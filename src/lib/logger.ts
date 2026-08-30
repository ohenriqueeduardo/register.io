import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

// Padrões de campos que devem ser ofuscados automaticamente
const redactPaths = [
  "password",
  "*.password",
  "passwordHash",
  "*.passwordHash",
  "token",
  "*.token",
  "jwt",
  "*.jwt",
  "authorization",
  "headers.authorization",
  "*.headers.authorization",
  "cnpj",
  "*.cnpj",
  "email",
  "*.email",
];

export const defaultLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: redactPaths,
    censor: "[REDACTED]",
  },
  transport: !isProduction
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
