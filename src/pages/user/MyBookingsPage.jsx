import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import GymAutocomplete from "../../components/GymAutocomplete";
import ClassCard from "../../components/ClassCard";
import { Link, useNavigate } from "react-router-dom";

const MyBookingsPage = () => {
  const { session, profile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [gymSeleccionado, setGymSeleccionado] = useState(null);
  const [isReservasOpen, setIsReservasOpen] = useState(false);
  const [isSelectedGym, setIsSelectedGym] = useState(false);
  const [classes, setClasses] = useState([]);
  const [gymActual, setGymActual] = useState([]);

  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  let gymNamefromMap = urlParams.get("name");
  let gymIdfromMap = urlParams.get("id");
  console.log(gymIdfromMap); // Aquí tenés el valor pasado

  // Esta es la función que pasaremos como parámetro
  const manejarSeleccion = async (opcion) => {
    if (opcion) {
      console.log("ID del Gym elegido:", opcion.value);
      console.log("Nombre del Gym elegido:", opcion.label);

      // Guardamos la elección en el estado del padre
      setGymSeleccionado(opcion);
      setIsSelectedGym(true);
      setLoading(true);
      try {
        const { data: gymData, error: gymError } = await supabase
          .from("gymsSantaFe")
          .select("*")
          .eq("id", opcion.value);

        if (gymError) throw gymError;

        setGymActual(gymData);

        const { data: classesData, error: classesError } = await supabase
          .from("classes_santa_fe")
          .select("*")
          .eq("gym_id", opcion.value)
          .order("start_time", { ascending: false });

        if (classesError) throw classesError;

        console.log("estas son las clases:", classesData);
        setClasses(classesData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
      // 3. Fetch classes for this gym
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (!session?.user) {
        setLoading(false);
        return; // No hay sesión, no hay reservas que mostrar
      }

      if (!profile || profile.role !== "cliente") {
        setError("No tienes permisos para acceder a esta página.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch bookings for the current user
        const { data, error } = await supabase
          .from("bookings_santa_fe")
          .select(
            `
            id,
            status,
            created_at,
            classes_santa_fe (id, name, start_time, end_time, capacity, gymsSantaFe (title))
          `,
          )
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }); // Mostrar las más recientes primero

        if (error) throw error;
        setBookings(data);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    if (gymIdfromMap) {
      setIsFormOpen(true);
      manejarSeleccion({ value: gymIdfromMap, label: gymNamefromMap });
    }
  }, [session]);

  // Función para cancelar una reserva (simplificada)
  const handleCancelBooking = async (bookingId) => {
    if (
      !window.confirm("¿Estás seguro de que quieres cancelar esta reserva?")
    ) {
      return;
    }
    try {
      const { error } = await supabase
        .from("bookings_santa_fe")
        .delete()
        .eq("id", bookingId)
        .eq("user_id", session.user.id); // Asegurarse que solo el dueño pueda cancelar

      if (error) throw error;
      alert("Reserva cancelada exitosamente.");
      // Actualizar la lista de reservas
      setBookings(bookings.filter((booking) => booking.id !== bookingId));
    } catch (error) {
      alert(`Error al cancelar reserva: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="pa4 tc">Cargando tus reservas...</div>;
  }

  if (error) {
    return <div className="pa4 tc red">Error al cargar reservas: {error}</div>;
  }

  if (!session?.user) {
    return (
      <div className="pa4 tc">
        Por favor,{" "}
        <Link to="/login" className="blue link">
          inicia sesión
        </Link>{" "}
        para ver tus reservas.
      </div>
    );
  }

  const openFormForNewReserva = () => {
    setIsFormOpen(true);
    setIsReservasOpen(false);
    setIsSelectedGym(false);
    //TODO: tengo que cargar las clases de todos los gimnacios
    // y mostrar Gym: Clase titulo y cargarlo en el ListView
    //TODO: Cuando seleccione una clase, tengo que mostrar los datos
    // de esa clase en el mismo formulario fecha y horario.
    //TODO: Que si elije otra clase, se vuelva a actualizar los datos.
    //TODO: el listView tendrá la opción de venir desde el mapa de gyms
    // con un gymMap.id para filtrar la lista o mostrar todas las
    // clases de todos los gym
    // también tendrá un boton que borrará ese filtro que viene del mapa
  };



  const openMostrarReservas = () => {
    setIsReservasOpen(true);
    setIsFormOpen(false);
    setIsSelectedGym(false);
    //TODO: el listView tendrá la opción de venir desde el mapa de gyms
    // con un gymMap.id para filtrar la lista o mostrar todas las
    // clases de todos los gym
    // también tendrá un boton que borrará ese filtro que viene del mapa
  };

  const handleReservas = (reservClass, reservGym) => {
    const planoGym = reservGym && reservGym[0];

    console.log(
      "llegué a la función que carga la reserva... y los parametros?",
      reservClass,
      planoGym,
    ); //NOW
    navigate("/user/book-checkout", {
      state: {
        clase: reservClass,
        gym: planoGym,
        profile: profile,
        session: session,
      },
    });
  };

  return (
    <div className="pa1 tc">
      <h1 className="f2 tc mb4">Mis Reservas</h1>
      <button
        onClick={openFormForNewReserva}
        className="bn ph3 pv2 bg-blue white grow pointer f6 dib br2 ma2"
      >
        + Añadir Reserva
      </button>
      <button
        onClick={openMostrarReservas}
        className="bn ph3 pv2 bg-green white grow pointer f6 dib br2 ma2"
      >
        Mostrar mis Reservas
      </button>
      {isReservasOpen && (
        <div className="pa4 tc">
          {bookings.length === 0 ? (
            <p className="tc">Aún no tienes ninguna reserva.</p>
          ) : (
            <div className="flex flex-wrap justify-center">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white shadow-1 br3 pa3 ma3 w-100 w-40-m w-30-l tc"
                >
                  <h3 className="f4 mv0">{booking.classes_santa_fe.name}</h3>
                  <p className="f6 lh-copy measure mid-gray">
                    En: {booking.classes_santa_fe.gymsSantaFe.title}
                  </p>
                  <p className="f6 mt2">
                    <strong>Horario:</strong>{" "}
                    {new Date(
                      booking.classes_santa_fe.start_time,
                    ).toLocaleString()}{" "}
                    -{" "}
                    {new Date(
                      booking.classes_santa_fe.end_time,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="f6">
                    <strong>Estado:</strong> {booking.status}
                  </p>
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="bn ph3 pv2 input-reset ba b--red bg-red grow pointer f6 dib br2 white mt3"
                  >
                    Cancelar Reserva
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {isFormOpen && (
        <div className="measure center pa1 br2">
          <h3 className="f4 mb3">Nueva Reserva</h3>
          <GymAutocomplete
            onSelectGym={manejarSeleccion}
            value={gymNamefromMap ? gymNamefromMap : null}
            idValue={gymIdfromMap ? gymIdfromMap : null}
          />
          {/* Sección de Clases */}
        </div>
      )}
      {isFormOpen && isSelectedGym && !loading && (
        <div className="center pa2 br2 mb4">
          <h3 className="f5 mv2">Clases Disponibles:</h3>
          {classes.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4 p-4">
              {classes.map((cls) => (
                <ClassCard
                  key={cls.id}
                  classInfo={cls}
                  gymInfo={gymActual}
                  onBook={handleReservas}
                  tabla="SantaFe" // Pasa la función onBook a ClassCard sea lo que sea
                />
              ))}
            </div>
          ) : (
            <p className="f6 mid-gray">
              <strong>{gymNamefromMap}</strong> no tiene clases programadas actualmente.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
