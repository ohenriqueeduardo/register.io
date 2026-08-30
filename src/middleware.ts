import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 60;

// Cache simples em memória por IP
const ipCache = new Map<string, { count: number; resetTime: number }>();

function cleanExpiredCache() {
  const now = Date.now();
  for (const [ip, data] of ipCache.entries()) {
    if (now > data.resetTime) {
      ipCache.delete(ip);
    }
  }
}

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-real-ip")?.trim() ??
    request.ip ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "127.0.0.1";

  // Aplica rate limit apenas nas rotas de API
  if (request.nextUrl.pathname.startsWith("/api")) {
    // Ignora a rota de keep-alive para evitar falso positivo do cron job
    if (request.nextUrl.pathname === "/api/cron/keep-alive") {
      return NextResponse.next();
    }

    // Limpeza da cache se passar de 1000 IPs
    if (ipCache.size > 1000) {
      cleanExpiredCache();
    }

    const now = Date.now();
    const rateLimitData = ipCache.get(ip);

    if (!rateLimitData || now > rateLimitData.resetTime) {
      ipCache.set(ip, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW,
      });
      return NextResponse.next();
    }

    if (rateLimitData.count >= MAX_REQUESTS) {
      return new NextResponse(
        JSON.stringify({
          status: "error",
          message: "Muitas requisições. Por favor, tente novamente mais tarde.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((rateLimitData.resetTime - now) / 1000).toString(),
          },
        }
      );
    }

    rateLimitData.count++;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};

