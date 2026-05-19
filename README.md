# Registros.io

Base backend preparada para evoluir o projeto para fullstack com Next.js App Router, Prisma, PostgreSQL e autenticacao segura.

Escopo atual: base Prisma/validacoes e autenticacao.

## Implementado

- Dependencias de backend e validacao instaladas.
- Scripts de Prisma adicionados ao `package.json`.
- `prisma/schema.prisma` com PostgreSQL.
- Models `User`, `Empresa`, `Categoria` e `AuditLog`.
- Enum `UserRole`.
- Migration inicial.
- Seed com admin inicial e categorias base.
- `.env.example`.
- `src/lib/prisma.ts` com singleton seguro para hot reload.
- Validadores Zod em `src/lib/validators`.
- Helper de CNPJ com limpeza, formatacao e validacao real.
- Autenticacao com JWT em cookie httpOnly.
- Endpoints `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` e `GET /api/auth/me`.
- Helpers `getCurrentUser`, `requireAuth` e `requireAdmin`.
- Rotas privadas protegidas por layout server-side.
- Telas `/login` e `/cadastro` integradas aos endpoints reais.

CRUD de empresas/categorias e upload real ainda nao foram implementados neste escopo.

## Variaveis

Crie `.env` a partir de `.env.example`.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="troque-por-um-segredo-forte-com-pelo-menos-32-caracteres"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STORAGE_PROVIDER="supabase"
SUPABASE_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
SUPABASE_BUCKET="catalogos"
```

## Prisma

Gerar client:

```bash
pnpm prisma:generate
```

Criar/aplicar migration em desenvolvimento:

```bash
pnpm prisma:migrate
```

Rodar seed:

```bash
pnpm prisma:seed
```

Admin inicial do seed:

- Email: `admin@sistema.com`
- Senha: `Admin@123456`

Altere essa senha em producao.

## Desenvolvimento

```bash
pnpm dev
```

## Validacao

```bash
pnpm lint
pnpm build
```
