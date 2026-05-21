import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@sistema.com";
  const adminName = process.env.ADMIN_NAME ?? "Administrador";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "34062620";

  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
    throw new Error("Defina ADMIN_PASSWORD antes de rodar o seed em producao.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      nome: adminName,
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      nome: adminName,
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const categorias = [
    "Tecnologia",
    "Servicos",
    "Industria",
    "Varejo",
    "Saude",
    "Educacao",
  ];

  for (const nome of categorias) {
    await prisma.categoria.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
