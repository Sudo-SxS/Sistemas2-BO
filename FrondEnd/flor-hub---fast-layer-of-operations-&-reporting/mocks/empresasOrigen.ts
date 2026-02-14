// mocks/empresasOrigen.ts
// Datos mock de empresas de origen para portabilidades

export interface EmpresaOrigen {
  empresa_origen_id: number;
  nombre: string;
  codigo: string;
  activa: boolean;
}

export const EMPRESAS_ORIGEN_MOCK: EmpresaOrigen[] = [
  {
    empresa_origen_id: 1,
    nombre: 'Movistar',
    codigo: 'MOV',
    activa: true,
  },
  {
    empresa_origen_id: 2,
    nombre: 'Vodafone',
    codigo: 'VOD',
    activa: true,
  },
  {
    empresa_origen_id: 3,
    nombre: 'Orange',
    codigo: 'ORA',
    activa: true,
  },
  {
    empresa_origen_id: 4,
    nombre: 'Yoigo',
    codigo: 'YOI',
    activa: true,
  },
  {
    empresa_origen_id: 5,
    nombre: 'Digi',
    codigo: 'DIG',
    activa: true,
  },
  {
    empresa_origen_id: 6,
    nombre: 'Pepephone',
    codigo: 'PEP',
    activa: true,
  },
  {
    empresa_origen_id: 7,
    nombre: 'Simyo',
    codigo: 'SIM',
    activa: true,
  },
  {
    empresa_origen_id: 8,
    nombre: 'Euskaltel',
    codigo: 'EUS',
    activa: true,
  },
  {
    empresa_origen_id: 9,
    nombre: 'R Cable',
    codigo: 'RCA',
    activa: true,
  },
  {
    empresa_origen_id: 10,
    nombre: 'Otros',
    codigo: 'OTR',
    activa: true,
  },
];

// Función helper para obtener empresa por ID
export const getEmpresaOrigenById = (id: number): EmpresaOrigen | undefined => {
  return EMPRESAS_ORIGEN_MOCK.find(e => e.empresa_origen_id === id);
};

// Función helper para obtener empresa por nombre
export const getEmpresaOrigenByName = (nombre: string): EmpresaOrigen | undefined => {
  return EMPRESAS_ORIGEN_MOCK.find(
    e => e.nombre.toLowerCase() === nombre.toLowerCase()
  );
};
