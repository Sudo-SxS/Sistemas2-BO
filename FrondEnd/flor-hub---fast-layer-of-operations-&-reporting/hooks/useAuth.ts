// hooks/useAuth.ts
// Hook simplificado para autenticación

import { useState, useCallback } from 'react';
import { login, logout } from '../services/auth';
import { VerifiedUser } from './useAuthCheck';

interface UseAuthReturn {
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  user: VerifiedUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  syncUser: (user: VerifiedUser | null) => void;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<VerifiedUser | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await login(email, password);
      
      if (response.success) {
        setLoggedIn(true);
        setUser(response.user as VerifiedUser);
        return true;
      } else {
        setError(response.message || 'Error de autenticación');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    setLoggedIn(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const syncUser = useCallback((userData: VerifiedUser | null) => {
    setUser(userData);
    setLoggedIn(!!userData);
  }, []);

  return {
    isLoggedIn: loggedIn,
    isLoading,
    error,
    user,
    login: handleLogin,
    logout: handleLogout,
    clearError,
    syncUser,
  };
};

export default useAuth;
