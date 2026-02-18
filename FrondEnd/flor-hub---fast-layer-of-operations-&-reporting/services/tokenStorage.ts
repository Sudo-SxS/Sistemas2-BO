// services/tokenStorage.ts
// Almacenamiento de token JWT en sessionStorage
// El frontend NO maneja cookies, eso lo hace el backend

export const TOKEN_KEY = 'auth_token';

export const tokenStorage = {
  /**
   * Guardar token en sessionStorage
   */
  setToken: (token: string): void => {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Error guardando token:', e);
    }
  },

  /**
   * Obtener token de sessionStorage
   */
  getToken: (): string | null => {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error leyendo token:', e);
      return null;
    }
  },

  /**
   * Eliminar token de sessionStorage
   */
  removeToken: (): void => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error eliminando token:', e);
    }
  },

  /**
   * Verificar si existe token
   */
  hasToken: (): boolean => {
    return !!tokenStorage.getToken();
  }
};
