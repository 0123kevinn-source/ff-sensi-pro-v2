import assert from "node:assert/strict";
import test from "node:test";
import {
  addSavedConfiguration,
  isStoredConfiguration,
  isSensitivityValues,
  MAX_SAVED_CONFIGURATIONS,
  sanitizeSavedConfigurations,
} from "../src/utils/savedConfigurations.js";

const phone = { id: 1, brand: "Samsung", model: "Galaxy A54", dpi: 403 };
const values = {
  general: 194,
  redDot: 178,
  scope2x: 163,
  scope4x: 138,
  sniper: 92,
  freeLook: 122,
};
const configuration = {
  id: "saved-1",
  name: "Mi perfil",
  phone,
  style: "balanced",
  values,
  createdAt: 1_700_000_000_000,
};

test("accepts valid saved configurations and sensitivity values", () => {
  assert.equal(isSensitivityValues(values), true);
  assert.equal(isStoredConfiguration(configuration), true);
});

test("rejects invalid sensitivity values and malformed configurations", () => {
  assert.equal(isSensitivityValues({ ...values, general: 201 }), false);
  assert.equal(isSensitivityValues({ ...values, sniper: 1.5 }), false);
  assert.equal(isStoredConfiguration({ ...configuration, style: "unknown" }), false);
  assert.equal(isStoredConfiguration({ ...configuration, name: " " }), false);
  assert.equal(
    isStoredConfiguration({ ...configuration, phone: { ...phone, dpi: 1001 } }),
    false,
  );
});

test("sanitizes malformed records, duplicate IDs, and excess configurations", () => {
  const manyConfigurations = Array.from({ length: MAX_SAVED_CONFIGURATIONS + 2 }, (_, index) => ({
    ...configuration,
    id: `saved-${index}`,
  }));

  assert.deepEqual(
    sanitizeSavedConfigurations([
      configuration,
      { ...configuration },
      null,
      ...manyConfigurations,
    ]).map(({ id }) => id),
    [
      "saved-1",
      ...manyConfigurations
        .filter(({ id }) => id !== configuration.id)
        .slice(0, MAX_SAVED_CONFIGURATIONS - 1)
        .map(({ id }) => id),
    ],
  );
  assert.deepEqual(sanitizeSavedConfigurations(null), []);
});

test("adds the newest configuration first and enforces the storage limit", () => {
  const existing = Array.from({ length: MAX_SAVED_CONFIGURATIONS }, (_, index) => ({
    ...configuration,
    id: `saved-${index}`,
  }));
  const next = addSavedConfiguration(existing, {
    ...configuration,
    id: "newest",
  });

  assert.equal(next.length, MAX_SAVED_CONFIGURATIONS);
  assert.equal(next[0].id, "newest");
  assert.equal(next.at(-1).id, `saved-${MAX_SAVED_CONFIGURATIONS - 2}`);
  assert.throws(() => addSavedConfiguration([], { ...configuration, values: {} }), TypeError);
});
