import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// Componente de carga mientras se verifica la autenticación
const LoadingScreen = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "18px",
    }}
  >
    <div>Verificando autenticación...</div>
  </div>
);

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mientras está cargando, mostrar pantalla de carga
  if (loading) {
    return <LoadingScreen />;
  }

  // Si no está autenticado después de cargar, redirigir a login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado, mostrar la ruta protegida
  return children;
};

// Componente para rutas públicas (como login) que redirigen si ya estás autenticado
export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mientras está cargando, mostrar pantalla de carga
  if (loading) {
    return <LoadingScreen />;
  }

  // Si ya está autenticado, redirigir a donde venía o al dashboard
  if (user) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  // Si no está autenticado, mostrar la página pública
  return children;
};
