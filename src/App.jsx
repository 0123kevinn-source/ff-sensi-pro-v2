import { useState, useEffect, useRef } from "react";

import html2canvas from "html2canvas";

import Header from "./components/Header";
import SearchBox from "./components/SearchBox";
import PhoneCard from "./components/PhoneCard";
import ResultCard from "./components/ResultCard";
import StyleSelector from "./components/StyleSelector";
import Loading from "./components/Loading";

import { PHONES } from "./data/phones";

import { generateSensitivity } from "./utils/generateSensitivity";

export default function App() {
  const [query, setQuery] = useState("");

  const [selectedStyle, setSelectedStyle] =
    useState("balanced");

  const [filteredPhones, setFilteredPhones] =
    useState([]);

  const [selectedPhone, setSelectedPhone] =
    useState(null);

  const [loading, setLoading] = useState(false);

  const [sens, setSens] = useState(null);

  // REF PARA EXPORTAR IMAGEN
  const resultRef = useRef(null);

  // CARGAR DATOS GUARDADOS
  useEffect(() => {
    const savedPhone =
      localStorage.getItem("selectedPhone");

    const savedSens =
      localStorage.getItem("sens");

    const savedStyle =
      localStorage.getItem("style");

    if (savedPhone) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedPhone(
        JSON.parse(savedPhone)
      );
    }

    if (savedSens) {
      setSens(JSON.parse(savedSens));
    }

    if (savedStyle) {
      setSelectedStyle(savedStyle);
    }
  }, []);

  // BUSQUEDA AUTOMATICA
  useEffect(() => {
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilteredPhones([]);
      return;
    }

    const normalize = (text) =>
      text
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");

    const search = normalize(query);

    const results = PHONES.filter((phone) => {
      const full = normalize(
        `${phone.brand} ${phone.model}`
      );

      return full.includes(search);
    });

    setFilteredPhones(results);
  }, [query]);

  // CALCULAR
  const calculateSensitivity = (phone) => {
    setLoading(true);

    setSelectedPhone(phone);

    setTimeout(() => {
      const result = generateSensitivity(
        phone.dpi,
        selectedStyle
      );

      setSens(result);

      localStorage.setItem(
        "selectedPhone",
        JSON.stringify(phone)
      );

      localStorage.setItem(
        "sens",
        JSON.stringify(result)
      );

      localStorage.setItem(
        "style",
        selectedStyle
      );

      setLoading(false);
    }, 1000);
  };

  // DESCARGAR IMAGEN
  const downloadImage = async () => {
    if (!resultRef.current) return;

    const canvas =
      await html2canvas(
        resultRef.current
      );

    const link =
      document.createElement("a");

    link.download =
      "ff-sens-pro.png";

    link.href =
      canvas.toDataURL();

    link.click();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        padding: "20px",
        fontFamily: "Arial",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <Header />

        <StyleSelector
          selected={selectedStyle}
          onSelect={setSelectedStyle}
        />

        <SearchBox
          query={query}
          setQuery={setQuery}
        />

        {/* RESULTADOS BUSQUEDA */}
        <div style={{ marginTop: "20px" }}>
          {filteredPhones.length > 0 ? (
            filteredPhones.map((phone) => (
              <PhoneCard
                key={phone.id}
                phone={phone}
                onSelect={
                  calculateSensitivity
                }
              />
            ))
          ) : query.trim() ? (
            <div
              style={{
                marginTop: "20px",
                background: "#151515",
                border: "1px solid #222",
                padding: "20px",
                borderRadius: "14px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  color: "#ff4444",
                  marginBottom: "10px",
                }}
              >
                No encontrado
              </h3>

              <p
                style={{
                  color: "#888",
                  fontSize: "14px",
                }}
              >
                Intenta escribir otro modelo
              </p>
            </div>
          ) : null}
        </div>

        {/* LOADING */}
        {loading && <Loading />}

        {/* RESULTADOS */}
        {selectedPhone &&
          sens &&
          !loading && (
            <div
              ref={resultRef}
              style={{
                marginTop: "30px",

                background:
                  "linear-gradient(135deg,#111,#0d0d0d)",

                border:
                  "1px solid #222",

                borderRadius: "22px",

                padding: "24px",

                boxShadow:
                  "0 0 30px rgba(0,255,136,0.08)",
              }}
            >
              <h2
                style={{
                  color: "#00ff88",

                  marginBottom: "20px",

                  fontSize: "28px",
                }}
              >
                🔥 FF SENS PRO
              </h2>

              <p
                style={{
                  color: "#aaa",

                  marginBottom: "20px",
                }}
              >
                {selectedPhone.brand}{" "}
                {
                  selectedPhone.model
                }
              </p>

              <ResultCard
                title="General"
                value={sens.general}
                color="#00ff88"
              />

              <ResultCard
                title="Punto Rojo"
                value={sens.redDot}
                color="#ff4444"
              />

              <ResultCard
                title="Mira 2X"
                value={sens.scope2x}
                color="#ffaa00"
              />

              <ResultCard
                title="Mira 4X"
                value={sens.scope4x}
                color="#00bbff"
              />

              <ResultCard
                title="Sniper"
                value={sens.sniper}
                color="#ff00aa"
              />

              <ResultCard
                title="Free Look"
                value={sens.freeLook}
                color="#ffffff"
              />

              <div
                style={{
                  marginTop: "20px",

                  padding: "16px",

                  background:
                    "#151515",

                  borderRadius: "14px",

                  border:
                    "1px solid #222",
                }}
              >
                <p
                  style={{
                    color: "#999",

                    fontSize: "14px",
                  }}
                >
                  DPI detectado
                </p>

                <h3
                  style={{
                    color: "#00ff88",

                    marginTop: "8px",

                    fontSize: "28px",
                  }}
                >
                  {
                    selectedPhone.dpi
                  }
                </h3>
              </div>

              <button
                onClick={downloadImage}
                style={{
                  width: "100%",

                  marginTop: "24px",

                  padding: "16px",

                  background:
                    "linear-gradient(135deg,#00ff88,#00cc6a)",

                  border: "none",

                  borderRadius: "16px",

                  color: "#000",

                  fontWeight: "700",

                  fontSize: "16px",

                  cursor: "pointer",
                }}
              >
                📸 Descargar Sensibilidad
              </button>
            </div>
          )}
      </div>
    </div>
  );
}