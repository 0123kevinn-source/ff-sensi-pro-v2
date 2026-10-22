import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { canRenderAd, countEditorialWords } from "../utils/adEligibility";

const ADSENSE_CLIENT = "ca-pub-9659401497685795";
const ADSENSE_SLOT = import.meta.env.VITE_ADSENSE_SLOT ?? "";
const GOOGLE_ADS_VENDOR_ID = 755;
let adsenseScriptPromise;

function readTcfConsent(tcData) {
  if (!tcData || tcData.eventStatus === "cmpuishown") return null;
  if (tcData.gdprApplies === false) return true;
  if (tcData.gdprApplies !== true) return null;

  return (
    tcData.eventStatus === "tcloaded" ||
    tcData.eventStatus === "useractioncomplete"
  )
    ? Boolean(
      tcData.purpose?.consents?.[1] &&
      tcData.vendor?.consents?.[GOOGLE_ADS_VENDOR_ID],
    )
    : null;
}

function subscribeToGoogleConsent(onConsent) {
  const tcfApi = window.__tcfapi;
  if (typeof tcfApi !== "function") return () => {};

  let listenerId;
  let active = true;
  tcfApi("addEventListener", 2, (tcData, success) => {
    if (!active) return;
    if (!success) {
      console.error("No se pudo consultar el estado de consentimiento de Google.");
      onConsent(false);
      return;
    }
    const consent = readTcfConsent(tcData);
    if (consent !== null) onConsent(consent);
    listenerId = tcData?.listenerId ?? listenerId;
  });

  return () => {
    active = false;
    if (listenerId) {
      tcfApi("removeEventListener", 2, () => {}, listenerId);
    }
  };
}

function loadAdsenseScript() {
  if (!adsenseScriptPromise) {
    adsenseScriptPromise = new Promise((resolve, reject) => {
      let script = document.querySelector("script[data-ff-sensi-adsense]");
      if (script?.dataset.loaded === "true") {
        resolve();
        return;
      }
      if (!script) {
        script = document.createElement("script");
        script.async = true;
        script.crossOrigin = "anonymous";
        script.dataset.ffSensiAdsense = "true";
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
        document.head.append(script);
      }
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve();
      }, { once: true });
      script.addEventListener("error", () => {
        reject(new Error("No se pudo cargar el script de AdSense."));
      }, { once: true });
    });
  }
  return adsenseScriptPromise;
}

export default function AdSlot({
  pageStatus = "ready",
  contentSelector = "#publisher-content .publisher-content-inner",
}) {
  const [hasConsent, setHasConsent] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [adError, setAdError] = useState(null);
  const adRequested = useRef(false);
  const mountNode = document.getElementById("ad-slot-mount");
  const editorialContent = document.querySelector(contentSelector);
  const contentWordCount = editorialContent
    ? countEditorialWords(editorialContent.innerText || editorialContent.textContent || "")
    : 0;
  const isPublisherPage = window.location.pathname === "/";
  const isEligible = canRenderAd({
    contentWordCount,
    pageStatus,
    hasConsent,
    slotId: ADSENSE_SLOT,
    isPublisherPage,
  });

  useEffect(() => {
    if (!isEligible) return undefined;
    let active = true;
    loadAdsenseScript()
      .then(() => {
        if (active) setScriptLoaded(true);
      })
      .catch((error) => {
        console.error(error);
        if (active) setAdError(error);
      });
    return () => {
      active = false;
    };
  }, [isEligible]);

  useEffect(() => subscribeToGoogleConsent(setHasConsent), []);

  useEffect(() => {
    if (!isEligible) {
      adRequested.current = false;
      return;
    }
    if (!scriptLoaded || adError || adRequested.current) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      adRequested.current = true;
    } catch (error) {
      console.error("No se pudo inicializar el bloque de AdSense.", error);
      Promise.resolve().then(() => setAdError(error));
    }
  }, [adError, isEligible, scriptLoaded]);

  if (!mountNode || !isEligible || adError) return null;

  return createPortal(
    <aside className="ad-slot" aria-label="Publicidad">
      <p className="ad-slot-label">PUBLICIDAD</p>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: 100 }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>,
    mountNode,
  );
}
