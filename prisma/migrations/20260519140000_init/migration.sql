CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Categoria" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Empresa" (
  "id" TEXT NOT NULL,
  "nomeEmpresa" TEXT NOT NULL,
  "cnpj" TEXT NOT NULL,
  "nomeRepresentante" TEXT NOT NULL,
  "telefoneRepresentante" TEXT NOT NULL,
  "telefoneEmpresa" TEXT,
  "email1" TEXT NOT NULL,
  "email2" TEXT,
  "trabalhaComApoioCotacoes" BOOLEAN NOT NULL,
  "categoriaId" TEXT NOT NULL,
  "especialidades" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "catalogoUrl" TEXT,
  "catalogoPath" TEXT,
  "catalogoNome" TEXT,
  "catalogoMimeType" TEXT,
  "catalogoTamanho" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdById" TEXT,
  "updatedById" TEXT,
  CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "userId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Categoria_nome_key" ON "Categoria"("nome");
CREATE UNIQUE INDEX "Empresa_cnpj_key" ON "Empresa"("cnpj");
CREATE INDEX "Empresa_categoriaId_idx" ON "Empresa"("categoriaId");
CREATE INDEX "Empresa_createdById_idx" ON "Empresa"("createdById");
CREATE INDEX "Empresa_updatedById_idx" ON "Empresa"("updatedById");
CREATE INDEX "Empresa_trabalhaComApoioCotacoes_idx" ON "Empresa"("trabalhaComApoioCotacoes");
CREATE INDEX "Empresa_createdAt_idx" ON "Empresa"("createdAt");
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
