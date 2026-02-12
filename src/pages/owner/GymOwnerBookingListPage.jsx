import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { CrudDelete } from "../../services/supaCrud";

const GymOwnerBookingListPage = () => {
  const { session } = useAuth();
  const [gym, setGym] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // 1. Fetch profile to verify role
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", session.user.id)
          .single();

        // console.log(session.user.id);

        if (profileError) throw profileError;

        if (!profileData || profileData.role !== "owner") {
          setError("No tienes permisos para acceder a esta página.");
          setLoading(false);
          return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const gymIdfromMap = urlParams.get("id");
        // console.log(gymIdfromMap); // Aquí tenés el valor pasado

        if (gymIdfromMap) {
          const { data: gymData, error: gymError } = await supabase
            .from("gyms")
            .select("*")
            .eq("owner_id", session.user.id)
            .eq("id", gymIdfromMap);

          if (gymError) throw gymError;
          if (!gymData) {
            setError("No se encontró un gimnasio asociado a tu cuenta.");
            setLoading(false);
            return;
          }
          setGym(gymData);
          // console.log("estos son los arrays: ", gymData);

          // 3. Fetch bookings for classes belonging to this gym
          const { data: bookingsData, error: bookingsError } =
            await supabase.rpc("get_confirmed_gym_bookings", {
              target_gym_id: gymData[0].id,
            });
          // console.log("el gym con las clases de las reservas: ", bookingsData);

          if (bookingsError) throw bookingsError;
          setBookings(bookingsData);
        } else {
          // 2. Fetch the gym associated with this owner
          const { data: gymData, error: gymError } = await supabase
            .from("gyms")
            .select("*")
            .eq("owner_id", session.user.id)
            .eq("is_deleted", false)
            .eq("is_approved", true);

          if (gymError) throw gymError;
          if (!gymData) {
            setError("No se encontró un gimnasio asociado a tu cuenta.");
            setLoading(false);
            return;
          }
          setGym(gymData);

          // 3. Fetch bookings for classes belonging to this gym

          const { data: bookingsData, error: bookingsError } =
            await supabase.rpc("get_confirmed_gym_bookings", {
              target_gym_id: gymData[0].id,
            });
          // console.log("el gym con las clases de las reservas: ", bookingsData);
          if (bookingsError) throw bookingsError;
          setBookings(bookingsData);
        }
      } catch (error) {
        setError(error.message);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleMisReservasGymChange = async (e) => {
    const selectedId = parseInt(e.target.value, 10);
    // console.log(
    //   "el id del Gym elegido para mostrar reservas:",
    //   selectedId,
    //   gym,
    // );
    // console.log(
    //   "el id del Gym elegido para mostrar reservas:",
    //   selectedId,
    //   gym[selectedId].id,
    //   gym,
    // );
    const { data: updatedBookings, error: fetchError } = await supabase.rpc(
      "get_confirmed_gym_bookings",
      {
        target_gym_id: gym[selectedId].id,
      },
    );

    if (!fetchError) setBookings(updatedBookings);
    // console.log("las reservas actualizadas: ", updatedBookings);
  };

  const handleDeleteBooking = async (bookId) => {
    try {
      const { error, elemId } = await CrudDelete(bookId, "bookings");

      if (error) throw error;

      setBookings(bookings.filter((bks) => bks.id !== elemId)); // Actualizar estado local
    } catch (error) {
      console.log(`Error al eliminar elemento: ${error.message}`);
    }
  };

  return (
    <div className="pa4">
      <h1 className="f2 tc mb4">Reservas de Mis Clases</h1>
      {!loading && !error && !gym && (
        <select
          name="gymId" // Importante para identificar el campo
          value={gym.id}
          onChange={handleMisReservasGymChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        >
          {/* <option value="">Seleccioná uno...</option> */}
          {gym.map((gym, i) => (
            <option key={gym.id} value={i}>
              {gym.name}
            </option>
          ))}
        </select>
      )}

      {loading && <p>Cargando reservas...</p>}
      {error && <p className="f6 red">{error}</p>}

      {!loading && !error && !gym && (
        <p className="tc">No tienes un gimnasio asociado.</p>
      )}

      {!loading && !error && gym && bookings.length === 0 && (
        <p className="tc">Aún no hay reservas para tus clases.</p>
      )}

      {/* {console.log("bookings: ", bookings)} */}
      {!loading && !error && gym && bookings.length > 0 && (
        <div className="flex flex-wrap justify-center">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-gray shadow-1 br3 pa3 ma3 w-100 w-40-m w-30-l tc"
            >
              <h3 className="f4 mv0">{booking.classes.name}</h3>
              <p className="f6 lh-copy measure">
                Reservado por: {booking.profiles?.full_name || booking.user_id}{" "}
                {/* ({booking.profiles?.email || "email no disponible"}) */}
              </p>
              <p className="f6 mt2">
                <strong>Hora:</strong>{" "}
                {new Date(booking.classes.start_time).toLocaleString()}
              </p>
              <p className="f6">
                <strong>Estado:</strong> {booking.status}
              </p>
              <div className="mt3 flex justify-center gap-2">
                <button
                  onClick={() => handleDeleteBooking(booking.id)}
                  className="bn ph3 pv2 input-reset ba b--red bg-red grow pointer f6 dib br2 white"
                >
                  Cancelar
                </button>
              </div>
              {/* Aquí se podrían añadir botones para gestionar la reserva si es necesario (ej. marcar como asistido, cancelar) */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GymOwnerBookingListPage;
