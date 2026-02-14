// BackEnd/src/router/EmpresaRouter.ts
// Router no implementado - los modelos MySQL no existen y no está conectado en main.ts
// TODO: Implementar con PostgreSQL si se necesita

import { Router } from "oak";
import { UserModelDB } from "../interface/Usuario.ts";

export function empresaRouter(_userModel: UserModelDB) {
  const router = new Router();
  // Este router no está implementado ya que:
  // 1. Los modelos MySQL (empresaMySQL.ts) no existen
  // 2. No está conectado en main.ts
  // 3. Solo existe empresaOrigenPostgreSQL para empresas de origen
  return router;
}
