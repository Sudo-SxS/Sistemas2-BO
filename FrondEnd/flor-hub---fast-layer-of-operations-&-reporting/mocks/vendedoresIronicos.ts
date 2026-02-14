// mocks/vendedoresIronicos.ts
// Vendedores con nombres de superhéroes y personajes icónicos

export interface VendedorIronico {
  id: string;
  nombre: string;
  apellido: string;
  legajo: string;
  exa: string;
  email: string;
  telefono: string;
  celula: number;
  activo: boolean;
}

export const VENDEDORES_IRONICOS: VendedorIronico[] = [
  {
    id: 'VEND-SUP-001',
    nombre: 'Clark',
    apellido: 'Kent',
    legajo: 'SUP-001',
    exa: 'SUPER-01',
    email: 'clark.kent@dailyplanet.com',
    telefono: '+54 11 9999-0001',
    celula: 1,
    activo: true
  },
  {
    id: 'VEND-IRN-001',
    nombre: 'Tony',
    apellido: 'Stark',
    legajo: 'IRN-001',
    exa: 'STARK-01',
    email: 'tony.stark@starkindustries.com',
    telefono: '+54 11 9999-0002',
    celula: 2,
    activo: true
  },
  {
    id: 'VEND-BAT-001',
    nombre: 'Bruce',
    apellido: 'Wayne',
    legajo: 'BAT-001',
    exa: 'WAYNE-01',
    email: 'bruce.wayne@wayneenterprises.com',
    telefono: '+54 11 9999-0003',
    celula: 3,
    activo: true
  },
  {
    id: 'VEND-SPD-001',
    nombre: 'Peter',
    apellido: 'Parker',
    legajo: 'SPD-001',
    exa: 'SPIDER-01',
    email: 'peter.parker@dailybugle.com',
    telefono: '+54 11 9999-0004',
    celula: 4,
    activo: true
  },
  {
    id: 'VEND-WW-001',
    nombre: 'Diana',
    apellido: 'Prince',
    legajo: 'WW-001',
    exa: 'WONDER-01',
    email: 'diana.prince@themyscira.gov',
    telefono: '+54 11 9999-0005',
    celula: 5,
    activo: true
  },
  {
    id: 'VEND-FLS-001',
    nombre: 'Barry',
    apellido: 'Allen',
    legajo: 'FLS-001',
    exa: 'FLASH-01',
    email: 'barry.allen@ccpd.gov',
    telefono: '+54 11 9999-0006',
    celula: 6,
    activo: true
  },
  {
    id: 'VEND-WLV-001',
    nombre: 'Logan',
    apellido: 'Howlett',
    legajo: 'WLV-001',
    exa: 'WOLV-01',
    email: 'logan@xavierschool.edu',
    telefono: '+54 11 9999-0007',
    celula: 7,
    activo: true
  },
  {
    id: 'VEND-CAP-001',
    nombre: 'Steve',
    apellido: 'Rogers',
    legajo: 'CAP-001',
    exa: 'CAPTAIN-01',
    email: 'steve.rogers@avengers.gov',
    telefono: '+54 11 9999-0008',
    celula: 8,
    activo: true
  },
  {
    id: 'VEND-BWD-001',
    nombre: 'Natasha',
    apellido: 'Romanoff',
    legajo: 'BWD-001',
    exa: 'WIDOW-01',
    email: 'natasha.romanoff@shield.gov',
    telefono: '+54 11 9999-0009',
    celula: 9,
    activo: true
  },
  {
    id: 'VEND-THR-001',
    nombre: 'Thor',
    apellido: 'Odinson',
    legajo: 'THR-001',
    exa: 'THUNDER-01',
    email: 'thor.odinson@asgard.gov',
    telefono: '+54 11 9999-0010',
    celula: 10,
    activo: true
  }
];

// Función para obtener vendedor aleatorio
export const getRandomVendedor = (): VendedorIronico => {
  return VENDEDORES_IRONICOS[Math.floor(Math.random() * VENDEDORES_IRONICOS.length)];
};

// Función para obtener vendedor por ID
export const getVendedorById = (id: string): VendedorIronico | undefined => {
  return VENDEDORES_IRONICOS.find(v => v.id === id);
};
