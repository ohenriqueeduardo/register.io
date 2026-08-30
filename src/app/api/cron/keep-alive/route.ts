import { getPrisma } from "@/lib/prisma";
import { timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

function isAuthorizedCron(authHeader: string | null, cronSecret?: string): boolean {
  if (!cronSecret) {
    return true;
  }

  if (!authHeader) {
    return false;
  }

  const expected = Buffer.from(`Bearer ${cronSecret}`);
  const received = Buffer.from(authHeader);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export async function GET(request: Request) {
  const env = (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env;

  const authHeader = request.headers.get("authorization");
  if (!isAuthorizedCron(authHeader, env?.CRON_SECRET)) {
    return new Response("Não autorizado", { status: 401 });
  }

  try {
    const prisma = getPrisma();
    // Executa uma query SQL simples (SELECT 1) para manter o banco ativo
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      status: "success",
      message: "Conexão com o Supabase está ativa.",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro no keep-alive do Supabase:", error);
    return Response.json(
      {
        status: "error",
        message: "Falha ao conectar com o banco de dados do Supabase.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

