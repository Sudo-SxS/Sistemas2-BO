import { Application } from "oak";
import routerCVS from "../router/pruevas.ts";
const app = new Application();
app.use(routerCVS.routes());
app.use(routerCVS.allowedMethods());

const port = parseInt(Deno.env.get("PORT") || "8000");
console.log("✅ Servidor iniciado exitosamente");
await app.listen({ port });
