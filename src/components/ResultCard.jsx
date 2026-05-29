export default function ResultCard({
  title,
  value,
  color = "#00ff88",
}) {
  return (
    <div
      style={{
        background: "#151515",
        border: `1px solid ${color}`,
        borderRadius: "16px",
        padding: "18px",
        marginBottom: "14px",
        boxShadow: `0 0 15px ${color}22`,
      }}
    >
      <h3
        style={{
          color,
          marginBottom: "10px",
          fontSize: "18px",
        }}
      >
        {title}
      </h3>

      <div
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          color: "white",
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: "10px",
          height: "8px",
          borderRadius: "999px",
          background: "#2a2a2a",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: color,
          }}
        />
      </div>
    </div>
  );
}