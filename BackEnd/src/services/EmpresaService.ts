// BackEnd/src/services/EmpresaService.ts
// ============================================
import { EmpresaModelDB, Empresa, EmpresaCreate } from "../interface/Empresa.ts";

export class EmpresaService {
  private modeEmpresa: EmpresaModelDB;

  constructor(modeEmpresa: EmpresaModelDB) {
    this.modeEmpresa = modeEmpresa;
  }

  async getAll(params: { page?: number; limit?: number; search?: string } = {}): Promise<Empresa[]> {
    const { page = 1, limit = 10, search } = params;
    const empresas = await this.modeEmpresa.getAll({ page, limit, name: search });
    return empresas || [];
  }

  async getById(id: string): Promise<Empresa | undefined> {
    return await this.modeEmpresa.getById({ id });
  }

  async create(input: EmpresaCreate): Promise<Empresa> {
    return await this.modeEmpresa.add({ input });
  }

  async update(id: string, input: Partial<Empresa>): Promise<Empresa | undefined> {
    return await this.modeEmpresa.update({ id, input });
  }

  async delete(id: string): Promise<boolean> {
    return await this.modeEmpresa.delete({ id });
  }
}