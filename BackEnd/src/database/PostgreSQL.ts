// src/db/PostgresClient.ts
// Sistema de conexión dual: Intenta deno-postgres primero, fallback a supabase-js

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

type ConnectionType = 'deno-postgres' | 'supabase-js' | null;

export class PostgresClient {
  private client: any = null; // deno-postgres client
  private supabase: SupabaseClient | null = null;
  private connected = false;
  private connectionType: ConnectionType = null;
  private url: string;

  constructor() {
    const url = Deno.env.get("POSTGRES_URL");
    if (!url) {
      throw new Error("POSTGRES_URL no está definida en las variables de entorno");
    }
    this.url = url;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    console.log("🔄 Iniciando conexión a base de datos...");
    console.log(`📝 URL configurada: ${this.url.substring(0, 50)}...`);

    // ============ INTENTO 1: deno-postgres (nativo) ============
    try {
      console.log("\n🔌 [INTENTO 1] Conectando con deno-postgres (biblioteca nativa Deno)...");
      
      const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
      console.log("✅ Biblioteca deno-postgres importada correctamente");
      
      // Leer certificado CA de Supabase
      const caCertPath = "./certs/prod-ca-2021.crt";
      let caCert: string | undefined;
      try {
        caCert = await Deno.readTextFile(caCertPath);
        console.log("✅ Certificado CA cargado correctamente");
      } catch (certError) {
        console.warn(`⚠️ No se pudo cargar el certificado CA desde ${caCertPath}:`);
        console.warn("⚠️ Intentando conexión sin verificación de certificado...");
      }
      
      // Parsear URL de conexión
      const url = new URL(this.url);
      const connectionConfig = {
        hostname: url.hostname,
        port: parseInt(url.port) || 5432,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.slice(1) || "postgres",
        tls: caCert ? {
          caCertificates: [caCert],
          enabled: true,
        } : undefined,
      };
      
      this.client = new Client(connectionConfig);
      console.log("⏳ Intentando conexión...");
      
      // Timeout de 10 segundos para la conexión
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout: La conexión tomó más de 10 segundos")), 10000);
      });
      
      await Promise.race([this.client.connect(), timeoutPromise]);
      
      // Verificar conexión con una query simple
      console.log("⏳ Verificando conexión con query de prueba...");
      const result = await this.client.queryArray("SELECT version()");
      console.log("📊 Versión PostgreSQL:", result.rows[0][0]);
      
      this.connectionType = 'deno-postgres';
      this.connected = true;
      console.log("✅ [ÉXITO] Conectado con deno-postgres (nativo)\n");
      
    } catch (error1) {
      console.error("\n❌ [FALLO 1] deno-postgres no pudo conectar:");
      console.error("   Error:", (error1 as Error).message);
      console.error("   Stack:", (error1 as Error).stack);
      
      // Delay de 2 segundos antes de intentar fallback
      console.log("\n⏳ Esperando 2 segundos antes de intentar fallback...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // ============ INTENTO 2: supabase-js (fallback) ============
      try {
        console.log("\n🔌 [INTENTO 2] Conectando con supabase-js (cliente oficial Supabase)...");
        
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        
        if (!supabaseUrl) {
          throw new Error("SUPABASE_URL no está definida - Se requiere para fallback");
        }
        
        if (!supabaseKey) {
          throw new Error("SUPABASE_SERVICE_ROLE_KEY no está definida - Se requiere para fallback");
        }

        console.log(`📝 URL Supabase: ${supabaseUrl}`);
        console.log(`🔑 Service Role Key: ${supabaseKey.substring(0, 20)}...`);
        
        const { createClient } = await import("jsr:@supabase/supabase-js@2");
        console.log("✅ Biblioteca supabase-js importada correctamente");
        
        this.supabase = createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        
        // Verificar conexión
        console.log("⏳ Verificando conexión con query de prueba...");
        const { error } = await this.supabase.from('empresa').select('id_empresa').limit(1);
        
        if (error) {
          console.error("❌ Error en query de verificación:", error.message);
          throw new Error(`Error de conexión Supabase: ${error.message}`);
        }
        
        this.connectionType = 'supabase-js';
        this.connected = true;
        console.log("✅ [ÉXITO] Conectado con supabase-js (fallback)\n");
        
      } catch (error2) {
        console.error("\n❌ [FALLO 2] supabase-js también falló:");
        console.error("   Error:", (error2 as Error).message);
        console.error("   Stack:", (error2 as Error).stack);
        
        throw new Error(
          `No se pudo conectar a la base de datos.\n\n` +
          `Intento 1 (deno-postgres): ${(error1 as Error).message}\n` +
          `Intento 2 (supabase-js): ${(error2 as Error).message}\n\n` +
          `Verifica que:\n` +
          `1. POSTGRES_URL esté correctamente configurada para deno-postgres\n` +
          `2. SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén configuradas para fallback\n` +
          `3. Las credenciales sean válidas y el servidor esté accesible`
        );
      }
    }
  }

  // Ejecutar query (compatible con ambos drivers)
  async query(sql: string, params?: any[]): Promise<any[]> {
    if (!this.connected) {
      throw new Error("Cliente no conectado. Llama a connect() primero.");
    }

    try {
      if (this.connectionType === 'deno-postgres' && this.client) {
        // Usar deno-postgres (más completo)
        const result = params 
          ? await this.client.queryArray(sql, ...params)
          : await this.client.queryArray(sql);
        return result.rows;
        
      } else if (this.connectionType === 'supabase-js' && this.supabase) {
        // Usar supabase-js (más limitado)
        // Para queries simples, usar RPC si está disponible
        const { data, error } = await this.supabase.rpc('exec_sql', { 
          query: sql,
          params: params || []
        });
        
        if (error) {
          throw new Error(`Error en query Supabase: ${error.message}`);
        }
        
        return data || [];
      }
      
      throw new Error("Tipo de conexión desconocido");
      
    } catch (error) {
      console.error("❌ Error ejecutando query:", (error as Error).message);
      throw error;
    }
  }

  // Obtener cliente nativo (para operaciones avanzadas)
  getNativeClient(): any {
    if (!this.connected) {
      throw new Error("Cliente no conectado");
    }
    return this.connectionType === 'deno-postgres' ? this.client : null;
  }

  // Obtener cliente Supabase
  getSupabaseClient(): SupabaseClient | null {
    if (!this.connected) {
      throw new Error("Cliente no conectado");
    }
    return this.supabase;
  }

  // Obtener cliente activo (compatible con código existente)
  getClient(): any {
    if (!this.connected) {
      throw new Error("Cliente no conectado. Llama a connect() primero.");
    }
    
    if (this.connectionType === 'deno-postgres' && this.client) {
      return this.client;
    } else if (this.connectionType === 'supabase-js' && this.supabase) {
      // Retornar wrapper que implementa interfaz de deno-postgres usando supabase-js
      return this.createSupabaseWrapper();
    }
    
    throw new Error("No hay cliente activo");
  }

  // Wrapper que implementa interfaz de deno-postgres para supabase-js
  private createSupabaseWrapper(): any {
    const supabase = this.supabase!;
    
    return {
      // queryObject - método principal usado por controllers
      queryObject: async (sql: string, params?: any[]) => {
        try {
          // Ejecutar via Supabase RPC si está disponible
          const { data, error } = await supabase.rpc('exec_sql', { 
            query: sql,
            params: params || []
          });
          
          if (error) {
            // Si RPC no existe o falla, loguear pero devolver estructura compatible
            console.warn("⚠️ RPC exec_sql no disponible, usando REST API de Supabase");
            
            // Para queries de SELECT simples, intentar usar from().select()
            // Nota: Esto es limitado, solo funciona para queries simples
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
              // Parsear tabla y columnas (simplificado)
              const match = sql.match(/FROM\s+(\w+)/i);
              if (match) {
                const table = match[1];
                const { data: restData, error: restError } = await supabase
                  .from(table)
                  .select('*')
                  .limit(100);
                
                if (restError) {
                  throw new Error(`Error en query REST: ${restError.message}`);
                }
                
                return { rows: restData || [] };
              }
            }
            
            throw new Error(`Error en query Supabase: ${error.message}`);
          }
          
          return { rows: data || [] };
          
        } catch (error) {
          console.error("❌ Error en queryObject wrapper:", (error as Error).message);
          throw error;
        }
      },
      
      // queryArray - también usado por algunos controllers
      queryArray: async (sql: string, params?: any[]) => {
        return this.query(sql, params);
      },
      
      // end - método de cierre (no-op para supabase-js)
      end: async () => {
        console.log("🔌 Cierre de conexión Supabase (no requiere acción)");
      }
    };
  }

  // Ver tipo de conexión activa
  getConnectionType(): ConnectionType {
    return this.connectionType;
  }

  // Verificar si está conectado
  isConnected(): boolean {
    return this.connected;
  }

  async close(): Promise<void> {
    if (!this.connected) return;
    
    try {
      if (this.connectionType === 'deno-postgres' && this.client) {
        await this.client.end();
      }
      // supabase-js no requiere cierre explícito
      
      this.connected = false;
      this.connectionType = null;
      console.log(`🔌 Conexión cerrada (usaba ${this.connectionType})`);
    } catch (error) {
      console.error("❌ Error cerrando conexión:", (error as Error).message);
    }
  }
}

// Exportar singleton
let postgresClientInstance: PostgresClient | null = null;

export function getPostgresClient(): PostgresClient {
  if (!postgresClientInstance) {
    postgresClientInstance = new PostgresClient();
  }
  return postgresClientInstance;
}
