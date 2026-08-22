import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const env = (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env;

  // Se houver um CRON_SECRET configurado, valida a autorização
  const authHeader = request.headers.get("authorization");
  if (
    env?.CRON_SECRET &&
    authHeader !== `Bearer ${env.CRON_SECRET}`
  ) {
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

