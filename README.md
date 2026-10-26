# SNUAAA HOMEPAGE

[Homepage](https://our.snuaaa.net/)

# About the Project

This project is for the website community of the [Seoul National University Amateur Astronomy Association](https://our.snuaaa.net/).

It is a [pnpm](https://pnpm.io/) workspace monorepo with two packages:

| Package | Path | Description |
| --- | --- | --- |
| `@snuaaa/community-web` | `packages/community` | Community web app (React SPA) |
| `@snuaaa/api` | `packages/api` | REST API server (Express + PostgreSQL) |

# Getting Started

### 1. Install packages

In the project root directory.

```bash
pnpm i
```

### 2. Set environment variables

`packages/community/.env`

```bash
REACT_APP_SERVER_URL=http://localhost:8080/
```

`packages/api/.env`

```bash
NODE_ENV=develop
PORT=8080
DB_HOST=localhost
POSTGRESQL_DATABASE=
POSTGRESQL_USERNAME=
POSTGRESQL_PASSWORD=
JWT_SECRET=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
```

### 3. Create the database

Start a PostgreSQL server (e.g. `docker run -d -p 5432:5432 -e POSTGRES_USER=snuaaa -e POSTGRES_PASSWORD=snuaaa -e POSTGRES_DB=snuaaa postgres:16`), fill in the `POSTGRESQL_*` variables above, and create the tables with migrations. See [docs/db-migration.md](docs/db-migration.md) for changing the schema.

```bash
pnpm --filter @snuaaa/api db:migrate
```

### 4. Run SNUAAA community web

In the project root directory. The dev server runs on http://localhost:3000.

```bash
pnpm dev
```

### 5. Run API server

```bash
pnpm --filter @snuaaa/api dev
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm build` | Build the community web (`packages/community/build`) |
| `pnpm --filter @snuaaa/community-web lint` | Lint the community web |
| `pnpm --filter @snuaaa/api build` | Compile the API server (`packages/api/dist`) |
| `pnpm --filter @snuaaa/api lint` | Lint the API server |
| `pnpm --filter @snuaaa/api format` | Format the API server with Prettier |
| `pnpm --filter @snuaaa/api db:generate` | Generate a DB migration from `src/db/schema.ts` |
| `pnpm --filter @snuaaa/api db:migrate` | Apply pending DB migrations |

## Deployment

| Trigger | Web | API |
| --- | --- | --- |
| Push to `main` | Cloudflare Pages (preview) | Dev server |
| Release tagged `WEB-*` | Cloudflare Pages (production) | - |
| Release tagged `API-*` | - | Production server |

## Stacks

### Web

- [React](https://reactjs.org/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [tailwindcss](https://tailwindcss.com/)
- [CKEditor](https://ckeditor.com/)
- [REMIX ICON](https://remixicon.com/)
- [Vite](https://vite.dev/)

### API

- [Express](https://expressjs.com/)
- [Sequelize](https://sequelize.org/) + [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://jwt.io/)
- [AWS S3](https://aws.amazon.com/s3/)
