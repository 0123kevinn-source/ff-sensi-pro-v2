export function createCustomPhone(model, dpiValue) {
  const dpi = Number(dpiValue);

  if (!Number.isInteger(dpi) || dpi < 100 || dpi > 1000) {
    throw new RangeError("Introduce un DPI entero entre 100 y 1000.");
  }

  return {
    id: "custom",
    brand: "Mi dispositivo",
    model: model.trim() || "DPI personalizado",
    dpi,
  };
}