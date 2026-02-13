import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useSearchParams } from "react-router-dom";

export default function ClassSearch() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // Filtros
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterCapacity, setFilterCapacity] = useState("");

  const searchableColumns = ["name", "description"];

  const highlight = (text) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text?.toString().replace(regex, "<mark>$1</mark>");
  };

  const formatPhoneForWhatsApp = (phone) => {
    if (!phone) return null;
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length <= 10) cleaned = "54" + cleaned;
    return cleaned;
  };

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
      .from("classes_santa_fe")
      .select(
        `
        id,
        name,
        description,
        start_time,
        end_time,
        capacity,
        gymsSantaFe (
          id,
          title,
          street,
          phone,
          website,
          city,
          state
        )
      `,
      )
      .or(orFilter)
      .limit(50); // traemos más para filtrar

    if (!error) {
      let filtered = [...data];

      // FILTRO POR RANGO DE FECHAS (start_time)
      if (filterDateFrom) {
        const from = new Date(filterDateFrom);
        filtered = filtered.filter((cls) => {
          const start = new Date(cls.start_time);
          return start >= from;
        });
      }

      if (filterDateTo) {
        const to = new Date(filterDateTo);
        filtered = filtered.filter((cls) => {
          const start = new Date(cls.start_time);
          return start <= to;
        });
      }

      // FILTRO POR HORARIO
      if (filterStart || filterEnd) {
        filtered = filtered.filter((cls) => {
          const start = new Date(cls.start_time);
          const end = new Date(cls.end_time);

          const startMinutes = start.getHours() * 60 + start.getMinutes();
          const endMinutes = end.getHours() * 60 + end.getMinutes();

          const filterStartMin = filterStart
            ? parseInt(filterStart.split(":")[0]) * 60 +
              parseInt(filterStart.split(":")[1])
            : 0;

          const filterEndMin = filterEnd
            ? parseInt(filterEnd.split(":")[0]) * 60 +
              parseInt(filterEnd.split(":")[1])
            : 24 * 60;

          return endMinutes >= filterStartMin && startMinutes <= filterEndMin;
        });
      }

      // FILTRO POR CAPACIDAD
      if (filterCapacity) {
        filtered = filtered.filter(
          (cls) => cls.capacity >= parseInt(filterCapacity),
        );
      }

      // ORDENAMIENTO
      if (sortColumn) {
        filtered.sort((a, b) => {
          const valA = a[sortColumn] ?? "";
          const valB = b[sortColumn] ?? "";

          return sortDirection === "asc"
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
        });
      }

      setResults(filtered.slice(0, 10)); // máximo 10
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
  }, [
    query,
    sortColumn,
    sortDirection,
    filterDateFrom,
    filterDateTo,
    filterStart,
    filterEnd,
    filterCapacity,
  ]);

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

  const resetFilters = () => {
    setQuery("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterStart("");
    setFilterEnd("");
    setFilterCapacity("");
    setSortColumn(null);
    setSortDirection("asc");
    setResults([]);
  };

  return (
    <div className="container">
      {/* INPUT PRINCIPAL */}
      <input
        type="text"
        placeholder="Buscar por nombre o descripción..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />

      {/* FILTROS */}
      <div className="filters">
        <div>
          <label>Fecha desde:</label>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
          />
        </div>

        <div>
          <label>Fecha hasta:</label>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
          />
        </div>

        <div>
          <label>Hora desde:</label>
          <input
            type="time"
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
          />
        </div>

        <div>
          <label>Hora hasta:</label>
          <input
            type="time"
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
          />
        </div>

        <div>
          <label>Capacidad mínima:</label>
          <input
            type="number"
            min="0"
            value={filterCapacity}
            onChange={(e) => setFilterCapacity(e.target.value)}
          />
        </div>
        <button className="reset-button" onClick={resetFilters}>
          Resetear filtros
        </button>
      </div>

      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}

      {!loading && results.length === 0 && query !== "" && (
        <p>No se encontraron clases.</p>
      )}

      {!loading && results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th onClick={() => toggleSort("name")}>
                Clase {sortIndicator("name")}
              </th>
              <th onClick={() => toggleSort("description")}>
                Descripción {sortIndicator("description")}
              </th>
              <th onClick={() => toggleSort("start_time")}>
                Inicio {sortIndicator("start_time")}
              </th>
              <th onClick={() => toggleSort("end_time")}>
                Fin {sortIndicator("end_time")}
              </th>
              <th onClick={() => toggleSort("capacity")}>
                Capacidad {sortIndicator("capacity")}
              </th>
              <th>Gimnasio</th>
              <th>Dirección</th>
              <th>Contacto</th>
            </tr>
          </thead>

          <tbody>
            {results.map((cls) => (
              <tr key={cls.id}>
                <td dangerouslySetInnerHTML={{ __html: highlight(cls.name) }} />
                <td
                  dangerouslySetInnerHTML={{
                    __html: highlight(cls.description),
                  }}
                />
                <td>{new Date(cls.start_time).toLocaleString()}</td>
                <td>{new Date(cls.end_time).toLocaleString()}</td>
                <td>{cls.capacity}</td>

                <td
                  dangerouslySetInnerHTML={{
                    __html: highlight(cls.gymsSantaFe?.title),
                  }}
                />
                <td
                  dangerouslySetInnerHTML={{
                    __html: highlight(cls.gymsSantaFe?.street),
                  }}
                />

                <td
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: highlight(cls.gymsSantaFe?.phone),
                    }}
                  />

                  {cls.gymsSantaFe?.phone && (
                    <button
                      onClick={() => {
                        const formatted = formatPhoneForWhatsApp(
                          cls.gymsSantaFe.phone,
                        );
                        if (formatted) {
                          window.open(`https://wa.me/${formatted}`, "_blank");
                        }
                      }}
                      className="wa-button"
                      title="Enviar WhatsApp"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M20.52 3.48A11.8 11.8 0 0 0 12 0C5.37 0 .02 5.35.02 11.98c0 2.11.55 4.17 1.6 5.98L0 24l6.22-1.63a12 12 0 0 0 5.78 1.47h.01c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.36zM12 21.82c-1.8 0-3.56-.48-5.1-1.39l-.37-.22-3.69.97.99-3.6-.24-.37a9.77 9.77 0 0 1-1.5-5.23C2.09 6.47 6.47 2.1 12 2.1c2.6 0 5.04 1.01 6.88 2.85A9.66 9.66 0 0 1 21.9 12c0 5.53-4.38 9.82-9.9 9.82zm5.47-7.35c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.5 0 1.48 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.48.71.31 1.26.5 1.7.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ESTILOS */}
      <style>
        {`
          :root {
            color-scheme: light dark;
          }

          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 20px;
          }

          .search-input {
            width: 100%;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #ccc;
            background: white;
            color: black;
          }
            .reset-button {
              padding: 8px 14px;
              background: #d9534f;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              height: fit-content;
              align-self: flex-end;
            }

            .reset-button:hover {
              background: #c9302c;
            }

            @media (prefers-color-scheme: dark) {
              .reset-button {
                background: #b52b27;
              }
              .reset-button:hover {
                background: #8e1f1c;
              }
            }

          @media (prefers-color-scheme: dark) {
            .search-input {
              background: #1e1e1e;
              color: #eee;
              border-color: #555;
            }
          }

          .filters {
            display: flex;
            gap: 20px;
            margin-top: 20px;
            flex-wrap: wrap;
          }

          .filters div {
            display: flex;
            flex-direction: column;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            padding: 10px;
            border-bottom: 1px solid #444;
            text-align: left;
          }

          th {
            cursor: pointer;
            user-select: none;
          }

          th:hover {
            background: rgba(255,255,255,0.1);
          }

          mark {
            background: #ffeb3b;
            color: black;
            padding: 0 2px;
            border-radius: 2px;
          }

          @media (prefers-color-scheme: dark) {
            mark {
              background: #ff9800;
              color: black;
            }
          }

          .spinner-container {
            margin-top: 20px;
            text-align: center;
          }

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

          .wa-button {
            padding: 4px 8px;
            background: #25d366;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .wa-button:hover {
            background: #1ebe5d;
          }

          @media (prefers-color-scheme: dark) {
            .wa-button {
              background: #128c7e;
            }
            .wa-button:hover {
              background: #0f6f63;
            }
          }
        `}
      </style>
    </div>
  );
}
