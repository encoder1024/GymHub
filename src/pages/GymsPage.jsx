import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import { supabase } from "../supabaseClient";
import GymCard from "../components/GymCard";
import ClassCard from "../components/ClassCard"; // Importar ClassCard
import MapLibreMapComponent from "../components/MapLibreMapComponent";
import { cargaDBSantaFe } from "../services/santaFeService";

const GymsPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate(); // Hook para navegación programática
  const [userLocation, setUserLocation] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock classes data for demonstration, this would ideally come from DB
  const mockGymData = [
    {
      id: 1,
      name: "Gimnasio Força",
      description:
        "El mejor lugar para entrenar pesas y cardio en el centro de la ciudad.",
      location_coords: { type: "Point", coordinates: [-34.6037, -58.3816] }, // Buenos Aires
      classes: [
        {
          id: 101,
          name: "Yoga Flow",
          description: "Sesión relajante de yoga.",
          start_time: new Date(Date.now() + 60 * 60 * 1000),
          end_time: new Date(Date.now() + 2 * 60 * 60 * 1000),
          capacity: 15,
        },
        {
          id: 102,
          name: "Spinning Intensivo",
          description: "Entrenamiento cardiovascular de alta intensidad.",
          start_time: new Date(Date.now() + 2 * 60 * 60 * 1000),
          end_time: new Date(Date.now() + 3 * 60 * 60 * 1000),
          capacity: 20,
        },
      ],
    },
    {
      id: 2,
      name: "Studio Yoga Zen",
      description:
        "Encuentra tu paz interior con nuestras clases de yoga y meditación.",
      location_coords: { type: "Point", coordinates: [-34.61, -58.4] }, // Buenos Aires
      classes: [
        {
          id: 103,
          name: "Meditación Guiada",
          description: "Sesión para reducir el estrés.",
          start_time: new Date(Date.now() + 3 * 60 * 60 * 1000),
          end_time: new Date(Date.now() + 4 * 60 * 60 * 1000),
          capacity: 10,
        },
      ],
    },
    // Add more mock gyms if needed
  ];

  useEffect(() => {
    const fetchGymsAndClasses = async () => {
      setLoading(true);
      setError(null);

      // cargaDBSantaFe();
      //mostrarGymsSantaFe();

      // 1. Obtener ubicación del usuario
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // 2. Llamar a la función RPC de Supabase para obtener gimnasios cercanos
          try {
            // const { data, error } = await supabase.rpc("buscar_gyms_cercanos", {
            //   lat: latitude,
            //   long: longitude,
            // });

            const { data, error } = await supabase.rpc(
              "get_all_gyms_with_coords_json",
            );

            console.log("cantidad de gyms con coordenadas: ", data.length); // Aquí verás el número real total

            console.log("los gym cercanos", data);

            setGyms(data);

            if (error) throw error;
            // For demonstration, merge mock classes with fetched gyms if fetched gyms lack classes
            // In a real app, you'd fetch classes related to these gyms from DB
            const gymsWithClasses = data.map((gym) => ({
              ...gym,
              // If gym.classes is not returned by RPC, use mock classes.
              // Realistically, this would involve another Supabase query.
              classes:
                gym.classes ||
                mockGymData.find((mock) => mock.id === gym.id)?.classes ||
                [],
            }));
            setGyms(gymsWithClasses);
          } catch (error) {
            setError(error.message);
            console.error("Error fetching nearby gyms:", error);
            // Fallback to mock data if fetching fails and mock data exists
            if (mockGymData) {
              setGyms(mockGymData);
            }
          } finally {
            setLoading(false);
          }
        },
        (geoError) => {
          setError(
            `Error al obtener ubicación: ${geoError.message}. Verifique permisos.`,
          );
          setLoading(false);
          // Fallback to mock data if geolocation fails
          if (mockGymData) {
            setGyms(mockGymData);
          }
        },
      );
    };

    fetchGymsAndClasses();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para manejar la reserva de una clase
  const handleBookClass = async (classInfo) => {
    if (!session?.user) {
      alert("Debes iniciar sesión para reservar una clase.");
      navigate("/login"); // Redirige a login si no hay sesión
      return;
    }

    if (
      !window.confirm(`¿Estás seguro de querer reservar "${classInfo.name}"?`)
    ) {
      return;
    }

    try {
      // Asumiendo que 'classes' table has a 'capacity' column and we need to check/decrement it.
      // For simplicity, this example doesn't handle capacity checks here; it would be done in an RLS policy or a server function.

      const { data, error } = await supabase.from("bookings").insert([
        {
          user_id: session.user.id,
          class_id: classInfo.id,
          status: "confirmada",
        },
      ]);

      if (error) throw error;
      alert("¡Reserva realizada con éxito!");
      // Aquí podrías refrescar las clases o mostrar un mensaje de éxito
      // Para simplificar, solo mostramos alerta. Una app real podría mostrar confirmación.
    } catch (error) {
      alert(`Error al reservar: ${error.message}`);
      console.error("Error booking class:", error);
    }
  };

  return (
    <div className="pa4">
      <h1 className="f2">Explora Gimnasios Cercanos</h1>
      {error && <p className="f6 red">{error}</p>}

      {loading && <p>Cargando mapa y gimnasios...</p>}

      {!loading && <MapLibreMapComponent gymsArray={gyms} />}

      <div className="flex flex-wrap">
        {/* Sección del Mapa */}

        {/* Sección de Lista de Gimnasios */}
        <div className="w-100 w-40-l pl3-l">
          <h2 className="f3">Gimnasios Cercanos</h2>
          {loading && !error && <p>Cargando gimnasios...</p>}
          {!loading && !error && gyms.length === 0 && (
            <p>No se encontraron gimnasios cerca.</p>
          )}
          {!loading && !error && gyms.length > 0 && (
            <div className="flex flex-column items-center">
              {gyms.map((gym) => (
                <div key={gym.id} className="mb3 w-100">
                  {/* GymCard ahora renderiza clases y espera onBook */}
                  <GymCard
                    gym={gym} // Pasar el objeto gym completo
                    onBook={handleBookClass} // Pasar la función de reserva
                  />
                  <p className="f7 mid-gray tc">
                    Distancia: {(gym.dist_meters / 1000).toFixed(2)} km
                  </p>
                  <button
                    className="bn bg-transparent pointer blue f6"
                    // onClick={() =>
                    //   gym.location_coords &&
                    //   centerMap(
                    //     gym.location_coords.coordinates[1],
                    //     gym.location_coords.coordinates[0],
                    //   )
                    // }
                  >
                    Ver en el mapa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GymsPage;
