import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";

const MyBookingsPage = () => {
  const { session } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!session?.user) {
        setLoading(false);
        return; // No hay sesión, no hay reservas que mostrar
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch bookings for the current user
        const { data, error } = await supabase
          .from("bookings")
          .select(
            `
            id,
            status,
            created_at,
            classes (id, name, start_time, end_time, capacity, gyms (name))
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
        .from("bookings")
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

const handleReservaSubmit = async (e) => {
  e.preventDefault();
};

  return (
    <div className="pa4 tc">
      <h1 className="f2 tc mb4">Mis Reservas</h1>
      <button
        onClick={openFormForNewReserva}
        className="bn ph3 pv2 bg-blue white grow pointer f6 dib br2"
      >
        + Añadir Reserva
      </button>
      {isFormOpen && (
        <div className="measure center pa4 bg-light-gray shadow-1 br2 mb4">
          <h3 className="f4 mb3">Nueva Reserva</h3>
          <form onSubmit={handleReservaSubmit}>
            <div className="mv2">
              <label className="db fw6 lh-copy f6" htmlFor="class-name">
                Nombre
              </label>
            </div>
          </form>
        </div>
      )}

      {bookings.length === 0 ? (
        <p className="tc">Aún no tienes ninguna reserva.</p>
      ) : (
        <div className="flex flex-wrap justify-center">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white shadow-1 br3 pa3 ma3 w-100 w-40-m w-30-l tc"
            >
              <h3 className="f4 mv0">{booking.classes.name}</h3>
              <p className="f6 lh-copy measure mid-gray">
                En: {booking.classes.gyms.name}
              </p>
              <p className="f6 mt2">
                <strong>Horario:</strong>{" "}
                {new Date(booking.classes.start_time).toLocaleString()} -{" "}
                {new Date(booking.classes.end_time).toLocaleTimeString([], {
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
  );
};

export default MyBookingsPage;
