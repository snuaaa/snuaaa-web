# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A pnpm-workspace monorepo for the SNUAAA (Seoul National University Amateur Astronomy Association) community website (https://our.snuaaa.net/). It has three packages:

- `packages/community` (`@snuaaa/community-web`) is the React 18 + Vite SPA.
- `packages/api` (`@snuaaa/api`) is the Express + Sequelize (PostgreSQL) REST API.
- `packages/home` (`@snuaaa/home-web`) is the club intro site (https://www.snuaaa.net/), moved from the `snuaaa-home` repo. It is one React 18 + Vite page styled with `@emotion/css`, and `build` prerenders it to static HTML (`vite build`, then `vite build --ssr src/entry-server.tsx`, then `scripts/prerender.js` fills `<!--app-head-->`/`<!--app-html-->` in `build/index.html`) so crawlers that don't run JS see the content. Keep `window`/`document` access inside effects, because the page is rendered in Node at build time. It has no CI or deploy workflow yet.

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
| `@snuaaa/community-web` | `dev`, `build`, `lint`, `lint:fix`, `typecheck`, `test:e2e` |
| `@snuaaa/api` | `dev` (nodemon + ts-node on `src/main.ts`), `build` (tsc -> `dist`), `serve`, `lint`, `lint:fix`, `format`, `format:check`, `db:generate`, `db:migrate` |
| `@snuaaa/home-web` | `dev` (http://localhost:3001), `build` (prerendered -> `packages/home/build`), `preview`, `lint`, `lint:fix`, `typecheck` |

Verify changes with `lint` and `build`. The web build does not run `tsc`, so also run `typecheck` for the web. The API has no tests. PRs to `main` run the same checks in `.github/workflows/ci.yml` (web: `lint`, `typecheck`, `build`, `test:e2e`; api: `lint`, `format:check`, `build`).

The web has Playwright E2E tests in `packages/community/e2e/` (`test:e2e`). Playwright starts the Vite dev server itself, and the API is never called: `e2e/fixtures.ts` answers every request with `page.route` and records the calls in the `api` fixture. That fixture also fails a test on a render loop (`Maximum update depth`) or the router's error screen, unless the test sets `test.use({ allowRouteError: true })`. Locally, install the browser once with `pnpm --filter @snuaaa/community-web exec playwright install chromium`. Add a test there when changing auth or routing behavior. Non-draft PRs from this repository also get an automatic Claude review (`.github/workflows/claude-review.yml`, authenticated with the `CLAUDE_CODE_OAUTH_TOKEN` secret from `claude setup-token`).

Each package has its own ESLint flat config (`eslint.config.*`) with Prettier (single quotes). The root `.eslintrc.js` is legacy.

## Environment

- **Web:** `packages/community/.env` needs `REACT_APP_SERVER_URL` with a trailing slash (e.g. `http://localhost:8080/`), because the axios base URL is `${SERVER_URL}api/`. Vite exposes only `REACT_APP_`-prefixed vars (`envPrefix`), and code reads them through `src/constants/env.ts`.
- **API:** `packages/api/.env` needs these variables:
  - `POSTGRESQL_DATABASE`, `POSTGRESQL_USERNAME`, `POSTGRESQL_PASSWORD`, `DB_HOST`
  - `JWT_SECRET`, `PORT` (default 8080), `NODE_ENV`
  - `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`

  `NODE_ENV=develop` switches the CORS allow-list to the dev origins, which include localhost:3000.
- **Sentry (optional):** error monitoring is off unless a DSN is set.
  - Web: `REACT_APP_SENTRY_DSN`, `REACT_APP_SENTRY_ENVIRONMENT`. Source maps are uploaded at build time only when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` and `SENTRY_PROJECT` are set (see `deploy-web.yml`).
  - API: `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE`. `src/instrument.ts` must stay the first import in `main.ts`. Only unexpected (500) errors are reported, from `middlewares/errorHandler.ts`.

## Architecture

### Web (`packages/community/src`)

- **Routing:** TanStack Router with file-based routes in `src/routes/`. The Vite plugin generates `src/routeTree.gen.ts`, so never edit that file by hand. Route files are thin: most render a component from `src/pages/`, which composes feature components from `src/components/<Feature>/`.
- **Root layout:** `index.jsx` wraps the router in `QueryClientProvider`. `routes/__root.tsx` wires `ViewportSizeProvider` and `components/Layout/AppShell` (desktop top nav, mobile bottom tab bar). Pages not yet redesigned render inside the legacy white column; `AppShell`'s `REDESIGNED_PATHS` lists the ones that draw their own layout. It also renders the photo and exhibit-photo detail modals, which are driven by the global `?photo=<id>` / `?exhibitPhoto=<id>` search params. To open a photo from anywhere, set that search param instead of navigating to a route.
- **Data layer, in three steps:**
  1. `src/services/index.ts` defines the shared axios instance and `API` wrapper. An interceptor attaches `Bearer <token>` from the cookie (`utils/token`).
  2. `src/services/*Service.ts` holds the endpoint functions, and `services/types.ts` holds the response types.
  3. `src/hooks/queries/use*Queries.ts` wraps those functions in TanStack Query hooks, each file with a `xxxKeys` query-key factory. New server calls should follow the same service → query-hook pattern, and mutations should invalidate through the key factories.
- **Auth:** the session (`/auth/check` result, or `null` when logged out) is a TanStack Query cache entry (`hooks/queries/useAuthQueries.ts`), revalidated at most every 5 minutes. The root route's `beforeLoad` loads it through `loadSession()` (`lib/auth.ts`) and redirects to `/auth/login?redirect=...` unless the page is public (`PUBLIC_PATHS`). It runs before any loader, so guard pages there, not with `<Navigate>` in components. Only a 401 logs the user out. `useAuth()` (`hooks/useAuth.ts`) exposes `authInfo`, plus `authLogin`/`authLogout`, which update the session cache directly, so navigating right after `authLogin` passes the guard. Pass a `redirect` value through `getSafeRedirect()` before navigating to it.
- **Styling:** Tailwind v4 via `@tailwindcss/vite`, alongside legacy SCSS in `src/sass/` and `App.scss`.
  - Design tokens live in the `@theme` block of `src/index.css` (see `docs/design.md`). Tailwind's default palette is cleared, so only token colors exist (`bg-primary`, `text-fg-muted`, `border-border`, `bg-navy-500`, ...). Prefer semantic tokens over raw palette steps, and don't add hex values in class names.
  - Legacy SCSS color variables in `sass/common/_color.scss` point at the same tokens via `var()`, so Sass color functions can't take them.
  - Shared UI primitives (Button, Field/Input, Tag, Avatar, Sheet, Dialog, NavDrawer, Tabs, Pagination, ...) live in `src/components/ui/` and are imported from `~/components/ui`. Merge classes with `cn()` from `~/lib/utils`, and use lucide-react for new icons.
- **Design system:** Read `docs/design.md` before any UI work. It holds the tokens, the motion rules, the component list, the screen decisions and the planned work. The redesign epic that built it has merged into `main`; screens it hasn't moved yet still render in the legacy column.
- **Motion:** elements appear by brightening and coming into focus (`animate-light-in` / `animate-light-out`, `ease-night`, `--duration-*` in `index.css`), not by sliding or scaling. Route changes get a view transition from `router.tsx` only when the path changes. Pair every animation or transition with `motion-reduce:`.
- **Rich text:** CKEditor 5 v38, bundled via `@ckeditor/vite-plugin-ckeditor5`.
- **Imports:** the `~/` alias maps to `src/`.

### API (`packages/api/src`)

- **Entry:** `main.ts` mounts every router under `/api` (see `routes/index.ts`) and serves `/static` from `upload/`.
- **Layering:** `routes/*.ts` handles HTTP parsing and responses, and `controllers/*.controller.ts` holds the Sequelize queries and business logic. Controllers are plain async functions, not Express handlers.
- **Auth:** the global token middleware is commented out, so each route opts in with `verifyTokenMiddleware`. That middleware reads the `Authorization: Bearer` header and sets `req.decodedToken` (type `AuthenticatedRequest`).
- **Errors:** expected failures are `AppError` subclasses from `src/errors` (`BadRequestError` 400, `AuthenticationError` 401, `AuthorizationError` 403, `NotFoundError` 404, `ConflictError` 409). Controllers throw them, and routes forward every error with `catch (err) { next(err); }` (or `return next(new XxxError(...))`). Express 4 does not catch rejected promises, so never leave an `await` outside `try` in a handler. `middlewares/errorHandler.ts` responds `{ success: false, error, message, code? }`. Any other error becomes a 500 and goes to Sentry. `code` is a legacy numeric code that the web still reads in some places (e.g. 1011–1014 for password changes).
- **Permissions:** permissions depend on the user's `grade`, where a lower number means more privilege. Boards filter visibility by comparing their read level against `decodedToken.grade`.
- **Content model:** `Content` is the polymorphic base row (`type` is one of `PO`/`DO`/`AL`/`PH`/`EH`/`EP`; see `enums/contentTypeEnum.ts`). It has a one-to-one detail table (`Post`, `Document`, `Album`, `Photo`, `Exhibition`, `ExhibitPhoto`) keyed by `content_id`. Likes, comments, tags and attached files all hang off `Content`. Associations are defined centrally in `models/index.ts`.
- **Schema changes:** the schema is managed by hand-written SQL migrations in `packages/api/drizzle/`, applied with the drizzle-orm migrator by `src/db/migrate.ts` when the API starts (before it listens). `sequelize.sync()` is not called, so changing a model does not change the DB. Add a migration with `pnpm db:generate --name <name>` and update the Sequelize model to match. Never edit a deployed migration. See `packages/api/drizzle/README.md`.
- **Rise/set info:** `/api/home/riseset` computes sunrise/sunset, moonrise/moonset, astronomical twilight and moon age for Seoul locally with `astronomy-engine` (`utils/riseset.ts`). No external API or service key is needed.
- **Images and files:** uploads go to S3 through `utils/upload.ts` (`uploadImageToS3`, with resource types in `S3_RESOURCE_TYPES`). Images are resized with sharp. Legacy local-disk paths (`profile_path`, etc.) are deprecated in favor of `*_url` fields (e.g. `User.profile_url`). When displaying images, prefer `profile_url` and fall back to the legacy path.

## Branching & Deployment

- PRs target `main` (the default branch), not `develop`, unless the work belongs to an epic.
- **Epic branches (`epic/<name>`):** large efforts that span many PRs and should not reach production half-done live on a long-lived branch cut from `main`.
  - Work branches are cut from the epic and their PRs target the epic. They are squash-merged like any other PR, and CI runs on PRs targeting `epic/**`.
  - Merge `main` into the epic periodically to stay current. Do not rebase an epic, since others build on it.
  - When the epic is finished, merge it into `main` with a merge commit, not a squash, so the per-PR history survives.
  - Each epic has a draft PR from `epic/<name>` to `main` that tracks its progress. Its body lists every PR that belongs to the epic, including the ones that target `main`, and the follow-up work to do after the epic ships.
  - API changes go to `main`, not the epic. The epic preview uses the dev API, which only deploys from `main`, and `main` can be released at any time. So an API change must stay backward compatible with the web currently in production:
    - Add new fields, params or endpoints instead of changing existing behavior (expand). The epic's web uses the new behavior.
    - Remove the old behavior only after the epic ships to production (contract), and add that cleanup to the epic PR's list.
    - Write `Epic: #<epic PR number>` in the PR body, so it shows up in the epic PR's timeline.
  - `<name>` must not be `develop` or `main`, because it becomes the preview alias.
  - Each epic keeps its plan under `docs/` on the epic branch (e.g. `docs/<name>.md` on `epic/<name>`). Read it before working on that epic.
- Branch names follow `<type>/<short-description>` (e.g. `fix/profile-path`, `feat/late-fee-management`), where `<type>` is `feat`, `fix`, `chore` or `refactor`. Commit messages and PR titles use `[feat]`, `[fix]`, `[refactor]`, `[chore]` prefixes, often written in Korean.
- **Merging:** comment `/merge` on the PR instead of using the merge button. `.github/workflows/merge-command.yml` picks the method from the branches and titles the commit `<PR title> (#<PR number>)`:

  | base ← head | method |
  | --- | --- |
  | `main` ← `epic/*` | merge commit |
  | `main` ← `<type>/*` | squash |
  | `epic/*` ← `<type>/*` | squash |
  | `epic/*` ← `sync/*` (manual sync) | merge commit |

  To bring `main` into an epic, comment `/sync` on the epic → `main` PR (drafts included). The bot merges `main` into the epic with a merge commit, like the Update branch button, which is blocked for `epic/*`.

  When `/sync` fails (usually a conflict with `main`), update the epic by hand through a `sync/*` branch:

  ```bash
  git fetch origin
  git switch -c sync/<epic>-<yyyymmdd> origin/epic/<epic>
  git merge origin/main   # resolve conflicts here, then commit
  git push -u origin sync/<epic>-<yyyymmdd>
  ```

  Then open a PR from `sync/<epic>-<yyyymmdd>` to `epic/<epic>` and `/merge` it after CI passes. The bot merges `sync/*` with a merge commit. Never squash `main` into an epic, and never open the PR from `main` itself (the conflict can't be resolved there); a squash duplicates main's commits and breaks the later epic → `main` merge. `Closes #N` only closes issues when the PR merges into `main`, so list an epic's issues on its epic → `main` PR.
- **Stacked PRs:** when a branch is built on top of another open PR's branch, and that parent PR is squash-merged, the child branch still carries the parent's original commits, so it conflicts with the squash commit. Don't resolve this with a merge commit. Replay only the child's own commits onto the new base with `git rebase --onto`:

  ```bash
  git fetch origin
  # <parent-tip>: the parent PR's last commit that the child was built on
  # (the parent PR's head SHA, `origin/<parent-branch>` if it still exists,
  #  or `git merge-base <child-branch> origin/<parent-branch>`)
  git rebase --onto origin/main <parent-tip> <child-branch>   # use origin/epic/<name> if the parent merged into an epic
  git push --force-with-lease origin <child-branch>
  ```

  Open the child PR against the parent's branch as a draft. `/merge` has no rule for `<type>/*` ← `<type>/*`, so it can't land in the parent by mistake. When the parent merges, its head branch is deleted automatically and GitHub retargets the child PR to the parent's base. Rebase the child as above, mark it ready, and `/merge` it after CI passes. Rebase only your own work branches this way, never an `epic/*` or `sync/*` branch.
- **`main` is always releasable.** A fix for production goes to `main` like any other PR and ships with the next release tag, and anything that isn't ready for production goes to an epic instead.
- **Push to `main`:** deploys the web to the Cloudflare Pages preview (`develop` branch) and the API Docker image to the dev Lightsail server.
- **Push to `epic/<name>`:** deploys the web to the Cloudflare Pages `<name>` alias (`https://<name>.snuaaa-web.pages.dev`), pointed at the dev API. The API is not deployed from epic branches.
- **Release tagged `WEB-*`:** deploys the web to production Cloudflare Pages.
- **Release tagged `API-*`:** deploys the API to the production Lightsail server. The image is built from `packages/api/Dockerfile` with `pnpm deploy`.
- **Release notes:** don't use GitHub's "Generate release notes" button, because it lists every PR in the range, web and API alike. Publish the release with an empty body, or with your own summary only. `.github/workflows/release-notes.yml` then fills in the PRs that touched the tag's package (`WEB-*` → `packages/community`, `API-*` → `packages/api`), compared with the previous tag of the same prefix (`.github/scripts/release-notes.sh`). The list goes between `<!-- release-notes:start/end -->` markers, below any text you wrote. To regenerate it, run the workflow manually with the tag.
