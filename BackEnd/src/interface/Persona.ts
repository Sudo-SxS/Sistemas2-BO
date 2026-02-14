import { Persona } from "../schemas/persona/Persona.ts";
import { ModelDB } from "./model.ts";

export interface PersonaModelDB extends ModelDB<Persona> {
  getByEmail: ({ email }: { email: string }) => Promise<Persona | undefined>;

  getBydocumento: (
    { documento }: { documento: string },
  ) => Promise<Persona | undefined>;
}
