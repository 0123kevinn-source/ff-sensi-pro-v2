export function generateSensitivity(dpi, style) {
  const REF_DPI = 411;

  const factor = REF_DPI / dpi;

  // eslint-disable-next-line no-useless-assignment
  let styleBoost = 1;

  switch (style) {
    case "aggressive":
      styleBoost = 1.12;
      break;

    case "balanced":
      styleBoost = 1;
      break;

    case "sniper":
      styleBoost = 0.82;
      break;

    default:
      styleBoost = 1;
  }

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