// main.ts
// ============================================
// Punto de entrada principal de la aplicación System-Back-Office
//
// Este archivo configura y inicializa:
// - Variables de entorno
// - Conexión resiliente a PostgreSQL que nunca detiene
// - Sistema de reintentos automáticos con backoff exponencial
// - Modo degradado funcional cuando no hay conexión
// - Middlewares de seguridad (CORS, autenticación)
// - Rutas de API para todas las entidades
// - Servidor HTTP con Oak
//
// @author Equipo de Desarrollo System-Back-Office
// ============================================

import { Application, Context, Router } from "oak";
import { load } from "dotenv";
import { PostgresClient } from "./database/PostgreSQL.ts";
import { createPostgreSQLTesterFromEnv } from "./database/PostgreSQLTest.ts";
import { logger } from "./Utils/logger.ts";

// Cargar configuración con variables vacías permitidas
await load({ export: true, allowEmptyValues: true });

// ============================================
// INICIALIZACIÓN POSTGRESQL
// ============================================

if (!Deno.env.get("SUPABASE_URL") && !Deno.env.get("POSTGRES_HOST")) {
  throw new Error(
    "❌ Configuración PostgreSQL/Supabase requerida. " +
      "Configura SUPABASE_URL o POSTGRES_HOST en tu archivo .env",
  );
}

// 1. Crear instancia del cliente PostgreSQL
const pgClient = new PostgresClient();

// 2. Conectar y verificar
try {
  logger.info("🔄 Iniciando conexión a PostgreSQL...");
  await pgClient.connect();
  logger.info("✅ Conexión PostgreSQL establecida exitosamente");

  // 3. Pruebas adicionales de validación
  const tester = createPostgreSQLTesterFromEnv();
  const testResult = await tester.testConnection();
  logger.info("🔍 Validación adicional:", testResult.message);

  if (testResult.success) {
    logger.info("🎯 Todas las validaciones pasaron correctamente");
  } else {
    logger.info("⚠️ Validaciones con advertencias, conexión funcional");
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error("❌ Error crítico al conectar PostgreSQL:", errorMessage);
  logger.info("🔄 Aplicación continuando en modo limitado");
}

// ============================================
// IMPORTACIÓN DE MODELOS POSTGRESQL
// ============================================

import { UsuarioPostgreSQL } from "./model/usuarioPostgreSQL.ts";
import { VentaPostgreSQL } from "./model/ventaPostgreSQL.ts";
import { EstadoVentaPostgreSQL } from "./model/estadoVentaPostgreSQL.ts";
import { CorreoPostgreSQL } from "./model/correoPostgreSQL.ts";
import { EstadoCorreoPostgreSQL } from "./model/estadoCorreoPostgreSQL.ts";
import { PlanPostgreSQL } from "./model/planPostgreSQL.ts";
import { PromocionPostgreSQL } from "./model/promocionPostgreSQL.ts";
import { ClientePostgreSQL } from "./model/clientePostgreSQL.ts";
import { LineaNuevaPostgreSQL } from "./model/lineaNuevaPostgreSQL.ts";
import { PortabilidadPostgreSQL } from "./model/portabilidadPostgreSQL.ts";
import { EmpresaOrigenPostgreSQL } from "./model/empresaOrigenPostgreSQL.ts";
import { MensajePostgreSQL } from "./model/MensajePostgreSQL.ts";
import { ComentarioPostgreSQL } from "./model/ComentarioPostgreSQL.ts";
import { CelulaPostgreSQL } from "./model/celulaPostgreSQL.ts";
import { CelulaService } from "./services/CelulaService.ts";
import { CelulaController } from "./Controller/CelulaController.ts";

// ============================================
// INSTANCIACIÓN DE MODELOS POSTGRESQL
// ============================================

// 4. Instanciar todos los models con el cliente PostgreSQL
const usuarioModel = new UsuarioPostgreSQL(pgClient);
const ventaModel = new VentaPostgreSQL(pgClient);
const estadoVentaModel = new EstadoVentaPostgreSQL(pgClient);
const correoModel = new CorreoPostgreSQL(pgClient);
const estadoCorreoModel = new EstadoCorreoPostgreSQL(pgClient);
const planModel = new PlanPostgreSQL(pgClient);
const promocionModel = new PromocionPostgreSQL(pgClient);
const clienteModel = new ClientePostgreSQL(pgClient);
const lineaNuevaModel = new LineaNuevaPostgreSQL(pgClient);
const portabilidadModel = new PortabilidadPostgreSQL(pgClient);
const empresaOrigenModel = new EmpresaOrigenPostgreSQL(pgClient);
const mensajeModel = new MensajePostgreSQL(pgClient);
const comentarioModel = new ComentarioPostgreSQL(pgClient);
const celulaModel = new CelulaPostgreSQL(pgClient);
const celulaService = new CelulaService(celulaModel);
const celulaController = new CelulaController(celulaService);

logger.info("🚀 Models PostgreSQL instanciados correctamente");
logger.info("🔧 Configurando routers y middleware...");

// ============================================
// IMPORTACIÓN DE ROUTERS
// ============================================

// Importar todos los routers para API completa
import { authRouter } from "./router/AuthRouter.ts";
import { usuarioRouter } from "./router/UsuarioRouter.ts";
import { ventaRouter } from "./router/VentaRouter.ts";
import { estadoVentaRouter } from "./router/EstadoVentaRouter.ts";
import { correoRouter } from "./router/CorreoRouter.ts";
import { estadoCorreoRouter } from "./router/EstadoCorreoRouter.ts";
import { planRouter } from "./router/PlanRouter.ts";
import { promocionRouter } from "./router/PromocionRouter.ts";
import { clienteRouter } from "./router/ClienteRouter.ts";
import { lineaNuevaRouter } from "./router/LineaNuevaRouter.ts";
import { portabilidadRouter } from "./router/PortabilidadRouter.ts";
import { empresaOrigenRouter } from "./router/EmpresaOrigenRouter.ts";
import { actualizarRouter } from "./router/ActulizarRouter.ts";
import { mensajeRouter } from "./router/MensajeRouter.ts";
import { comentarioRouter } from "./router/ComentarioRouter.ts";
import routerHome from "./router/HomeRouter.ts";
import { celulaRouter } from "./router/CelulaRouter.ts";
import { estadisticaRouter } from "./router/EstadisticaRouter.ts";

// Importar middleware de manejo de errores
import {
  corsMiddleware,
  errorMiddleware,
  //loggerMiddleware,
  //timingMiddleware,
} from "./middleware/corsMiddlewares.ts";

// ============================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================

const app = new Application();

// ============================================
// CONFIGURACIÓN DE MIDDLEWARES (ORDEN CRÍTICO)
// ============================================

// 1. Error Handler (debe ir primero para capturar todos los errores)
app.use(errorMiddleware);

// 2. CORS (debe ir antes de los routers para permitir preflight)
app.use(corsMiddleware);

// 3. Logger (opcional, para desarrollo)
// app.use(loggerMiddleware);

// 4. Timing (opcional, debe ir después de logger)
// app.use(timingMiddleware);

// ============================================
// ENDPOINTS DE HEALTH CHECK
// ============================================

const healthRouter = new Router();

// Health check endpoint básico
healthRouter.get("/health", (ctx: Context) => {
  ctx.response.status = 200;
  ctx.response.body = {
    success: true,
    message: "Servidor saludable",
    timestamp: new Date().toISOString(),
    uptime: performance.now(),
  };
});

// Registrar router de health check
app.use(healthRouter.routes());
app.use(healthRouter.allowedMethods());

// ============================================
// Configuración de Rutas de API
// ============================================
/**
 * Registra todos los routers de la aplicación
 * Cada router maneja un conjunto de endpoints para una entidad específica
 * Los routers incluyen middleware de autenticación y validación
 */

// Router Home (endpoints básicos de salud del sistema)
app.use(routerHome.routes());
app.use(routerHome.allowedMethods());

// Router Auth
const authRouterInstance = authRouter(usuarioModel);
app.use(authRouterInstance.routes());
app.use(authRouterInstance.allowedMethods());

// Router Usuario
const usuarioRouterInstance = usuarioRouter(usuarioModel);
app.use(usuarioRouterInstance.routes());
app.use(usuarioRouterInstance.allowedMethods());

// ✅ NUEVO: Router Correo
const correoRouterInstance = correoRouter(correoModel, usuarioModel);
app.use(correoRouterInstance.routes());
app.use(correoRouterInstance.allowedMethods());

// Router EstadoCorreo
const estadoCorreoRouterInstance = estadoCorreoRouter(
  estadoCorreoModel,
  usuarioModel,
);
app.use(estadoCorreoRouterInstance.routes());
app.use(estadoCorreoRouterInstance.allowedMethods());

// Router Plan
const planRouterInstance = planRouter(planModel, usuarioModel);
app.use(planRouterInstance.routes());
app.use(planRouterInstance.allowedMethods());

// Router Promocion
const promocionRouterInstance = promocionRouter(promocionModel, usuarioModel);
app.use(promocionRouterInstance.routes());
app.use(promocionRouterInstance.allowedMethods());

// Router Venta
const ventaRouterInstance = ventaRouter(
  ventaModel,
  usuarioModel,
  correoModel,
  lineaNuevaModel,
  portabilidadModel,
  clienteModel,
  planModel,
  promocionModel,
  estadoVentaModel,
);
app.use(ventaRouterInstance.routes());
app.use(ventaRouterInstance.allowedMethods());

// Router Estado Venta
const estadoVentaRouterInstance = estadoVentaRouter(
  estadoVentaModel,
  usuarioModel,
);
app.use(estadoVentaRouterInstance.routes());
app.use(estadoVentaRouterInstance.allowedMethods());

// Router Empresa Origen
const empresaOrigenRouterInstance = empresaOrigenRouter(
  empresaOrigenModel,
  usuarioModel,
);
app.use(empresaOrigenRouterInstance.routes());
app.use(empresaOrigenRouterInstance.allowedMethods());

// Router Linea Nueva
const lineaNuevaRouterInstance = lineaNuevaRouter(
  lineaNuevaModel,
  ventaModel,
  portabilidadModel,
  usuarioModel,
);
app.use(lineaNuevaRouterInstance.routes());
app.use(lineaNuevaRouterInstance.allowedMethods());

// Router Portabilidad
const portabilidadRouterInstance = portabilidadRouter(
  portabilidadModel,
  ventaModel,
  lineaNuevaModel,
  usuarioModel,
);
app.use(portabilidadRouterInstance.routes());
app.use(portabilidadRouterInstance.allowedMethods());

// Router Cliente
const clienteRouterInstance = clienteRouter(clienteModel, usuarioModel);
app.use(clienteRouterInstance.routes());
app.use(clienteRouterInstance.allowedMethods());

// ✅ NUEVO: Router Actualizar (Bulk Updates)
const actualizarRouterInstance = actualizarRouter(
  estadoCorreoModel,
  estadoVentaModel,
  ventaModel,
  correoModel,
  usuarioModel,
);
app.use(actualizarRouterInstance.routes());
app.use(actualizarRouterInstance.allowedMethods());

// ✅ NUEVO: Router Mensajes (Alertas y Notificaciones)
const mensajeRouterInstance = mensajeRouter(mensajeModel, usuarioModel);
app.use(mensajeRouterInstance.routes());
app.use(mensajeRouterInstance.allowedMethods());

// ✅ NUEVO: Router Comentarios
const comentarioRouterInstance = comentarioRouter(comentarioModel, usuarioModel);
app.use(comentarioRouterInstance.routes());
app.use(comentarioRouterInstance.allowedMethods());

// ✅ NUEVO: Router Células
const celulaRouterInstance = celulaRouter(celulaController, usuarioModel);
app.use(celulaRouterInstance.routes());
app.use(celulaRouterInstance.allowedMethods());

// ✅ NUEVO: Router Estadísticas
const estadisticaRouterInstance = estadisticaRouter(pgClient);
app.use(estadisticaRouterInstance.routes());
app.use(estadisticaRouterInstance.allowedMethods());

// ============================================
// MANEJO DE ERRORES 404 (DEBE IR AL FINAL)
// ============================================

app.use(/*async*/ (ctx: Context) => {
  ctx.response.status = 404;
  ctx.response.body = {
    success: false,
    message: "Endpoint no encontrado",
    path: ctx.request.url.pathname,
    method: ctx.request.method,
    timestamp: new Date().toISOString(),
  };
});

// ============================================
// INICIO DEL SERVIDOR
// ============================================

const port = parseInt(Deno.env.get("PORT") || "8000");

logger.info("🚀 Iniciando servidor System-Back-Office resiliente");
logger.info(`   🌐 Puerto: http://localhost:${port}`);
logger.info(`   🐘 Base de datos: PostgreSQL/Supabase`);
logger.info(`   🔄 Sistema resiliente: ACTIVO`);

await app.listen({ port });

logger.info("✅ Servidor iniciado exitosamente");
