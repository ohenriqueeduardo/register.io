import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Provisionamento do Administrador Master (Fixo & Seguro)
  const masterEmail = process.env.MASTER_ADMIN_EMAIL ?? "admin@savezone.local";
  const masterUsername = "masteradmin";
  const masterName = process.env.MASTER_ADMIN_NAME ?? "Master Admin";
  const masterPassword =
    process.env.MASTER_ADMIN_PASSWORD ?? "Master@SaveZone2026!Secure";

  const masterPasswordHash = await bcrypt.hash(masterPassword, 12);

  await prisma.user.upsert({
    where: { email: masterEmail },
    update: {
      role: UserRole.MASTER_ADMIN,
      username: masterUsername,
    },
    create: {
      nome: masterName,
      username: masterUsername,
      email: masterEmail,
      passwordHash: masterPasswordHash,
      role: UserRole.MASTER_ADMIN,
      status: UserStatus.ACTIVE,
      mustChangePassword: true,
      tokenVersion: 0,
    },
  });

  // 2. Administrador Padrão Legado (mantido para retrocompatibilidade)
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@sistema.com";
  const adminName = process.env.ADMIN_NAME ?? "Administrador";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "34062620";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nome: adminName,
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  // 3. Configurações Padrão da Plataforma
  await prisma.systemSetting.upsert({
    where: { key: "platform_settings" },
    update: {},
    create: {
      key: "platform_settings",
      value: {
        allowPublicRegistration: true,
        maintenanceMode: false,
        sessionTimeoutMinutes: 60 * 24 * 7,
        passwordMinLength: 6,
        requireSpecialChars: false,
      },
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
