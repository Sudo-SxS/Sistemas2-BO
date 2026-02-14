import { load } from "dotenv";
import { PostgresClient } from "../database/PostgreSQL.ts";
import { ComentarioPostgreSQL } from "../model/ComentarioPostgreSQL.ts";

async function testComentarios() {
  console.log("🚀 Cargando variables de entorno...");
  try {
    // Intentamos cargar el .env desde la raíz del proyecto
    await load({ export: true });
    
    if (!Deno.env.get("POSTGRES_URL")) {
      console.error("❌ Error: POSTGRES_URL no está definida en el .env");
      return;
    }
  } catch (error) {
    console.warn("⚠️ Advertencia al cargar .env:", error instanceof Error ? error.message : error);
  }
  
  const connection = new PostgresClient();
  
  console.log("🚀 Intentando conectar a la base de datos...");
  try {
    await connection.connect();
    const model = new ComentarioPostgreSQL(connection);

    // 1. Probar getAll
    console.log("\n--- Probando getAll() ---");
    const result = await model.getAll({ page: 1, limit: 5 });
    console.log("✅ Resultado obtenido:");
    console.log(`   - Registros devueltos: ${result.length}`);
    
    if (result.length > 0) {
      console.log("   - Primer comentario id:", result[0].comentario_id);
      
      // 2. Probar getByVentaId (si hay datos)
      const venta_id = result[0].venta_id;
      console.log(`\n--- Probando getByVentaId(${venta_id}) ---`);
      const ventaResult = await model.getByVentaId({ venta_id });
      console.log("✅ Resultado obtenido:");
      console.log(`   - Registros devueltos: ${ventaResult.length}`);
    } else {
      console.log("ℹ️ No hay comentarios en la tabla para probar filtros.");
    }

    console.log("\n✨ Pruebas finalizadas con éxito.");
  } catch (error) {
    console.error("❌ Error durante las pruebas:");
    console.error(error);
  } finally {
    try {
      await connection.close();
    } catch {}
    Deno.exit(0);
  }
}

testComentarios();
