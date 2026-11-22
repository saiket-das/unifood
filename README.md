# UM Food

UM Food is a university food ordering and restaurant operations project. It will
include a student PWA, a restaurant POS, a platform admin app, and delivery
coordination through the Telegram Bot API. The architecture is a NestJS modular
monolith with a separate worker process from the same codebase.

Phase 0 prepares the workspace, tooling, and local services. Application
scaffolding, Prisma schema and migrations, and integration setup begin in later
phases. The five v1.1 specifications in [docs/](docs/) define the product and
architecture.

## Stack

| Area                   | Baseline                                                    |
| ---------------------- | ----------------------------------------------------------- |
| Runtime and workspaces | Node.js 24 LTS and pnpm 11                                  |
| Web apps               | Next.js 16 and React 19                                     |
| API and worker         | NestJS 12, Express adapter, Socket.IO adapter, and BullMQ 6 |
| Local services         | PostgreSQL 18.7 and Redis 8.10.3 via Docker Compose         |
| Database tooling       | Prisma ORM 7 with the PostgreSQL driver adapter             |
| Development checks     | TypeScript 6, ESLint, and Prettier                          |

## Repository layout

```text
apps/
  backend/           NestJS API and background worker (two entrypoints, one codebase)
    prisma/          Reserved for the schema, migrations and seed
  student-app/       Student PWA
  restaurant-pos/    Restaurant owner dashboard and staff POS
  admin/             Platform admin dashboard
packages/
  contracts/         API contracts
  shared-types/      Shared TypeScript types
  validation/        Shared validation, with Zod declared
  ui/                Shared UI workspace
  config/            Shared TypeScript configuration
infra/
  docker/            Local Postgres and Redis (compose.yml) and future image builds
  deployment/        Reserved for future deployment configuration
docs/                Five v1.1 project specifications
scripts/             Setup, environment and local service checks
.github/             Security policy and future GitHub configuration
```

Every file has one correct location. [AGENTS.md](AGENTS.md) defines where each
kind of file goes and the project rules that every developer and AI agent
(Claude Code, Codex, Cursor and others) follows. `pnpm check:structure` fails on
files placed anywhere the rules do not allow.

Application and shared package directories contain workspace manifests. Use
`workspace:*` for internal dependencies when a package starts exporting code.
The pnpm catalog in `pnpm-workspace.yaml` pins versions shared across workspaces.

## Prerequisites

- Git and Node.js 24 LTS. Use the version in `.nvmrc` as the starting point.
- pnpm 11.25.0. If pnpm needs installing, run
  `npm install --global pnpm@11.25.0` from a standard Node.js installation.
- Docker Engine and the Docker Compose plugin for local services. Docker Desktop
  bundles both on Windows and macOS. Use Linux containers on Windows.
- Use a recent editor with EditorConfig support. Native PostgreSQL and Redis
  clients are optional.

On Windows, run the commands below from PowerShell with Windows Node and pnpm.
They can connect to Docker Desktop's WSL 2 backend without installing Node inside
WSL. If the tools only resolve inside Codex, install Node and pnpm for your
regular shell, then open a new PowerShell window.

## Install and validate

From the repository root, confirm your tools and install the locked dependencies.

```text
git --version
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm check:setup
```

Each app keeps its own ignored `.env`, documented by the `.env.example` beside
it. Web apps hold only their port and `NEXT_PUBLIC_*` values; backend secrets
live only in `apps/backend/.env`.

| File                    | Holds                                                     |
| ----------------------- | --------------------------------------------------------- |
| `infra/docker/.env`     | Postgres and Redis settings for Docker Compose            |
| `apps/backend/.env`     | API port, CORS, database and Redis URLs, future secrets   |
| `apps/student-app/.env` | Port and public API URL (same for the other two web apps) |

Create any missing local files from their templates. Existing files are never
overwritten.

```text
pnpm env:init
```

Generate a local PostgreSQL password with
`node -p "require('node:crypto').randomBytes(24).toString('hex')"`. Put the same
value in `POSTGRES_PASSWORD` in `infra/docker/.env` and the password segment of
`DATABASE_URL` in `apps/backend/.env` before the first startup. Keep the
authentication, Telegram, object storage, and other external integration
placeholders empty for Phase 0. `pnpm check:setup` verifies that the files agree.

## Local infrastructure

Start Docker, then run these commands from the repository root.

```text
docker version
docker compose version
pnpm infra:config
pnpm dev:infra
pnpm infra:ps
pnpm check:infra
```

`dev:infra` waits for both health checks. `check:infra` connects from the host
using the local URLs and runs PostgreSQL `SELECT 1` and Redis `PING`. Both services
publish on `127.0.0.1`, with default ports 5432 and 6379. PostgreSQL stores its
data in a named volume. Redis uses a named volume and append-only persistence
with a one-second sync interval. Its `noeviction` policy protects BullMQ queue keys.
Redis accepts connections without a password from the host loopback and containers
on the Compose network. This configuration is for local development.

`pnpm stop:infra` stops both containers and retains their volumes. Run
`pnpm dev:infra` to start them again.

## Workspace commands

| Command                              | Purpose                                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`     | Installs the dependency graph recorded in the lockfile                                         |
| `pnpm env:init`                      | Creates missing local `.env` files from their templates                                        |
| `pnpm check:structure`               | Checks every file is in a location allowed by `AGENTS.md`                                      |
| `pnpm check:setup`                   | Checks TypeScript presets, environment settings, Git ignore rules, structure, lint, formatting |
| `pnpm lint:setup`                    | Lints the setup scripts and ESLint configuration                                               |
| `pnpm format:check`                  | Checks formatting of the workspace files                                                       |
| `pnpm format`                        | Formats workspace files, with existing specs and the lockfile excluded                         |
| `pnpm infra:config`                  | Validates the Compose model and interpolation without starting services                        |
| `pnpm dev:infra` / `pnpm stop:infra` | Starts and waits for healthy services, or stops them                                           |
| `pnpm infra:ps` / `pnpm infra:logs`  | Shows service status, or Postgres and Redis logs                                               |
| `pnpm check:infra`                   | Checks PostgreSQL and Redis connectivity from the host                                         |

Application `dev`, `lint`, `typecheck`, `test`, and `build` commands become
available when each application is scaffolded. Extend the Node TypeScript preset
for `apps/backend` and the Next.js preset for the web apps. Add the
workspace's input paths and output options in its own `tsconfig.json`. Backend
test preparation includes the Nest testing utilities and Node's built-in test
runner. The team can choose the browser test runner when the first web flows
are available.

## Troubleshooting

- **Docker is missing or the engine is unreachable.** On Windows with no WSL
  runtime, an administrator can run `wsl --install --no-distribution` in elevated
  PowerShell and restart when prompted. Confirm `wsl --version` meets Docker
  Desktop's requirements. Install and start Docker Desktop using the WSL 2
  backend, complete its first-run prompts, and reopen PowerShell to verify
  `docker version` and `docker compose version`. See the
  [Docker Desktop Windows instructions](https://docs.docker.com/desktop/setup/install/windows-install/)
  and [Microsoft WSL commands](https://learn.microsoft.com/en-us/windows/wsl/basic-commands).
- **A host port is busy.** Pick an unused port in `POSTGRES_PORT` or `REDIS_PORT`
  in `infra/docker/.env` and update the matching URL in `apps/backend/.env`.
  Rerun `pnpm dev:infra`.
- **PostgreSQL rejects the password after an env edit.** The image applies
  its initialization credentials only when the volume is empty. Restore the
  credentials used at first startup, or explicitly change the existing database
  role's password before updating the local connection URL.
- **A service is unhealthy.** Use `pnpm infra:ps` and `pnpm infra:logs` to
  inspect status and startup messages.
- **Dependency installation cannot reach the registry.** Verify shell access to
  the npm registry and retry the frozen install. The Prisma engine dependency
  may also fetch binaries from Prisma's distribution service.

## Phase 0 verification

Phase 0 was verified on Windows 11 with Docker Desktop 4.99.0, WSL 2, Docker
Engine 29.9.3, and Compose 5.7.0. Both services passed their health and host
connectivity checks. A temporary PostgreSQL record and an expiring Redis key
survived `docker compose restart postgres redis` on the same named volumes.
Both probes were removed after verification.

## Next phase

Phase 0 is complete. Phase 1 can scaffold the NestJS backend (API and worker
entrypoints) and the three Next.js apps in their registered workspaces. Add application
scripts and runner configuration with the first source files, then implement the
reviewed Prisma schema and migrations.
