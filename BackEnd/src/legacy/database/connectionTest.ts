/**
 * Módulo específico para pruebas de conexión con MySQL
 * Utiliza las utilidades genéricas para implementar pruebas específicas
 * de base de datos MySQL para el proyecto System Back-Office
 */

import { Client } from "mysql";
import { 
  ConnectionTestResult, 
  ConnectionTestOptions, 
  testTcpConnection, 
  retryWithBackoff,
  formatConnectionTestResult,
  identifyErrorType
} from "../../Utils/connectionTester.ts";
import { logger } from "../../Utils/logger.ts";

export interface MySQLConnectionConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface MySQLTestResult extends ConnectionTestResult {
  databaseInfo?: {
    version: string;
    currentDatabase: string;
    tablesCount: number;
  };
  connectionConfig?: {
    host: string;
    port: number;
    username: string;
    database: string;
  };
}

export class MySQLConnectionTester {
  private config: MySQLConnectionConfig;

  constructor(config: MySQLConnectionConfig) {
    this.config = config;
  }

  /**
   * Realiza una prueba completa de conexión a MySQL
   * Incluye pruebas de red, autenticación y acceso a base de datos
   */
  async testFullConnection(options: ConnectionTestOptions = {}): Promise<MySQLTestResult> {
    const startTime = Date.now();
    const { 
      retries = 3, 
      timeout = 10000, 
      verbose = false,
      retryDelay = 2000 
    } = options;

    logger.info("🔍 Iniciando prueba completa de conexión a MySQL...");
    
    try {
      // Paso 1: Probar conectividad de red
      const networkResult = await this.testNetworkConnection({ timeout, verbose });
      if (!networkResult.success) {
        return {
          ...networkResult,
          connectionConfig: this.getConfigSummary()
        };
      }

      // Paso 2: Probar conexión y autenticación con retries
      const authResult = await retryWithBackoff(
        () => this.testAuthentication({ timeout, verbose }),
        { retries, retryDelay, verbose }
      );

      if (!authResult.success) {
        return {
          ...authResult,
          connectionConfig: this.getConfigSummary()
        };
      }

      // Paso 3: Probar acceso a base de datos y consulta simple
      const dbResult = await this.testDatabaseAccess({ timeout, verbose });
      
      const duration = Date.now() - startTime;
      
      if (dbResult.success) {
        logger.info("✅ Prueba de conexión a MySQL completada exitosamente");
        return {
          success: true,
          message: "Conexión a MySQL completamente verificada",
          duration,
          timestamp: new Date().toISOString(),
          databaseInfo: dbResult.details as any,
          connectionConfig: this.getConfigSummary()
        };
      } else {
        return {
          ...dbResult,
          duration,
          connectionConfig: this.getConfigSummary()
        };
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        message: `Error crítico en prueba de conexión: ${errorMessage}`,
        error: error as Error,
        duration,
        timestamp: new Date().toISOString(),
        connectionConfig: this.getConfigSummary()
      };
    }
  }

  /**
   * Prueba la conectividad de red al servidor MySQL
   */
  private async testNetworkConnection(options: ConnectionTestOptions): Promise<ConnectionTestResult> {
    logger.info(`🌐 Probando conectividad de red a ${this.config.host}:${this.config.port}`);
    
    const result = await testTcpConnection(this.config.host, this.config.port, options);
    
    if (result.success) {
      logger.info(`✅ Conexión de red exitosa`);
    } else {
      logger.error(`❌ Error de conectividad: ${result.message}`);
    }
    
    return result;
  }

  /**
   * Prueba la autenticación con el servidor MySQL
   */
  private async testAuthentication(options: ConnectionTestOptions): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    const { timeout = 5000, verbose = false } = options;

    try {
      if (verbose) {
        logger.info(`🔐 Probando autenticación como '${this.config.username}'`);
      }

      const client = new Client();
      
      await client.connect({
        hostname: this.config.host,
        username: this.config.username,
        password: this.config.password,
        port: this.config.port,
        timeout: timeout,
      });

      // Si llegamos aquí, la autenticación fue exitosa
      await client.close();
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        message: `Autenticación exitosa como '${this.config.username}'`,
        duration,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorType = identifyErrorType(error);
      
      return {
        success: false,
        message: `Error de autenticación: ${errorMessage}`,
        error: error as Error,
        duration,
        timestamp: new Date().toISOString(),
        details: { errorType }
      };
    }
  }

  /**
   * Prueba el acceso a la base de datos específica y ejecuta consultas de prueba
   */
  private async testDatabaseAccess(options: ConnectionTestOptions): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    const { timeout = 5000, verbose = false } = options;

    try {
      if (verbose) {
        logger.info(`🗄️  Probando acceso a base de datos '${this.config.database}'`);
      }

      const client = new Client();
      
      await client.connect({
        hostname: this.config.host,
        username: this.config.username,
        password: this.config.password,
        db: this.config.database,
        port: this.config.port,
        timeout: timeout,
      });

      // Consulta 1: Verificar versión de MySQL
      const versionResult = await client.query("SELECT VERSION() as version");
      const version = versionResult[0]?.version || "Desconocida";

      // Consulta 2: Verificar base de datos actual
      const dbResult = await client.query("SELECT DATABASE() as current_db");
      const currentDb = dbResult[0]?.current_db;

      // Consulta 3: Contar tablas en la base de datos
      const tablesResult = await client.query("SHOW TABLES");
      const tablesCount = Array.isArray(tablesResult) ? tablesResult.length : 0;

      // Consulta 4: Prueba simple de lectura/escritura
      await client.query("SELECT 1 as test_value");

      await client.close();

      const duration = Date.now() - startTime;

      return {
        success: true,
        message: `Acceso a base de datos verificado (MySQL ${version}, ${tablesCount} tablas)`,
        duration,
        timestamp: new Date().toISOString(),
        details: {
          version,
          currentDatabase: currentDb,
          tablesCount
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorType = identifyErrorType(error);
      
      return {
        success: false,
        message: `Error de acceso a base de datos: ${errorMessage}`,
        error: error as Error,
        duration,
        timestamp: new Date().toISOString(),
        details: { errorType }
      };
    }
  }

  /**
   * Verifica la existencia de tablas críticas para la aplicación
   */
  async checkCriticalTables(criticalTables: string[]): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      const client = new Client();
      
      await client.connect({
        hostname: this.config.host,
        username: this.config.username,
        password: this.config.password,
        db: this.config.database,
        port: this.config.port,
        timeout: 10000,
      });

      const existingTables: string[] = [];
      const missingTables: string[] = [];

      for (const table of criticalTables) {
        try {
          const result = await client.query(`SHOW TABLES LIKE '${table}'`);
          if (result && result.length > 0) {
            existingTables.push(table);
          } else {
            missingTables.push(table);
          }
        } catch (error) {
          missingTables.push(table);
        }
      }

      await client.close();

      const duration = Date.now() - startTime;
      const allExist = missingTables.length === 0;

      return {
        success: allExist,
        message: allExist 
          ? `Todas las tablas críticas existen (${existingTables.length}/${criticalTables.length})`
          : `Faltan tablas críticas: ${missingTables.join(", ")}`,
        duration,
        timestamp: new Date().toISOString(),
        details: {
          criticalTables,
          existingTables,
          missingTables,
          checkedCount: criticalTables.length
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        message: `Error verificando tablas críticas: ${errorMessage}`,
        error: error as Error,
        duration,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene un resumen de la configuración (sin incluir contraseña)
   */
  private getConfigSummary() {
    return {
      host: this.config.host,
      port: this.config.port,
      username: this.config.username,
      database: this.config.database,
      password: "***" // Ocultar contraseña en logs
    };
  }

  /**
   * Formatea el resultado completo para logging
   */
  formatResult(result: MySQLTestResult): string {
    let output = formatConnectionTestResult(result);
    
    if (result.success && result.databaseInfo) {
      const { version, currentDatabase, tablesCount } = result.databaseInfo;
      output += `\n📊 MySQL ${version} | BD: ${currentDatabase} | Tablas: ${tablesCount}`;
    }
    
    if (result.connectionConfig) {
      const { host, port, username, database } = result.connectionConfig;
      output += `\n🔗 Servidor: ${username}@${host}:${port}/${database}`;
    }
    
    return output;
  }
}

/**
 * Función de conveniencia para crear un tester a partir de variables de entorno
 */
export function createMySQLTesterFromEnv(): MySQLConnectionTester {
  const host = Deno.env.get("MYSQL_ADDON_HOST") || Deno.env.get("DB_HOST");
  const port = Number(Deno.env.get("MYSQL_ADDON_PORT") || Deno.env.get("DB_PORT") || 3306);
  const username = Deno.env.get("MYSQL_ADDON_USER") || Deno.env.get("DB_USER");
  const password = Deno.env.get("MYSQL_ADDON_PASSWORD") || Deno.env.get("DB_PASSWORD");
  const database = Deno.env.get("MYSQL_ADDON_DB") || Deno.env.get("DB_NAME");

  if (!host || !username || !password || !database) {
    throw new Error("❌ Faltan variables de entorno para la conexión a MySQL");
  }

  return new MySQLConnectionTester({
    host,
    port,
    username,
    password,
    database
  });
}