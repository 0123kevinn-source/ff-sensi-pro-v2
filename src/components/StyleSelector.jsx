const styles = [
  {
    id: "aggressive",
    name: "Agresivo",
    color: "#ff3b3b",
  },

  {
    id: "balanced",
    name: "Equilibrado",
    color: "#00ff88",
  },

  {
    id: "sniper",
    name: "Sniper",
    color: "#00bfff",
  },
];

export default function StyleSelector({
  selected,
  onSelect,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      {styles.map((style) => (
        <button
          key={style.id}
          onClick={() => onSelect(style.id)}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "14px",
            border:
              selected === style.id
                ? `2px solid ${style.color}`
                : "1px solid #333",

            background:
              selected === style.id
                ? "#1e1e1e"
                : "#121212",

            color:
              selected === style.id
                ? style.color
                : "#999",

            cursor: "pointer",
            transition: "0.2s",
            fontWeight: "bold",
          }}
        >
          {style.name}
        </button>
      ))}
    </div>
  );
}