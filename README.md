# ChatWeb

Real-time direct messaging web application built with **Spring Boot 3 (Java 21)** and **React 19 (TypeScript, Vite)**.

## Features

- **Authentication & Account Security:** JWT authentication, password recovery via email, and in-app password updates.
- **Real-Time Messaging (STOMP over WebSocket / SockJS):** Instant delivery with optimistic UI reconciliation (`clientMessageId`), message editing, real-time deletion, read receipts (`readAt`), and typing indicators.
- **Presence & Connections:** Live online status tracking across active WebSocket sessions, friend invitations by email, incoming/sent request management, and unread counters per conversation.
- **Interactive Demo Mode (`/demo`):** Full client-side sandbox persisted in `localStorage` that runs without a backend connection.

## Repository Structure

```text
chat-web/
├── backend/chatweb/      # Spring Boot 3.5 API, WebSocket broker, JPA entities
├── frontend/chat-web/    # React 19 + TypeScript + Vite SPA
├── docker-compose.yml    # Local PostgreSQL 16 instance
└── render.yaml           # Render Blueprint for API and database deployment
```

## Running Locally

### Prerequisites

- **Java 21**
- **Node.js 20+** and **npm**
- **PostgreSQL 14+** (or Docker to run `docker-compose.yml`)

### 1. Database

Start a local PostgreSQL container:

```sh
docker compose up -d
```

### 2. Backend (`http://localhost:8080`)

```sh
cd backend/chatweb
export JWT_SECRET=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=
export DB_PASSWORD=postgres
./mvnw spring-boot:run
```

See [backend/README.md](backend/README.md) for REST endpoints and WebSocket destinations.

### 3. Frontend (`http://localhost:5173`)

```sh
cd frontend/chat-web
npm install
npm run dev
```

Vite proxies `/auth`, `/api`, `/ws`, and `/uploads` to `http://localhost:8080` in development.

## Testing

Both suites run without requiring a running PostgreSQL instance (backend tests use an in-memory H2 database in PostgreSQL compatibility mode):

```sh
# Backend
cd backend/chatweb && ./mvnw test

# Frontend
cd frontend/chat-web && npm run lint && npm test && npm run build
```

## Environment Variables

### Backend (`backend/chatweb`)

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP server port | `8080` |
| `DATABASE_URL` | Full connection URL (`jdbc:postgresql://...` or `postgres://user:pass@host:port/db`) | — |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | Individual PostgreSQL host, port, and database name (used when `DATABASE_URL` is unset) | `localhost` / `5432` / `chatweb` |
| `DB_USER` / `DB_PASSWORD` | PostgreSQL credentials | `postgres` / empty |
| `JWT_SECRET` | Base64-encoded 256-bit key (`openssl rand -base64 32`) | *(required)* |
| `FRONTEND_URL` | Public frontend URL used in password recovery links | `http://localhost:5173` |
| `ALLOWED_ORIGINS` | Comma-separated exact CORS origins | `http://localhost:5173` |
| `ALLOWED_ORIGIN_PATTERNS` | Comma-separated CORS origin patterns | Localhost + Vercel preview/prod |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` | SMTP configuration for password reset emails | `localhost` / `587` |

### Frontend (`frontend/chat-web`)

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_URL` | Backend base URL in production (e.g. `https://chatweb-api.onrender.com`) | Same origin / Vite proxy |

## Deployment (Render + Vercel)

- **Backend on Render:** Import the repository as a Blueprint (`render.yaml`) or configure a Docker web service with root directory `backend/chatweb` and health check path `/health`. Set `FRONTEND_URL` and `ALLOWED_ORIGINS` to your production Vercel domain.
- **Frontend on Vercel:** Import the repository with root directory `frontend/chat-web`, framework preset `Vite`, and set `VITE_API_URL` to the Render service URL before building.

### Production Notes

- **Cold Starts:** Render's free web service spins down after inactivity and can take 30–90 seconds to wake up. The login/register screen pings `/health` on mount and notifies the user while the instance wakes up.
- **Database Retention:** Render's free PostgreSQL tier expires 30 days after creation. For a permanent free database, create a PostgreSQL instance on Neon or Supabase and set `DATABASE_URL` (`postgres://user:pass@host/db` or `jdbc:postgresql://...`) in the Render service environment variables.
- **Avatar Storage:** Uploaded avatars are stored under `uploads/avatars/` on the container filesystem, which is ephemeral on free instances across redeploys.
