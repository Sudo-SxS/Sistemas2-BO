// ============================================
// BackEnd/src/schemas/persona/User.ts
// ============================================
import { z } from "zod";
import { PersonaSchema } from "./Persona.ts";

// ============================================
// ENUMS Y CONSTANTES
// ============================================

/**
 * ✅ Roles del sistema según nueva BD
 */
export const ROLES = z.enum(["ADMIN", "SUPERADMIN", "SUPERVISOR", "BACK_OFFICE", "VENDEDOR"]);

/**
 * ✅ Permisos disponibles en el sistema
 */
export const PERMISOS = z.enum([
  "ADMIN",
  "SUPERADMIN",
  "VENDEDOR",
  "BACK_OFFICE",
  "SUPERVISOR",
]);

/**
 * Estados posibles de un usuario
 */
export const EstadoEnum = z.enum(["ACTIVO", "INACTIVO", "SUSPENDIDO"]);

// ============================================
// SCHEMAS DE USUARIO
// ============================================

/**
 * ✅ ACTUALIZADO: Schema base de usuario SIN password_hash
 * La contraseña ahora está en la tabla password separada
 */
export const UsuarioBaseSchema = z.object({
  persona_id: z.string().uuid(),
  legajo: z.string().length(5, "El legajo debe tener exactamente 5 caracteres").transform(val => val.toUpperCase()),
  rol: ROLES,
  permisos: z.array(PERMISOS),
  exa: z
    .string()
    .min(4, "El código EXA debe tener al menos 4 caracteres")
    .max(8, "El código EXA debe tener máximo 8 caracteres")
    .transform(val => val.toUpperCase()),
  celula: z.number().int().positive("La célula debe ser un número positivo"),
  estado: EstadoEnum.default("ACTIVO"),
});

/**
 * Schema completo de usuario (con datos de persona)
 * ✅ NO incluye password_hash
 */
export const UsuarioSchema = UsuarioBaseSchema.merge(
  PersonaSchema.pick({
    nombre: true,
    apellido: true,
    email: true,
    documento: true,
    tipo_documento: true,
    telefono: true,
    fecha_nacimiento: true,
    nacionalidad: true,
    genero: true,
  }),
);

/**
 * Schema para respuestas seguras (sin datos sensibles)
 */
export const UsuarioSecuritySchema = UsuarioSchema.pick({
  persona_id: true,
  nombre: true,
  apellido: true,
  email: true,
  telefono: true,
  legajo: true,
  rol: true,
  permisos: true,
  exa: true,
  fecha_nacimiento: true,
  nacionalidad: true,
  estado: true,
  celula: true,
});

/**
 * ✅ Schema para CREAR usuario
 * NOTA IMPORTANTE: password_hash solo se usa aquí para crear el primer registro
 * en la tabla password. NO se almacena en la tabla usuario.
 */
export const UsuarioCreateSchema = UsuarioSchema
  .omit({
    persona_id: true,
  })
  .extend({
    password_hash: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(100, "La contraseña no puede tener más de 100 caracteres"),
  });

/**
 * Schema para ACTUALIZAR usuario
 * ✅ NO incluye password_hash (se actualiza via AuthService)
 */
export const UsuarioUpdateSchema = UsuarioSchema
  .omit({
    persona_id: true,
  })
  .partial();

/**
 * Schema para LOGIN
 */
export const UsuarioLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

/**
 * Schema para respuestas de API
 * ✅ NO incluye password_hash
 */
export const UsuarioResponseSchema = UsuarioSchema;

// ============================================
// SCHEMAS DE ROLES ESPECÍFICOS
// ============================================

/**
 * Schema para tabla supervisor
 */
export const SupervisorSchema = z.object({
  usuario_id: z.string().uuid(),
  supervisor: z.number().int().positive(),
});

/**
 * Schema para tabla back_office
 */
export const BackOfficeSchema = z.object({
  usuario: z.string().uuid(),
  back_office: z.number().int().positive(),
});

/**
 * Schema para tabla vendedor
 */
export const VendedorSchema = z.object({
  usuario_id: z.string().uuid(),
  vendedor: z.number().int().positive(),
});

// ============================================
// SCHEMAS DE CAMBIO DE CONTRASEÑA
// ============================================

/**
 * ✅ ACTUALIZADO: Schema para cambio de contraseña por el mismo usuario
 * Requiere contraseña actual y validaciones estrictas
 */
export const CambioPasswordSchema = z
  .object({
    passwordActual: z.string().min(1, "Contraseña actual requerida"),
    passwordNueva: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(100, "La contraseña no puede tener más de 100 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .regex(
        /[^A-Za-z0-9]/,
        "Debe contener al menos un carácter especial (!@#$%^&*)",
      ),
    passwordNuevaConfirmacion: z
      .string()
      .min(1, "Confirmación de contraseña requerida"),
  })
  .refine((data) => data.passwordNueva === data.passwordNuevaConfirmacion, {
    message: "Las contraseñas nuevas no coinciden",
    path: ["passwordNuevaConfirmacion"],
  })
  .refine((data) => data.passwordActual !== data.passwordNueva, {
    message: "La nueva contraseña debe ser diferente a la actual",
    path: ["passwordNueva"],
  });

/**
 * ✅ Schema para cambio de contraseña por administrador
 * NO requiere contraseña actual
 */
export const CambioPasswordAdminSchema = z
  .object({
    passwordNueva: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(100, "La contraseña no puede tener más de 100 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .regex(
        /[^A-Za-z0-9]/,
        "Debe contener al menos un carácter especial (!@#$%^&*)",
      ),
    passwordNuevaConfirmacion: z
      .string()
      .min(1, "Confirmación de contraseña requerida"),
  })
  .refine((data) => data.passwordNueva === data.passwordNuevaConfirmacion, {
    message: "Las contraseñas nuevas no coinciden",
    path: ["passwordNuevaConfirmacion"],
  });

// ============================================
// ✅ NUEVOS SCHEMAS PARA HISTORIAL DE CONTRASEÑAS
// ============================================

/**
 * Schema completo de la tabla password
 */
export const PasswordHistorySchema = z.object({
  password_id: z.number().int().positive(),
  password_hash: z.string().min(1).max(255),
  usuario_persona_id: z.string().uuid(),
  fecha_creacion: z.coerce.date(),
  activa: z.boolean(),
});

/**
 * Schema para respuestas de historial (sin exponer hashes)
 */
export const PasswordHistoryResponseSchema = z.object({
  fecha_creacion: z.coerce.date(),
  activa: z.boolean(),
});

/**
 * Schema para crear un registro de contraseña
 */
export const PasswordCreateSchema = z.object({
  password_hash: z.string().min(1),
  usuario_persona_id: z.string().uuid(),
  fecha_creacion: z.coerce.date().default(() => new Date()),
  activa: z.boolean().default(true),
});

// ============================================
// TIPOS TYPESCRIPT
// ============================================

export type Usuario = z.infer<typeof UsuarioSchema>;
export type UsuarioSecurity = z.infer<typeof UsuarioSecuritySchema>;
export type UsuarioCreate = z.infer<typeof UsuarioCreateSchema>;
export type UsuarioUpdate = z.infer<typeof UsuarioUpdateSchema>;
export type UsuarioLogin = z.infer<typeof UsuarioLoginSchema>;
export type UsuarioResponse = z.infer<typeof UsuarioResponseSchema>;
export type Role = z.infer<typeof ROLES>;
export type Permiso = z.infer<typeof PERMISOS>;
export type Estado = z.infer<typeof EstadoEnum>;
export type Supervisor = z.infer<typeof SupervisorSchema>;
export type BackOffice = z.infer<typeof BackOfficeSchema>;
export type Vendedor = z.infer<typeof VendedorSchema>;
export type CambioPassword = z.infer<typeof CambioPasswordSchema>;
export type CambioPasswordAdmin = z.infer<typeof CambioPasswordAdminSchema>;
export type PasswordHistory = z.infer<typeof PasswordHistorySchema>;
export type PasswordHistoryResponse = z.infer<
  typeof PasswordHistoryResponseSchema
>;
export type PasswordCreate = z.infer<typeof PasswordCreateSchema>;

// ============================================
// VALIDADORES AUXILIARES
// ============================================

/**
 * Valida si una cadena es un email válido
 */
export const isValidEmail = (email: string): boolean => {
  return UsuarioLoginSchema.shape.email.safeParse(email).success;
};

/**
 * Valida si una contraseña cumple los requisitos
 */
export const PasswordNuevaSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(100, "La contraseña no puede tener más de 100 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(
    /[^A-Za-z0-9]/,
    "Debe contener al menos un carácter especial (!@#$%^&*)",
  );

export const isValidPassword = (password: string): boolean => {
  return PasswordNuevaSchema.safeParse(password).success;
};

/**
 * Valida si un rol es válido
 */
export const isValidRole = (rol: string): boolean => {
  return ROLES.safeParse(rol).success;
};

/**
 * Valida si un permiso es válido
 */
export const isValidPermiso = (permiso: string): boolean => {
  return PERMISOS.safeParse(permiso).success;
};

// ============================================
// CONSTANTES DE VALIDACIÓN
// ============================================

/**
 * Requisitos de contraseña para mostrar al usuario
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 100,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  specialChars: "!@#$%^&*()-_=+[]{}|;:,.<>?",
} as const;

/**
 * Mensajes de validación de contraseña
 */
export const PASSWORD_VALIDATION_MESSAGES = {
  minLength: `La contraseña debe tener al menos ${PASSWORD_REQUIREMENTS.minLength} caracteres`,
  maxLength: `La contraseña no puede tener más de ${PASSWORD_REQUIREMENTS.maxLength} caracteres`,
  requireUppercase: "Debe contener al menos una letra mayúscula (A-Z)",
  requireLowercase: "Debe contener al menos una letra minúscula (a-z)",
  requireNumber: "Debe contener al menos un número (0-9)",
  requireSpecial: `Debe contener al menos un carácter especial (${PASSWORD_REQUIREMENTS.specialChars})`,
  noMatch: "Las contraseñas no coinciden",
  sameAsCurrent: "La nueva contraseña debe ser diferente a la actual",
  previouslyUsed:
    "No puedes reutilizar una contraseña anterior. Elige una diferente.",
} as const;

/**
 * Roles que pueden gestionar usuarios
 */
export const MANAGEMENT_ROLES = ["SUPERVISOR", "BACK_OFFICE"] as const;

/**
 * Roles con permisos administrativos completos
 */
export const ADMIN_ROLES = ["BACK_OFFICE"] as const;

/**
 * Todos los roles del sistema
 */
export const ALL_ROLES = ["ADMIN", "SUPERADMIN", "SUPERVISOR", "BACK_OFFICE", "VENDEDOR"] as const;
