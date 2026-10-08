import assert from "node:assert/strict";
import test from "node:test";
import { PHONES } from "../src/data/phones.js";

test("catalog has unique IDs and valid model names and DPI references", () => {
  const ids = PHONES.map(({ id }) => id);

  assert.equal(new Set(ids).size, PHONES.length);
  assert.ok(PHONES.length > 0);

  for (const phone of PHONES) {
    assert.ok(phone.brand.trim(), `phone ${phone.id} must have a brand`);
    assert.ok(phone.model.trim(), `phone ${phone.id} must have a model`);
    assert.ok(
      Number.isInteger(phone.dpi) && phone.dpi >= 100 && phone.dpi <= 1000,
      `phone ${phone.id} must have an integer DPI reference between 100 and 1000`,
    );
  }
});
