import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../hooks/useAuth'; // Necesario para obtener el usuario actual

const AdminGymApprovalPage = () => {
  const { session } = useAuth();
  const [pendingGyms, setPendingGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingGyms = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // First, verify if the current user is an admin (this RLS/check might need refinement)
        // For now, we'll assume access is protected by route/ProtectedRoute and admin role check can be basic
        // In a real app, you'd query profiles for role='admin' and check permissions server-side too.

        const { data, error } = await supabase
          .from('gyms')
          .select('*')
          .eq('is_approved', false) // Filter for gyms awaiting approval
          .order('created_at', { ascending: true }); // Order by creation date

        if (error) throw error;
        setPendingGyms(data);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching pending gyms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingGyms();
  }, [session]);

  const handleApproveGym = async (gymId) => {
    if (!window.confirm('¿Estás seguro de que quieres aprobar este gimnasio?')) return;

    try {
      const { error } = await supabase
        .from('gyms')
        .update({ is_approved: true })
        .eq('id', gymId);

      if (error) throw error;
      alert('Gimnasio aprobado correctamente.');
      // Update the list to remove the approved gym
      setPendingGyms(pendingGyms.filter(gym => gym.id !== gymId));
    } catch (error) {
      alert(`Error al aprobar gimnasio: ${error.message}`);
    }
  };

  const handleRejectGym = async (gymId) => {
    if (!window.confirm('¿Estás seguro de que quieres rechazar este gimnasio? Esta acción no se puede deshacer.')) return;

    try {
      const { error } = await supabase
        .from('gyms')
        .delete()
        .eq('id', gymId);

      if (error) throw error;
      alert('Gimnasio rechazado y eliminado correctamente.');
      // Update the list to remove the rejected gym
      setPendingGyms(pendingGyms.filter(gym => gym.id !== gymId));
    } catch (error) {
      alert(`Error al rechazar gimnasio: ${error.message}`);
    }
  };

  return (
    <div className="pa4">
      <h1 className="f2 tc mb4">Aprobación de Gimnasios</h1>
      
      {loading && <p>Cargando solicitudes de gimnasios...</p>}
      {error && <p className="f6 red">{error}</p>}

      {!loading && !error && pendingGyms.length === 0 && (
        <p className="tc">No hay gimnasios pendientes de aprobación.</p>
      )}

      {!loading && !error && pendingGyms.length > 0 && (
        <div className="flex flex-wrap justify-center">
          {pendingGyms.map((gym) => (
            <div key={gym.id} className="bg-gray shadow-1 br3 pa3 ma3 w-100 w-40-m w-30-l tc">
              <h3 className="f4 mv0">{gym.name}</h3>
              <p className="f6 lh-copy measure mt2">{gym.description}</p>
              <p className="f6">Ubicación: {gym.city || 'No especificada'}</p>
              <p className="f6">Celu: {gym.phone}</p>
              <div className="mt3 flex justify-center gap-2">
                <button onClick={() => handleApproveGym(gym.id)} className="bn ph3 pv2 input-reset ba b--green bg-green grow pointer f6 dib br2 white ma2">
                  Aprobar
                </button>
                <button onClick={() => handleRejectGym(gym.id)} className="bn ph3 pv2 input-reset ba b--red bg-red grow pointer f6 dib br2 white ma2">
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGymApprovalPage;