// hooks/useAuthErrorHandler.ts
// Hook para manejar errores de autenticación y redirigir al login cuando sea necesario

import { useCallback } from 'react';

interface UseAuthErrorHandlerReturn {
  handleAuthError: (error: any, onRedirect?: () => void) => boolean;
}

export const useAuthErrorHandler = (): UseAuthErrorHandlerReturn => {
  const handleAuthError = useCallback((error: any, onRedirect?: () => void): boolean => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Verificar si es un error de autenticación
    if (errorMessage === 'Sesión expirada' || 
        errorMessage.includes('no autorizado') ||
        errorMessage.includes('Token inválido')) {
      
      // Limpiar la cookie de token
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      
      // Redirigir al login (usando el callback proporcionado o window.location)
      if (onRedirect) {
        onRedirect();
      } else {
        window.location.href = '/login';
      }
      
      return true; // Indica que el error fue manejado
    }
    
    return false; // No es un error de autenticación
  }, []);

  return { handleAuthError };
};

export default useAuthErrorHandler;