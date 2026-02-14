// ============================================
// BackEnd/src/schemas/correo/Correo.ts
// VERSIÓN ACTUALIZADA - Campos completos según DB
// ============================================
import { z } from "zod";

/**
 * Schema completo de Correo según la base de datos
 * Incluye TODOS los campos de la tabla correo
 */
export const CorreoSchema = z.object({
  sap_id: z.string()
    .max(255, "SAP ID no puede exceder 255 caracteres")
    .min(1, "SAP ID es requerido")
    .transform((val) => val.toUpperCase()),

  telefono_contacto: z.string()
    .max(20, "Teléfono de contacto no puede exceder 20 caracteres")
    .min(1, "Teléfono de contacto es requerido"),

  telefono_alternativo: z.string()
    .max(20, "Teléfono alternativo no puede exceder 20 caracteres")
    .nullable()
    .optional(),

  destinatario: z.string()
    .max(255, "Destinatario no puede exceder 255 caracteres")
    .min(1, "Destinatario es requerido"),

  persona_autorizada: z.string()
    .max(255, "Persona autorizada no puede exceder 255 caracteres")
    .nullable()
    .optional(),

  direccion: z.string()
    .max(255, "Dirección no puede exceder 255 caracteres")
    .min(1, "Dirección es requerida"),

  numero_casa: z.number()
    .int("Número de casa debe ser un entero")
    .positive("Número de casa debe ser positivo"),

  entre_calles: z.string()
    .max(255, "Entre calles no puede exceder 255 caracteres")
    .nullable()
    .optional(),

  barrio: z.string()
    .max(255, "Barrio no puede exceder 255 caracteres")
    .nullable()
    .optional(),

  localidad: z.string()
    .max(255, "Localidad no puede exceder 255 caracteres")
    .min(1, "Localidad es requerida"),

  departamento: z.string()
    .max(255, "Departamento no puede exceder 255 caracteres")
    .min(1, "Departamento es requerido"),

  codigo_postal: z.number()
    .int("Código postal debe ser un entero")
    .positive("Código postal debe ser positivo"),

  fecha_creacion: z.coerce.date(),

  fecha_limite: z.coerce.date(),

  // ✅ NUEVOS CAMPOS AGREGADOS según esquema DB
  piso: z.string()
    .max(255, "Piso no puede exceder 255 caracteres")
    .nullable()
    .optional(),

  departamento_numero: z.string()
    .max(255, "Número de departamento no puede exceder 255 caracteres")
    .nullable()
    .optional(),

  geolocalizacion: z.string()
    .max(255, "Geolocalización no puede exceder 255 caracteres")
    .nullable()
    .optional(),

  comentario_cartero: z.string()
    .max(255, "Comentario del cartero no puede exceder 255 caracteres")
    .nullable()
    .optional(),
});

/**
 * Schema para crear un correo nuevo
 * Omite campos autogenerados por la DB
 */
export const CorreoCreateSchema = CorreoSchema.omit({
  fecha_creacion: true,
  fecha_limite: true,
}).extend({
  // Opcional: agregar usuario_id si lo necesitas para el estado inicial
  usuario_id: z.string()
    .uuid("Usuario ID debe ser un UUID válido")
    .optional(),
});

/**
 * Schema para actualizar un correo existente
 * - No se puede cambiar el sap_id (es la PK)
 * - No se puede cambiar fecha_creacion
 * - Todos los demás campos son opcionales
 */
export const CorreoUpdateSchema = CorreoSchema.omit({
  sap_id: true,
  fecha_creacion: true,
}).partial();

/**
 * Schema para validar parámetros de búsqueda/filtrado
 */
export const CorreoFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  name: z.string().max(255).optional(),
  localidad: z.string().max(255).optional(),
  departamento: z.string().max(255).optional(),
  codigo_postal: z.number().int().positive().optional(),
  fecha_desde: z.coerce.date().optional(),
  fecha_hasta: z.coerce.date().optional(),
});

/**
 * Schema para búsqueda por SAP ID
 */
export const CorreoSapIdSchema = z.object({
  sap_id: z.string()
    .min(1, "SAP ID es requerido")
    .transform((val) => val.toUpperCase()),
});

/**
 * Schema para búsqueda por localidad
 */
export const CorreoLocalidadSchema = z.object({
  localidad: z.string()
    .min(1, "Localidad es requerida")
    .max(255),
});

/**
 * Schema para búsqueda por departamento
 */
export const CorreoDepartamentoSchema = z.object({
  departamento: z.string()
    .min(1, "Departamento es requerido")
    .max(255),
});

/**
 * Schema para búsqueda por código postal
 */
export const CorreoCodigoPostalSchema = z.object({
  codigoPostal: z.number()
    .int("Código postal debe ser un entero")
    .positive("Código postal debe ser positivo"),
});

/**
 * Schema para obtener correos próximos a vencer
 */
export const CorreoProximosVencerSchema = z.object({
  dias: z.number()
    .int("Días debe ser un entero")
    .positive("Días debe ser positivo")
    .max(30, "Máximo 30 días")
    .default(3),
});

// ============================================
// TIPOS TYPESCRIPT
// ============================================

export type Correo = z.infer<typeof CorreoSchema>;
export type CorreoCreate = z.infer<typeof CorreoCreateSchema>;
export type CorreoUpdate = z.infer<typeof CorreoUpdateSchema>;
export type CorreoFilter = z.infer<typeof CorreoFilterSchema>;
export type CorreoSapId = z.infer<typeof CorreoSapIdSchema>;
export type CorreoLocalidad = z.infer<typeof CorreoLocalidadSchema>;
export type CorreoDepartamento = z.infer<typeof CorreoDepartamentoSchema>;
export type CorreoCodigoPostal = z.infer<typeof CorreoCodigoPostalSchema>;
export type CorreoProximosVencer = z.infer<typeof CorreoProximosVencerSchema>;

// ============================================
// VALIDADORES DE AYUDA
// ============================================

/**
 * Valida que la fecha límite sea posterior a la fecha de creación
 */
export const validateFechas = (data: {
  fecha_creacion: Date;
  fecha_limite: Date;
}): boolean => {
  return data.fecha_limite > data.fecha_creacion;
};

/**
 * Valida formato de teléfono argentino (básico)
 */
export const validateTelefonoArgentino = (telefono: string): boolean => {
  // Formato: +54 9 11 XXXX-XXXX o variaciones
  const regex =
    /^(\+54|0)?[\s-]?(9)?[\s-]?(\d{2,4})[\s-]?(\d{4})[\s-]?(\d{4})$/;
  return regex.test(telefono);
};

/**
 * Valida que el código postal sea válido para Argentina
 */
export const validateCodigoPostalArgentino = (cp: number): boolean => {
  // CPA tienen 4 dígitos
  return cp >= 1000 && cp <= 9999;
};

// ============================================
// EJEMPLOS DE USO
// ============================================

/*
// Ejemplo 1: Crear un correo nuevo
const nuevoCorreoData = {
  sap_id: "SAP123456",
  telefono_contacto: "+54 11 1234-5678",
  destinatario: "Juan Pérez",
  direccion: "Av. Corrientes",
  numero_casa: 1234,
  localidad: "Buenos Aires",
  departamento: "Capital Federal",
  codigo_postal: 1043,
};

const correoValidado = CorreoCreateSchema.parse(nuevoCorreoData);

// Ejemplo 2: Actualizar un correo
const updateData = {
  telefono_alternativo: "+54 11 9876-5432",
  comentario_cartero: "Llamar antes de entregar",
};

const updateValidado = CorreoUpdateSchema.parse(updateData);

// Ejemplo 3: Filtrar correos
const filtros = {
  page: 1,
  limit: 20,
  localidad: "Buenos Aires",
  fecha_desde: new Date("2024-01-01"),
};

const filtrosValidados = CorreoFilterSchema.parse(filtros);

// Ejemplo 4: Buscar por SAP
const sapSearch = CorreoSapIdSchema.parse({ sap_id: "sap123456" });
// Resultado: { sap_id: "SAP123456" } (convertido a mayúsculas)
*/
