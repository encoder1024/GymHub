import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom'; // Para enlaces

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
          .from('profiles')
          .select('id, role')
          .eq('id', session.user.id)
          .single();
        
        // console.log(session.user.id);

        if (profileError) throw profileError;

        if (!profileData || profileData.role !== 'owner') {
          setError("No tienes permisos para acceder a esta página.");
          setLoading(false);
          return;
        }

        // 2. Fetch the gym associated with this owner
        const { data: gymData, error: gymError } = await supabase
          .from('gyms')
          .select('*')
          .eq('owner_id', session.user.id)
          .single();

        if (gymError) throw gymError;
        if (!gymData) {
            setError("No se encontró un gimnasio asociado a tu cuenta.");
            setLoading(false);
            return;
        }
        setGym(gymData);

        // 3. Fetch bookings for classes belonging to this gym
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            status,
            created_at,
            user_id,
            profiles (full_name, email),
            classes (id, name, start_time, end_time, gyms(id))
          `)
          .eq('classes.gym_id', gymData.id) // Filter by gym_id
          .order('created_at', { ascending: false }); // Show most recent first

        if (bookingsError) throw bookingsError;
        setBookings(bookingsData);

      } catch (error) {
        setError(error.message);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  return (
    <div className="pa4">
      <h1 className="f2 tc mb4">Reservas de Mis Clases</h1>
      
      {loading && <p>Cargando reservas...</p>}
      {error && <p className="f6 red">{error}</p>}

      {!loading && !error && !gym && <p className="tc">No tienes un gimnasio asociado.</p>}

      {!loading && !error && gym && bookings.length === 0 && (
        <p className="tc">Aún no hay reservas para tus clases.</p>
      )}

      {!loading && !error && gym && bookings.length > 0 && (
        <div className="flex flex-wrap justify-center">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white shadow-1 br3 pa3 ma3 w-100 w-40-m w-30-l tc">
              <h3 className="f4 mv0">{booking.classes.name}</h3>
              <p className="f6 lh-copy measure mid-gray">
                Reservado por: {booking.profiles?.full_name || booking.user_id} ({booking.profiles?.email || 'email no disponible'})
              </p>
              <p className="f6 mt2">
                <strong>Hora:</strong> {new Date(booking.classes.start_time).toLocaleString()}
              </p>
              <p className="f6"><strong>Estado:</strong> {booking.status}</p>
              {/* Aquí se podrían añadir botones para gestionar la reserva si es necesario (ej. marcar como asistido, cancelar) */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GymOwnerBookingListPage;