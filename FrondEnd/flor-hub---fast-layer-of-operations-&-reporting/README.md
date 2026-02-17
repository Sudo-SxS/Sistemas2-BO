<div align="center">
  <h1>🌸 Flor Hub</h1>
  <p><strong>Fast Layer of Operations & Reporting</strong></p>
  <p>Aplicación web moderna para gestión de ventas y operaciones de telecomunicaciones</p>
</div>

---

## 🎯 Descripción

**Flor Hub** es la interfaz de usuario del sistema System-Back-Office, diseñada para proporcionar una experiencia moderna e intuitiva en la gestión de:

- 📊 **Ventas**: Creación y seguimiento de portabilidades y líneas nuevas
- 👥 **Clientes**: Administración completa de datos de clientes
- 📮 **Correos**: Tracking de envíos y estados logísticos
- 📈 **Reportes**: Visualización de estadísticas y métricas
- 🔔 **Notificaciones**: Sistema de alertas y mensajes

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 18.3+ | Framework UI declarativo |
| **TypeScript** | 5.3+ | Tipado estático fuerte |
| **Vite** | 5.0+ | Build tool ultrarrápido |
| **Tailwind CSS** | 3.4+ | Framework CSS utilitario |
| **Radix UI** | 1.0+ | Componentes accesibles sin estilos |
| **React Router** | 6.21+ | Enrutamiento SPA |
| **Lucide React** | 0.300+ | Iconos modernos y personalizables |
| **date-fns** | 3.0+ | Manipulación de fechas |
| **XLSX** | 0.18+ | Exportación a Excel |
| **Sonner** | 1.3+ | Notificaciones toast elegantes |

## ✨ Características Principales

### 🎨 Diseño y UX
- **Interfaz Moderna**: Diseño limpio con Tailwind CSS
- **Responsive**: Adaptable a desktop, tablet y móvil
- **Tema Claro/Oscuro**: Soporte para modo oscuro (próximamente)
- **Componentes Reutilizables**: Biblioteca de UI consistente
- **Accesibilidad**: Cumple estándares WCAG 2.1

### 📊 Gestión de Datos
- **Tablas Dinámicas**: Sorting, filtering, paginación
- **Formularios Validados**: Validación en tiempo real
- **Modales Interactivos**: Edición inline sin recargar
- **Exportación**: Descarga a CSV y Excel
- **Búsqueda Avanzada**: Filtros múltiples y combinados

### 🔄 Estados y Flujos
- **SPA (Single Page Application)**: Navegación sin recarga
- **Estado Global**: Gestión de estado con React hooks
- **Optimistic UI**: Actualizaciones inmediatas
- **Skeleton Loaders**: Estados de carga elegantes
- **Error Boundaries**: Manejo graceful de errores

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes React (Organizados)
│   ├── analytics/       # Gráficos y KPIs
│   ├── common/          # Componentes genéricos (Logo, Toast, etc.)
│   ├── layout/          # Estructura (Header, Filters, Menus)
│   ├── modals/          # Diálogos y formularios flotantes
│   └── sale/            # Tarjetas y detalles de venta
├── contexts/            # Contextos de React (Toast, Auth, etc.)
├── hooks/               # Custom React hooks (Query, Auth)
├── pages/               # Páginas principales
├── services/            # Clientes de API y mapeadores
├── types.ts             # Definiciones TypeScript globales
└── App.tsx              # Punto de entrada principal
```

## 🛠️ Mejoras Recientes (v2.1.0)

### 📋 Gestión de Estados
- **Corrección de Payloads**: Sincronización exacta con los esquemas Zod del backend para actualizaciones operativas y logísticas.
- **Validación Robusta**: Mejora en el reporte de errores de Zod directamente en la interfaz (Toasts detallados).
- **Invalidación de Queries**: Actualización en tiempo real de los modales al cambiar el estado de una venta.

### 🎨 UI & UX
- **Claridad Visual**: Eliminación de efectos de desenfoque pesados en modales para mejorar la legibilidad.
- **Reorganización**: Estructura de componentes más lógica y escalable.
- **Feedback**: Mejora en las notificaciones de éxito y error.

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ o 20+
- npm 9+ o yarn 1.22+

### 1. Instalar Dependencias

```bash
npm install
# o
yarn install
```

### 2. Configurar Variables de Entorno

Crear archivo `.env.local`:

```env
# API Backend
VITE_API_URL=http://localhost:8000

# Otras configuraciones
VITE_APP_NAME=Flor Hub
VITE_APP_VERSION=2.0.0
```

### 3. Iniciar Servidor de Desarrollo

```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en: **http://localhost:5173**

### 4. Build de Producción

```bash
npm run build
# o
yarn build
```

Los archivos de producción se generarán en la carpeta `dist/`.

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run dev:host         # Iniciar con acceso de red

# Build
npm run build            # Build de producción
npm run build:analyze    # Build con análisis de bundle

# Calidad de Código
npm run lint             # Ejecutar ESLint
npm run lint:fix         # Corregir errores de ESLint
npm run typecheck        # Verificar tipos de TypeScript

# Testing
npm run test             # Ejecutar tests
npm run test:coverage    # Tests con cobertura
```

## 🎨 Sistema de Diseño

### Paleta de Colores

```css
/* Colores principales */
--primary: #3b82f6;        /* Azul principal */
--primary-hover: #2563eb;  /* Azul hover */
--secondary: #64748b;      /* Gris */
--success: #22c55e;        /* Verde éxito */
--warning: #f59e0b;        /* Naranja alerta */
--error: #ef4444;          /* Rojo error */

/* Colores de fondo */
--bg-primary: #ffffff;     /* Fondo principal */
--bg-secondary: #f8fafc;   /* Fondo secundario */
--bg-dark: #0f172a;        /* Fondo oscuro */
```

### Tipografía

- **Fuente principal**: Inter (system-ui como fallback)
- **Tamaños**: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px)
- **Pesos**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Componentes Base

#### Botones
```tsx
// Variantes disponibles
<Button variant="default">Primario</Button>
<Button variant="secondary">Secundario</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructivo</Button>

// Tamaños
<Button size="sm">Pequeño</Button>
<Button size="default">Normal</Button>
<Button size="lg">Grande</Button>
<Button size="icon">Icono</Button>
```

#### Inputs
```tsx
<Input type="text" placeholder="Nombre" />
<Input type="email" placeholder="Email" />
<Input type="number" placeholder="Monto" />
```

#### Tablas
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>ID</TableHead>
      <TableHead>Cliente</TableHead>
      <TableHead>Estado</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* Filas de datos */}
  </TableBody>
</Table>
```

## 📱 Pantallas Principales

### 🏠 Dashboard (Home)
- Resumen de ventas del día/semana/mes
- Notificaciones críticas y recientes
- Gráficos de rendimiento
- Accesos rápidos

### 📊 Gestión de Ventas (Sales)
- Lista completa de ventas
- Filtros avanzados (estado, fecha, vendedor)
- Creación de nueva venta (modal)
- Detalle de venta con historial

### 👥 Clientes (Clients)
- Directorio de clientes
- Búsqueda por DNI, nombre, teléfono
- Historial de compras por cliente
- Edición de datos

### 📈 Reportes (Reports)
- Estadísticas por período
- Rendimiento de vendedores
- Exportación a Excel/CSV
- Gráficos interactivos

### ⚙️ Configuración
- Perfil de usuario
- Preferencias de visualización
- Gestión de notificaciones

## 🔐 Autenticación

El frontend maneja la autenticación mediante:

1. **JWT Token**: Almacenado en localStorage o cookie
2. **Refresh Token**: Para renovación automática
3. **Protected Routes**: Rutas protegidas por roles
4. **Auto-logout**: Al expirar el token

### Roles Soportados
- **ADMIN**: Acceso total
- **SUPERADMIN**: Gestión de permisos
- **SUPERVISOR**: Reportes y supervisión
- **BACK_OFFICE**: Gestión de documentación
- **VENDEDOR**: Creación de ventas

## 🌐 Integración con Backend

### Configuración de API

```typescript
// services/api.ts
const API_URL = import.meta.env.VITE_API_URL;

export const api = {
  get: (endpoint: string) => fetch(`${API_URL}${endpoint}`),
  post: (endpoint: string, data: any) => 
    fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
  // ...
};
```

### Manejo de Errores

```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.status === 401) {
    // Redirigir a login
    window.location.href = '/login';
  } else if (error.status === 403) {
    // Mostrar mensaje de permisos insuficientes
    toast.error('No tienes permisos para esta acción');
  }
  // ...
};
```

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.21.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.300.0",
    "date-fns": "^3.0.0",
    "xlsx": "^0.18.5",
    "sonner": "^1.3.1"
  }
}
```

## 🎓 Buenas Prácticas

### Convenciones de Código
- **Componentes**: PascalCase (ej: `SaleTable.tsx`)
- **Hooks**: camelCase con prefijo "use" (ej: `useSales.ts`)
- **Utilidades**: camelCase (ej: `formatDate.ts`)
- **Tipos**: PascalCase con sufijo (ej: `SaleType.ts`)

### Estructura de Componentes
```tsx
// 1. Imports
import React from 'react';
import { Button } from '@/components/ui/button';

// 2. Tipos
interface SaleCardProps {
  sale: Sale;
  onEdit: (id: number) => void;
}

// 3. Componente
export const SaleCard: React.FC<SaleCardProps> = ({ sale, onEdit }) => {
  // Lógica...
  
  return (
    <div className="rounded-lg border p-4">
      {/* JSX */}
    </div>
  );
};
```

## 🐛 Debugging

### Herramientas Recomendadas
- **React DevTools**: Extensión de navegador
- **Redux DevTools**: Para estado global (si se usa)
- **VS Code**: Con extensiones:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Importer

### Logs de Desarrollo
```typescript
// En desarrollo
if (import.meta.env.DEV) {
  console.log('Debug:', data);
}
```

## 📄 Licencia

Propietario - Todos los derechos reservados.

## 🤝 Contribución

1. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commits descriptivos
3. Asegurar que `npm run lint` y `npm run typecheck` pasen
4. Crear Pull Request con descripción detallada

## 📞 Soporte

Para reportar bugs o solicitar features:
- Crear issue en el repositorio
- Contactar al equipo de desarrollo

---

<div align="center">
  <p>Desarrollado con ❤️ por el equipo de Flor Hub</p>
  <p><strong>Versión 2.0.0</strong></p>
</div>
