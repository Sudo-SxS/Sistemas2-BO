// interface/Usuario.ts

import { Usuario, UsuarioCreate, UsuarioUpdate } from "../schemas/persona/User.ts";
import { ModelDB } from "./model.ts";

export interface UserModelDB extends Omit<ModelDB<Usuario>, 'add'> {
  // Método personalizado para crear usuarios con manejo de transacciones complejas
  add(params: {
    input: UsuarioCreate;
  }): Promise<Usuario>;

  // Métodos principales de usuario
  getAll(params?: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
  }): Promise<Usuario[]>;

  getById({ id }: { id: string }): Promise<Usuario | undefined>;

  getByEmail({ email }: { email: string }): Promise<Usuario | undefined>;

  getByLegajo({ legajo }: { legajo: string }): Promise<Usuario | undefined>;

  getByExa({ exa }: { exa: string }): Promise<Usuario | undefined>;

  // Métodos de contraseña
  updatePassword(params: {
    id: string;
    newPasswordHash: string;
  }): Promise<boolean>;

  getPasswordHash({ id }: { id: string }): Promise<string | undefined>;

  getPasswordHistory({ id, limit }: { id: string; limit?: number }): Promise<Array<{
    password_hash: string;
    fecha_creacion: Date;
  }>>;

  isPasswordUsedBefore(params: {
    id: string;
    passwordHash: string;
  }): Promise<boolean>;

  getFailedAttemptsDB({ id }: { id: string }): Promise<number>;
  incrementFailedAttemptsDB({ id }: { id: string }): Promise<void>;
  resetFailedAttemptsDB({ id }: { id: string }): Promise<void>;
}
