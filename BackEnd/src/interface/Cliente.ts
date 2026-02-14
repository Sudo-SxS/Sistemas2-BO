import { Cliente, ClienteCreate, ClienteUpdate, ClienteResponse } from "../schemas/persona/Cliente.ts";
import { ModelDB } from "./model.ts";

export interface ClienteModelDB extends Omit<ModelDB<Cliente>, 'add' | 'update'> {
  add(params: { input: ClienteCreate }): Promise<Cliente>;

  update(params: { id: string; input: ClienteUpdate }): Promise<Cliente | undefined>;

  getByPersonaId: ({ personaId }: { personaId: string }) => Promise<Cliente | undefined>;

  getWithPersonaData: ({ personaId }: { personaId: string }) => Promise<ClienteResponse | undefined>;

  getAllWithPersonaData: (params?: { page?: number; limit?: number }) => Promise<ClienteResponse[]>;

  getByDocumento: ({ tipo_documento, documento }: { tipo_documento: string; documento: string }) => Promise<ClienteResponse | undefined>;
}