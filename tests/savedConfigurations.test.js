import assert from "node:assert/strict";
import test from "node:test";
import {
  addSavedConfiguration,
  getSelectedConfigurations,
  createSavedConfigurationsBackup,
  mergeSavedConfigurations,
  MAX_COMPARE_CONFIGURATIONS,
  isStoredConfiguration,
  isSensitivityValues,
  MAX_SAVED_CONFIGURATIONS,
  parseSavedConfigurationsBackup,
  sanitizeSavedConfigurations,
  toggleComparisonSelection,
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

test("comparison selection toggles IDs and cannot exceed the comparison limit", () => {
  const selected = ["saved-1", "saved-2"];

  assert.deepEqual(toggleComparisonSelection(selected, "saved-2"), ["saved-1"]);
  assert.deepEqual(
    toggleComparisonSelection(selected, "saved-3"),
    ["saved-1", "saved-2", "saved-3"],
  );
  assert.deepEqual(
    toggleComparisonSelection(
      [...selected, "saved-3"],
      "saved-4",
    ),
    [...selected, "saved-3"],
  );
  assert.equal(MAX_COMPARE_CONFIGURATIONS, 3);
});

test("comparison order follows selection order and ignores deleted IDs", () => {
  const configurations = [
    { ...configuration, id: "saved-1" },
    { ...configuration, id: "saved-2" },
    { ...configuration, id: "saved-3" },
  ];

  assert.deepEqual(
    getSelectedConfigurations(configurations, ["saved-3", "removed", "saved-1"]),
    [configurations[2], configurations[0]],
  );
});

test("saved configuration backups round-trip and reject invalid records", () => {
  const backup = createSavedConfigurationsBackup([configuration], "2026-10-28T00:00:00.000Z");

  assert.deepEqual(parseSavedConfigurationsBackup(backup), [configuration]);
  assert.throws(() => parseSavedConfigurationsBackup({ ...backup, version: 2 }), TypeError);
  assert.throws(
    () => parseSavedConfigurationsBackup({ ...backup, configurations: [{ ...configuration, id: "" }] }),
    TypeError,
  );
});

test("import merges new configurations without duplicates and respects the limit", () => {
  const existing = [{ ...configuration, id: "saved-1" }];
  const imported = [
    { ...configuration, id: "saved-1" },
    { ...configuration, id: "saved-2" },
  ];

  assert.deepEqual(
    mergeSavedConfigurations(existing, imported).map(({ id }) => id),
    ["saved-1", "saved-2"],
  );
  assert.throws(
    () => mergeSavedConfigurations(existing, Array.from({ length: MAX_SAVED_CONFIGURATIONS }, (_, index) => ({
      ...configuration,
      id: `imported-${index}`,
    }))),
    RangeError,
  );
});
