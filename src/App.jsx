import { useMemo, useRef, useState } from "react";

import Header from "./components/Header";
import SearchBox from "./components/SearchBox";
import PhoneCard from "./components/PhoneCard";
import ResultCard from "./components/ResultCard";
import StyleSelector from "./components/StyleSelector";
import { FIELDS } from "./data/fields";
import { PHONES } from "./data/phones";
import { STYLES } from "./data/styles";
import { generateSensitivity } from "./utils/generateSensitivity";
import { createCustomPhone } from "./utils/createCustomPhone";
import { searchPhones } from "./utils/searchPhones";
import { isStoredPhone } from "./utils/storage";
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
    const savedRecentPhones = readStoredValue("recentPhones");
    const style = savedStyle && VALID_STYLES.has(savedStyle)
      ? savedStyle
      : "balanced";
    const phone = isStoredPhone(savedPhone) ? savedPhone : null;

    return {
      selectedStyle: style,
      selectedPhone: phone,
      sens: phone ? generateSensitivity(phone.dpi, style) : null,
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

export default function App() {
  const [initialPreferences] = useState(loadStoredPreferences);
  const [query, setQuery] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(initialPreferences.selectedStyle);
  const [selectedPhone, setSelectedPhone] = useState(initialPreferences.selectedPhone);
  const [recentPhones, setRecentPhones] = useState(initialPreferences.recentPhones);
  const [customModel, setCustomModel] = useState("");
  const [customDpi, setCustomDpi] = useState("");
  const [customError, setCustomError] = useState("");
  const [sens, setSens] = useState(initialPreferences.sens);
  const [downloadError, setDownloadError] = useState("");
  const [copyError, setCopyError] = useState("");
  const { copied, copy } = useClipboard();
  const resultRef = useRef(null);
  const filteredPhones = useMemo(() => searchPhones(query, PHONES), [query]);

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

        <div className="app-layout">
          <section className="controls-column" aria-label="Buscar dispositivo">
            <p className="section-label">1 / DISPOSITIVO</p>
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
                    Borrar guardados
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
                  <span className="result-badge">
                    {STYLES[selectedStyle].name}
                  </span>
                </div>

                <div className="sensitivity-grid">
                  {FIELDS.map((field) => (
                    <ResultCard
                      key={field.key}
                      title={field.label}
                      value={sens[field.key]}
                      color={field.color}
                    />
                  ))}
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
              <div className="result-placeholder">
                Selecciona un dispositivo para ver una configuración sugerida.
              </div>
            )}
          </section>
        </div>
        <section className="seo-guide" aria-labelledby="guide-title">
          <h2 id="guide-title">Guía de sensibilidad para Free Fire</h2>
          <p>
            Genera una referencia inicial según el DPI que ingreses o el modelo
            de teléfono seleccionado. Los valores se calculan en tu navegador y
            puedes ajustarlos al tamaño de tus controles y a tu forma de jugar.
          </p>
          <div className="seo-guide-grid">
            <article>
              <h3>¿El DPI aumenta la sensibilidad táctil?</h3>
              <p>
                No necesariamente. En Android, la densidad afecta principalmente
                el tamaño de los elementos de interfaz; no es una medición de la
                respuesta física de la pantalla ni cambia por sí sola la
                sensibilidad dentro del juego.
              </p>
            </article>
            <article>
              <h3>¿Los valores son oficiales o garantizados?</h3>
              <p>
                No. Son estimaciones no oficiales para usar como punto de partida.
                Pruébalas en entrenamiento y haz pequeños ajustes según tu
                dispositivo, HUD y comodidad.
              </p>
            </article>
            <article>
              <h3>¿Cómo encuentro mi modelo o ingreso mi DPI?</h3>
              <p>
                Busca por marca o modelo en el catálogo. Si no aparece, puedes
                introducir un DPI entero entre 100 y 1000; la herramienta no
                detecta ni modifica los ajustes del teléfono.
              </p>
            </article>
          </div>
        </section>
        <footer className="app-footer">
          <p>
            Los dispositivos y ajustes recientes se guardan solo en este navegador.
            Puedes borrarlos desde la lista de recientes.
          </p>
          <p>
            Proyecto independiente, sin afiliación ni aval de Garena. Free Fire es
            una marca de sus respectivos titulares.
          </p>
          <p>
            Contacto: <a href="mailto:danpon421@gmail.com">danpon421@gmail.com</a>
          </p>
          <details className="legal-details">
            <summary>Privacidad y uso</summary>
            <div className="legal-copy">
              <p>
                El modelo elegido, el perfil, los valores calculados y hasta cuatro
                recientes se guardan en el almacenamiento local de este navegador.
                No se envían a un servidor de FF Sens Pro. Usa “Borrar guardados”
                para eliminarlos; borrar los datos del navegador también los quita.
              </p>
              <p>
                Esta versión no integra cuentas, pagos, anuncios, analítica ni
                fuentes externas. El proveedor de alojamiento puede procesar datos
                técnicos de las solicitudes (como la IP), según sus condiciones.
              </p>
              <p>
                El DPI/densidad sirve aquí como referencia matemática. En Android,
                la densidad escala unidades de interfaz; no equivale a la sensibilidad
                física del panel táctil ni a los controles del juego. Las sensibilidades
                son estimaciones no oficiales y deben probarse en partida.
              </p>
              <p>
                Para consultas sobre este aviso o el tratamiento de datos, escribe a{" "}
                <a href="mailto:danpon421@gmail.com">danpon421@gmail.com</a>.
                FF Sens Pro no está afiliada ni avalada por Garena.
              </p>
            </div>
          </details>
        </footer>
      </div>
    </main>
  );
}
