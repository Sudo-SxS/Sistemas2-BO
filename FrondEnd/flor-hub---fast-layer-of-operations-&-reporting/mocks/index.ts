// mocks/index.ts
// Sistema de mocks para desarrollo sin backend
// Se activa con VITE_ENABLE_MOCKS=true en .env

import { ApiResponse } from '../services/api';

// Tipo para los handlers de mock
type MockHandler<T> = () => Promise<ApiResponse<T>>;

// Registro de mocks
const mockRegistry = new Map<string, MockHandler<any>>();

// Registrar un mock
export function registerMock<T>(endpoint: string, handler: MockHandler<T>): void {
  mockRegistry.set(endpoint, handler);
  console.log('[MOCKS] Registrado:', endpoint);
}

// Verificar si existe mock para un endpoint
export function hasMock(endpoint: string): boolean {
  return mockRegistry.has(endpoint);
}

// Ejecutar mock
export async function executeMock<T>(endpoint: string): Promise<ApiResponse<T> | null> {
  const handler = mockRegistry.get(endpoint);
  if (!handler) return null;
  
  console.log('[MOCKS] Ejecutando mock para:', endpoint);
  
  // Simular delay de red (200-800ms)
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 600));
  
  return handler();
}

// Mock de autenticación
registerMock('/usuario/login', async () => ({
  success: true,
  message: 'Login exitoso (MOCK)',
  user: {
    id: 'mock-user-id',
    email: 'usuario@ejemplo.com',
    nombre: 'Usuario',
    apellido: 'Demo',
    rol: 'VENDEDOR',
    legajo: 'V001'
  }
}));

// Mock de ventas
registerMock('/ventas', async () => ({
  success: true,
  data: [
    {
      venta_id: 1,
      sds: 'SDS001',
      cliente_nombre: 'Juan',
      cliente_apellido: 'Pérez',
      vendedor_nombre: 'Carlos',
      plan_nombre: 'Plan 5GB',
      estado_actual: 'CREADO_SIN_DOCU',
      fecha_creacion: new Date().toISOString()
    },
    {
      venta_id: 2,
      sds: 'SDS002',
      cliente_nombre: 'María',
      cliente_apellido: 'García',
      vendedor_nombre: 'Ana',
      plan_nombre: 'Plan 10GB',
      estado_actual: 'EN_PROCESO',
      fecha_creacion: new Date().toISOString()
    }
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 2
  }
}));

// Mock de estadísticas
registerMock('/ventas/estadisticas', async () => ({
  success: true,
  data: {
    total_ventas: 150,
    ventas_hoy: 5,
    ventas_mes: 45,
    por_estado: {
      CREADO_SIN_DOCU: 50,
      EN_PROCESO: 30,
      COMPLETADO: 70
    }
  }
}));

// Mock de planes
registerMock('/planes', async () => ({
  success: true,
  data: [
    { plan_id: 1, nombre: 'Plan 5GB', precio: 5000, gigabyte: 5, llamadas: 'Ilimitadas', mensajes: '1000', whatsapp: 'Incluido', roaming: 'No incluido', empresa_origen_id: 1 },
    { plan_id: 2, nombre: 'Plan 10GB', precio: 8000, gigabyte: 10, llamadas: 'Ilimitadas', mensajes: 'Ilimitados', whatsapp: 'Incluido', roaming: 'Incluido USA', empresa_origen_id: 1 }
  ]
}));

// Mock de clientes
registerMock('/clientes', async () => ({
  success: true,
  data: [
    {
      cliente_id: '1',
      nombre: 'Juan',
      apellido: 'Pérez',
      documento: '12345678',
      tipo_documento: 'DNI',
      email: 'juan@ejemplo.com',
      telefono: '1234567890'
    },
    {
      cliente_id: '2',
      nombre: 'María',
      apellido: 'García',
      documento: '87654321',
      tipo_documento: 'DNI',
      email: 'maria@ejemplo.com',
      telefono: '0987654321'
    }
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 2
  }
}));

// Mock de usuario actual
registerMock('/usuario/verify', async () => ({
  success: true,
  payload: {
    id: 'mock-user-id',
    email: 'usuario@ejemplo.com',
    nombre: 'Usuario',
    apellido: 'Demo',
    rol: 'VENDEDOR',
    permisos: ['VENTAS', 'CLIENTES']
  }
}));

export { mockRegistry };
