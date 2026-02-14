// mocks/planes.ts
// Datos mock de planes disponibles

export interface Plan {
  plan_id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  gigas: number;
  minutos: string;
  sms: string;
  tipo: 'POSTPAGO' | 'PREPAGO';
}

export const PLANES_MOCK: Plan[] = [
  {
    plan_id: 1,
    nombre: 'GigaMax Ilimitada',
    descripcion: 'Plan postpago con datos ilimitados',
    precio: 8999,
    gigas: 100,
    minutos: 'Ilimitados',
    sms: 'Ilimitados',
    tipo: 'POSTPAGO',
  },
  {
    plan_id: 2,
    nombre: 'Power 50GB',
    descripcion: 'Plan con 50GB de alta velocidad',
    precio: 6999,
    gigas: 50,
    minutos: 'Ilimitados',
    sms: '1000',
    tipo: 'POSTPAGO',
  },
  {
    plan_id: 3,
    nombre: 'Essential 25GB',
    descripcion: 'Plan básico con 25GB',
    precio: 4999,
    gigas: 25,
    minutos: '500',
    sms: '500',
    tipo: 'POSTPAGO',
  },
  {
    plan_id: 4,
    nombre: 'Flex 15GB',
    descripcion: 'Plan flexible prepago',
    precio: 3499,
    gigas: 15,
    minutos: '300',
    sms: '300',
    tipo: 'PREPAGO',
  },
  {
    plan_id: 5,
    nombre: 'Max Speed 150GB',
    descripcion: 'Plan premium con velocidad máxima',
    precio: 12999,
    gigas: 150,
    minutos: 'Ilimitados',
    sms: 'Ilimitados',
    tipo: 'POSTPAGO',
  },
];

// Función helper para obtener plan por ID
export const getPlanById = (id: number): Plan | undefined => {
  return PLANES_MOCK.find(p => p.plan_id === id);
};
