export default function Header({ catalogCount = 0 }) {
  return (
    <header className="app-header">
      <div className="brand-mark" aria-hidden="true">FF</div>
      <div className="brand-copy">
        <h1>FF SENS PRO</h1>
        <p>Tu punto de partida, a tu manera</p>
      </div>
      <nav className="header-navigation" aria-label="Navegación principal">
        <a href="#sensitivity-tool">Herramienta</a>
        <a href="#publisher-content">Guía</a>
        <a href="/sobre-nosotros/">Acerca de</a>
      </nav>
      <span className="catalog-count">
        <span className="catalog-status-dot" aria-hidden="true" />
        {catalogCount} modelos
      </span>
    </header>
  );
}
    