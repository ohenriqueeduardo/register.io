import { getPrisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Se houver um CRON_SECRET configurado, valida a autorização
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const prisma = getPrisma();
    // Executa uma query SQL simples (SELECT 1) para manter o banco ativo
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "success",
      message: "Conexão com o Supabase está ativa.",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro no keep-alive do Supabase:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Falha ao conectar com o banco de dados do Supabase.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
