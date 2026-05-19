import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123456", 12);

  await prisma.user.upsert({
    where: { email: "admin@sistema.com" },
    update: {
      nome: "Administrador",
      role: UserRole.ADMIN,
    },
    create: {
      nome: "Administrador",
      email: "admin@sistema.com",
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
