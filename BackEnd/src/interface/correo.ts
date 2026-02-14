import { Correo } from "../schemas/correo/Correo.ts";
import { ModelDB } from "./model.ts";

export interface CorreoModelDB extends Omit<ModelDB<Correo>, 'add'> {
  add: (params: { input: Correo }) => Promise<Correo>;
  getBySAP: ({ sap }: { sap: string }) => Promise<Correo | undefined>;
  getByLocalidad: ({ localidad }: { localidad: string }) => Promise<Correo[]>;
  getByDepartamento: ({ departamento }: { departamento: string }) => Promise<Correo[]>;
  getProximosAVencer: ({ dias }: { dias: number }) => Promise<Correo[]>;
  getVencidos: () => Promise<Correo[]>;
}
