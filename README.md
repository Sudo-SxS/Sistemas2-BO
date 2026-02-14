# System-Back-Office

Sistema completo de gestión de ventas y operaciones para telecomunicaciones. Incluye backend API robusto y frontend moderno para administración de ventas, clientes, seguimiento de correos y operaciones comerciales.

## 🏗️ Arquitectura del Sistema

Este es un proyecto **monorepo** que contiene:

- **Backend**: API RESTful con Deno + PostgreSQL
- **Frontend**: Aplicación web moderna con React + TypeScript

```
System-Back-Office/
├── BackEnd/          # API REST (Deno + PostgreSQL)
├── FrondEnd/         # Aplicación web (React + TypeScript)
└── SQL/              # Scripts de base de datos
```

## ✨ Características Principales

### Backend
- **Autenticación y Autorización**: JWT con 5 roles (ADMIN, SUPERADMIN, SUPERVISOR, BACK_OFFICE, VENDEDOR)
- **Gestión de Ventas**: Creación y seguimiento (líneas nuevas, portabilidades)
- **Validaciones**: Compatibilidad de empresas, roaming, whatsapp
- **Estados Automáticos**: Transiciones automáticas según documentación
- **Seguridad**: Bloqueo de cuentas tras intentos fallidos, rate limiting

### Frontend
- **Interfaz Moderna**: Diseño responsive con componentes reutilizables
- **Gestión Visual**: Tablas de datos, formularios, modales
- **Estados en Tiempo Real**: Seguimiento de ventas y correos
- **Reportes**: Exportación a CSV y Excel

## 🛠️ Stack Tecnológico

### Backend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **Deno** | 2.0+ | Runtime TypeScript seguro |
| **Oak** | v17.1.5 | Framework web middleware |
| **PostgreSQL** | 15+ / Supabase | Base de datos relacional |
| **Zod** | 3.22.4 | Validación de schemas |
| **JWT** | - | Autenticación stateless |

### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 18+ | Framework UI |
| **TypeScript** | 5.0+ | Tipado estático |
| **Vite** | 5.0+ | Build tool |
| **Tailwind CSS** | 3.4+ | Estilos utilitarios |
| **Radix UI** | 1.0+ | Componentes accesibles |
| **React Router** | 6+ | Navegación SPA |

## 📁 Estructura del Proyecto

```
System-Back-Office/
├── BackEnd/
│   ├── src/
│   │   ├── Controller/     # Lógica de controladores
│   │   ├── services/       # Lógica de negocio
│   │   ├── model/          # Acceso a datos PostgreSQL
│   │   ├── router/         # Definición de rutas API
│   │   ├── schemas/        # Validaciones Zod
│   │   ├── middleware/     # Middlewares (auth, CORS)
│   │   ├── interface/      # Interfaces TypeScript
│   │   └── Utils/          # Utilidades
│   ├── SQL/                # Scripts de base de datos
│   └── deno.json           # Configuración Deno
│
├── FrondEnd/
│   └── flor-hub---fast-layer-of-operations-&-reporting/
│       ├── src/
│       │   ├── components/ # Componentes React
│       │   ├── pages/      # Páginas de la app
│       │   ├── hooks/      # Custom hooks
│       │   ├── services/   # API calls
│       │   ├── types/      # Tipos TypeScript
│       │   └── utils/      # Utilidades
│       ├── public/         # Assets estáticos
│       └── package.json    # Dependencias
│
└── SQL/                    # Scripts SQL compartidos
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ (para frontend)
- Deno 2.0+ (para backend)
- PostgreSQL 15+ (o cuenta Supabase)

### 1. Clonar Repositorio

```bash
git clone <repository-url>
cd System-Back-Office
```

### 2. Configurar Backend

```bash
cd BackEnd

# Crear archivo .env
cat > .env << EOF
POSTGRES_URL=postgresql://user:password@localhost:5432/bo_system
JWT_SECRET=your_super_secret_key_here
PORT=8000
ENV=development
EOF

# Ejecutar migraciones SQL
# Usar el archivo: SQL/DataBasePosgreSQL.sql

# Iniciar servidor
deno task dev
```

### 3. Configurar Frontend

```bash
cd ../FrondEnd/flor-hub---fast-layer-of-operations-&-reporting

# Instalar dependencias
npm install

# Crear archivo .env.local
cat > .env.local << EOF
VITE_API_URL=http://localhost:8000
EOF

# Iniciar servidor de desarrollo
npm run dev
```

### 4. Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: Usar colección Bruno en `BackEnd/Api/`

## 📚 Documentación

### Backend
- Ver [BackEnd/README.md](BackEnd/README.md) para documentación completa de la API
- Colección Bruno disponible en `BackEnd/Api/System-Back-Office/`

### Frontend
- Ver [FrondEnd/flor-hub---fast-layer-of-operations-&-reporting/README.md](FrondEnd/flor-hub---fast-layer-of-operations-&-reporting/README.md) para documentación del frontend

## 🔐 Roles del Sistema

| Rol | Permisos |
|-----|----------|
| **ADMIN** | CRUD completo excepto eliminar usuarios |
| **SUPERADMIN** | CRUD total, gestión de permisos |
| **SUPERVISOR** | Gestión de vendedores, reportes |
| **BACK_OFFICE** | Gestión de correos, documentación |
| **VENDEDOR** | Crear ventas, ver sus clientes |

## 🧪 Testing

### Backend
```bash
cd BackEnd
deno task test          # Ejecutar pruebas
deno check src/         # Verificar tipos
```

### Frontend
```bash
cd FrondEnd/flor-hub---fast-layer-of-operations-&-reporting
npm run lint            # Linting
npm run typecheck       # Verificación de tipos
npm run build           # Build de producción
```

## 📝 Cambios Recientes

### v2.0.0 - Migración a PostgreSQL
- ✅ Migración completa de MySQL a PostgreSQL
- ✅ Sincronización de esquemas Zod con base de datos
- ✅ Actualización de `promocion.descuento` a tipo integer
- ✅ Corrección de tipos en `portabilidad` (pin y empresa_origen ahora son strings)
- ✅ Actualización de roles: agregados ADMIN y SUPERADMIN

## 📄 Licencia

Propietario - Todos los derechos reservados.

## 📞 Contacto

Para soporte o consultas, contactar al equipo de desarrollo.
