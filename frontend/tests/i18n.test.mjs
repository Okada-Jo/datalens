import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../src/", import.meta.url));
const catalogs = Object.fromEntries(["en", "de", "ja"].map(lang => [lang, JSON.parse(readFileSync(path.join(root, `locales/${lang}.json`), "utf8"))]));
let counter = 0;
async function runtime(languages = ["en"], saved = null, storageBlocked = false) {
  const environment = `
export const navigator = ${JSON.stringify({ languages, language: languages[0] })};
export const document = { documentElement: { lang: "" }, title: "" };
export const storage = new Map([["datalens-language", ${JSON.stringify(saved)}]]);
export const localStorage = {
  getItem(key) { ${storageBlocked ? 'throw new Error("blocked");' : 'return storage.get(key);'} },
  setItem(key, value) { ${storageBlocked ? 'throw new Error("blocked");' : 'storage.set(key, value);'} }
};
// ${counter++}`;
  const environmentUrl = `data:text/javascript;base64,${Buffer.from(environment).toString("base64")}`;
  const modules = new Map();

  function compile(filename) {
    if (modules.has(filename)) return modules.get(filename);
    if (filename.endsWith(".json")) {
      const json = readFileSync(filename, "utf8");
      return `data:text/javascript;base64,${Buffer.from(`export default ${json}`).toString("base64")}`;
    }
    let source = readFileSync(filename, "utf8");
    source = source.replace(/^((?:import|export) .*?from )"([^"\n]+)"/gm, (match, prefix, specifier) => {
      if (!specifier.startsWith(".")) return `${prefix}"${pathToFileURL(require.resolve(specifier))}"`;
      const dependency = path.resolve(path.dirname(filename), specifier);
      return `${prefix}"${compile(dependency.endsWith(".json") ? dependency : `${dependency}.ts`)}"`;
    });
    source = `import { navigator, document, localStorage } from "${environmentUrl}";\n${source}`;
    const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
    const url = `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
    modules.set(filename, url);
    return url;
  }

  const app = await import(compile(path.join(root, "i18n.ts")));
  const { document, storage } = await import(environmentUrl);
  return { ...app, testDocument: document, testStorage: storage };
}

test("all locales cover the same messages and preserve interpolation placeholders", () => {
  for (const lang of ["de", "ja"]) {
    assert.deepEqual(Object.keys(catalogs[lang]).sort(), Object.keys(catalogs.en).sort());
    for (const [key, value] of Object.entries(catalogs[lang])) {
      assert.ok(value.trim(), `${lang}: ${key}`);
      assert.deepEqual([...key.matchAll(/\{\w+\}/g)].map(x => x[0]).sort(), [...value.matchAll(/\{\w+\}/g)].map(x => x[0]).sort(), `${lang}: ${key}`);
    }
  }
});

test("detects regional browser languages in priority order and falls back to English", async () => {
  const app = await runtime();
  assert.equal(app.detectLocale(["de-AT"]), "de");
  assert.equal(app.detectLocale(["ja-JP"]), "ja");
  assert.equal(app.detectLocale(["fr-FR", "de-DE", "ja"]), "de");
  assert.equal(app.detectLocale(["en-GB", "de"]), "en");
  assert.equal(app.detectLocale(["fr", "es"]), "en");
  assert.equal(app.detectLocale([]), "en");
});

test("uses saved choice before browser preference and updates document metadata", async () => {
  const app = await runtime(["de-DE"], "ja");
  assert.equal(app.getLocale(), "ja");
  assert.equal(app.testDocument.documentElement.lang, "ja");
  assert.match(app.testDocument.title, /データ/);
  app.setLocale("de");
  assert.equal(app.testStorage.get("datalens-language"), "de");
  assert.equal(app.testDocument.documentElement.lang, "de");
  assert.equal(app.gettext("Page {page} of {pages}", { page: 2, pages: 5 }), "Seite 2 von 5");
});

test("invalid stored language and unavailable storage still allow browser detection and switching", async () => {
  assert.equal((await runtime(["ja-JP"], "invalid")).getLocale(), "ja");
  const app = await runtime(["de-DE"], null, true);
  assert.equal(app.getLocale(), "de");
  app.setLocale("ja");
  assert.equal(app.gettext("Try again"), "再試行");
  assert.equal(app.gettext("Unknown message"), "Unknown message");
});

test("translates dynamic API errors while preserving column names", async () => {
  const app = await runtime(["ja"]);
  const message = "Cannot calculate sum for column 'Average': 2 non-numeric value(s) cannot be compared as numbers. Choose a numeric Y column, clean these values, or switch to Count.";
  assert.match(app.translateMessage(message), /数値以外/);
  assert.match(app.translateMessage(message), /'Average'/);
  assert.match(app.translateMessage(message), /合計/);
  const nested = "Cannot apply 'rename_column' to column 'revenue'. Unknown column: revenue Review or undo this step in Clean.";
  assert.match(app.translateMessage(nested), /不明な列：revenue/);
});

function files(directory) { return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]); }
test("literal gettext calls have catalog entries and visible JSX text is wrapped", () => {
  for (const filename of files(root).filter(file => /\.tsx?$/.test(file))) {
    const ast = ts.createSourceFile(filename, readFileSync(filename, "utf8"), ts.ScriptTarget.Latest, true);
    function visit(node) {
      if (ts.isCallExpression(node) && ["t", "gettext"].includes(node.expression.getText(ast)) && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) assert.ok(catalogs.en[node.arguments[0].text], `${filename}: ${node.arguments[0].text}`);
      if (ts.isJsxText(node) && /[A-Za-z]/.test(node.text) && !filename.endsWith("LanguageSelect.tsx")) assert.equal(node.text.trim(), "DataLens", `${filename}: unwrapped text`);
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
});
