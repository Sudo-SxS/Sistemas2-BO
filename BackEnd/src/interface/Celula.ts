// interface/Celula.ts

export interface Celula {
  id_celula: number;
  empresa: number;
  nombre: string;
  tipo_cuenta: string;
}

export interface CelulaCreate {
  id_celula: number;
  empresa: number;
  nombre: string;
  tipo_cuenta: string;
}

export interface CelulaModelDB {
  connection: any;
  
  // Métodos CRUD básicos
  add(params: { input: CelulaCreate }): Promise<Celula>;
  getAll(params?: { page?: number; limit?: number }): Promise<Celula[]>;
  getById({ id }: { id: number }): Promise<Celula | undefined>;
  update(params: { id: number; input: Partial<Celula> }): Promise<Celula | undefined>;
  delete({ id }: { id: number }): Promise<boolean>;
  
  // Métodos específicos
  getByEmpresa({ empresa }: { empresa: number }): Promise<Celula[]>;
  getAsesoresByCelula({ id_celula }: { id_celula: number }): Promise<any[]>;
  checkExists({ id }: { id: number }): Promise<boolean>;
}