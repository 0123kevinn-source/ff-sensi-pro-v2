export default function ResultCard({
  title,
  value,
  color = "#00ff88",
  onChange,
}) {
  return (
    <div
      className="sensitivity-card"
      style={{ "--sensitivity-color": color }}
    >
      <div className="sensitivity-card-heading">
        <h3>{title}</h3>
        <output aria-live="polite">{value}</output>
      </div>
      <div className="sensitivity-meter" aria-hidden="true">
        <div style={{ width: `${(value / 200) * 100}%` }} />
      </div>
      <label className="visually-hidden" htmlFor={`sensitivity-${title}`}>
        Ajustar sensibilidad de {title}
      </label>
      <input
        id={`sensitivity-${title}`}
        className="sensitivity-slider"
        type="range"
        min="0"
        max="200"
        step="1"
        value={value}
        aria-label={`Sensibilidad ${title}`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="sensitivity-range-labels" aria-hidden="true">
        <span>0</span>
        <span>200</span>
      </div>
    </div>
  );
}