# Registros.io

Sistema fullstack para cadastro, classificacao e gestao de empresas parceiras, com autenticacao segura, banco PostgreSQL via Prisma e upload real de catalogos em Supabase Storage.

## Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod
- bcryptjs
- JWT em cookie httpOnly
- Supabase Storage
- shadcn/ui + Tailwind CSS

## Funcionalidades

- Autenticacao: `register`, `login`, `logout`, `me`.
- Rotas privadas protegidas por layout server-side.
- CRUD de empresas com busca, filtros, paginacao e ordenacao.
- CNPJ validado e unico.
- CRUD de categorias com protecao para administradores nas mutacoes.
- Listagem real de usuarios para administradores.
- Dashboard com estatisticas reais do banco.
- Upload, visualizacao, download, substituicao e remocao de catalogos.
- Banco salva apenas metadados do catalogo: URL, nome, MIME type e tamanho.

## Variaveis De Ambiente

Crie `.env` a partir de `.env.example` em desenvolvimento. O Prisma CLI le `.env` por padrao; `.env.local` e carregado pelo Next.js, mas nao deve ser usado como unico arquivo para comandos `prisma`.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/DATABASE?pgbouncer=true&connection_limit=1&pool_timeout=20"
JWT_SECRET="troque-por-um-segredo-forte-com-pelo-menos-32-caracteres"
SUPABASE_URL="https://SEU-PROJETO.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
SUPABASE_BUCKET="catalogos"
ALLOW_PUBLIC_REGISTRATION="false"
ADMIN_EMAIL="admin@sistema.com"
ADMIN_NAME="Administrador"
ADMIN_PASSWORD="troque-por-uma-senha-forte"
```

Em deploy serverless com Vercel + Supabase, use a connection string do Transaction Pooler do Supabase (porta `6543`) em `DATABASE_URL`. Evite a porta `5432` do Session Pooler para runtime da aplicação, pois ela pode estourar o limite de sessões.

O bucket do Supabase deve existir. Para abrir arquivos diretamente pela URL retornada, use bucket publico.
Em producao, mantenha `ALLOW_PUBLIC_REGISTRATION="false"` salvo se o cadastro publico for intencional.

## Instalar

```bash
pnpm install
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Depois edite `.env` com os valores reais.

## Banco E Prisma

```bash
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

Admin inicial criado pelo seed:

- Email: valor de `ADMIN_EMAIL` ou `admin@sistema.com`
- Senha: valor de `ADMIN_PASSWORD` ou `34062620` em desenvolvimento

Defina `ADMIN_PASSWORD` antes de rodar o seed em producao.

## Desenvolvimento

```bash
pnpm dev
```

## Validacao Local

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Deploy Na Vercel

1. Configure as variaveis `DATABASE_URL`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`, `ALLOW_PUBLIC_REGISTRATION`, `ADMIN_EMAIL`, `ADMIN_NAME` e `ADMIN_PASSWORD`.
2. Garanta que o banco PostgreSQL esteja acessivel pela Vercel.
3. Aplique migrations no banco de producao antes do rollout:

```bash
pnpm prisma:migrate:deploy
```

4. Rode o seed apenas se quiser criar o admin inicial no ambiente:

```bash
pnpm prisma:seed
```

5. O build da Vercel usa:

```bash
pnpm build
```

O script de build ja executa `prisma generate && next build`.

## Comandos Finais

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm lint
pnpm typecheck
pnpm build
pnpm dev
```

Para producao:

```bash
pnpm prisma:migrate:deploy
pnpm prisma:seed
pnpm build
```
