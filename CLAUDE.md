# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A pnpm-workspace monorepo for the SNUAAA (Seoul National University Amateur Astronomy Association) community website (https://our.snuaaa.net/). It has two packages:

- `packages/community` (`@snuaaa/community-web`) is the React 18 + Vite SPA.
- `packages/api` (`@snuaaa/api`) is the Express + Sequelize (PostgreSQL) REST API.

Use pnpm (not yarn or npm) for installing and running scripts.

## Commands

From the repo root:

```bash
pnpm install
pnpm dev      # community web dev server on http://localhost:3000
pnpm build    # community web production build -> packages/community/build
```

Per package, run with `pnpm --filter <name> <script>`, or run the script from inside the package directory:

| Package | Scripts |
| --- | --- |
| `@snuaaa/community-web` | `dev`, `build`, `lint`, `lint:fix` |
| `@snuaaa/api` | `dev` (nodemon + ts-node on `src/main.ts`), `build` (tsc -> `dist`), `serve`, `lint` (runs with `--fix`), `format`, `format:check` |

There is no test suite in either package. Verify changes with `lint` and `build`. The web build does not run `tsc`, so run `npx tsc --noEmit` in `packages/community` to type-check it.

Each package has its own ESLint flat config (`eslint.config.*`) with Prettier (single quotes). The root `.eslintrc.js` is legacy.

## Environment

- **Web:** `packages/community/.env` needs `REACT_APP_SERVER_URL` with a trailing slash (e.g. `http://localhost:8080/`), because the axios base URL is `${SERVER_URL}api/`. Vite exposes only `REACT_APP_`-prefixed vars (`envPrefix`), and code reads them through `src/constants/env.ts`.
- **API:** `packages/api/.env` needs these variables:
  - `POSTGRESQL_DATABASE`, `POSTGRESQL_USERNAME`, `POSTGRESQL_PASSWORD`, `DB_HOST`
  - `JWT_SECRET`, `PORT` (default 8080), `NODE_ENV`
  - `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
  - `RISESET_SERVICE_KEY`

  `NODE_ENV=develop` switches the CORS allow-list to the dev origins, which include localhost:3000.

## Architecture

### Web (`packages/community/src`)

- **Routing:** TanStack Router with file-based routes in `src/routes/`. The Vite plugin generates `src/routeTree.gen.ts`, so never edit that file by hand. Route files are thin: most render a component from `src/pages/`, which composes feature components from `src/components/<Feature>/`.
- **Root layout:** `routes/__root.tsx` wires `QueryClientProvider`, `AuthProvider`, `ViewportSizeProvider`, the header, sidebar and footer. It also renders the photo and exhibit-photo detail modals, which are driven by the global `?photo=<id>` / `?exhibitPhoto=<id>` search params. To open a photo from anywhere, set that search param instead of navigating to a route.
- **Data layer, in three steps:**
  1. `src/services/index.ts` defines the shared axios instance and `API` wrapper. An interceptor attaches `Bearer <token>` from the cookie (`utils/token`).
  2. `src/services/*Service.ts` holds the endpoint functions, and `services/types.ts` holds the response types.
  3. `src/hooks/queries/use*Queries.ts` wraps those functions in TanStack Query hooks, each file with a `xxxKeys` query-key factory. New server calls should follow the same service → query-hook pattern, and mutations should invalidate through the key factories.
- **Auth:** `contexts/auth` (`useAuth`). On load, the provider validates the cookie token and redirects to `/auth/login?redirect=...` unless the page is public (`/auth/login`, `/auth/signup`).
- **Styling:** Tailwind v4 via `@tailwindcss/vite`, alongside legacy SCSS in `src/sass/` and `App.scss`.
- **Rich text:** CKEditor 5 v38, bundled via `@ckeditor/vite-plugin-ckeditor5`.
- **Imports:** the `~/` alias maps to `src/`.

### API (`packages/api/src`)

- **Entry:** `main.ts` mounts every router under `/api` (see `routes/index.ts`) and serves `/static` from `upload/`.
- **Layering:** `routes/*.ts` handles HTTP parsing and responses, and `controllers/*.controller.ts` holds the Sequelize queries and business logic. Controllers are plain async functions, not Express handlers.
- **Auth:** the global token middleware is commented out, so each route opts in with `verifyTokenMiddleware`. That middleware reads the `Authorization: Bearer` header and sets `req.decodedToken` (type `AuthenticatedRequest`).
- **Permissions:** permissions depend on the user's `grade`, where a lower number means more privilege. Boards filter visibility by comparing their read level against `decodedToken.grade`.
- **Content model:** `Content` is the polymorphic base row (`type` is one of `PO`/`DO`/`AL`/`PH`/`EH`/`EP`; see `enums/contentTypeEnum.ts`). It has a one-to-one detail table (`Post`, `Document`, `Album`, `Photo`, `Exhibition`, `ExhibitPhoto`) keyed by `content_id`. Likes, comments, tags and attached files all hang off `Content`. Associations are defined centrally in `models/index.ts`.
- **Schema changes:** `models/sequelize.ts` calls `sequelize.sync()` on connect. There are no migration files, so schema changes come from model definitions.
- **Images and files:** uploads go to S3 through `utils/upload.ts` (`uploadImageToS3`, with resource types in `S3_RESOURCE_TYPES`). Images are resized with sharp. Legacy local-disk paths (`profile_path`, etc.) are deprecated in favor of `*_url` fields (e.g. `User.profile_url`). When displaying images, prefer `profile_url` and fall back to the legacy path.

## Branching & Deployment

- `develop` is the integration branch, and PRs target it. Commit messages use `[feat]`, `[fix]`, `[refactor]`, `[chore]` prefixes, often written in Korean.
- **Push to `main`:** deploys the web to the Cloudflare Pages preview (`develop` branch) and the API Docker image to the dev Lightsail server.
- **Release tagged `WEB-*`:** deploys the web to production Cloudflare Pages.
- **Release tagged `API-*`:** deploys the API to the production Lightsail server. The image is built from `packages/api/Dockerfile` with `pnpm deploy`.
