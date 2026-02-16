// hooks/useAuthCheck.ts
// Hook simplificado para verificación de autenticación

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { tokenStorage } from '../services/tokenStorage';

export interface VerifiedUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  permisos: string[];
  legajo: string;
  exa: string;
  celula: number;
  estado: string;
}

interface UseAuthCheckReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: VerifiedUser | null;
  refetch: () => Promise<void>;
  setIsAuthenticated: (value: boolean) => void;
}

export const useAuthCheck = (): UseAuthCheckReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<VerifiedUser | null>(null);
  const isVerifying = useRef(false);

  const checkAuth = useCallback(async () => {
    if (isVerifying.current) return;
    isVerifying.current = true;

    try {
      // Verificar si hay token en sessionStorage primero
      if (!tokenStorage.hasToken()) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const verify1 = await api.get<VerifiedUser>('/usuario/verify');

      if (verify1.success && verify1.payload) {
        setUser(verify1.payload);
        setIsAuthenticated(true);
        return;
      }

      // Intentar refresh si el token expiró
      const refresh = await api.post<{ success: boolean; token?: string }>('/usuario/refresh', {});

      if (refresh.success) {
        // Guardar nuevo token si se devuelve
        if (refresh.token) {
          tokenStorage.setToken(refresh.token);
        }

        const verify2 = await api.get<VerifiedUser>('/usuario/verify');

        if (verify2.success && verify2.payload) {
          setUser(verify2.payload);
          setIsAuthenticated(true);
          return;
        }
      }

      // Si todo falla, limpiar token y estado
      tokenStorage.removeToken();
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      tokenStorage.removeToken();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      isVerifying.current = false;
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isAuthenticated, isLoading, user, refetch, setIsAuthenticated };
};

export default useAuthCheck;
