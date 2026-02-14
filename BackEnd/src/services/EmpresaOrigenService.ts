// BackEnd/src/services/EmpresaOrigenService.ts
import { EmpresaOrigenModelDB, EmpresaOrigen, EmpresaOrigenCreate } from "../interface/EmpresaOrigen.ts";

export class EmpresaOrigenService {
  private modeEmpresaOrigen: EmpresaOrigenModelDB;

  constructor(modeEmpresaOrigen: EmpresaOrigenModelDB) {
    this.modeEmpresaOrigen = modeEmpresaOrigen;
  }

  async getAll(params: { page?: number; limit?: number; search?: string } = {}): Promise<EmpresaOrigen[]> {
    const { page = 1, limit = 10 } = params;
    const empresas = await this.modeEmpresaOrigen.getAll({ page, limit });
    return empresas || [];
  }

  async getById(id: string): Promise<EmpresaOrigen | undefined> {
    return await this.modeEmpresaOrigen.getById({ id });
  }

  async create(input: EmpresaOrigenCreate): Promise<EmpresaOrigen> {
    return await this.modeEmpresaOrigen.add({ input });
  }

  async update(id: string, input: Partial<EmpresaOrigen>): Promise<EmpresaOrigen | undefined> {
    return await this.modeEmpresaOrigen.update({ id, input });
  }

  async delete(id: string): Promise<boolean> {
    return await this.modeEmpresaOrigen.delete({ id });
  }
}