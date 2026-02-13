# ChatWeb Monorepo

Welcome to the main repository for **ChatWeb**, a monorepo project that integrates backend and frontend for a modern, secure chat system.

## Project Structure

```
chatweb/
├── backend/
│   └── chatweb/ (Spring Boot, Java)
├── frontend/
│   └── chat-web/ (React, TypeScript, Vite)
└── README.md (this file)
```

## Technologies Used
- **Backend:** Java, Spring Boot, Spring Security, WebSocket, JPA, Maven
- **Frontend:** React, TypeScript, Vite
- **Monorepo:** Organized structure to support integrated development

## Overview Video
[Watch the project overview video](https://www.youtube.com/watch?v=SEU_VIDEO_AQUI)

## Documentation
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## Prerequisites
- **Java 21** (backend)
- **Node.js 18+** and **npm** (frontend)
- **PostgreSQL 14+** (database)

## How to Clone and Run

```sh
git clone https://github.com/MiguelFazioAssuncao/chat-web.git
```

## Quick Start
1. Start the backend (see [backend/README.md](backend/README.md)).
2. Start the frontend (see [frontend/README.md](frontend/README.md)).
3. Open the app in your browser after both services are running.

## Quick Structure
- `backend/chatweb/` - Server code, APIs, authentication, WebSocket
- `frontend/chat-web/` - Web UI, authentication, real-time messaging

## Configuration Notes
- Backend settings live in `backend/chatweb/src/main/resources/application.properties`.
- Update database, JWT, and mail settings for your environment.
- Avoid committing secrets. Use environment-specific values when running locally or in production.

## Development Tips
- Use separate terminals for backend and frontend.
- If ports are already in use, stop the conflicting process or update the port in the respective config.
- Keep backend running before launching the frontend for full functionality.

## About the Project
ChatWeb is a chat system with JWT authentication, user management, real-time messaging, and a modern interface. The goal is to demonstrate integration between modern backend and frontend technologies in a monorepo architecture.

---

> For questions, suggestions, or contributions, feel free to open an issue or pull request!
