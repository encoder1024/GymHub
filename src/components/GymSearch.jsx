import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useSearchParams } from "react-router-dom";

export default function GymSearch() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const searchableColumns = [
    "street",
    "title",
    "category_name",
    "phone",
    "website",
  ];

  const fetchResults = async (text) => {
    if (!text || text.trim() === "") {
      setResults([]);
      return;
    }

    setLoading(true);

    const orFilter = searchableColumns
      .map((col) => `${col}.ilike.%${text}%`)
      .join(",");

    const { data, error } = await supabase
      .from("gymsSantaFe")
      .select("*")
      .or(orFilter)
      .limit(10);

    if (!error) {
      let sorted = [...data];

      if (sortColumn) {
        sorted.sort((a, b) => {
          const valA = a[sortColumn] ?? "";
          const valB = b[sortColumn] ?? "";

          if (typeof valA === "number" && typeof valB === "number") {
            return sortDirection === "asc" ? valA - valB : valB - valA;
          }

          return sortDirection === "asc"
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
        });
      }

      setResults(sorted);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (initialQuery) fetchResults(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const delay = setTimeout(() => fetchResults(query), 300);
    return () => clearTimeout(delay);
  }, [query, sortColumn, sortDirection]);

  const toggleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortIndicator = (column) => {
    if (sortColumn !== column) return "";
    return sortDirection === "asc" ? "▲" : "▼";
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <input
        type="text"
        placeholder="Buscar por nombre, calle, categoría, teléfono o web..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          background: "white" /* 👈 fuerza fondo claro */,
          color: "black" /* 👈 fuerza texto oscuro */,
        }}
      />

      {loading && (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <div className="spinner"></div>
        </div>
      )}

      <style>
        {`
          .spinner {
            width: 32px;
            height: 32px;
            border: 4px solid #ccc;
            border-top-color: #333;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }

          th {
            cursor: pointer;
            user-select: none;
          }

          th:hover {
            background: #f5f5f5;
          }
        `}
      </style>

      {!loading && results.length === 0 && query !== "" && (
        <p>No se encontraron resultados.</p>
      )}

      {!loading && results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th onClick={() => toggleSort("title")}>
                Nombre {sortIndicator("title")}
              </th>
              <th onClick={() => toggleSort("street")}>
                Calle {sortIndicator("street")}
              </th>
              <th onClick={() => toggleSort("category_name")}>
                Categoría {sortIndicator("category_name")}
              </th>
              <th onClick={() => toggleSort("phone")}>
                Teléfono {sortIndicator("phone")}
              </th>
              <th onClick={() => toggleSort("website")}>
                Web {sortIndicator("website")}
              </th>
              <th onClick={() => toggleSort("city")}>
                Ciudad {sortIndicator("city")}
              </th>
              <th onClick={() => toggleSort("state")}>
                Estado {sortIndicator("state")}
              </th>
            </tr>
          </thead>

          <tbody>
            {results.map((gym) => (
              <tr key={gym.id}>
                <td>{gym.title}</td>
                <td>{gym.street}</td>
                <td>{gym.category_name}</td>
                <td>{gym.phone}</td>
                <td>
                  {gym.website && (
                    <a
                      href={gym.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {gym.website}
                    </a>
                  )}
                </td>
                <td>{gym.city}</td>
                <td>{gym.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
