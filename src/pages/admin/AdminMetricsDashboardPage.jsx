import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../supabaseClient";

const AdminMetricsDashboardPage = () => {
  const { session } = useAuth();
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    pendingGyms: 0,
    approvedGyms: 0,
    totalBookings: 0,
    totalMemberships: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // IMPORTANT: RLS policies must be in place to ensure only admins can fetch this data.
        // For sensitive data like user counts, consider server-side aggregation or admin-specific roles.

        // Fetch total users (profiles count)
        const { count: totalUsers, error: userError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");
        if (userError) throw userError;

        // Fetch gym approval counts
        const { count: pendingGyms, error: pendingGymError } = await supabase
          .from("gyms")
          .select("*", { count: "exact", head: true })
          .eq("is_approved", false);
        if (pendingGymError) throw pendingGymError;

        const { count: approvedGyms, error: approvedGymError } = await supabase
          .from("gymsSantaFe")
          .select("*", { count: "exact", head: true })
          .eq("is_approved", true)
          .eq("is_deleted", false);
        if (approvedGymError) throw approvedGymError;

        const { count: totalGyms, error: totalGymError } = await supabase
          .from("gymsSantaFe")
          .select("*", { count: "exact", head: true })
          .not("location", "is", null);
        if (totalGymError) throw totalGymError;

        // Fetch total bookings count
        const { count: totalBookings, error: bookingsError } = await supabase
          .from("bookings_santa_fe")
          .select("*", { count: "exact", head: true })
          .eq("status", "confirmada");
        if (bookingsError) throw bookingsError;

        // Fetch total active memberships count
        const { count: totalMemberships, error: membershipsError } =
          await supabase
            .from("owner_memberships")
            .select("*", { count: "exact", head: true })
            .eq("status", "activa"); // Count only active memberships
        if (membershipsError) throw membershipsError;

        setMetrics({
          totalUsers: totalUsers || 0,
          pendingGyms: pendingGyms || 0,
          approvedGyms: approvedGyms || 0,
          totalBookings: totalBookings || 0,
          totalMemberships: totalMemberships || 0,
          totalGyms: totalGyms || 0,
        });
      } catch (error) {
        setError(error.message);
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [session]);

  return (
    <div className="pa4">
      <h1 className="f2 tc mb4">Dashboard de Administrador</h1>

      {loading && <p>Cargando métricas...</p>}
      {error && <p className="f6 red">{error}</p>}

      {!loading &&
        !error && ( // Only render if not loading and no error
          <div className="flex flex-wrap justify-center items-center">
            <div className="bg-gray shadow-1 br3 pa3 ma3 w-100 w-30-m w-25-l tc">
              <h2 className="f3 mv0">
                {metrics.totalMemberships}/{metrics.totalGyms}
              </h2>
              <p className="f5 lh-copy">Membresías Activas</p>
            </div>
            <div className="bg-gray shadow-1 br3 pa3 ma3 w-100 w-30-m w-25-l tc">
              <h2 className="f3 mv0">
                {metrics.approvedGyms}/{metrics.totalGyms}
              </h2>
              <p className="f5 lh-copy">Gimnasios Aprobados</p>
            </div>
            <div className="bg-gray shadow-1 br3 pa3 ma3 w-100 w-30-m w-25-l tc">
              <h2 className="f3 mv0">{metrics.pendingGyms}</h2>
              <p className="f5 lh-copy">Gimnasios Pendientes</p>
            </div>
            <div className="bg-gray shadow-1 br3 pa3 ma3 w-100 w-30-m w-25-l tc">
              <h2 className="f3 mv0">
                {metrics.totalUsers}/{metrics.totalGyms * 30}
              </h2>
              <p className="f5 lh-copy">Usuarios Registrados</p>
            </div>
            <div className="bg-gray shadow-1 br3 pa3 ma3 w-100 w-30-m w-25-l tc">
              <h2 className="f3 mv0">{metrics.totalBookings}</h2>
              <p className="f5 lh-copy">Reservas Totales Confirmadas</p>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminMetricsDashboardPage;
