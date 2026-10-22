function normalizeModel(value) {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function platformFromUserAgent(userAgent) {
  if (/ipad/i.test(userAgent)) return "iPadOS";
  if (/iphone|ipod/i.test(userAgent)) return "iOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/windows/i.test(userAgent)) return "Windows";
  if (/macintosh|mac os/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";
  return "desconocida";
}

function modelFromUserAgent(userAgent, platform) {
  if (platform === "iOS") return "iPhone";
  if (platform === "iPadOS") return "iPad";
  if (platform !== "Android") return "";

  const match = userAgent.match(/Android[^;)]*;\s*([^;)]+)/i);
  const model = match?.[1]?.trim() ?? "";
  if (!model || model.length < 3 || /^(?:wv|k|build|mobile|linux)$/i.test(model)) {
    return "";
  }
  return model;
}

function findCatalogMatch(model, phones) {
  if (!model) return null;

  const normalizedModel = normalizeModel(model);
  return phones.find((phone) => {
    const normalizedName = normalizeModel(`${phone.brand} ${phone.model}`);
    const normalizedPhoneModel = normalizeModel(phone.model);
    return normalizedModel === normalizedName || normalizedModel === normalizedPhoneModel;
  }) ?? null;
}

export async function detectDevice(navigatorLike, phones) {
  const userAgent = navigatorLike.userAgent ?? "";
  const fallbackPlatform = platformFromUserAgent(userAgent);
  let platform = fallbackPlatform;
  let model = "";

  if (navigatorLike.userAgentData) {
    platform = navigatorLike.userAgentData.platform || fallbackPlatform;
    model = navigatorLike.userAgentData.model?.trim() ?? "";

    if (!model && typeof navigatorLike.userAgentData.getHighEntropyValues === "function") {
      try {
        const highEntropyValues = await navigatorLike.userAgentData.getHighEntropyValues(["model"]);
        model = highEntropyValues.model?.trim() ?? "";
      } catch {
        // Use the reduced user-agent string when the browser withholds model hints.
      }
    }
  }

  if (!model) {
    model = modelFromUserAgent(userAgent, fallbackPlatform);
  }

  const phone = findCatalogMatch(model, phones);
  return {
    platform,
    model,
    phone,
    canConfigure: Boolean(phone),
  };
}
