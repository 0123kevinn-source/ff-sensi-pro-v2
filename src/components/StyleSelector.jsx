import { STYLES } from "../data/styles";

export default function StyleSelector({
  selected,
  onSelect,
}) {
  return (
    <div
      className="style-selector"
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      {Object.entries(STYLES).map(([id, style]) => (
        <button
          key={id}
          title={style.description}
          aria-label={`${style.name}. ${style.description}`}
          aria-pressed={selected === id}
          onClick={() => onSelect(id)}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "14px",
            border:
              selected === id
                ? `2px solid ${style.color}`
                : "1px solid #333",

            background:
              selected === id
                ? "#1e1e1e"
                : "#121212",

            color:
              selected === id
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