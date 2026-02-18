import { z } from 'zod';

export const Fase1Schema = z.object({
  tipo_documento: z.string().min(1, 'Tipo de documento requerido'),
  documento: z.string().min(7, 'Documento inválido').max(20),
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  telefono_alternativo: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  genero: z.string().optional(),
  nacionalidad: z.string().optional(),
});

export const Fase2Schema = z.object({
  tipo_venta: z.enum(['PORTABILIDAD', 'LINEA_NUEVA']),
  empresa_origen_id: z.number().min(1, 'Seleccione empresa'),
  plan_id: z.number().min(1, 'Seleccione un plan'),
  promocion_id: z.number().optional(),
  chip: z.enum(['SIM', 'ESIM']),
  sds: z.string().optional(),
  stl: z.string().optional(),
  // Campos de portabilidad
  spn: z.string().optional(),
  numero_portar: z.string().optional(),
  pin: z.string().optional(),
  fecha_vencimiento_pin: z.string().optional(),
  mercado_origen: z.enum(['PREPAGO', 'POSPAGO']).optional().transform(val => val === "" ? undefined : val),
}).superRefine((data, ctx) => {
  if (data.tipo_venta === 'PORTABILIDAD') {
    if (!data.empresa_origen_id) {
       ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Empresa de origen requerida para portabilidad",
        path: ["empresa_origen_id"]
      });
    }
    if (!data.numero_portar) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Número a portar requerido",
        path: ["numero_portar"]
      });
    }
     if (!data.spn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "SPN requerido",
        path: ["spn"]
      });
    }
  }
});

export const Fase3Schema = z.object({
  sap_id: z.string().optional(),
  numero: z.string().min(8, 'Teléfono inválido'),
  tipo: z.enum(['RESIDENCIAL', 'EMPRESARIAL']).optional(),
  direccion: z.string().min(1, 'Dirección requerida'),
  numero_casa: z.string().min(1, 'Número requerido'),
  entre_calles: z.string().optional(),
  barrio: z.string().optional(),
  localidad: z.string().min(1, 'Localidad requerida'),
  departamento: z.string().min(1, 'Departamento requerido'),
  provincia: z.string().optional(),
  codigo_postal: z.string().min(1, 'CP requerido'),
  geolocalizacion: z.string().optional(),
  telefono_alternativo: z.string().optional(),
});

export type Fase1Data = z.infer<typeof Fase1Schema>;
export type Fase2Data = z.infer<typeof Fase2Schema>;
export type Fase3Data = z.infer<typeof Fase3Schema>;
