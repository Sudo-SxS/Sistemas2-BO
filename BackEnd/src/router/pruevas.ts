import { Context, Router } from "oak";
import { logger } from "../Utils/logger.ts";
import { parseUploadedFile } from "../Utils/Csv.ts";

type ContextWithParams = Context & { params: Record<string, string> };

const routerCVS = new Router();

routerCVS.post("/upload", async (ctx) => {
  try {
    // Forma correcta de obtener FormData en Oak
    const body = ctx.request.body.formData();
    const formData = await body;

    // Opción 1: Obtener el primer archivo del formulario
    let file: File | null = null;

    for (const [key, value] of formData) {
      if (key === "file" && value instanceof File) {
        file = value;
        break; // Tomar el primer archivo encontrado
      }
    }

    // Opción 2: Si conoces el nombre del campo (por ejemplo "file")
    // const file = formData.get("file") as File;

    if (!file) {
      ctx.response.status = 400;
      ctx.response.body = { error: "No se envió ningún archivo" };
      return;
    }

    // Verificar tamaño del archivo (10 MB = 10,000,000 bytes)
    if (file.size > 10_000_000) {
      ctx.response.status = 413;
      ctx.response.body = {
        error: "El archivo es demasiado grande (máximo 10MB)",
      };
      return;
    }

    // Procesar el archivo con tu función existente
    const parsedData = await parseUploadedFile(file);

    ctx.response.body = {
      message: "Archivo procesado correctamente",
      data: parsedData,
    };
  } catch (err) {
    logger.error("Error procesando archivo:", err);
    ctx.response.status = 400;
    ctx.response.body = { error: err || "Error procesando el archivo" };
  }
});
export async function parseCsv(file: File) {
  const text = await file.text();
  const rows = text.trim().split("\n").map((r) => r.split(","));

  const headers = rows.shift()!.map((h) => h.trim()); // primera fila
  const result = rows.map((row) => {
    const obj: Record<string, string> = {};
    row.forEach((value, i) => {
      obj[headers[i]] = value.trim();
    });
    return obj;
  });

  return result;
}

export default routerCVS;
