export function isStoredPhone(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    (typeof value.id === "string" || Number.isInteger(value.id)) &&
    typeof value.brand === "string" &&
    value.brand.trim().length > 0 &&
    value.brand.length <= 40 &&
    typeof value.model === "string" &&
    value.model.trim().length > 0 &&
    value.model.length <= 80 &&
    Number.isInteger(value.dpi) &&
    value.dpi >= 100 &&
    value.dpi <= 1000
  );
}
