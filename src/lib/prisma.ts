import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let prismaClient: PrismaClient | undefined;

function getRuntimeDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return undefined;
  }

  try {
    const url = new URL(databaseUrl);

    if (url.hostname.includes("pooler.supabase.com") && url.port === "5432") {
      url.port = "6543";
    }

    if (url.hostname.includes("pooler.supabase.com")) {
      url.searchParams.set("pgbouncer", "true");
      url.searchParams.set("connection_limit", "1");
      url.searchParams.set("pool_timeout", "20");
    }

    return url.toString();
  } catch {
    return databaseUrl;
  }
}

export function getPrisma() {
  if (!prismaClient) {
    const runtimeDatabaseUrl = getRuntimeDatabaseUrl();

    prismaClient =
      globalForPrisma.prisma ??
      new PrismaClient({
        datasources: runtimeDatabaseUrl
          ? {
              db: {
                url: runtimeDatabaseUrl,
              },
            }
          : undefined,
      });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaClient;
    }
  }

  return prismaClient;
}
