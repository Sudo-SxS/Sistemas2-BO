// services/auth.ts
// Servicio de autenticación - Cookies httpOnly manejadas automáticamente por el backend

import { api } from './api';

interface LoginCredentials {
  user: {
    email: string;
    password: string;
  };
}

interface AuthData {
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    exa: string;
    legajo: string;
    rol: string;
    permisos: string[];
  };
  // El token ya no viene en el body, está en la cookie httpOnly
}

// Respuesta del login ahora devuelve user directamente
interface AuthResponse {
  success: boolean;
  user?: AuthData['user'];
  message?: string;
}

// Login
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const credentials: LoginCredentials = {
    user: {
      email,
      password
    }
  };
  
  const response = await api.post<AuthData>('/usuario/login', credentials);
  
  // El token se guarda automáticamente en cookie httpOnly por el backend
  return response;
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    // Llamar al endpoint de logout del backend para eliminar la cookie
    await api.post('/usuario/logout', {});
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  } finally {
    // Redirigir a login independientemente del resultado
    window.location.href = '/login';
  }
};

export type { AuthData, AuthResponse, LoginCredentials };
