import { ConsoleHandler, getLogger, LogRecord, setup } from "log";

const isDevelopment = Deno.env.get("MODO") !== "PRODUCCION";

setup({
  handlers: {
    console: new ConsoleHandler("DEBUG", {
      formatter: (record: LogRecord) => {
        const timestamp = new Date().toISOString();
        return `${record.levelName}         ${timestamp}        ${record.msg} `;
      },
    }),
  },
  loggers: {
    default: {
      level: isDevelopment ? "DEBUG" : "ERROR",
      handlers: ["console"],
    },
  },
});

export const logger = getLogger();
