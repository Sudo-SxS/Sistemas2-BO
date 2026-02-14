import { VerifiedUser } from '../hooks/useAuthCheck';

export const getCurrentUserId = (): string | null => {
  // Método 1: Intentar obtener del hook useAuth
  try {
    const authUserStr = localStorage.getItem('authUser');
    if (authUserStr) {
      const parsed = JSON.parse(authUserStr);
      if (parsed.user?.id) {
        return parsed.user.id;
      }
    }
  } catch (error) {
    console.warn('Error obteniendo usuario del localStorage:', error);
  }

  // Método 2: Intentar obtener del hook useAuthCheck
  /* 
   * NOTA: No podemos usar useAuthCheck aquí porque es un hook y getCurrentUserId es una función normal.
   * Esto violaba las reglas de Hooks de React y causaba el error "Invalid hook call".
   */

  // Método 3: Fallback - ID guardado separadamente en login
  const fallbackId = localStorage.getItem('userId');
  if (fallbackId) {
    return fallbackId;
  }

  console.warn('No se pudo obtener el ID del usuario');
  return null;
};

// Helper específico para el endpoint de cambio de contraseña
export const buildPasswordChangeUrl = (userId: string): string => {
  return `/usuarios/${userId}/password`;
};

// Obtener datos completos del usuario actual (para usar en el modal si es necesario)


export const getCurrentUserData = (): VerifiedUser | null => {
  try {
    const authUserStr = localStorage.getItem('authUser');
    if (authUserStr) {
      const parsed = JSON.parse(authUserStr);
      return parsed.user || null;
    }
  } catch (error) {
    console.warn('Error obteniendo datos del usuario:', error);
    return null;
  }
};

export const saveUserIdToFallback = (userId: string) => {
  localStorage.setItem('userId', userId);
  console.log('ID guardado como fallback:', userId);
};

export const removeUserIdFallback = () => {
  localStorage.removeItem('userId');
};