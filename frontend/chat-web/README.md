# ChatWeb Frontend

React 19, TypeScript, and Vite client for ChatWeb.

## Development

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open `http://localhost:5173`. In development, Vite proxies `/auth`, `/api`, `/ws`, and `/uploads` to `http://localhost:8080`.

The `/demo` route runs entirely in the browser using `localStorage` without requiring the backend.

## Routes

- `/` — Product landing page
- `/auth/login`, `/auth/register` — Sign in and account creation
- `/auth/forgot-password`, `/auth/reset-password?token=…` — Password recovery
- `/app` — Authenticated workspace
- `/demo` — Interactive local demo

## Features

- Light and dark themes (`data-theme`)
- Conversation search, unread filter, and in-chat message search with match navigation
- Real-time messaging over STOMP/SockJS with optimistic send reconciliation
- Message editing (edit button or `ArrowUp` from an empty composer) and deletion
- Read receipts (`✓` sent, `✓✓` read), live typing indicator, and online presence dots
- Incoming and sent friend request management with live notifications
- Profile editing, avatar upload, and password update

## Scripts

```sh
npm run lint     # ESLint + TypeScript checks
npm test         # Node test runner for message reconciliation utilities
npm run build    # Type-check and build production bundle into dist/
npm run preview  # Preview production build locally
```
