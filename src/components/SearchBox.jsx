export default function SearchBox({ 
    query,
    setQuery,
    onSearch,


}) {
    return (
        <div style={{
            display: "flex",
            gap: "10px",
            marginBottom: "30px"
        }}>
            <input
                type="text"
                placeholder="Buscar..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    border:"none",
                    outline: "none",
                    backgroundColor: "#1e1e1e",
                    color: "white",
                    fontSize: "16px"
                }}
                />
            <button
                onClick={onSearch}
                style={{
                    padding: "14px 20px",
                    borderRadius: "12px",
                    border:"none",
                    background: "#00ff88",
                    color: "black",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer"
                }}
                >
                Buscar
            </button>
        </div>
    )
}