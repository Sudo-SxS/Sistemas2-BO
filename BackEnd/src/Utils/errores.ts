import { load } from "dotenv";

const initEnv = await load({ export: true });

export function manejoDeError(message: string, error: unknown) {
  const MODE = Deno.env.get("MODO") ?? "production";

  const errorMsg = error instanceof Error
    ? error.message
    : JSON.stringify(error);

  if (MODE === "development") {
    console.error(`\x1b[31m[DEV ERROR]\x1b[0m ${message}`);
    console.error(`\x1b[33mDetalles:\x1b[0m ${errorMsg}`);
    console.trace();
  } else {
    console.error(`[ERROR] ${message}`);
  }

  return { message, error: errorMsg, mode: MODE };
}
