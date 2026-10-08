export default function Header({ catalogCount = 0 }) {
  return (
    <header className="app-header">
      <div className="brand-mark" aria-hidden="true">FF</div>
      <div>
        <h1>FF SENS PRO</h1>
        <p>Configuraciones de sensibilidad para Free Fire</p>
      </div>
      <span className="catalog-count">{catalogCount} DISPOSITIVOS</span>
    </header>
  );
}
    