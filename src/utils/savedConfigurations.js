import { FIELDS } from "../data/fields.js";
import { STYLES } from "../data/styles.js";
import { isStoredPhone } from "./storage.js";

export const MAX_SAVED_CONFIGURATIONS = 8;
export const MAX_COMPARE_CONFIGURATIONS = 3;

export function toggleComparisonSelection(selectedIds, id) {
  if (selectedIds.includes(id)) {
    return selectedIds.filter((selectedId) => selectedId !== id);
  }
  if (selectedIds.length >= MAX_COMPARE_CONFIGURATIONS) {
    return selectedIds;
  }
  return [...selectedIds, id];
}

export function getSelectedConfigurations(configurations, selectedIds) {
  const configurationsById = new Map(
    configurations.map((configuration) => [configuration.id, configuration]),
  );
  return selectedIds
    .map((id) => configurationsById.get(id))
    .filter((configuration) => configuration !== undefined);
}

export function isSensitivityValues(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    FIELDS.every(
      ({ key }) =>
        Number.isInteger(value[key]) &&
        value[key] >= 0 &&
        value[key] <= 200,
    )
  );
}

export function isStoredConfiguration(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 100 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    value.name.length <= 40 &&
    isStoredPhone(value.phone) &&
    typeof value.style === "string" &&
    Object.hasOwn(STYLES, value.style) &&
    isSensitivityValues(value.values) &&
    Number.isFinite(value.createdAt) &&
    value.createdAt > 0
  );
}

export function sanitizeSavedConfigurations(value) {
  if (!Array.isArray(value)) return [];

  const seenIds = new Set();
  return value
    .filter((configuration) => {
      if (!isStoredConfiguration(configuration) || seenIds.has(configuration.id)) {
        return false;
      }
      seenIds.add(configuration.id);
      return true;
    })
    .slice(0, MAX_SAVED_CONFIGURATIONS);
}

export function addSavedConfiguration(configurations, configuration) {
  if (!isStoredConfiguration(configuration)) {
    throw new TypeError("La configuración no es válida.");
  }

  return [
    configuration,
    ...configurations.filter((saved) => saved.id !== configuration.id),
  ].slice(0, MAX_SAVED_CONFIGURATIONS);
}
