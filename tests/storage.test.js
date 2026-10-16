import assert from "node:assert/strict";
import test from "node:test";
import { isStoredPhone } from "../src/utils/storage.js";

test("accepts catalog and custom device records", () => {
  assert.equal(
    isStoredPhone({ id: 1, brand: "Samsung", model: "Galaxy A54", dpi: 403 }),
    true,
  );
  assert.equal(
    isStoredPhone({
      id: "custom",
      brand: "Mi dispositivo",
      model: "Mi teléfono",
      dpi: 420,
    }),
    true,
  );
});

test("rejects malformed or oversized stored device records", () => {
  assert.equal(isStoredPhone(null), false);
  assert.equal(isStoredPhone({ id: 1, brand: "", model: "A54", dpi: 403 }), false);
  assert.equal(
    isStoredPhone({
      id: 1,
      brand: "Samsung",
      model: "x".repeat(81),
      dpi: 403,
    }),
    false,
  );
  assert.equal(
    isStoredPhone({ id: 1, brand: "Samsung", model: "A54", dpi: 1001 }),
    false,
  );
});
