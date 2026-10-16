export default function SearchBox({ query, setQuery }) {
    return (
        <form
            className="search-form"
            onSubmit={(event) => event.preventDefault()}
            role="search"
        >
            <label className="visually-hidden" htmlFor="phone-search">
                Buscar marca o modelo de teléfono
            </label>
            <input
                id="phone-search"
                type="search"
                placeholder="Ej. Samsung A54"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
                maxLength={80}
            />
            {query && (
                <button
                    className="clear-search"
                    type="button"
                    aria-label="Limpiar búsqueda"
                    title="Limpiar búsqueda"
                    onClick={() => setQuery("")}
                >
                    <span aria-hidden="true">×</span>
                </button>
            )}
        </form>
    );
}