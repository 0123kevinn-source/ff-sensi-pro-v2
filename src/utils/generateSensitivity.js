import { STYLES } from "../data/styles.js";

export function generateSensitivity(dpi, style) {
  if (!Number.isFinite(dpi) || dpi <= 0) {
    throw new RangeError("DPI debe ser un número positivo.");
  }
  if (!Object.hasOwn(STYLES, style)) {
    throw new RangeError("Selecciona un perfil de sensibilidad válido.");
  }

  const REF_DPI = 411;

  const factor = REF_DPI / dpi;
  const styleBoost = STYLES[style].boost;

  const general = Math.min(
    200,
    Math.round(
      190 * factor * styleBoost
    )
  );

  const redDot = Math.min(
    200,
    Math.round(
      175 * factor * styleBoost
    )
  );

  const scope2x = Math.min(
    200,
    Math.round(
      160 * factor * styleBoost
    )
  );

  const scope4x = Math.min(
    200,
    Math.round(
      135 * factor * styleBoost
    )
  );

  const sniper = Math.min(
    200,
    Math.round(
      90 * factor * styleBoost
    )
  );

  const freeLook = Math.min(
    200,
    Math.round(
      120 * factor * styleBoost
    )
  );

  return {
    general,
    redDot,
    scope2x,
    scope4x,
    sniper,
    freeLook,
  };
}