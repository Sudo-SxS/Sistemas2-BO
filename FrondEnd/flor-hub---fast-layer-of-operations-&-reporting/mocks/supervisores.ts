// mocks/supervisores.ts
// Datos mock de supervisores disponibles

export interface Supervisor {
  usuario_id: string;
  legajo: string;
  nombre: string;
  apellido: string;
  email: string;
  celula: number;
}

export const SUPERVISORES_MOCK: Supervisor[] = [
  {
    usuario_id: '550e8400-e29b-41d4-a716-446655440000',
    legajo: 'S001',
    nombre: 'Marta',
    apellido: 'García',
    email: 'marta.garcia@flortelecom.com',
    celula: 1,
  },
  {
    usuario_id: '550e8400-e29b-41d4-a716-446655440001',
    legajo: 'S002',
    nombre: 'Alberto',
    apellido: 'Gómez',
    email: 'alberto.gomez@flortelecom.com',
    celula: 2,
  },
  {
    usuario_id: '550e8400-e29b-41d4-a716-446655440002',
    legajo: 'S003',
    nombre: 'Carolina',
    apellido: 'López',
    email: 'carolina.lopez@flortelecom.com',
    celula: 3,
  },
  {
    usuario_id: '550e8400-e29b-41d4-a716-446655440003',
    legajo: 'S004',
    nombre: 'Roberto',
    apellido: 'Fernández',
    email: 'roberto.fernandez@flortelecom.com',
    celula: 4,
  },
];

// Función helper para obtener supervisor por ID
export const getSupervisorById = (id: string): Supervisor | undefined => {
  return SUPERVISORES_MOCK.find(s => s.usuario_id === id);
};

// Función helper para obtener supervisor por legajo
export const getSupervisorByLegajo = (legajo: string): Supervisor | undefined => {
  return SUPERVISORES_MOCK.find(s => s.legajo === legajo);
};

// Función helper para obtener nombre completo
export const getSupervisorFullName = (supervisor: Supervisor): string => {
  return `${supervisor.nombre} ${supervisor.apellido}`;
};
