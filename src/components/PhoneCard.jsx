import { motion } from "framer-motion";

export default function PhoneCard({
  phone,
  onSelect,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      whileHover={{
        scale: 1.03,
      }}

      whileTap={{
        scale: 0.98,
      }}

      transition={{
        duration: 0.25,
      }}

      onClick={() => onSelect(phone)}

      style={{
        background:
          "linear-gradient(135deg,#151515,#101010)",

        border: "1px solid #222",

        borderRadius: "18px",

        padding: "18px",

        marginBottom: "14px",

        cursor: "pointer",

        overflow: "hidden",

        position: "relative",

        boxShadow:
          "0 0 20px rgba(0,0,0,0.25)",
      }}
    >
      {/* GLOW */}
      <div
        style={{
          position: "absolute",
          top: "-30px",
          right: "-30px",

          width: "100px",
          height: "100px",

          background:
            "rgba(0,255,136,0.08)",

          borderRadius: "50%",

          filter: "blur(20px)",
        }}
      />

      <div
        style={{
          display: "flex",

          justifyContent:
            "space-between",

          alignItems: "center",

          position: "relative",

          zIndex: 2,
        }}
      >
        <div>
          <h3
            style={{
              color: "#ffffff",

              fontSize: "20px",

              marginBottom: "6px",

              fontWeight: "700",
            }}
          >
            {phone.brand}
          </h3>

          <p
            style={{
              color: "#00ff88",

              fontSize: "15px",

              fontWeight: "500",
            }}
          >
            {phone.model}
          </p>
        </div>

        <div
          style={{
            background: "#0f0f0f",

            padding: "10px 16px",

            borderRadius: "14px",

            border:
              "1px solid #2a2a2a",

            textAlign: "center",

            minWidth: "90px",
          }}
        >
          <p
            style={{
              color: "#777",

              fontSize: "11px",

              marginBottom: "4px",
            }}
          >
            DPI
          </p>

          <h2
            style={{
              color: "#ffaa00",

              fontSize: "24px",
            }}
          >
            {phone.dpi}
          </h2>
        </div>
      </div>
    </motion.div>
  );
}