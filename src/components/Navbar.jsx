import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

const Navbar = () => {
  const { session, profile, loading } = useAuth(); // Get loading state
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Redirige a la página de inicio tras cerrar sesión
  };

  const renderAuthLinks = () => {
    // If loading, show nothing specific to auth state yet, or a minimal loader
    if (loading) {
      return null; // Or <span className="f6 f5-l dib ml3">Cargando...</span>;
    }

    if (session) {
      const userRole = profile?.role;
      const baseLinks = [
        <Link key="profile" className="link dim dark-gray f6 f5-l dib mr3 mr4-l" to="/profile" title="Perfil">
          Mi Perfil
        </Link>,
        <Link key="my-bookings" className="link dim dark-gray f6 f5-l dib mr3 mr4-l" to="/my-bookings" title="Mis Reservas">
          Mis Reservas
        </Link>
      ];

      const roleLinks = {
        admin: [
          <Link key="admin-gym-approval" className="link dim dark-gray f6 f5-l dib mr3 mr4-l" to="/admin/gym-approval" title="Aprobación Gimnasios">
            Aprobar Gimnasios
          </Link>,
          <Link key="admin-user-management" className="link dim dark-gray f6 f5-l dib mr3 mr4-l" to="/admin/user-management" title="Gestión Usuarios">
            Gestionar Usuarios
          </Link>,
          <Link key="admin-metrics" className="link dim dark-gray f6 f5-l dib mr3 mr4-l" to="/admin/metrics" title="Dashboard Métricas">
            Métricas
          </Link>
        ],
        owner: [
          <Link key="owner-dashboard" className="link dim dark-gray f6 f5-l dib mr3 mr4-l" to="/gym-owner-dashboard" title="Dashboard Gimnasio">
            Mi Gimnasio
          </Link>,
          <Link key="owner-classes" className="link dim dark-gray f6 f5-l dib mr3 mr4-l" to="/gym-owner-classes" title="Gestionar Clases">
            Mis Clases
          </Link>,
          <Link key="owner-bookings" className="link dim dark-gray f6 f5-l dib mr3 mr4-l" to="/gym-owner-bookings" title="Reservas de Clases">
            Ver Reservas
          </Link>
        ],
        cliente: [] // Clients only have baseLinks (profile, my-bookings)
      };

      return (
        <>
          {baseLinks}
          {roleLinks[userRole] || []}
          <button
            onClick={handleLogout}
            className="link dim dark-gray f6 f5-l dib pointer bg-transparent bn"
            title="Cerrar Sesión"
          >
            Cerrar Sesión
          </button>
        </>
      );
    } else {
      // No session, show login link
      return (
        <Link className="link dim dark-gray f6 f5-l dib" to="/login" title="Login">
          Iniciar Sesión
        </Link>
      );
    }
  };

  return (
    <nav className="db dt-l w-100 border-box pa3 ph5-l shadow-1 bg-white">
      <Link className="db dtc-l v-mid mid-gray link dim w-100 w-25-l tc tl-l mb2 mb0-l" to="/" title="Home">
        <img src="/vite.svg" className="dib w2 h2 br-100" alt="AppGymHub Logo" />
        <span className="pl2 f5 fw6">AppGymHub</span>
      </Link>
      <div className="db dtc-l v-mid w-100 w-75-l tc tr-l">
        {/* Links públicos que siempre se muestran */}
        <Link className="link dim dark-gray f6 f5-l dib mr3 mr4-l" to="/gyms" title="Gimnasios">
          Gimnasios
        </Link>
        <Link className="link dim dark-gray f6 f5-l dib mr3 mr4-l" to="/membership" title="Membresías">
          Membresías
        </Link>

        {renderAuthLinks()} {/* Renderiza los links de autenticación/rol */}
      </div>
    </nav>
  );
};

export default Navbar;
