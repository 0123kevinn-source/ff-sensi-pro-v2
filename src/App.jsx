import { useMemo, useRef, useState } from "react";

import Header from "./components/Header";
import SearchBox from "./components/SearchBox";
import PhoneCard from "./components/PhoneCard";
import ResultCard from "./components/ResultCard";
import AdSlot from "./components/AdSlot";
import StyleSelector from "./components/StyleSelector";
import { FIELDS } from "./data/fields";
import { PHONES } from "./data/phones";
import { STYLES } from "./data/styles";
import { generateSensitivity } from "./utils/generateSensitivity";
import { createCustomPhone } from "./utils/createCustomPhone";
import { detectDevice } from "./utils/detectDevice";
import { searchPhones } from "./utils/searchPhones";
import { isStoredPhone } from "./utils/storage";
import {
  addSavedConfiguration,
  createSavedConfigurationsBackup,
  getSelectedConfigurations,
  isSensitivityValues,
  MAX_COMPARE_CONFIGURATIONS,
  MAX_SAVED_CONFIGURATIONS,
  mergeSavedConfigurations,
  parseSavedConfigurationsBackup,
  sanitizeSavedConfigurations,
  toggleComparisonSelection,
} from "./utils/savedConfigurations";
import { useClipboard } from "./hooks/useClipboard";

const VALID_STYLES = new Set(Object.keys(STYLES));

function readStoredValue(key) {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) return null;
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function loadStoredPreferences() {
  try {
    const savedPhone = readStoredValue("selectedPhone");
    const savedStyle = localStorage.getItem("style");
    const savedSensitivity = readStoredValue("sens");
    const savedRecentPhones = readStoredValue("recentPhones");
    const style = savedStyle && VALID_STYLES.has(savedStyle)
      ? savedStyle
      : "balanced";
    const phone = isStoredPhone(savedPhone) ? savedPhone : null;

    return {
      selectedStyle: style,
      selectedPhone: phone,
      sens: phone
        ? isSensitivityValues(savedSensitivity)
          ? savedSensitivity
          : generateSensitivity(phone.dpi, style)
        : null,
      recentPhones: Array.isArray(savedRecentPhones)
        ? savedRecentPhones.filter(isStoredPhone).slice(0, 4)
        : [],
    };
  } catch {
    return {
      selectedStyle: "balanced",
      selectedPhone: null,
      sens: null,
      recentPhones: [],
    };
  }
}

function loadSavedConfigurations() {
  try {
    const rawValue = localStorage.getItem("savedConfigurations");
    return rawValue
      ? sanitizeSavedConfigurations(JSON.parse(rawValue))
      : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [initialPreferences] = useState(loadStoredPreferences);
  const [initialSavedConfigurations] = useState(loadSavedConfigurations);
  const [query, setQuery] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(initialPreferences.selectedStyle);
  const [selectedPhone, setSelectedPhone] = useState(initialPreferences.selectedPhone);
  const [recentPhones, setRecentPhones] = useState(initialPreferences.recentPhones);
  const [customModel, setCustomModel] = useState("");
  const [customDpi, setCustomDpi] = useState("");
  const [customError, setCustomError] = useState("");
  const [isDetectingDevice, setIsDetectingDevice] = useState(false);
  const [deviceDetectionMessage, setDeviceDetectionMessage] = useState("");
  const [deviceDetectionStatus, setDeviceDetectionStatus] = useState("");
  const [sens, setSens] = useState(initialPreferences.sens);
  const [savedConfigurations, setSavedConfigurations] = useState(initialSavedConfigurations);
  const [comparisonIds, setComparisonIds] = useState([]);
  const [configurationName, setConfigurationName] = useState("");
  const [savedConfigurationMessage, setSavedConfigurationMessage] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [copyError, setCopyError] = useState("");
  const { copied, copy } = useClipboard();
  const resultRef = useRef(null);
  const backupInputRef = useRef(null);
  const filteredPhones = useMemo(() => searchPhones(query, PHONES), [query]);
  const comparisonConfigurations = getSelectedConfigurations(savedConfigurations, comparisonIds);
  const estimatedSensitivity = useMemo(
    () => selectedPhone ? generateSensitivity(selectedPhone.dpi, selectedStyle) : null,
    [selectedPhone, selectedStyle],
  );
  const hasAdjustedSensitivities = Boolean(
    estimatedSensitivity &&
    sens &&
    FIELDS.some((field) => sens[field.key] !== estimatedSensitivity[field.key]),
  );

  const calculateSensitivity = (phone) => {
    setDownloadError("");
    setCopyError("");
    setSelectedPhone(phone);

    const result = generateSensitivity(phone.dpi, selectedStyle);
    setSens(result);

    setRecentPhones((previousPhones) => {
      const nextRecentPhones = [
        phone,
        ...previousPhones.filter(
          (recentPhone) =>
            recentPhone.brand !== phone.brand ||
            recentPhone.model !== phone.model ||
            recentPhone.dpi !== phone.dpi,
        ),
      ].slice(0, 4);

      try {
        localStorage.setItem("recentPhones", JSON.stringify(nextRecentPhones));
      } catch {
        // El almacenamiento puede estar deshabilitado en el navegador.
      }

      return nextRecentPhones;
    });

    try {
      localStorage.setItem("selectedPhone", JSON.stringify(phone));
      localStorage.setItem("sens", JSON.stringify(result));
      localStorage.setItem("style", selectedStyle);
    } catch {
      // La configuración permanece disponible durante esta sesión.
    }

    if (window.matchMedia("(max-width: 700px)").matches) {
      window.requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      });
    }
  };

  const detectCurrentDevice = async () => {
    setIsDetectingDevice(true);
    setDeviceDetectionMessage("");
    setDeviceDetectionStatus("");

    try {
      const device = await detectDevice(navigator, PHONES);
      if (device.phone) {
        setQuery(`${device.phone.brand} ${device.phone.model}`);
        setDeviceDetectionMessage(
          `Detectamos ${device.phone.brand} ${device.phone.model}. Usaremos su DPI de referencia (${device.phone.dpi}); es aproximado, no una lectura del teléfono.`,
        );
        setDeviceDetectionStatus("success");
        calculateSensitivity(device.phone);
        return;
      }

      if (device.model) {
        setCustomModel(device.model);
        setQuery(device.model);
        setDeviceDetectionMessage(
          `El navegador identificó “${device.model}”, pero ese modelo no está en el catálogo. Busca una coincidencia o introduce el DPI manualmente para continuar.`,
        );
      } else if (device.platform === "iOS" || device.platform === "iPadOS") {
        setDeviceDetectionMessage(
          `El navegador confirma ${device.platform}, pero no revela el modelo exacto. Busca tu iPhone o iPad en el catálogo; el navegador no proporciona su DPI.`,
        );
      } else if (device.platform === "Android") {
        setDeviceDetectionMessage(
          "El navegador confirma Android, pero no comparte el modelo exacto. Busca tu teléfono por marca o introduce su DPI manualmente.",
        );
      } else {
        setDeviceDetectionMessage(
          "No pudimos identificar un teléfono compatible. Busca el modelo en el catálogo o introduce un DPI manualmente.",
        );
      }
      setDeviceDetectionStatus("info");
    } catch {
      setDeviceDetectionMessage(
        "No se pudo consultar la información del dispositivo. Puedes buscar el modelo o introducir el DPI manualmente.",
      );
      setDeviceDetectionStatus("error");
    } finally {
      setIsDetectingDevice(false);
    }
  };

  const addCustomDevice = (event) => {
    event.preventDefault();

    try {
      const phone = createCustomPhone(customModel, customDpi);
      setCustomError("");
      setCustomModel("");
      setCustomDpi("");
      calculateSensitivity(phone);
    } catch (error) {
      setCustomError(error.message);
    }
  };

  const clearSavedDevices = () => {
    setRecentPhones([]);
    setSelectedPhone(null);
    setSens(null);
    setSelectedStyle("balanced");
    setCustomModel("");
    setCustomDpi("");
    setCustomError("");
    setDownloadError("");
    setCopyError("");

    try {
      localStorage.removeItem("selectedPhone");
      localStorage.removeItem("sens");
      localStorage.removeItem("style");
      localStorage.removeItem("recentPhones");
    } catch {
      // La interfaz se limpia aunque el navegador no permita borrar almacenamiento.
    }
  };

  const changeStyle = (style) => {
    if (!VALID_STYLES.has(style)) return;

    setSelectedStyle(style);
    setCopyError("");

    const result = selectedPhone
      ? generateSensitivity(selectedPhone.dpi, style)
      : null;

    if (result) {
      setSens(result);
    }

    try {
      localStorage.setItem("style", style);
      if (result) localStorage.setItem("sens", JSON.stringify(result));
    } catch {
      // La configuración permanece disponible durante esta sesión.
    }
  };

  const changeSensitivity = (key, value) => {
    if (!FIELDS.some((field) => field.key === key) || !Number.isInteger(value) || value < 0 || value > 200) {
      return;
    }

    setSens((current) => {
      if (!current) return current;
      const next = { ...current, [key]: value };
      try {
        localStorage.setItem("sens", JSON.stringify(next));
      } catch {
        // La sensibilidad sigue disponible durante esta sesión.
      }
      return next;
    });
    setSavedConfigurationMessage("");
  };

  const resetSensitivities = () => {
    if (!selectedPhone) return;

    const result = generateSensitivity(selectedPhone.dpi, selectedStyle);
    setSens(result);
    setSavedConfigurationMessage("");
    try {
      localStorage.setItem("sens", JSON.stringify(result));
    } catch {
      // La sensibilidad sigue disponible durante esta sesión.
    }
  };

  const saveConfiguration = (event) => {
    event.preventDefault();
    setSavedConfigurationMessage("");

    if (!selectedPhone || !sens) {
      setSavedConfigurationMessage("Selecciona un dispositivo antes de guardar.");
      return;
    }

    const name = configurationName.trim();
    if (!name) {
      setSavedConfigurationMessage("Escribe un nombre para guardar la configuración.");
      return;
    }
    if (savedConfigurations.length >= MAX_SAVED_CONFIGURATIONS) {
      setSavedConfigurationMessage("Ya tienes ocho configuraciones. Borra una para guardar otra.");
      return;
    }

    const configuration = {
      id: globalThis.crypto?.randomUUID?.() ?? `saved-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      phone: selectedPhone,
      style: selectedStyle,
      values: sens,
      createdAt: Date.now(),
    };

    try {
      const next = addSavedConfiguration(savedConfigurations, configuration);
      localStorage.setItem("savedConfigurations", JSON.stringify(next));
      setSavedConfigurations(next);
      setConfigurationName("");
      setSavedConfigurationMessage(`“${name}” quedó guardada en este navegador.`);
    } catch {
      setSavedConfigurationMessage("No se pudo guardar. Revisa el almacenamiento disponible en el navegador.");
    }
  };

  const exportSavedConfigurations = () => {
    if (!savedConfigurations.length) return;

    const backup = createSavedConfigurationsBackup(savedConfigurations);
    const fileUrl = URL.createObjectURL(
      new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "ff-sens-pro-configuraciones.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    setSavedConfigurationMessage("Copia descargada. Puedes importarla en otro dispositivo.");
  };

  const importSavedConfigurations = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > 256_000) {
        throw new RangeError("El archivo supera el límite de 256 KB.");
      }

      const imported = parseSavedConfigurationsBackup(JSON.parse(await file.text()));
      const next = mergeSavedConfigurations(savedConfigurations, imported);
      localStorage.setItem("savedConfigurations", JSON.stringify(next));
      setSavedConfigurations(next);
      const addedCount = next.length - savedConfigurations.length;
      setSavedConfigurationMessage(
        addedCount
          ? `Se importaron ${addedCount} ${addedCount === 1 ? "configuración" : "configuraciones"}.`
          : "La copia ya está en este navegador; no se agregaron duplicados.",
      );
    } catch (error) {
      const message = error instanceof RangeError || error instanceof TypeError
        ? error.message
        : error?.name === "QuotaExceededError"
          ? "No hay espacio disponible para guardar la copia."
          : "Comprueba que sea un archivo JSON válido de FF Sens Pro.";
      setSavedConfigurationMessage(
        `No se pudo importar. ${message}`,
      );
    } finally {
      event.target.value = "";
    }
  };

  const applySavedConfiguration = (configuration) => {
    setSelectedPhone(configuration.phone);
    setSelectedStyle(configuration.style);
    setSens(configuration.values);
    setDownloadError("");
    setCopyError("");
    setSavedConfigurationMessage(`Se cargó “${configuration.name}”.`);

    try {
      localStorage.setItem("selectedPhone", JSON.stringify(configuration.phone));
      localStorage.setItem("style", configuration.style);
      localStorage.setItem("sens", JSON.stringify(configuration.values));
    } catch {
      // La configuración aplicada sigue disponible durante esta sesión.
    }
  };

  const deleteSavedConfiguration = (id) => {
    const next = savedConfigurations.filter((configuration) => configuration.id !== id);
    try {
      localStorage.setItem("savedConfigurations", JSON.stringify(next));
      setSavedConfigurations(next);
      setComparisonIds((current) => current.filter((selectedId) => selectedId !== id));
      setSavedConfigurationMessage("Configuración guardada eliminada.");
    } catch {
      setSavedConfigurationMessage("No se pudo eliminar. Inténtalo de nuevo.");
    }
  };

  const downloadImage = async () => {
    if (!resultRef.current) return;

    try {
      setDownloadError("");
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: "#101312",
        scale: Math.min(window.devicePixelRatio || 1, 2),
      });
      const link = document.createElement("a");
      link.download = "ff-sens-pro.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      setDownloadError("No se pudo crear la imagen. Inténtalo de nuevo.");
    }
  };

  const copySettings = async () => {
    if (!selectedPhone || !sens) {
      setCopyError("Primero selecciona un dispositivo para copiar su configuración.");
      return;
    }

    const text = [
      `${selectedPhone.brand} ${selectedPhone.model}`,
      `Perfil: ${STYLES[selectedStyle].name}`,
      ...FIELDS.map(({ key, label }) => `${label}: ${sens[key]}`),
      `${selectedPhone.id === "custom" ? "DPI introducido" : "DPI de referencia"}: ${selectedPhone.dpi}`,
    ].join("\n");

    const success = await copy(text, "settings");
    setCopyError(success ? "" : "No se pudo copiar. Revisa el permiso del navegador.");
  };

  return (
    <main className="app-shell">
      <div className="app-container">
        <Header catalogCount={PHONES.length} />

        <section className="home-hero" aria-labelledby="home-hero-title">
          <div className="home-hero-copy">
            <p className="hero-eyebrow">
              <span aria-hidden="true" />
              FREE FIRE · SENSITIVITY STUDIO
            </p>
            <h2 id="home-hero-title">
              Tu sensibilidad.<br />
              <span>Tu forma de jugar.</span>
            </h2>
            <p>
              Encuentra una base para empezar, personaliza cada control y guarda
              los ajustes que mejor se adapten a ti.
            </p>
            <a className="hero-action" href="#sensitivity-tool">
              Crear mi configuración
              <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-visual-orbit hero-visual-orbit-outer" />
            <div className="hero-visual-orbit hero-visual-orbit-inner" />
            <div className="hero-visual-core">
              <span>FF</span>
              <small>SENS</small>
            </div>
            <div className="hero-visual-tag hero-visual-tag-top">
              <span className="hero-visual-tag-dot" />
              AIM CONTROL
            </div>
            <div className="hero-visual-tag hero-visual-tag-bottom">
              <span>01</span>
              PERSONALIZA
            </div>
            <div className="hero-visual-line hero-visual-line-one" />
            <div className="hero-visual-line hero-visual-line-two" />
          </div>
        </section>

        <div className="app-layout" id="sensitivity-tool">
          <section className="controls-column" aria-label="Buscar dispositivo">
            <p className="section-label">1 / DISPOSITIVO</p>
            <button
              className="detect-device-button"
              type="button"
              onClick={detectCurrentDevice}
              disabled={isDetectingDevice}
            >
              <span className="detect-device-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="7" y="3" width="10" height="18" rx="2.4" />
                  <path d="M10 6h4M11 18h2M3 8V5a2 2 0 0 1 2-2m16 5V5a2 2 0 0 0-2-2M3 16v3a2 2 0 0 0 2 2m16-5v3a2 2 0 0 1-2 2" />
                </svg>
              </span>
              <span>{isDetectingDevice ? "Detectando dispositivo..." : "Detectar mi dispositivo"}</span>
              <span className="detect-device-arrow" aria-hidden="true">↗</span>
            </button>
            {deviceDetectionMessage && (
              <p className={`device-detection-message is-${deviceDetectionStatus}`} role="status">
                {deviceDetectionMessage}
              </p>
            )}
            <SearchBox query={query} setQuery={setQuery} />

            {query.trim() && (
              <p className="search-count" aria-live="polite">
                {filteredPhones.length} {filteredPhones.length === 1 ? "modelo" : "modelos"}
              </p>
            )}

            <div id="phone-results" className="phone-results">
              {filteredPhones.length > 0 ? (
                filteredPhones.map((phone) => (
                  <PhoneCard
                    key={phone.id}
                    phone={phone}
                    onSelect={calculateSensitivity}
                    isSelected={selectedPhone?.id === phone.id}
                  />
                ))
              ) : query.trim() ? (
                <div className="empty-state">
                  <h3>No encontrado</h3>
                  <p>Prueba con otra marca o modelo.</p>
                </div>
              ) : null}
            </div>

            {!query.trim() && !selectedPhone && (
              <p className="search-hint">
                Busca entre {PHONES.length} modelos para empezar.
              </p>
            )}

            <form className="manual-device" onSubmit={addCustomDevice}>
              <p className="section-label">USAR DPI MANUAL</p>
              <label htmlFor="custom-model">Nombre del dispositivo (opcional)</label>
              <input
                id="custom-model"
                type="text"
                value={customModel}
                onChange={(event) => setCustomModel(event.target.value)}
                placeholder="Mi teléfono"
                maxLength={40}
              />
              <label htmlFor="custom-dpi">DPI del dispositivo</label>
              <div className="manual-device-row">
                <input
                  id="custom-dpi"
                  type="number"
                  inputMode="numeric"
                  min="100"
                  max="1000"
                  step="1"
                  required
                  value={customDpi}
                  onChange={(event) => setCustomDpi(event.target.value)}
                  placeholder="Ej. 420"
                />
                <button type="submit">Calcular</button>
              </div>
              <p className="dpi-help">
                Ingresa la densidad configurada en Android si la conoces. Esta web no puede leer ni cambiar ese ajuste; el DPI reescala la interfaz y no aumenta por sí solo la sensibilidad física del táctil.
              </p>
              {customError && <p className="error-message" role="alert">{customError}</p>}
            </form>

            {recentPhones.length > 0 && (
              <div className="recent-devices">
                <div className="recent-heading">
                  <p className="section-label">RECIENTES</p>
                  <button type="button" onClick={clearSavedDevices}>
                    Borrar recientes
                  </button>
                </div>
                {recentPhones.map((phone) => (
                  <button
                    className="recent-device"
                    key={`${phone.brand}-${phone.model}-${phone.dpi}`}
                    type="button"
                    onClick={() => calculateSensitivity(phone)}
                  >
                    <span>{phone.brand} {phone.model}</span>
                    <strong>{phone.dpi} DPI</strong>
                  </button>
                ))}
              </div>
            )}

            <p className="section-label style-step-label">2 / ESTILO DE JUEGO</p>
            <StyleSelector selected={selectedStyle} onSelect={changeStyle} />
          </section>

          <section className="result-column" aria-label="Sensibilidad generada">
            {selectedPhone && sens ? (
              <div ref={resultRef} className="result-panel">
                <div className="result-heading">
                  <div>
                    <p className="section-label">3 / CONFIGURACIÓN</p>
                    <h2>Configuración estimada</h2>
                    <p className="device-name">
                      {selectedPhone.brand} {selectedPhone.model}
                    </p>
                  </div>
                  <div className="result-badges">
                    <span className="result-badge">{STYLES[selectedStyle].name}</span>
                    <span className={`result-state-badge${hasAdjustedSensitivities ? " is-adjusted" : ""}`}>
                      <span aria-hidden="true" />
                      {hasAdjustedSensitivities ? "Personalizada" : "Base estimada"}
                    </span>
                  </div>

                  <AdSlot
                    pageStatus={query.trim() && filteredPhones.length === 0 ? "empty" : "ready"}
                  />
                </div>

                <div className="sensitivity-grid">
                  {FIELDS.map((field) => (
                    <ResultCard
                      key={field.key}
                      title={field.label}
                      value={sens[field.key]}
                      color={field.color}
                      onChange={(value) => changeSensitivity(field.key, value)}
                    />
                  ))}
                </div>

                <div className="sensitivity-controls">
                  <p>Ajusta los valores a tu gusto. Usa las flechas del teclado para afinar de uno en uno.</p>
                  <button type="button" onClick={resetSensitivities}>
                    Restablecer estimación
                  </button>
                </div>

                {FIELDS.some((field) => sens[field.key] >= 200) && (
                  <p className="sensitivity-warning" role="status">
                    Uno o más valores llegaron al máximo de 200. Verifica el DPI; la fórmula limita los resultados a ese tope.
                  </p>
                )}

                <div className="dpi-row">
                  <span>{selectedPhone.id === "custom" ? "DPI introducido" : "DPI de referencia"}</span>
                  <strong>{selectedPhone.dpi}</strong>
                </div>
                <p className="method-note">
                  {selectedPhone.id === "custom"
                    ? "Estimación con el valor que introdujiste; no es una lectura del teléfono ni un valor oficial. Pruébala en entrenamiento y ajústala a tu HUD."
                    : "El DPI del catálogo es una referencia aproximada, no una lectura verificada del teléfono. La fórmula produce una estimación no oficial; pruébala en entrenamiento y ajústala a tu HUD."}
                </p>

                <section className="tuning-guide" aria-labelledby="tuning-guide-title">
                  <div className="tuning-guide-heading">
                    <span className="tuning-guide-icon" aria-hidden="true">✳</span>
                    <div>
                      <p>PRUEBA Y AJUSTA</p>
                      <h3 id="tuning-guide-title">Encuentra tu propio control</h3>
                    </div>
                  </div>
                  <ol>
                    <li><span>01</span><p>Empieza con esta base en el campo de entrenamiento.</p></li>
                    <li><span>02</span><p>Cambia un solo control por vez; usa <strong>−</strong> y <strong>+</strong> para moverlo de 5 en 5.</p></li>
                    <li><span>03</span><p>Si te funciona, guarda la configuración con un nombre para volver a ella.</p></li>
                  </ol>
                </section>

                <div className="result-actions">
                  <button className="download-button" type="button" onClick={downloadImage}>
                    Descargar imagen
                  </button>
                  <button className="copy-button" type="button" onClick={copySettings}>
                    {copied === "settings" ? "Copiado" : "Copiar valores"}
                  </button>
                </div>
                {downloadError && (
                  <p className="error-message" role="alert">
                    {downloadError}
                  </p>
                )}
                {copyError && (
                  <p className="error-message" role="alert">
                    {copyError}
                  </p>
                )}
              </div>
            ) : (
              <div className="result-placeholder" aria-live="polite">
                <div className="placeholder-art" aria-hidden="true">
                  <span className="placeholder-orbit placeholder-orbit-one" />
                  <span className="placeholder-orbit placeholder-orbit-two" />
                  <span className="placeholder-crosshair">+</span>
                </div>
                <p className="placeholder-eyebrow">TU ESPACIO DE AJUSTE</p>
                <h2>La configuración empieza aquí</h2>
                <p>
                  Elige tu dispositivo y crea una base que puedas probar,
                  personalizar y guardar.
                </p>
                <span className="placeholder-step">01 — SELECCIONA UN DISPOSITIVO</span>
              </div>
            )}

            <section className="saved-configurations" aria-labelledby="saved-configurations-title">
              <div className="saved-configurations-heading">
                <div>
                  <h2 id="saved-configurations-title">Mis configuraciones</h2>
                  <p>Se guardan en este navegador. Exporta una copia para moverlas.</p>
                </div>
                <span>{savedConfigurations.length}/{MAX_SAVED_CONFIGURATIONS}</span>
              </div>
              <div className="saved-configurations-tools">
                <button
                  type="button"
                  onClick={exportSavedConfigurations}
                  disabled={!savedConfigurations.length}
                >
                  <span aria-hidden="true">↓</span>
                  Exportar copia
                </button>
                <button
                  type="button"
                  onClick={() => backupInputRef.current?.click()}
                >
                  <span aria-hidden="true">↑</span>
                  Importar copia
                </button>
                <input
                  ref={backupInputRef}
                  type="file"
                  accept=".json,application/json"
                  aria-label="Seleccionar copia de configuraciones"
                  hidden
                  onChange={importSavedConfigurations}
                />
              </div>
              <form className="save-configuration-form" onSubmit={saveConfiguration}>
                <label className="visually-hidden" htmlFor="configuration-name">
                  Nombre de la configuración
                </label>
                <input
                  id="configuration-name"
                  type="text"
                  value={configurationName}
                  onChange={(event) => setConfigurationName(event.target.value)}
                  placeholder="Ej. Mi sensibilidad para rush"
                  maxLength={40}
                  disabled={savedConfigurations.length >= MAX_SAVED_CONFIGURATIONS}
                />
                <button
                  type="submit"
                  disabled={!selectedPhone || savedConfigurations.length >= MAX_SAVED_CONFIGURATIONS}
                >
                  Guardar actual
                </button>
              </form>
              {savedConfigurationMessage && (
                <p
                  className="saved-configurations-message"
                  role={savedConfigurationMessage.startsWith("No se pudo") ? "alert" : "status"}
                >
                  {savedConfigurationMessage}
                </p>
              )}
              {savedConfigurations.length > 0 ? (
                <ul className="saved-configurations-list">
                  {savedConfigurations.map((configuration) => (
                    <li className="saved-configuration" key={configuration.id}>
                      <div className="saved-configuration-info">
                        <strong>{configuration.name}</strong>
                        <span>
                          {configuration.phone.brand} {configuration.phone.model} · {STYLES[configuration.style].name}
                        </span>
                      </div>
                      <div className="saved-configuration-actions">
                        <label className="compare-configuration-option">
                          <input
                            type="checkbox"
                            checked={comparisonIds.includes(configuration.id)}
                            disabled={
                              comparisonIds.length >= MAX_COMPARE_CONFIGURATIONS &&
                              !comparisonIds.includes(configuration.id)
                            }
                            onChange={() =>
                              setComparisonIds((current) =>
                                toggleComparisonSelection(current, configuration.id),
                              )
                            }
                          />
                          <span>Comparar</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => applySavedConfiguration(configuration)}
                        >
                          Cargar
                        </button>
                        <button
                          type="button"
                          className="saved-configuration-delete"
                          aria-label={`Eliminar ${configuration.name}`}
                          onClick={() => deleteSavedConfiguration(configuration.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="saved-configurations-empty">
                  Aún no hay configuraciones guardadas. Ponle un nombre y pulsa Guardar actual.
                </p>
              )}
              {comparisonConfigurations.length > 0 && (
                <div className="comparison-panel">
                  <div className="comparison-heading">
                    <div>
                      <h3>Comparación</h3>
                      <p aria-live="polite">
                        {comparisonConfigurations.length} de {MAX_COMPARE_CONFIGURATIONS} seleccionadas
                        {comparisonConfigurations.length === 1
                          ? ". Elige otra para comparar."
                          : ". Diferencias calculadas respecto a la primera."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setComparisonIds([])}
                      disabled={comparisonConfigurations.length === 0}
                    >
                      Limpiar
                    </button>
                  </div>
                  {comparisonConfigurations.length >= 2 && (
                    <div
                      className="comparison-table-scroll"
                      role="region"
                      aria-label="Comparación de sensibilidades guardadas"
                      tabIndex="0"
                    >
                      <table className="comparison-table">
                        <caption className="visually-hidden">
                          Valores de sensibilidad y diferencia respecto a la primera configuración seleccionada
                        </caption>
                        <thead>
                          <tr>
                            <th scope="col">Ajuste</th>
                            {comparisonConfigurations.map((configuration) => (
                              <th scope="col" key={configuration.id}>
                                <span>{configuration.name}</span>
                                <small>
                                  {configuration.phone.brand} {configuration.phone.model}
                                </small>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {FIELDS.map((field) => {
                            const baseline = comparisonConfigurations[0].values[field.key];
                            return (
                              <tr key={field.key}>
                                <th scope="row">{field.label}</th>
                                {comparisonConfigurations.map((configuration, index) => {
                                  const value = configuration.values[field.key];
                                  const difference = value - baseline;
                                  return (
                                    <td key={configuration.id}>
                                      <strong>{value}</strong>
                                      {index > 0 && (
                                        <small>
                                          {difference > 0 ? `+${difference}` : difference}
                                        </small>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
