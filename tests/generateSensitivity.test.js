import assert from "node:assert/strict";
import test from "node:test";
import { generateSensitivity } from "../src/utils/generateSensitivity.js";

test("returns the balanced reference values at reference DPI", () => {
  assert.deepEqual(generateSensitivity(411, "balanced"), {
    general: 190,
    redDot: 175,
    scope2x: 160,
    scope4x: 135,
    sniper: 90,
    freeLook: 120,
  });
});

test("applies the selected profile multiplier", () => {
  assert.equal(generateSensitivity(411, "aggressive").general, 200);
  assert.equal(generateSensitivity(411, "sniper").general, 156);
});

test("caps every sensitivity value at the game setting maximum", () => {
  assert.ok(Object.values(generateSensitivity(100, "balanced")).every((value) => value === 200));
});

test("rejects non-positive or non-finite DPI values", () => {
  assert.throws(() => generateSensitivity(0, "balanced"), RangeError);
  assert.throws(() => generateSensitivity(Number.NaN, "balanced"), RangeError);
});

test("rejects unknown profiles instead of silently using the balanced multiplier", () => {
  assert.throws(() => generateSensitivity(411, "unknown"), RangeError);
  assert.throws(() => generateSensitivity(411, "__proto__"), RangeError);
});