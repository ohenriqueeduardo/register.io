import { AsyncLocalStorage } from "async_hooks";
import { defaultLogger } from "./logger";
import type { Logger } from "pino";

type RequestContext = {
  requestId: string;
  userId?: string;
  action: string;
  logger: Logger;
};

export const loggerContextStore = new AsyncLocalStorage<RequestContext>();

/**
 * Retorna o logger contextualizado da requisição atual.
 * Se chamado fora de uma requisição, retorna o logger padrão do Pino.
 */
export function getLogger(): Logger {
  const store = loggerContextStore.getStore();
  return store?.logger ?? defaultLogger;
}
