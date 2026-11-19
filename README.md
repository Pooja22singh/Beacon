# Beacon

A customer support chat agent. Users sign in with Google, then chat with an assistant that can
answer policy questions (RAG), look up their orders and open support tickets.

**Live demo:** _add the deployed URL here_

## How it works

```
Browser (React)
   |  HTTPS, httpOnly session cookie
   v
Nginx  ── serves the built UI, proxies /chat and /auth
   |  round robin
   v
Backend x2 (Express)  ── Google sign-in, rate limit, agent loop, MCP client
   |  Streamable HTTP + bearer token, private network
   v
MCP server  ── tools: search_policies, get_order, list_orders, create_ticket
   |
   v
Postgres + pgvector (Neon)
```

1. The user signs in with Google. The backend verifies the Google ID token (issuer, signature and
   audience), then sets a signed session cookie (JWT, httpOnly, SameSite=Lax, 7 days).
2. `POST /chat` sends the conversation to the agent loop. The model (Gemini) decides whether to call
   a tool. Tool calls go to the MCP server, results go back to the model, up to 5 steps per request.
3. `search_policies` embeds the question and runs a vector similarity search over policy documents
   stored in Postgres with pgvector (768 dimensions).
4. Order and ticket tools only see the signed-in user's data. The user id comes from the verified
   session, never from the model or the request body.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Node 26, Express 5, TypeScript, Zod |
| Tools | Model Context Protocol (TypeScript SDK), Streamable HTTP transport |
| Model | Gemini for chat, `gemini-embedding-001` for embeddings |
| Data | Postgres with pgvector on Neon |
| Delivery | Docker (multi-stage), Docker Compose, Nginx, GitHub Actions |

## Security

- Google ID token audience is checked against this app's client id. Missing config stops the server
  at startup instead of running unprotected.
- Session cookie is `httpOnly`, `SameSite=Lax` and `Secure` in production.
- The MCP server is not exposed publicly. It sits on a private Docker network and requires a bearer
  token, compared in constant time. The deployment uses its own token, never the local one.
- Rate limit of 10 chat requests per minute per user id (not per IP, so shared networks are fair).
- Request validation with Zod: 1 to 50 messages, 1 to 2000 characters each. Nginx also caps body size.
- Hard 30 second timeout on a chat request (HTTP 504), and at most 5 tool steps per request.
- Containers run as a non-root user. Images contain no `.env` files or secrets.

## Reliability and scaling

- The backend is stateless (the session lives in a signed cookie), so copies can be added behind
  Nginx. Compose runs two. If one stops, Nginx sends traffic to the other.
- `/health` is a liveness check. `/ready` checks the database and the MCP link.
- On `SIGTERM` each service stops accepting requests, finishes in-flight ones and closes its
  connections, so deploys do not drop chats.
- Known limits and next steps: chat history is sent by the client on every request (server side
  history would allow summarising and audit), the rate limit store is in memory per copy (move it to
  Redis to enforce one global limit), and the MCP bearer token is static (short-lived service tokens
  would be stronger).

## Run it locally

Requirements: Node 26, pnpm, a Postgres database with the pgvector extension (Neon works), a Gemini
API key and a Google OAuth client id.

Create `backend/.env`, `mcp-server/.env` and `frontend/.env` from the table below, then in three
terminals:

```bash
cd mcp-server && pnpm install && pnpm seed && pnpm dev:http
cd backend && pnpm install && pnpm dev
cd frontend && pnpm install && pnpm dev
```

Open the URL Vite prints. Add that origin to the Google OAuth client's authorized JavaScript origins.

## Run with Docker

```bash
docker compose up --build
```

The app is served on `http://localhost:8080` (change with `WEB_PORT`). Only Nginx is published. For
Google sign-in, add `http://localhost:8080` to the OAuth client's authorized origins. The Google
client id is read at build time, so set `VITE_GOOGLE_CLIENT_ID` in your shell before building.

## Deploy

Pushes to `main` run CI, then build three images and publish them to GitHub Container Registry
(`beacon-backend`, `beacon-mcp`, `beacon-web`). The server never builds, it only pulls.

On a Linux server with Docker, from the `deploy/` folder:

```bash
cp backend.env.example backend.env   # fill in real values, use a NEW MCP_TOKEN
cp mcp.env.example mcp.env           # same MCP_TOKEN as backend.env
export SITE_ADDRESS=your-hostname    # Caddy gets the HTTPS certificate for it
docker compose -f docker-compose.prod.yml up -d
```

Update to a new release with `docker compose -f docker-compose.prod.yml pull` then `up -d`.
Images are tagged `latest` and with the commit SHA, so a bad release can be rolled back by setting `TAG`.
The production compose file runs Caddy (HTTPS) in front of Nginx, two backend copies and the private MCP service.

## Environment variables

| Service | Variable | Purpose |
|---|---|---|
| backend | `GOOGLE_CLIENT_ID` | Audience for Google token verification |
| backend | `SESSION_SECRET` | Signs the session cookie |
| backend | `GEMINI_API_KEY` | Chat model |
| backend | `DATABASE_URL` | Postgres connection |
| backend | `MCP_URL`, `MCP_TOKEN` | MCP server address and bearer token |
| backend | `PORT` | Optional, defaults to 3000 |
| mcp-server | `DATABASE_URL`, `GEMINI_API_KEY` | Data and embeddings |
| mcp-server | `MCP_TOKEN` | Must match the backend's token |
| mcp-server | `PORT` | Optional, defaults to 4000 |
| frontend (build time) | `VITE_GOOGLE_CLIENT_ID` | Public Google client id |

## Scripts

| Where | Command | What it does |
|---|---|---|
| backend, mcp-server | `pnpm typecheck` | Strict TypeScript check, no output |
| backend, mcp-server | `pnpm build` | Compile to `dist/` |
| mcp-server | `pnpm seed` | Embed and load the policy documents |
| frontend | `pnpm lint`, `pnpm build` | Lint, type check and bundle |

CI runs the checks and builds for all three packages, then builds the Docker images.

## Design decisions

- **MCP between the agent and the tools** keeps tools as a separate service with its own auth, so
  they can change and scale without touching the agent.
- **Streamable HTTP, not stdio**, because the tools run in their own container.
- **Compiled JavaScript in production** (`tsc`), `tsx` only in development. `tsx` does not type
  check, so `tsc` runs in CI to fail on type errors.
- **Native ESM**, so relative imports carry a `.js` extension.
