import { Link } from "react-router-dom";

export default function Breadcrumbs() {
  return (
    <nav style={{ marginBottom: "20px", fontSize: "14px" }}>
      <Link to="/">Inicio</Link> /{" "}
      <Link to="/gyms">Mapa de Gyms</Link> /{" "}
      <span>Búsqueda de Gym</span>
    </nav>
  );
}
