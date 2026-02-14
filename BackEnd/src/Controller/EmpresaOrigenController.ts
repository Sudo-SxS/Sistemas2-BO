// BackEnd/src/Controller/EmpresaOrigenController.ts
// ============================================
import { EmpresaOrigenService } from "../services/EmpresaOrigenService.ts";
import { EmpresaOrigenCreate, EmpresaOrigen } from "../interface/EmpresaOrigen.ts";
import { manejoDeError } from "../Utils/errores.ts";

export class EmpresaOrigenController {
  private empresaOrigenService: EmpresaOrigenService;

  constructor(empresaOrigenService: EmpresaOrigenService) {
    this.empresaOrigenService = empresaOrigenService;
  }

  async getAll(params: { page?: number; limit?: number; search?: string }) {
    try {
      const empresas = await this.empresaOrigenService.getAll(params);
      return empresas;
    } catch (error) {
      manejoDeError("Error obteniendo empresas origen", error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const empresa = await this.empresaOrigenService.getById(id);
      return empresa;
    } catch (error) {
      manejoDeError("Error obteniendo empresa origen", error);
      throw error;
    }
  }

  async create(input: EmpresaOrigenCreate) {
    try {
      const empresa = await this.empresaOrigenService.create(input);
      return empresa;
    } catch (error) {
      manejoDeError("Error creando empresa origen", error);
      throw error;
    }
  }

  async update(id: string, input: Partial<EmpresaOrigen>) {
    try {
      const empresa = await this.empresaOrigenService.update(id, input);
      return empresa;
    } catch (error) {
      manejoDeError("Error actualizando empresa origen", error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const success = await this.empresaOrigenService.delete(id);
      return success;
    } catch (error) {
      manejoDeError("Error eliminando empresa origen", error);
      throw error;
    }
  }
}