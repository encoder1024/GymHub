import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import OneSignal from "react-onesignal";

const Navbar = () => {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await OneSignal.logout();
    setIsOpen(false);
    navigate("/");
  };

  const getRoleLinks = () => {
    // AHORA CHEQUEAMOS EXPLÍCITAMENTE SI EL PERFIL ESTÁ CARGADO
    if (loading || !session || !profile?.role) return [];

    const userRole = profile.role;
    const links = [{ to: "/profile", label: "Mi Perfil" }];

    // ... (Tu lógica de roleSpecific queda igual) ...
    const roleSpecific = {
      admin: [
        { to: "/admin/AdminGymApprovalPage", label: "Aprobar Gimnasios" },
        { to: "/admin/AdminUserManagementPage", label: "Gestionar Usuarios" },
        { to: "/admin/AdminMetricsDashboardPage", label: "Métricas" },
        { to: "/admin/membership", label: "Membresías" },
      ],
      owner: [
        { to: "/owner/gym-owner-dashboard", label: "Mi Gimnasio" },
        { to: "/owner/gym-owner-bookings", label: "Ver Reservas" },
        { to: "/admin/membership", label: "Membresías" },
      ],
      cliente: [{ to: "user/my-bookings", label: "Mis Reservas" }],
    };

    return [...links, ...(roleSpecific[userRole] || [])];
  };

  const navLinks = getRoleLinks();

  return (
    <nav className="db dt-l w-100 border-box pa1 ph5-l shadow-1 bg-white relative">
      {/* Header: Logo y Botón Hamburguesa */}
      {/* Eliminamos dtc-l aquí para que el flex-box funcione en móviles */}
      <div className="flex justify-between items-center w-100 w-25-l v-mid-l">
        <Link
          className="link dim mid-gray flex items-center"
          to="/"
          onClick={() => setIsOpen(false)}
        >
          <img src="/vite.svg" className="dib w2 h2 br-100" alt="Logo" />
          <span className="pl2 f5 fw6 dark-gray">AppGymHub</span>
        </Link>

        {/* Botón Hamburguesa (dn-l = display: none en large screens) */}
        <div className="dn-l">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-transparent bn pointer dark-gray focus-outline-none pa2"
            aria-label="Menu"
          >
            {/* ... (Iconos SVG) ... */}
            <svg className="w2 h2 fill-current" viewBox="0 0 24 24">
              {isOpen ? (
                <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7a1 1 0 00-1.41 1.41L10.59 12l-4.89 4.89a1 1 0 001.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.42z" />
              ) : (
                <path d="M4 5h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Contenedor de Links */}
      <div
        className={`${
          isOpen
            ? "db bg-near-white pa3 mt3 br2 bt b--light-gray shadow-1"
            : "dn"
        } dtc-l v-mid w-100 w-75-l tr-l mt0-l pa0-l bg-white-l bn-l shadow-none-l`}
      >
        {/* Links Públicos */}
        <Link
          className="link dim dark-gray f6 f5-l db dib-l mr3-l mb3 mb0-l fw5"
          to="/gyms"
          onClick={() => setIsOpen(false)}
        >
          Gimnasios
        </Link>
        {/* <Link
          className="link dim dark-gray f6 f5-l db dib-l mr3-l mb3 mb0-l fw5"
          to="/membership"
          onClick={() => setIsOpen(false)}
        >
          Membresías
        </Link> */}

        {isOpen && session && (
          <div className="db dn-l bt b--black-10 mb3"></div>
        )}

        {/* Links de Autenticación y Roles */}
        {/* Usamos 'loading' y 'profile' para asegurar que los links se muestren SOLO cuando tenemos todos los datos */}
        {loading ? (
          <span className="f6 f5-l dib ml3">Cargando...</span>
        ) : (
          <>
            {session ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    className="link dim dark-gray f6 f5-l db dib-l mr3-l mb3 mb0-l fw5"
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="link dim red f6 f5-l db dib-l pointer bg-transparent bn pa0 tl tr-l fw6"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                className="link dim blue f6 f5-l db dib-l fw6"
                to="/login"
                onClick={() => setIsOpen(false)}
              >
                Iniciar Sesión
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
