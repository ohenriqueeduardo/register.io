import { loggerContextStore } from "./logger-context";
import { defaultLogger } from "./logger";
import { getCurrentUser } from "./auth";
import { randomUUID } from "crypto";

type ApiHandler = (request: Request, context: any) => Promise<Response>;

export function withLogging(handler: ApiHandler): ApiHandler {
  return async (request: Request, context: any) => {
    const requestId = request.headers.get("x-request-id") || randomUUID();
    const { method } = request;
    const url = new URL(request.url);
    const action = `${method} ${url.pathname}`;

    // Tenta capturar o userId se houver usuário autenticado no cookie
    let userId: string | undefined;
    try {
      const user = await getCurrentUser();
      userId = user?.id;
    } catch {
      // Ignora erro de obtenção de usuário para rotas públicas
    }

    const childLogger = defaultLogger.child({
      requestId,
      userId,
      action,
    });

    const startTime = Date.now();

    return loggerContextStore.run(
      { requestId, userId, action, logger: childLogger },
      async () => {
        childLogger.info("Iniciando processamento da requisição.");

        try {
          const response = await handler(request, context);
          const duration = Date.now() - startTime;

          childLogger.info(
            { durationMs: duration, status: response.status },
            "Requisição concluída."
          );

          return response;
        } catch (error: any) {
          const duration = Date.now() - startTime;
          childLogger.fatal(
            { durationMs: duration, error: error.message, stack: error.stack },
            "Erro fatal não tratado no processamento da requisição."
          );
          throw error;
        }
      }
    );
  };
}
