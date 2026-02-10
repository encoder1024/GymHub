import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, roles }) => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    // Muestra un indicador de carga mientras se obtiene el perfil
    return <div>Cargando...</div>;
  }

  if (!session) {
    // Si no hay sesión, redirige al login
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(profile?.role)) {
    // Si el rol del usuario no está permitido, redirige a una página de "no autorizado" o "no encontrado"
    console.log("estos son los valores: ", roles, profile, session)
    return <Navigate to="/not-found" replace />;
  }

  // Si la sesión existe y el rol es correcto (o no se requieren roles), muestra el contenido
  return children;
};

export default ProtectedRoute;
