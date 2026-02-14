// database/PostgreSQLTest.ts
// ============================================
// Pruebas de conexión y salud para PostgreSQL/Supabase
// ============================================

import { Pool } from "postgres-pool";
import { createClient } from "supabase";
import { logger } from "../Utils/logger.ts";

export interface PostgreSQLTestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

export interface CriticalTablesResult {
  success: boolean;
  message: string;
  details?: {
    checkedCount?: number;
    totalTables?: number;
    missingTables?: string[];
    existingTables?: string[];
  };
  timestamp: string;
}

export function createPostgreSQLTesterFromEnv() {
  return {
    /**
     * Prueba básica de conexión a PostgreSQL
     */
    async testConnection(options: { timeout?: number } = {}): Promise<PostgreSQLTestResult> {
      const timeout = options.timeout || 10000;
      
      try {
        const host = Deno.env.get("POSTGRES_HOST") || Deno.env.get("DB_HOST");
        const user = Deno.env.get("POSTGRES_USER") || Deno.env.get("DB_USER");
        const database = Deno.env.get("POSTGRES_DB") || Deno.env.get("DB_NAME") || "postgres";
        
        if (!host || !user) {
          return {
            success: false,
            message: "❌ Faltan variables de entorno para conexión PostgreSQL",
            details: { host, user },
            timestamp: new Date().toISOString()
          };
        }

        // Crear pool temporal para prueba
        const testPool = new Pool(
          {
            hostname: host,
            user: user,
            password: Deno.env.get("POSTGRES_PASSWORD") || Deno.env.get("DB_PASSWORD"),
            database: database,
            connection: {
              attempts: 1,
              interval: timeout
            }
          },
          1 // tamaño del pool
        );

        const client = await testPool.connect();
        const result = await client.queryArray`SELECT version() as version, CURRENT_TIMESTAMP as timestamp`;
        client.release();
        await testPool.end();

        return {
          success: true,
          message: "✅ Conexión PostgreSQL exitosa",
          details: { 
            host, 
            user, 
            database,
            version: result.rows[0][0],
            timestamp: result.rows[0][1]
          },
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          message: `❌ Error de conexión PostgreSQL: ${errorMessage}`,
          details: { 
            error: errorMessage,
            code: error instanceof Error && 'code' in error ? (error as any).code : "UNKNOWN"
          },
          timestamp: new Date().toISOString()
        };
      }
    },

    /**
     * Prueba de conexión a Supabase
     */
    async testSupabaseConnection(): Promise<PostgreSQLTestResult> {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        
        if (!supabaseUrl || !serviceKey) {
          return {
            success: false,
            message: "❌ Faltan variables de entorno Supabase",
            details: { 
              hasUrl: !!supabaseUrl,
              hasKey: !!serviceKey
            },
            timestamp: new Date().toISOString()
          };
        }

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false }
        });

        // Probar consulta simple
        const { data, error } = await supabase
          .from('persona')
          .select('count', { count: 'exact' })
          .single();

        if (error) {
          throw error;
        }

        return {
          success: true,
          message: "✅ Conexión Supabase exitosa",
          details: { 
            url: supabaseUrl.replace(/\/\/.*@/, '//***@'), // Ocultar credenciales
            count: data?.count || 0
          },
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          message: `❌ Error de conexión Supabase: ${errorMessage}`,
          details: { 
            error: errorMessage,
            code: error instanceof Error && 'code' in error ? (error as any).code : "UNKNOWN"
          },
          timestamp: new Date().toISOString()
        };
      }
    },

    /**
     * Prueba completa de conexión (PostgreSQL + Supabase)
     */
    async testFullConnection(options: { timeout?: number; retries?: number; retryDelay?: number } = {}): Promise<PostgreSQLTestResult> {
      const { timeout = 10000, retries = 3, retryDelay = 2000 } = options;
      
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          logger.debug(`🔄 Intento de conexión ${attempt}/${retries}`);
          
          // Probar PostgreSQL
          const pgResult = await this.testConnection({ timeout });
          if (!pgResult.success) {
            throw new Error(`PostgreSQL: ${pgResult.message}`);
          }
          
          // Probar Supabase (si está configurado)
          const supabaseUrl = Deno.env.get("SUPABASE_URL");
          if (supabaseUrl) {
            const supabaseResult = await this.testSupabaseConnection();
            if (!supabaseResult.success) {
              throw new Error(`Supabase: ${supabaseResult.message}`);
            }
          }
          
          return {
            success: true,
            message: `✅ Conexión completa exitosa (intento ${attempt}/${retries})`,
            details: {
              attempt,
              postgresql: pgResult.details,
              supabase: supabaseUrl ? await this.testSupabaseConnection().then(r => r.details) : null
            },
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          logger.warn(`⚠️  Intento ${attempt} falló: ${lastError.message}`);
          
          if (attempt < retries) {
            logger.debug(`⏳ Esperando ${retryDelay}ms antes de reintentar...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
      
      return {
        success: false,
        message: `❌ Todos los intentos de conexión fallaron (${retries} intentos)`,
        details: {
          attempts: retries,
          lastError: lastError?.message
        },
        timestamp: new Date().toISOString()
      };
    },

    /**
     * Verifica tablas críticas de la aplicación
     */
    async checkCriticalTables(tables: string[]): Promise<CriticalTablesResult> {
      try {
        const host = Deno.env.get("POSTGRES_HOST") || Deno.env.get("DB_HOST");
        
        if (!host) {
          return {
            success: false,
            message: "❌ No hay configuración de conexión PostgreSQL",
            timestamp: new Date().toISOString()
          };
        }

        const pool = new Pool(
          {
            hostname: host,
            user: Deno.env.get("POSTGRES_USER") || Deno.env.get("DB_USER"),
            password: Deno.env.get("POSTGRES_PASSWORD") || Deno.env.get("DB_PASSWORD"),
            database: Deno.env.get("POSTGRES_DB") || Deno.env.get("DB_NAME") || "postgres"
          },
          1 // tamaño del pool
        );

        const client = await pool.connect();
        
        // Consultar tablas existentes en PostgreSQL
        const result = await client.queryArray(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND table_name = ANY($1)
        `, [tables]);

        client.release();
        await pool.end();

        const existingTables = result.rows.flat() as string[];
        const missingTables = tables.filter(table => !existingTables.includes(table));

        return {
          success: missingTables.length === 0,
          message: missingTables.length === 0 
            ? "✅ Todas las tablas críticas existen"
            : `⚠️  Faltan ${missingTables.length} tablas críticas`,
          details: {
            checkedCount: tables.length,
            totalTables: existingTables.length,
            missingTables,
            existingTables
          },
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          message: `❌ Error verificando tablas críticas: ${errorMessage}`,
          timestamp: new Date().toISOString()
        };
      }
    },

    /**
     * Formatea resultados para logging
     */
    formatResult(result: PostgreSQLTestResult | CriticalTablesResult): string {
      return `[${result.timestamp}] ${result.message}`;
    },

    /**
     * Compara configuración con variables esperadas
     */
    validateEnvironment(): PostgreSQLTestResult {
      const requiredVars = [
        "POSTGRES_HOST",
        "POSTGRES_USER", 
        "POSTGRES_PASSWORD"
      ];
      
      const optionalVars = [
        "POSTGRES_DB",
        "POSTGRES_PORT",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY"
      ];

      const missing = requiredVars.filter(varName => !Deno.env.get(varName));
      const missingOptional = optionalVars.filter(varName => !Deno.env.get(varName));

      return {
        success: missing.length === 0,
        message: missing.length === 0 
          ? "✅ Variables de entorno configuradas correctamente"
          : `❌ Faltan variables requeridas: ${missing.join(", ")}`,
        details: {
          required: requiredVars.map(v => ({ [v]: !!Deno.env.get(v) })),
          optional: optionalVars.map(v => ({ [v]: !!Deno.env.get(v) })),
          missing,
          missingOptional
        },
        timestamp: new Date().toISOString()
      };
    }
  };
}