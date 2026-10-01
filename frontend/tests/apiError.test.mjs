import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/apiError.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { readApiError, retryDataQuery } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("preserves actionable API validation details and avoids retrying invalid input", async () => {
  const message = "Column 'country' is not numeric. Choose a numeric Y column or Count.";
  const error = await readApiError(Response.json({ detail: message }, { status: 400 }), "Fallback");
  assert.equal(error.message, message);
  assert.equal(retryDataQuery(0, error), false);
});

test("includes a separate backend cause without duplicating messages", async () => {
  const error = await readApiError(Response.json({ detail: "Cannot load rows.", error: "Mixed types cannot be sorted." }, { status: 400 }), "Fallback");
  assert.equal(error.message, "Cannot load rows. Mixed types cannot be sorted.");
  assert.equal((await readApiError(Response.json({ detail: "Same", error: "Same" }, { status: 400 }), "Fallback")).message, "Same");
});

test("handles HTML, empty, and malformed error bodies without exposing raw markup", async () => {
  for (const body of ["<html>Server error</html>", "", "{broken", JSON.stringify({ detail: { unexpected: true } })]) {
    const error = await readApiError(new Response(body, { status: 500 }), "Please retry.");
    assert.equal(error.message, "Please retry.");
    assert.equal(retryDataQuery(0, error), true);
    assert.equal(retryDataQuery(1, error), false);
  }
});

test("provides a useful fallback for missing datasets", async () => {
  assert.match((await readApiError(new Response("", { status: 404 }), "Fallback")).message, /expired/);
});
