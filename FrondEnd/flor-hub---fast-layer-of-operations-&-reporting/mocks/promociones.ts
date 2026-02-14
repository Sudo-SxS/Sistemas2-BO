// mocks/promociones.ts
// Datos mock de promociones disponibles

export interface Promocion {
  promocion_id: number;
  nombre: string;
  descripcion: string;
  descuento_porcentaje: number;
  meses_duracion: number;
  plan_id: number | null; // null = aplica a todos los planes
  tipo_venta: 'PORTABILIDAD' | 'LINEA_NUEVA' | 'AMBOS';
  activa: boolean;
}

export const PROMOCIONES_MOCK: Promocion[] = [
  {
    promocion_id: 1,
    nombre: '50% OFF 12 Meses',
    descripcion: 'Descuento del 50% por 12 meses',
    descuento_porcentaje: 50,
    meses_duracion: 12,
    plan_id: null,
    tipo_venta: 'AMBOS',
    activa: true,
  },
  {
    promocion_id: 2,
    nombre: '30% OFF 6 Meses',
    descripcion: 'Descuento del 30% por 6 meses',
    descuento_porcentaje: 30,
    meses_duracion: 6,
    plan_id: null,
    tipo_venta: 'AMBOS',
    activa: true,
  },
  {
    promocion_id: 3,
    nombre: 'Porta Promo - 40% OFF',
    descripcion: 'Especial portabilidades 40% OFF por 12 meses',
    descuento_porcentaje: 40,
    meses_duracion: 12,
    plan_id: 1,
    tipo_venta: 'PORTABILIDAD',
    activa: true,
  },
  {
    promocion_id: 4,
    nombre: 'Línea Nueva 25% OFF',
    descripcion: 'Descuento especial líneas nuevas',
    descuento_porcentaje: 25,
    meses_duracion: 6,
    plan_id: 2,
    tipo_venta: 'LINEA_NUEVA',
    activa: true,
  },
  {
    promocion_id: 5,
    nombre: 'GigaMax Especial',
    descripcion: 'Promoción exclusiva GigaMax 60% OFF',
    descuento_porcentaje: 60,
    meses_duracion: 12,
    plan_id: 1,
    tipo_venta: 'AMBOS',
    activa: true,
  },
];

// Función helper para obtener promociones por plan y tipo de venta
export const getPromocionesByPlanAndTipo = (
  planId: number,
  tipoVenta: 'PORTABILIDAD' | 'LINEA_NUEVA'
): Promocion[] => {
  return PROMOCIONES_MOCK.filter(
    p =>
      p.activa &&
      (p.plan_id === null || p.plan_id === planId) &&
      (p.tipo_venta === 'AMBOS' || p.tipo_venta === tipoVenta)
  );
};

// Función helper para obtener promoción por ID
export const getPromocionById = (id: number): Promocion | undefined => {
  return PROMOCIONES_MOCK.find(p => p.promocion_id === id);
};
