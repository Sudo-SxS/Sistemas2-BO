// ============================================
// BackEnd/src/constants/roles.ts
// ============================================
/**
 * ✅ ACTUALIZADO: Constantes de roles del sistema
 * Ahora solo incluye los 3 roles de la nueva BD
 */
export const ROLES = {
  SUPERVISOR: "SUPERVISOR",
  BACK_OFFICE: "BACK_OFFICE",
  VENDEDOR: "VENDEDOR",
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN"
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/**
 * ✅ ACTUALIZADO: Grupo de roles con permisos de gestión
 * SUPERVISOR y BACK_OFFICE tienen permisos administrativos
 */
export const ROLES_MANAGEMENT = [ROLES.SUPERVISOR, ROLES.BACK_OFFICE, ROLES.SUPERADMIN, ROLES.ADMIN] as const;

/**
 * ✅ ACTUALIZADO: Roles con permisos de administrador completo
 * BACK_OFFICE, SUPERADMIN y ADMIN pueden gestionar recursos
 */
export const ROLES_ADMIN = [ROLES.BACK_OFFICE, ROLES.SUPERADMIN, ROLES.ADMIN] as const;

/**
 * Roles que pueden CREAR clientes (todos los usuarios autenticados)
 */
export const ROLES_CAN_CREATE_CLIENTE = [ROLES.SUPERVISOR, ROLES.BACK_OFFICE, ROLES.VENDEDOR, ROLES.SUPERADMIN, ROLES.ADMIN] as const;

/**
 * Todos los roles del sistema
 */
export const ROLES_ALL = Object.values(ROLES);
