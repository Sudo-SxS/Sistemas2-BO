import { z } from 'zod';

export const Fase1Schema = z.object({
  tipo_documento: z.string().min(1, 'Tipo de documento requerido'),
  documento: z.string().min(7, 'Documento inválido').max(20),
  nombre: z.string().min(1, 'Nombre requerido'),
  apellido: z.string().min(1, 'Apellido requerido'),
  email: z.string().min(1, 'Email requerido').email('Email inválido'),
  telefono: z.string().min(1, 'Teléfono requerido').regex(/^\d+$/, 'Solo números'),
  telefono_alternativo: z.string().regex(/^\d*$/, 'Solo números').optional(),
  fecha_nacimiento: z.string().min(1, 'Fecha de nacimiento requerida'),
  genero: z.string().min(1, 'Género requerido'),
  nacionalidad: z.string().min(1, 'Nacionalidad requerida'),
});

export const Fase2Schema = z.object({
  tipo_venta: z.enum(['PORTABILIDAD', 'LINEA_NUEVA']),
  empresa_origen_id: z.number().min(1, 'Empresa de origen requerida'),
  plan_id: z.number().min(1, 'Plan requerido'),
  promocion_id: z.number().optional(),
  chip: z.enum(['SIM', 'ESIM']),
  sds: z.string().optional(),
  stl: z.string().regex(/^\d*$/, 'Solo números').optional(),
  spn: z.string().optional(),
  numero_portar: z.string().regex(/^\d*$/, 'Solo números').optional(),
  pin: z.string().regex(/^\d{0,4}$/, 'Máximo 4 dígitos').optional(),
  fecha_vencimiento_pin: z.string().optional(),
  mercado_origen: z.enum(['PREPAGO', 'POSPAGO', '']).transform(val => val === "" ? undefined : val),
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
    if (!data.mercado_origen) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mercado de origen requerido",
        path: ["mercado_origen"]
      });
    }
  }
});

export const Fase3Schema = z.object({
  sap: z.string().regex(/^\d*$/, 'Solo números').optional(),
  numero: z.string().min(8, 'Teléfono requerido').regex(/^\d+$/, 'Solo números'),
  tipo: z.enum(['RESIDENCIAL', 'EMPRESARIAL']).optional(),
  direccion: z.string().min(1, 'Dirección requerida'),
  numero_casa: z.string().min(1, 'Número requerido'),
  entre_calles: z.string().optional(),
  barrio: z.string().optional(),
  localidad: z.string().min(1, 'Localidad requerida'),
  departamento: z.string().min(1, 'Departamento requerido'),
  codigo_postal: z.string().min(1, 'Código postal requerido').regex(/^\d+$/, 'Solo números'),
  geolocalizacion: z.string().optional(),
  telefono_alternativo: z.string().regex(/^\d*$/, 'Solo números').optional(),
  piso: z.string().optional(),
  departamento_numero: z.string().optional(),
});

export type Fase1Data = z.infer<typeof Fase1Schema>;
export type Fase2Data = z.infer<typeof Fase2Schema>;
export type Fase3Data = z.infer<typeof Fase3Schema>;
