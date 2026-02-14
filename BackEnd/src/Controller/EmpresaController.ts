// BackEnd/src/Controller/EmpresaController.ts
// ============================================
import { EmpresaService } from "../services/EmpresaService.ts";
import { EmpresaCreate, Empresa } from "../interface/Empresa.ts";
import { manejoDeError } from "../Utils/errores.ts";

export class EmpresaController {
  private empresaService: EmpresaService;

  constructor(empresaService: EmpresaService) {
    this.empresaService = empresaService;
  }

  async getAll(params: { page?: number; limit?: number; search?: string }) {
    try {
      const empresas = await this.empresaService.getAll(params);
      return empresas;
    } catch (error) {
      manejoDeError("Error obteniendo empresas", error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const empresa = await this.empresaService.getById(id);
      return empresa;
    } catch (error) {
      manejoDeError("Error obteniendo empresa", error);
      throw error;
    }
  }

  async create(input: EmpresaCreate) {
    try {
      const empresa = await this.empresaService.create(input);
      return empresa;
    } catch (error) {
      manejoDeError("Error creando empresa", error);
      throw error;
    }
  }

  async update(id: string, input: Partial<Empresa>) {
    try {
      const empresa = await this.empresaService.update(id, input);
      return empresa;
    } catch (error) {
      manejoDeError("Error actualizando empresa", error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const success = await this.empresaService.delete(id);
      return success;
    } catch (error) {
      manejoDeError("Error eliminando empresa", error);
      throw error;
    }
  }
}