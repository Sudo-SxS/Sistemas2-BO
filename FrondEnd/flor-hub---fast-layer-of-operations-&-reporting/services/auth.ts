// services/auth.ts
// Servicio de autenticación - Token JWT manejado por el frontend en sessionStorage
// El backend devuelve el token en el body, NO en cookies

import { api } from './api';
import { tokenStorage } from './tokenStorage';

interface LoginCredentials {
  user: {
    email: string;
    password: string;
  };
}

interface AuthData {
  token: string;  // JWT token devuelto por el backend
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
}

// Respuesta del login incluye token y user
interface AuthResponse {
  success: boolean;
  user?: AuthData['user'];
  token?: string;
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

  // console.log('[AUTH LOGIN DEBUG] Response:', response);

  // Guardar token en sessionStorage si existe
  if (response.success && response.data?.token) {
    // console.log('[AUTH LOGIN DEBUG] Token received:', response.data.token.substring(0, 50) + '...');
    tokenStorage.setToken(response.data.token);
  } else {
    // console.warn('[AUTH LOGIN DEBUG] No token in response:', response);
  }

  return {
    success: response.success,
    user: response.data?.user,
    token: response.data?.token,
    message: response.message
  };
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    // Llamar al endpoint de logout del backend
    await api.post('/usuario/logout', {});
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  } finally {
    // Limpiar token de sessionStorage
    tokenStorage.removeToken();
    // Redirigir a login independientemente del resultado
    window.location.href = '/login';
  }
};

export type { AuthData, AuthResponse, LoginCredentials };
