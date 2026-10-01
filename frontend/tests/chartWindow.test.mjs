import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/chartWindow.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { chartWindow, CHART_PAGE_SIZE } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("17,520 points have bounded render windows and remain accessible exactly once", () => {
  const data = Array.from({ length: 17520 }, (_, x) => ({ x, y: x % 17 }));
  const recovered = [];
  const { pageCount } = chartWindow(data, 0);
  for (let page = 0; page < pageCount; page++) {
    const window = chartWindow(data, page);
    assert.ok(window.data.length <= CHART_PAGE_SIZE);
    assert.equal(window.end - window.start, window.data.length);
    recovered.push(...window.data);
  }
  assert.deepEqual(recovered, data);
  assert.equal(chartWindow(data, pageCount - 1).data.length, 120);
});

test("empty, small and shrinking datasets keep a valid window", () => {
  assert.deepEqual(chartWindow([], 8), { page: 0, pageCount: 1, start: 0, end: 0, data: [] });
  const data = [{ x: null, y: 0 }, { x: "peak", y: 100000 }];
  assert.deepEqual(chartWindow(data, 87).data, data);
  assert.equal(chartWindow(data, 87).page, 0);
  assert.equal(chartWindow(data, -1).page, 0);
});
