import assert from "node:assert/strict";
import test from "node:test";
import { createCustomPhone } from "../src/utils/createCustomPhone.js";

test("creates a custom phone with a trimmed optional name", () => {
  assert.deepEqual(createCustomPhone("  Mi móvil  ", "420"), {
    id: "custom",
    brand: "Mi dispositivo",
    model: "Mi móvil",
    dpi: 420,
  });
});

test("uses a fallback name when the model is omitted", () => {
  assert.equal(createCustomPhone("", 300).model, "DPI personalizado");
});

test("rejects DPI values outside the allowed integer range", () => {
  for (const dpi of [99, 1001, 420.5, "abc", ""]) {
    assert.throws(() => createCustomPhone("Teléfono", dpi), RangeError);
  }
});