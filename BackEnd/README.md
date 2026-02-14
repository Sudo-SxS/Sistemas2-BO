# System-Back-Office API

API RESTful para Gestión de Ventas, Clientes y Operaciones de BackOffice

---

## 🎯 1. INTRODUCCIÓN Y DESCRIPCIÓN

**System-Back-Office API** es una API RESTful robusta desarrollada en **Deno** y **TypeScript** para gestionar operaciones de backoffice, incluyendo:

- ✅ Gestión completa de **ventas** (Portabilidad y Línea Nueva)
- ✅ **Estados automáticos** de ventas según documentación (SDS/STL)
- ✅ Sistema de **correos** con tracking de envíos
- ✅ Gestión de **clientes** con datos completos de persona
- ✅ **Autenticación JWT** con roles y permisos granulares
- ✅ Historial completo de estados por venta
- ✅ Validación estricta de datos con **Zod**
- ✅ Rollback automático en operaciones complejas

**Características principales:**
- 🔒 Seguridad JWT con roles (SUPER_ADMIN, ADMIN, BACK_OFFICE, VENDEDOR)
- 🔄 Estados automáticos sin intervención manual
- 📊 Sistema de tracking para correos
- 🧪 100+ endpoints documentados con Bruno
- 🚀 Arquitectura MVC escalable y mantenible

---

## 🏗️ 2. ARQUITECTURA DEL SISTEMA

### Patrón: MVC + Service Layer

El sistema implementa una arquitectura en capas claramente definidas:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Frontend/Bruno)                 │
│         HTTP Request (JSON + Bearer Token)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      ROUTER (Oak)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Definición de endpoints (13 routers)              │   │
│  │ • Middleware authMiddleware (JWT)                   │   │
│  │ • Middleware rolMiddleware (RBAC)                   │   │
│  │ • Validación de parámetros URL                      │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTROLLER                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Validación Zod de request body                    │   │
│  │ • Extracción de datos del contexto                  │   │
│  │ • Llamada a Services                                │   │
│  │ • Formato de respuestas HTTP (JSON)                 │   │
│  │ • Manejo de errores con logger                      │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Lógica de negocio compleja                        │   │
│  │ • Validaciones de negocio (planes, promociones)     │   │
│  │ • Transformaciones de datos                         │   │
│  │ • Estados automáticos (SDS/STL)                     │   │
│  │ • Asignación de SAP automática                      │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      MODEL                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • PostgreSQL Models (15+ tablas)                    │   │
│  │ • Queries SQL optimizadas                           │   │
│  │ • Transacciones ACID                                │   │
│  │ • Rollback automático en errores                    │   │
│  │ • Pool de conexiones PostgreSQL                     │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   POSTGRESQL DATABASE                       │
│         (Supabase o PostgreSQL Local)                       │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de una Petición (Ejemplo: Crear Venta)

```
1. Cliente → POST /ventas
   Headers: Authorization: Bearer <token>
   Body: { venta: {...}, correo: {...} }

2. Router → AuthMiddleware valida JWT
   → RolMiddleware verifica permisos

3. VentaController → 
   → Extrae ctx.state.user.id (vendedor)
   → Valida body con VentaCreateSchema
   → Llama a ventaService.create()

4. VentaService → 
   → Valida plan y promoción
   → Crea correo (si aplica)
   → Crea venta
   → Crea estado automático (PENDIENTE/CREADO)
   → Crea portabilidad/línea nueva

5. Si error en paso 4 → Rollback automático:
   → Elimina correo creado
   → Elimina venta creada
   → Lanza error

6. Response → { success: true, data: venta }
```

---

## 🛠️ 3. STACK TECNOLÓGICO COMPLETO

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **Deno** | 2.0+ | Runtime de JavaScript/TypeScript seguro |
| **TypeScript** | 5.0+ | Lenguaje tipado estático |
| **Oak** | v17.1.5 | Framework web middleware (similar a Express) |
| **PostgreSQL** | 15+ / Supabase | Base de datos relacional principal |
| **@db/postgres** | 0.19 | Driver PostgreSQL nativo para Deno |
| **Zod** | 3.22.4 | Validación de schemas y tipos en runtime |
| **djwt** | v3.0.2 | Creación y verificación de JWT |
| **jose** | v6.0.11 | Utilidades criptográficas JWT |
| **dotenv** | std@0.224.0 | Gestión de variables de entorno |
| **oakCors** | v1.2.2 | Middleware CORS |
| **CSV** | std@0.224.0 | Procesamiento de archivos CSV |
| **xlsx** | npm | Procesamiento de archivos Excel |
| **log** | std@0.224.0 | Sistema de logging |

---

## 📁 4. ESTRUCTURA DEL PROYECTO

```
System-Back-Office/BackEnd/
│
├── 📄 deno.json                    # Configuración Deno e imports
├── 📄 deno.lock                    # Lock de dependencias seguras
├── 📄 .env.example                 # Variables de entorno de ejemplo
├── 📄 main.ts                      # Punto de entrada principal
│
├── 📁 Api/                         # Colección Bruno para testing
│   └── System-Back-Office/
│       ├── Venta/                  # 5 archivos .bru
│       ├── Cliente/                # 8 archivos .bru
│       ├── Correo/                 # 12 archivos .bru
│       ├── EstadoVenta/            # 6 archivos .bru
│       ├── Portabilidad/           # 5 archivos .bru
│       ├── LineaNueva/             # 5 archivos .bru
│       ├── Plan/                   # 6 archivos .bru
│       ├── Promocion/              # 6 archivos .bru
│       ├── Usuario/                # 8 archivos .bru
│       ├── EmpresaOrigen/          # 5 archivos .bru
│       ├── EstadoCorreo/           # 12 archivos .bru
│       └── Auth/                   # 3 archivos .bru
│
├── 📁 SQL/                         # Scripts de base de datos
│   └── DataBasePosgreSQL.sql       # Schema completo
│
└── 📁 src/
    │
    ├── 📁 router/                  # 13 routers HTTP
    │   ├── VentaRouter.ts         # 15 endpoints de ventas
    │   ├── ClienteRouter.ts       # 8 endpoints de clientes
    │   ├── AuthRouter.ts          # Login, refresh, logout
    │   ├── UsuarioRouter.ts       # CRUD usuarios
    │   ├── CorreoRouter.ts        # Gestión de correos
    │   ├── EstadoVentaRouter.ts   # Estados de ventas
    │   ├── EstadoCorreoRouter.ts  # Tracking de correos
    │   ├── PlanRouter.ts          # Planes disponibles
    │   ├── PromocionRouter.ts     # Promociones
    │   ├── PortabilidadRouter.ts  # Portabilidades
    │   ├── LineaNuevaRouter.ts    # Líneas nuevas
    │   ├── EmpresaRouter.ts       # Empresas
    │   ├── EmpresaOrigenRouter.ts # Empresas de origen
    │   └── HomeRouter.ts          # Endpoint raíz
    │
    ├── 📁 Controller/             # 15 controllers
    │   ├── VentaController.ts     # Lógica de ventas compleja
    │   ├── ClienteController.ts   # Gestión de clientes
    │   ├── AuthController.ts      # Autenticación
    │   └── ...
    │
    ├── 📁 services/               # Lógica de negocio
    │   ├── VentaService.ts        # Estados automáticos, validaciones
    │   ├── ClienteService.ts      # Gestión de clientes
    │   ├── PlanService.ts         # Validación de planes
    │   └── ...
    │
    ├── 📁 model/                  # 15 modelos PostgreSQL
    │   ├── ventaPostgreSQL.ts     # Queries de ventas
    │   ├── clientePostgreSQL.ts   # Queries de clientes
    │   ├── estadoVentaPostgreSQL.ts # Queries de estados
    │   └── ...
    │
    ├── 📁 interface/              # Interfaces TypeScript
    │   ├── venta.ts
    │   ├── Cliente.ts
    │   ├── EstadoVenta.ts
    │   └── ...
    │
    ├── 📁 schemas/                # Validación Zod
    │   ├── venta/
    │   │   ├── Venta.ts           # Schema Venta
    │   │   ├── EstadoVenta.ts     # Schema EstadoVenta
    │   │   ├── Portabilidad.ts    # Schema Portabilidad
    │   │   └── LineaNueva.ts      # Schema LineaNueva
    │   ├── persona/
    │   │   ├── Cliente.ts         # Schema Cliente
    │   │   ├── User.ts            # Schema Usuario
    │   │   └── Persona.ts         # Schema Persona
    │   ├── correo/
    │   │   └── Correo.ts          # Schema Correo
    │   └── ...
    │
    ├── 📁 middleware/             # Middlewares
    │   ├── authMiddlewares.ts     # JWT validation
    │   └── rolMiddlewares.ts      # RBAC roles
    │
    ├── 📁 database/               # Conexión a BD
    │   ├── PostgreSQL.ts          # Cliente PostgreSQL
    │   └── PostgreSQLTest.ts      # Tests de conexión
    │
    ├── 📁 Utils/                  # Utilidades
    │   ├── logger.ts              # Logger centralizado
    │   ├── databaseErrorMapper.ts # Mapeo de errores BD
    │   └── errores.ts             # Manejo de errores
    │
    └── 📁 types/                  # Tipos globales
        └── ventaTypes.ts          # Tipos específicos de venta
```

---

## 🔐 5. SISTEMA DE SEGURIDAD Y PERMISOS

### 5.1 Autenticación JWT

```typescript
// Configuración en authMiddlewares.ts
- Algoritmo: HMAC-SHA256
- Expiración: 24 horas (configurable)
- Almacenamiento: Cookies o Header Authorization
- Refresh Token: Disponible para extender sesión
```

**Flujo de Login:**
```
POST /login
Body: { email, password }
↓
Validación en BD
↓
Generar JWT con payload:
  { id: persona_id, email, rol, permisos, exp }
↓
Response: { token, user: {...} }
```

### 5.2 Roles del Sistema (RBAC)

| Rol | Descripción | Permisos CRUD |
|-----|-------------|---------------|
| **SUPER_ADMIN** | Administrador total | ✅ Todo (Crear, Leer, Actualizar, Eliminar) |
| **ADMIN** | Administrador | ✅ CRUD excepto eliminar usuarios |
| **BACK_OFFICE** | Operador backoffice | ✅ CRUD en estados, ventas<br>❌ No puede eliminar |
| **SUPERVISOR** | Supervisor de vendedores | ✅ Solo lectura de reportes y estadísticas |
| **VENDEDOR** | Vendedor | ✅ Crear ventas, ver sus clientes<br>❌ No puede modificar/eliminar |

### 5.3 Middlewares de Seguridad

```typescript
// Ejemplo de protección de endpoint
router.post("/ventas",
  authMiddleware(userModel),                    // 1. Validar JWT
  rolMiddleware("VENDEDOR", "ADMIN", "BACK_OFFICE"), // 2. Validar rol
  async (ctx) => {                              // 3. Ejecutar endpoint
    // Lógica del endpoint
  }
);
```

---

## 📡 7. DOCUMENTACIÓN COMPLETA DE ENDPOINTS

### 7.1 Códigos de Respuesta HTTP

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado exitosamente |
| 204 | No Content | Eliminación exitosa sin contenido |
| 400 | Bad Request | Datos inválidos o faltantes |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | Sin permisos suficientes |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

### 7.2 Formato de Respuesta Estándar

**Éxito (200/201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

**Error (400/401/403/404/500):**
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": { ... } // Opcional, para errores de validación
}
```

**Paginación (cuando aplica):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150
  }
}
```

### 7.3 Notas Importantes

1. **Autenticación:** Todos los endpoints protegidos requieren el header `Authorization: Bearer <token>` o cookie `token`
2. **Paginación:** La mayoría de los endpoints GET soportan `?page` y `?limit`
3. **Validación:** Los endpoints POST/PUT usan Zod para validación de esquemas
4. **Logging:** Todos los routers utilizan un sistema de logging para tracking de operaciones

---

## 7.4 AUTHENTICATION (AuthRouter) - `/auth`

### POST /auth/login
Iniciar sesión y obtener token JWT.

**Roles:** Público (cualquiera)

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Response 200 (Éxito):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "persona_id": "18813772-835c-4ea1-8794-b2284d25b6cd",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "usuario@example.com",
    "rol": "VENDEDOR"
  }
}
```

**Response 401 (Error):**
```json
{
  "success": false,
  "message": "Credenciales inválidas"
}
```

---

### POST /auth/refresh
Refrescar token JWT antes de que expire.

**Roles:** Usuario autenticado

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

### POST /auth/logout
Cerrar sesión e invalidar token.

**Roles:** Usuario autenticado

**Response 200:**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

## 7.5 USUARIOS (UsuarioRouter) - `/usuarios`

### GET /usuarios
Obtener todos los usuarios con paginación y filtros.

**Roles:** ADMIN, SUPER_ADMIN, SUPERVISOR

**Query Params:**
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 10)
- `name`: Filtro por nombre (opcional)
- `email`: Filtro por email (opcional)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "persona_id": "uuid",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com",
      "rol": "VENDEDOR",
      "legajo": "EMP001",
      "estado": "ACTIVO"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

---

### GET /usuarios/:id
Obtener usuario específico por ID.

**Roles:** ADMIN, SUPER_ADMIN, SUPERVISOR (o el propio usuario)

**Params:**
- `:id`: UUID del usuario

**Response 200:**
```json
{
  "success": true,
  "data": {
    "persona_id": "uuid",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "documento": "12345678",
    "telefono": "3511234567",
    "rol": "VENDEDOR",
    "legajo": "EMP001",
    "exa": 12345,
    "estado": "ACTIVO",
    "permisos": ["CREAR_VENTA", "VER_CLIENTES"]
  }
}
```

---

### POST /usuarios
Crear un nuevo usuario (con persona y password).

**Roles:** SUPER_ADMIN

**Request Body:**
```json
{
  "nombre": "Carlos",
  "apellido": "López",
  "email": "carlos@empresa.com",
  "documento": "87654321",
  "tipo_documento": "DNI",
  "telefono": "3517654321",
  "fecha_nacimiento": "1985-03-20",
  "nacionalidad": "Argentina",
  "genero": "Masculino",
  "legajo": "EMP002",
  "rol": "VENDEDOR",
  "exa": 54321,
  "password": "PasswordSeguro123"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "persona_id": "nuevo-uuid",
    "nombre": "Carlos",
    "apellido": "López",
    "email": "carlos@empresa.com",
    "rol": "VENDEDOR"
  }
}
```

---

### PUT /usuarios/:id
Actualizar datos de un usuario.

**Roles:** ADMIN, SUPER_ADMIN

**Params:**
- `:id`: UUID del usuario

**Request Body:**
```json
{
  "nombre": "Carlos Alberto",
  "telefono": "3519998888",
  "rol": "ADMIN"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "persona_id": "uuid",
    "nombre": "Carlos Alberto",
    "apellido": "López",
    "email": "carlos@empresa.com",
    "rol": "ADMIN"
  }
}
```

---

### PATCH /usuarios/:id/estado
Cambiar estado de un usuario (activar/desactivar).

**Roles:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "estado": "INACTIVO"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Usuario desactivado exitosamente"
}
```

---

### DELETE /usuarios/:id
Eliminar usuario permanentemente.

**Roles:** SUPER_ADMIN

**Response 200:**
```json
{
  "success": true,
  "message": "Usuario eliminado permanentemente"
}
```

---

## 7.6 CLIENTES (ClienteRouter) - `/clientes`

### GET /clientes
Obtener todos los clientes con datos completos.

**Roles:** Cualquier usuario autenticado

**Query Params:**
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 10)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "persona_id": "18813772-835c-4ea1-8794-b2284d25b6cd",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com",
      "documento": "12345678",
      "tipo_documento": "DNI",
      "telefono": "3511234567",
      "fecha_nacimiento": "1990-05-15",
      "nacionalidad": "Argentina",
      "genero": "Masculino"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150
  }
}
```

---

### GET /clientes/buscar
Buscar cliente por tipo y número de documento.

**Roles:** Cualquier usuario autenticado

**Query Params:**
- `tipo_documento` (requerido): Tipo de documento (DNI, PASAPORTE, CUIT, CUIL, LC, LE)
- `documento` (requerido): Número de documento

**Ejemplo:** `GET /clientes/buscar?tipo_documento=DNI&documento=12345678`

**Response 200 (Encontrado):**
```json
{
  "success": true,
  "data": {
    "persona_id": "18813772-835c-4ea1-8794-b2284d25b6cd",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "documento": "12345678",
    "tipo_documento": "DNI",
    "telefono": "3511234567",
    "fecha_nacimiento": "1990-05-15",
    "nacionalidad": "Argentina",
    "genero": "Masculino"
  }
}
```

**Response 404 (No encontrado):**
```json
{
  "success": false,
  "message": "Cliente no encontrado"
}
```

---

### GET /clientes/:id
Obtener un cliente específico por ID.

**Roles:** Cualquier usuario autenticado

**Params:**
- `:id`: UUID del cliente

**Response 200:**
```json
{
  "success": true,
  "data": {
    "persona_id": "uuid",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "documento": "12345678",
    "tipo_documento": "DNI"
  }
}
```

---

### POST /clientes
Crear un nuevo cliente.

**Roles:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "nombre": "María",
  "apellido": "García",
  "email": "maria@example.com",
  "documento": "87654321",
  "tipo_documento": "DNI",
  "telefono": "3519876543",
  "fecha_nacimiento": "1992-08-25",
  "nacionalidad": "Argentina",
  "genero": "Femenino"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "persona_id": "nuevo-uuid",
    "nombre": "María",
    "apellido": "García",
    "email": "maria@example.com"
  }
}
```

---

### PUT /clientes/:id
Actualizar datos de un cliente.

**Roles:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "telefono": "3511112222",
  "email": "maria.nueva@example.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "persona_id": "uuid",
    "nombre": "María",
    "apellido": "García",
    "email": "maria.nueva@example.com",
    "telefono": "3511112222"
  }
}
```

---

### DELETE /clientes/:id
Eliminar un cliente permanentemente.

**Roles:** ADMIN, SUPER_ADMIN

**Response 200:**
```json
{
  "success": true,
  "message": "Cliente eliminado correctamente"
}
```

---

## 7.7 VENTAS (VentaRouter) - `/ventas`

### GET /ventas
Obtener todas las ventas con datos completos.

**Roles:** ADMIN, SUPER_ADMIN, SUPERVISOR, BACK_OFFICE

**Query Params:**
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 10)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "venta_id": 123,
      "sds": "SDS123456",
      "chip": "SIM",
      "stl": "STL789012",
      "tipo_venta": "PORTABILIDAD",
      "sap": "SAP00112233",
      "cliente_id": "uuid-cliente",
      "cliente_nombre": "Juan",
      "cliente_apellido": "Pérez",
      "vendedor_id": "uuid-vendedor",
      "vendedor_nombre": "Carlos López",
      "plan_id": 1,
      "plan_nombre": "Plan Ultra 50GB",
      "promocion_id": 1,
      "promocion_nombre": "Promo Verano",
      "estado_actual": "CREADO_SIN_DOCU",
      "fecha_creacion": "2026-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150
  }
}
```

---

### GET /ventas/:id
Obtener una venta específica por ID.

**Roles:** Cualquier usuario autenticado

**Response 200:**
```json
{
  "success": true,
  "data": {
    "venta_id": 123,
    "sds": "SDS123456",
    "tipo_venta": "PORTABILIDAD",
    "cliente": {
      "persona_id": "uuid",
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "vendedor": {
      "persona_id": "uuid",
      "nombre": "Carlos",
      "apellido": "López"
    },
    "plan": {
      "plan_id": 1,
      "nombre": "Plan Ultra 50GB",
      "precio": 50.00
    },
    "correo": {
      "sap_id": "SAP00112233",
      "destinatario": "Juan Pérez",
      "direccion": "Av. Colón 1234"
    },
    "portabilidad": {
      "spn": "SPN789",
      "mercado_origen": "POSPAGO",
      "numero_porta": "3517654321"
    }
  }
}
```

---

### POST /ventas
Crear una nueva venta (Portabilidad o Línea Nueva).

**Roles:** VENDEDOR, ADMIN, BACK_OFFICE, SUPER_ADMIN

**Request Body:**
```json
{
  "venta": {
    "sds": "SDS123456",
    "chip": "SIM",
    "stl": "STL789012",
    "tipo_venta": "PORTABILIDAD",
    "sap": "SAP00112233",
    "cliente_id": "18813772-835c-4ea1-8794-b2284d25b6cd",
    "plan_id": 1,
    "promocion_id": 1,
    "empresa_origen_id": 5,
    "multiple": 0
  },
  "correo": {
    "sap_id": "SAP00112233",
    "telefono_contacto": "3514567890",
    "telefono_alternativo": "3517654321",
    "destinatario": "Juan Pérez",
    "persona_autorizada": "María López",
    "direccion": "Av. Colón 1234",
    "numero_casa": 1234,
    "entre_calles": "25 de Mayo y 9 de Julio",
    "barrio": "Centro",
    "localidad": "Córdoba",
    "departamento": "Córdoba",
    "codigo_postal": 5000,
    "piso": "3",
    "departamento_numero": "A"
  },
  "portabilidad": {
    "spn": "SPN789",
    "mercado_origen": "pospago",
    "numero_porta": "3517654321",
    "pin": 1234
  }
}
```

**Notas importantes:**
- `vendedor_id` se obtiene automáticamente del JWT
- `mercado_origen` se convierte a mayúsculas automáticamente
- Estado automático según SDS/STL

**Response 201:**
```json
{
  "success": true,
  "data": {
    "venta_id": 124,
    "sds": "SDS123456",
    "tipo_venta": "PORTABILIDAD",
    "estado_actual": "CREADO_SIN_DOCU",
    "message": "Venta creada exitosamente con estado CREADO_SIN_DOCU"
  }
}
```

---

### GET /ventas/sds/:sds
Buscar venta por código SDS.

**Roles:** Cualquier usuario autenticado

**Response 200:**
```json
{
  "success": true,
  "data": {
    "venta_id": 123,
    "sds": "SDS123456",
    ...
  }
}
```

---

### GET /ventas/sap/:sap
Buscar venta por código SAP.

**Roles:** Cualquier usuario autenticado

---

### GET /ventas/vendedor/:vendedor
Obtener ventas de un vendedor específico.

**Roles:** ADMIN, SUPERVISOR, SUPER_ADMIN (o el propio vendedor)

---

### GET /ventas/cliente/:cliente
Obtener ventas de un cliente específico.

**Roles:** Cualquier usuario autenticado

---

### GET /ventas/estadisticas
Obtener estadísticas de ventas.

**Roles:** ADMIN, SUPERVISOR, SUPER_ADMIN

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_ventas": 150,
    "ventas_por_tipo": {
      "PORTABILIDAD": 100,
      "LINEA_NUEVA": 50
    },
    "ventas_por_estado": {
      "CREADO_SIN_DOCU": 80,
      "PENDIENTE_DE_CARGA": 20,
      "ENTREGADO": 50
    },
    "ventas_por_mes": {
      "2026-01": 45,
      "2026-02": 55
    }
  }
}
```

---

### GET /ventas/fechas
Obtener ventas por rango de fechas.

**Roles:** Cualquier usuario autenticado

**Query Params:**
- `start`: Fecha inicio (YYYY-MM-DD)
- `end`: Fecha fin (YYYY-MM-DD)

---

### PUT /ventas/:id
Actualizar una venta.

**Roles:** ADMIN, SUPER_ADMIN

---

### DELETE /ventas/:id
Eliminar una venta.

**Roles:** ADMIN, SUPER_ADMIN

---

## 7.8 ESTADOS DE VENTA (EstadoVentaRouter) - `/estados`

### GET /estados
Obtener todos los estados de venta.

**Roles:** Cualquier usuario autenticado

---

### GET /estados/venta/:venta_id
Obtener historial completo de estados de una venta.

**Roles:** Cualquier usuario autenticado

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "estado_id": 1,
      "estado": "CREADO_SIN_DOCU",
      "descripcion": "Venta creada con STL y SDS",
      "fecha_creacion": "2026-01-15T10:30:00Z",
      "usuario_nombre": "Carlos López",
      "usuario_rol": "VENDEDOR"
    },
    {
      "estado_id": 2,
      "estado": "EN_REVISION",
      "descripcion": "Documentación en revisión por backoffice",
      "fecha_creacion": "2026-01-16T14:20:00Z",
      "usuario_nombre": "María García",
      "usuario_rol": "BACK_OFFICE"
    },
    {
      "estado_id": 3,
      "estado": "APROBADO",
      "descripcion": "Venta aprobada para envío",
      "fecha_creacion": "2026-01-17T09:15:00Z",
      "usuario_nombre": "Admin Principal",
      "usuario_rol": "ADMIN"
    }
  ]
}
```

---

### POST /estados
Crear un nuevo estado para una venta.

**Roles:** ADMIN, BACK_OFFICE, SUPER_ADMIN

**Request Body:**
```json
{
  "venta_id": 123,
  "estado": "EN_REVISION",
  "descripcion": "Documentación en revisión por backoffice",
  "fecha_creacion": "2026-02-02T15:00:00Z"
}
```

**Nota:** `usuario_id` se obtiene automáticamente del JWT

**Response 201:**
```json
{
  "success": true,
  "data": {
    "estado_id": 45,
    "venta_id": 123,
    "estado": "EN_REVISION",
    "descripcion": "Documentación en revisión por backoffice",
    "usuario_id": "18813772-835c-4ea1-8794-b2284d25b6cd",
    "fecha_creacion": "2026-02-02T15:00:00Z"
  }
}
```

---

### PUT /estados/:id
Actualizar un estado.

**Roles:** ADMIN, BACK_OFFICE, SUPER_ADMIN

---

### DELETE /estados/:id
Eliminar un estado.

**Roles:** ADMIN, SUPER_ADMIN

---

## 7.9 PORTABILIDAD (PortabilidadRouter) - `/portabilidad`

### GET /portabilidad
Obtener todas las portabilidades.

**Roles:** Cualquier usuario autenticado

---

### GET /portabilidad/:venta_id
Obtener portabilidad por venta ID.

**Roles:** Cualquier usuario autenticado

**Response 200:**
```json
{
  "success": true,
  "data": {
    "portabilidad_id": 45,
    "venta_id": 123,
    "spn": "SPN789",
    "empresa_origen_id": 5,
    "mercado_origen": "POSPAGO",
    "numero_porta": "3517654321",
    "pin": 1234,
    "fecha_portacion": "2026-02-15T00:00:00Z"
  }
}
```

---

### POST /portabilidad
Crear portabilidad.

**Roles:** VENDEDOR, ADMIN, BACK_OFFICE, SUPER_ADMIN

---

### PUT /portabilidad/:venta_id
Actualizar portabilidad.

**Roles:** ADMIN, SUPER_ADMIN

---

### DELETE /portabilidad/:venta_id
Eliminar portabilidad.

**Roles:** ADMIN, SUPER_ADMIN

---

## 7.10 LÍNEA NUEVA (LineaNuevaRouter) - `/linea-nueva`

### GET /linea-nueva
Obtener todas las líneas nuevas.

**Roles:** Cualquier usuario autenticado

---

### GET /linea-nueva/:venta_id
Obtener línea nueva por venta ID.

**Roles:** Cualquier usuario autenticado

---

### POST /linea-nueva
Crear línea nueva.

**Roles:** VENDEDOR, ADMIN, BACK_OFFICE, SUPER_ADMIN

---

### PUT /linea-nueva/:venta_id
Actualizar línea nueva.

**Roles:** ADMIN, SUPER_ADMIN

---

### DELETE /linea-nueva/:venta_id
Eliminar línea nueva.

**Roles:** ADMIN, SUPER_ADMIN

---

## 7.11 CORREOS (CorreoRouter) - `/correos`

### GET /correos
Obtener todos los correos.

**Roles:** ADMIN, BACK_OFFICE, SUPER_ADMIN, SUPERVISOR

---

### GET /correos/sap/:sap
Buscar correo por SAP.

**Roles:** Cualquier usuario autenticado

---

### POST /correos
Crear un nuevo correo.

**Roles:** ADMIN, BACK_OFFICE, SUPER_ADMIN

**Request Body:**
```json
{
  "sap_id": "SAP00112233",
  "telefono_contacto": "3514567890",
  "telefono_alternativo": "3517654321",
  "destinatario": "Juan Pérez",
  "persona_autorizada": "María López",
  "direccion": "Av. Colón 1234",
  "numero_casa": 1234,
  "entre_calles": "25 de Mayo y 9 de Julio",
  "barrio": "Centro",
  "localidad": "Córdoba",
  "departamento": "Córdoba",
  "codigo_postal": 5000,
  "piso": "3",
  "departamento_numero": "A"
}
```

**Nota:** `usuario_id` se obtiene automáticamente del JWT

---

### GET /correos/proximos-vencer
Obtener correos próximos a vencer.

**Roles:** ADMIN, BACK_OFFICE, SUPER_ADMIN

**Query Params:**
- `dias`: Días para vencer (default: 3)

---

### GET /correos/vencidos
Obtener correos vencidos.

**Roles:** ADMIN, BACK_OFFICE, SUPER_ADMIN

---

## 7.12 ESTADOS DE CORREO (EstadoCorreoRouter) - `/estados-correo`

### GET /estados-correo
Obtener todos los estados de correo.

**Roles:** ADMIN, BACK_OFFICE, SUPER_ADMIN, SUPERVISOR

---

### GET /estados-correo/entregados
Obtener correos entregados.

**Roles:** ADMIN, BACK_OFFICE, SUPER_ADMIN

---

### GET /estados-correo/no-entregados
Obtener correos no entregados.

**Roles:** ADMIN, BACK_OFFICE, SUPER_ADMIN

---

### GET /estados-correo/search/sap
Buscar historial completo por SAP.

**Roles:** Cualquier usuario autenticado

**Query Params:**
- `sap`: Código SAP

---

### POST /estados-correo
Crear nuevo estado de correo.

**Roles:** ADMIN, SUPER_ADMIN

---

### PATCH /estados-correo/:id/marcar-entregado
Marcar correo como entregado.

**Roles:** ADMIN, SUPER_ADMIN

---

## 7.13 PLANES (PlanRouter) - `/planes`

### GET /planes
Obtener todos los planes.

**Roles:** Cualquier usuario autenticado

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "plan_id": 1,
      "nombre": "Plan Ultra 50GB",
      "precio": 50.00,
      "llamadas": "Ilimitadas",
      "sms": "Ilimitados",
      "datos": "50GB",
      "empresa_origen_id": 5
    }
  ]
}
```

---

### GET /planes/:id
Obtener plan específico.

**Roles:** Cualquier usuario autenticado

---

### POST /planes
Crear nuevo plan.

**Roles:** ADMIN, SUPER_ADMIN

---

### PUT /planes/:id
Actualizar plan.

**Roles:** ADMIN, SUPER_ADMIN

---

### DELETE /planes/:id
Eliminar plan.

**Roles:** ADMIN, SUPER_ADMIN

---

## 7.14 PROMOCIONES (PromocionRouter) - `/promociones`

### GET /promociones
Obtener todas las promociones.

**Roles:** Cualquier usuario autenticado

---

### GET /promociones/empresa/:empresa_id
Obtener promociones por empresa.

**Roles:** Cualquier usuario autenticado

---

### GET /promociones/:id
Obtener promoción específica.

**Roles:** Cualquier usuario autenticado

---

### POST /promociones
Crear nueva promoción.

**Roles:** ADMIN, SUPER_ADMIN

---

### PUT /promociones/:id
Actualizar promoción.

**Roles:** ADMIN, SUPER_ADMIN

---

### DELETE /promociones/:id
Eliminar promoción.

**Roles:** ADMIN, SUPER_ADMIN

---

## 7.15 EMPRESAS (EmpresaRouter) - `/empresas`

### GET /empresas
Obtener todas las empresas.

**Roles:** Cualquier usuario autenticado

---

### GET /empresas/:id
Obtener empresa específica.

**Roles:** Cualquier usuario autenticado

---

### POST /empresas
Crear empresa.

**Roles:** ADMIN, SUPER_ADMIN

---

### PUT /empresas/:id
Actualizar empresa.

**Roles:** ADMIN, SUPER_ADMIN

---

### DELETE /empresas/:id
Eliminar empresa.

**Roles:** ADMIN, SUPER_ADMIN

---

## 7.16 EMPRESA ORIGEN (EmpresaOrigenRouter) - `/empresa-origen`

### GET /empresa-origen
Obtener todas las empresas origen.

**Roles:** Cualquier usuario autenticado

---

### GET /empresa-origen/:id
Obtener empresa origen específica.

**Roles:** Cualquier usuario autenticado

---

### POST /empresa-origen
Crear empresa origen.

**Roles:** ADMIN, SUPER_ADMIN

---

### PUT /empresa-origen/:id
Actualizar empresa origen.

**Roles:** ADMIN, SUPER_ADMIN

---

### DELETE /empresa-origen/:id
Eliminar empresa origen.

**Roles:** ADMIN, SUPER_ADMIN

---

## 🚀 8. INSTALACIÓN Y CONFIGURACIÓN

### 8.1 Requisitos Previos

- **Deno 2.0+** - [Instalación oficial](https://deno.land/)
- **PostgreSQL 15+** o cuenta **Supabase**
- **Git**

Verificar instalación:
```bash
deno --version  # Debe mostrar 2.0 o superior
```

---

### 8.2 Variables de Entorno (.env)

Crear archivo `.env` en la raíz del proyecto:

```bash
# ============================================
# CONFIGURACIÓN POSTGRESQL (Local)
# ============================================
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=system_back_office
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_password_seguro

# ============================================
# CONFIGURACIÓN SUPABASE (Alternativa)
# ============================================
# Descomenta estas líneas si usas Supabase
# SUPABASE_URL=https://tu-proyecto.supabase.co
# SUPABASE_KEY=tu_service_role_key

# ============================================
# SEGURIDAD JWT
# ============================================
JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro_minimo_32_caracteres

# ============================================
# CONFIGURACIÓN SERVIDOR
# ============================================
PORT=8000
MODO=development  # development | production

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=info  # debug | info | warn | error
```

---

### 8.3 Instalación Paso a Paso

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd System-Back-Office/BackEnd

# 2. Crear archivo de variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 3. Verificar conexión a PostgreSQL (opcional pero recomendado)
deno task testConection

# 4. Iniciar en modo desarrollo (con auto-reload)
deno task dev

# 5. O iniciar en modo producción
deno task start
```

---

### 8.4 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `deno task start` | Iniciar en modo producción |
| `deno task dev` | Iniciar en desarrollo (con watch) |
| `deno task testConection` | Probar conexión a PostgreSQL |
| `deno task test` | Ejecutar tests unitarios |

---

### 8.5 Verificación de Instalación

Una vez iniciado, verificar en navegador o Postman/Bruno:

```
GET http://localhost:8000/
```

**Response esperado:**
```json
{
  "message": "API System Back Office",
  "status": "running",
  "version": "1.0.0"
}
```

---

## 🧪 9. TESTING CON BRUNO

### 9.1 ¿Qué es Bruno?

Bruno es una herramienta de testing de APIs (similar a Postman) que usa archivos `.bru` planos, fáciles de versionar con Git.

### 9.2 Estructura de la Colección

```
Api/System-Back-Office/
├── bruno.json              # Configuración de la colección
├── Login.bru               # Autenticación
├── Venta/
│   ├── Venta - Create.bru
│   ├── Venta - Create Portabilidad.bru
│   ├── Venta - Get All.bru
│   └── ...
├── Cliente/
│   ├── Cliente - Get All.bru
│   ├── Cliente - Buscar por Documento.bru
│   ├── Cliente - Create.bru
│   └── ...
└── ... (12 carpetas, 50+ endpoints)
```

### 9.3 Configuración Inicial

1. **Instalar Bruno** - [https://www.usebruno.com/](https://www.usebruno.com/)

2. **Abrir la colección:**
   - Abrir carpeta `Api/System-Back-Office/`

3. **Configurar variables de entorno en Bruno:**
   ```json
   {
     "base_url": "http://localhost:8000",
     "token": "obtenido_del_login"
   }
   ```

4. **Ejecutar flujo típico:**
   - Primero: `Login.bru` (obtiene token automáticamente)
   - Luego: Cualquier otro endpoint (usa el token)

### 9.4 Ejemplo de Archivo .bru

```bru
meta {
  name: Cliente - Buscar por Documento
  type: http
  seq: 8
}

get {
  url: {{base_url}}/clientes/buscar?tipo_documento=DNI&documento=12345678
  body: none
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

docs {
  Busca un cliente por tipo y número de documento.
  Tipos: DNI, PASAPORTE, CUIT, CUIL, LC, LE
}
```

---

## 🗄️ 10. MODELO DE DATOS

### 10.1 Diagrama Entidad-Relación (Resumen)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   persona   │◄──────┤   cliente   │       │   usuario   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ persona_id  │       │ persona_id  │       │ persona_id  │
│ nombre      │       └─────────────┘       │ legajo      │
│ apellido    │                             │ rol         │
│ email       │       ┌─────────────┐       │ exa         │
│ documento   │       │  vendedor   │       │ estado      │
│ telefono    │       │ usuario_id  │       └─────────────┘
└─────────────┘       └─────────────┘              │
                                                   │
┌─────────────┐       ┌─────────────┐              │
│    venta    │◄──────┤ vendedor_id │──────────────┘
├─────────────┤       └─────────────┘
│ venta_id    │
│ tipo_venta  │       ┌─────────────┐
│ sds         │◄──────┤    plan     │
│ stl         │       ├─────────────┤
│ cliente_id  │       │ plan_id     │
│ vendedor_id │       │ nombre      │
│ plan_id     │       │ precio      │
│ promocion_id│       └─────────────┘
└─────────────┘              │
       │                     │
       │              ┌──────┴──────┐
       │              │  promocion  │
       │              ├─────────────┤
       └────────────► │ promocion_id│
                      │ plan_id     │
                      │ descuento   │
                      └─────────────┘

┌─────────────┐       ┌─────────────┐
│  portabilidad      │       │  linea_nueva │
├─────────────┤       ├─────────────┤
│ portabilidad_id    │       │ linea_nueva_id│
│ venta_id    │◄──────┤ venta_id    │
│ spn         │       │             │
│ mercado_origen     │       └─────────────┘
│ numero_porta       │
└─────────────┘

┌─────────────┐       ┌─────────────┐
│   estado    │       │   correo    │
├─────────────┤       ├─────────────┤
│ estado_id   │       │ sap_id      │
│ venta_id    │◄──────┤ venta_id    │
│ estado      │       │ destinatario│
│ descripcion │       │ direccion   │
│ usuario_id  │       │ localidad   │
└─────────────┘       └─────────────┘
```

### 10.2 Tablas Principales (15+)

| Tabla | Descripción | Clave Primaria |
|-------|-------------|----------------|
| **persona** | Datos personales básicos | persona_id (UUID) |
| **cliente** | Extensión de persona para clientes | persona_id (FK) |
| **usuario** | Usuarios del sistema (extiende persona) | persona_id (FK) |
| **password** | Contraseñas hasheadas de usuarios | password_id |
| **permisos_has_usuario** | Relación roles-usuarios | (permisos_id, persona_id) |
| **vendedor** | Vendedores (extienden usuario) | usuario_id (FK) |
| **venta** | Ventas (PORTABILIDAD o LINEA_NUEVA) | venta_id (serial) |
| **portabilidad** | Datos específicos de portabilidad | portabilidad_id |
| **linea_nueva** | Datos específicos de línea nueva | linea_nueva_id |
| **estado** | Historial de estados de ventas | estado_id |
| **correo** | Datos de envío postal | sap_id |
| **estado_correo** | Tracking de estados de correos | estado_correo_id |
| **plan** | Planes de telefonía disponibles | plan_id |
| **promocion** | Promociones vigentes | promocion_id |
| **empresa** | Empresas del sistema | empresa_id |
| **empresa_origen** | Empresas de origen para portabilidad | empresa_origen_id |

---

## 🗺️ 11. ROADMAP Y PRÓXIMAS CARACTERÍSTICAS

### 11.1 En Desarrollo (Q1 2026)

- [ ] **Reportes Avanzados** - Exportación a Excel/PDF de ventas por período
- [ ] **Dashboard en Tiempo Real** - Métricas de ventas con WebSockets
- [ ] **Notificaciones Push** - Alertas de cambios de estado vía email/SMS
- [ ] **Auditoría Completa** - Log de todas las acciones (quién, qué, cuándo)

### 11.2 Planificado (Q2 2026)

- [ ] **API de Integración** - Webhooks para sistemas externos (ERP, CRM)
- [ ] **Gestión de Stock** - Control de inventario de chips/SIMs
- [ ] **App Móvil** - Aplicación para vendedores en campo
- [ ] **Multi-empresa** - Soporte para múltiples empresas con datos aislados

### 11.3 Futuro (Q3-Q4 2026)

- [ ] **Inteligencia Artificial** - Predicción de ventas y recomendaciones
- [ ] **Blockchain** - Certificación de documentos en blockchain
- [ ] **Escalabilidad Horizontal** - Soporte para múltiples instancias
- [ ] **API GraphQL** - Alternativa flexible al REST

---

## 🤝 12. CONTRIBUCIÓN

### 12.1 Cómo Contribuir

1. **Fork** el repositorio
2. Crea una **branch** (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. **Push** a la branch (`git push origin feature/nueva-funcionalidad`)
5. Crea un **Pull Request**

### 12.2 Estándares de Código

- Usar **TypeScript** estricto
- Seguir **convention over configuration**
- Documentar funciones con JSDoc
- Mantener cobertura de tests > 80%

### 12.3 Reportar Bugs

Usar el sistema de issues de GitHub con:
- Título descriptivo
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots (si aplica)

---

## 📞 13. CONTACTO Y SOPORTE

- **Email:** soporte@system-back-office.com
- **GitHub Issues:** [github.com/tu-org/system-back-office/issues](https://github.com)
- **Documentación:** [docs.system-back-office.com](https://docs)

---

## 📝 14. LICENCIA

Este proyecto está licenciado bajo **MIT License**.

---

## 🎉 15. AGRADECIMIENTOS

Desarrollado con ❤️ por el equipo de System-Back-Office.

**Tecnologías clave que hacen posible este proyecto:**
- Deno Runtime
- PostgreSQL
- Oak Framework
- Zod Validation
- Supabase Community

---

## 📝 Changelog y Actualizaciones Recientes

### v2.0.0 - Migración PostgreSQL y Sincronización de Esquemas

#### ✅ Cambios de Base de Datos
- **Migración completa**: MySQL → PostgreSQL
- **Columna `descuento`**: Cambiado de `VARCHAR(45)` a `INTEGER` en tabla `promocion`
- **Nuevos campos agregados**:
  - `plan.fecha_duracion` (date, opcional)
  - `plan.promocion_id` (integer, FK a promocion, opcional)
  - `promocion.fecha_terminacion` (date, opcional)
  - `password.intentos_fallidos` (integer, default 0)
- **Corrección de tipos**:
  - `portabilidad.empresa_origen`: number → string
  - `portabilidad.pin`: number → string
  - `estado_correo.usuario_id`: ahora es NOT NULL (requerido)

#### ✅ Actualizaciones de Esquemas Zod
- **Roles extendidos**: Agregados `ADMIN` y `SUPERADMIN` al enum de roles (ahora 5 roles totales)
- **Corrección de nombres de campos** en `Estado.ts`:
  - `id_estado` → `estado_id`
  - `venta` → `venta_id`
  - `estado_actual` → `estado`
  - `estado_descripcion` → `descripcion`
  - `usuario_modificador` → `usuario_id`
  - Eliminado: `fecha_activacion` (no existe en DB)
- **Simplificación de esquemas**:
  - `BackOffice.ts`: Eliminado campo `supervisor` (no existe en DB), agregado `back_office_id`
  - `Vendedor.ts`: Eliminado campo `supervisor` (no existe en DB), agregado `vendedor_id`
- **Campos requeridos ajustados**:
  - `Plan.whatsapp` y `Plan.roaming`: ahora requeridos (NOT NULL en DB)
  - `EstadoCorreo.usuario_id`: ahora requerido

#### ⚠️ Esquemas Desactivados
- **`Alerta.ts`**: Esquema comentado (tabla `alerta` no existe en la base de datos)

#### 🔧 Tecnologías Actualizadas
- **PostgreSQL**: Base de datos principal (reemplaza MySQL)
- **Supabase**: Opción de hosting PostgreSQL
- **Zod 3.22.4**: Validación de esquemas mejorada

---

**¿Preguntas? Consulta la documentación completa o contacta al equipo de soporte.**

**¡Gracias por usar System-Back-Office API! 🚀**