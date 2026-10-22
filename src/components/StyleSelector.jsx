import { STYLES } from "../data/styles";

export default function StyleSelector({
  selected,
  onSelect,
}) {
  return (
    <div className="style-selector" role="group" aria-label="Perfil de juego">
      {Object.entries(STYLES).map(([id, style]) => (
        <button
          key={id}
          className={`style-option${selected === id ? " is-selected" : ""}`}
          type="button"
          aria-label={`${style.name}. ${style.description}`}
          aria-pressed={selected === id}
          style={{ "--profile-color": style.color }}
          onClick={() => onSelect(id)}
        >
          <span className="style-option-indicator" aria-hidden="true" />
          <span className="style-option-copy">
            <strong>{style.name}</strong>
            <small>{style.description}</small>
          </span>
        </button>
      ))}
    </div>
  );
}