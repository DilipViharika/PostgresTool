# FATHOM

FATHOM is a multi-tenant database monitoring and administration platform. It ships
a unified operator UI over PostgreSQL, MySQL/MariaDB, and MongoDB with live
metrics, alerting, schema exploration, log analysis, and a lightweight SDK that
customer apps can use to stream their own API logs, errors, and audit events
into the same dashboard.

## Repository layout

```
backend/    Node.js (Express 5) control-plane API and WebSocket server.
frontend/   React 19 + Vite SPA.
api/        Vercel serverless entrypoint that re-exports backend/server.js.
python/     FastAPI analytics and ML worker.
sdk/        Zero-dep JS client library (@fathom/sdk) for customer apps.
shared/     Cross-workspace types and contracts.
demo/       Stand-alone demo app used by docs and screenshots.
```

This is an npm workspaces monorepo; `package.json` declares `frontend`,
`backend`, and `shared/*` as workspaces. Turbo is used for cross-workspace
scripts.

## Requirements

- Node.js 18 or newer (Node 20 recommended; see `engines` in `sdk/package.json`).
- Python 3.11+ for the analytics worker (`python/pyproject.toml`).
- A PostgreSQL 14+ database for the FATHOM control plane (users, sessions,
  connection metadata, audit log, feedback, etc.). Neon, Supabase, or any
  standard Postgres work.

## Environment

The backend refuses to start unless the following secrets are configured.
Generate each one with a separate random source.

| Name                           | Required | Purpose                                                                                                     |
| ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                 | yes      | Connection string for the FATHOM control-plane DB.                                                          |
| `JWT_SECRET`                   | yes      | Signs session JWTs. At least 32 bytes of entropy.                                                           |
| `ENCRYPTION_KEY`               | yes      | AES-256-GCM key used to encrypt connection secrets at rest. Must NOT equal `JWT_SECRET`.                    |
| `JWT_AUDIENCE`                 | no       | JWT `aud` claim (default `fathom-api`).                                                                     |
| `JWT_ISSUER`                   | no       | JWT `iss` claim (default `fathom-auth`).                                                                    |
| `CRON_SECRET`                  | prod     | Bearer credential required by `/api/alerts/run-monitoring`. If unset, the cron endpoint is disabled.        |
| `FATHOM_TLS_ALLOW_SELF_SIGNED` | no       | Set to `true` to accept self-signed TLS certs on user-added DB connections (default: strict in production). |
| `FATHOM_TLS_CA_CERT`           | no       | Extra CA bundle (PEM) added to the trust store for DB TLS.                                                  |

Generate secrets with:

```
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

## Bootstrap

```
npm ci
npm run migrate --workspace=backend   # creates control-plane schema
npm run dev                           # runs frontend + backend
```

The first migration run creates an `admin` user with a randomly generated
password, prints it ONCE to stdout, and sets `must_change_password=true`.
Record the password immediately — it is not stored anywhere else. You can
override it for automated CI setups via `FATHOM_INITIAL_ADMIN_PASSWORD`.

## Deployment

The repository is set up for split deployment:

- **Frontend + serverless API** → Vercel (`vercel.json`, `api/index.js`).
- **Long-lived backend + WebSocket** → Railway, Fly.io, Render, or any Node host.

`vercel.json` pins `installCommand` to `npm ci` (audit SEC-09) and the
serverless function `maxDuration` to 30 s (audit PRF-04).

## Security

FATHOM ships with custom Semgrep and Gitleaks rules (`.semgrep/fathom-rules.yml`,
`.gitleaks.toml`
