import Breadcrumbs from "../../components/Breadcrumbs";
import GymSearch from "../../components/GymSearch";

export default function AdminGymDetails() {
  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumbs />
      <h1>Detalles y Búsqueda de Gimnasios</h1>
      <GymSearch />
    </div>
  );
}
