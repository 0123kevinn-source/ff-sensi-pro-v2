import { FIELDS } from "../data/fields.js";
import { STYLES } from "../data/styles.js";
import { isStoredPhone } from "./storage.js";

export const MAX_SAVED_CONFIGURATIONS = 8;
export const MAX_COMPARE_CONFIGURATIONS = 3;
export const SAVED_CONFIGURATIONS_BACKUP_FORMAT = "ff-sens-pro-configurations";
export const SAVED_CONFIGURATIONS_BACKUP_VERSION = 1;

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

export function createSavedConfigurationsBackup(configurations, exportedAt = new Date().toISOString()) {
  return {
    format: SAVED_CONFIGURATIONS_BACKUP_FORMAT,
    version: SAVED_CONFIGURATIONS_BACKUP_VERSION,
    exportedAt,
    configurations: sanitizeSavedConfigurations(configurations),
  };
}

export function parseSavedConfigurationsBackup(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    value.format !== SAVED_CONFIGURATIONS_BACKUP_FORMAT ||
    value.version !== SAVED_CONFIGURATIONS_BACKUP_VERSION ||
    !Array.isArray(value.configurations) ||
    value.configurations.length > MAX_SAVED_CONFIGURATIONS
  ) {
    throw new TypeError("El archivo no es una copia válida de FF Sens Pro.");
  }

  const configurations = sanitizeSavedConfigurations(value.configurations);
  if (configurations.length !== value.configurations.length) {
    throw new TypeError("La copia contiene configuraciones inválidas o repetidas.");
  }

  return configurations;
}

export function mergeSavedConfigurations(current, imported) {
  const existing = sanitizeSavedConfigurations(current);
  const existingIds = new Set(existing.map(({ id }) => id));
  const additions = sanitizeSavedConfigurations(imported).filter(({ id }) => !existingIds.has(id));

  if (existing.length + additions.length > MAX_SAVED_CONFIGURATIONS) {
    throw new RangeError(`Solo hay espacio para ${MAX_SAVED_CONFIGURATIONS - existing.length} configuraciones más.`);
  }

  return [...existing, ...additions];
}
