# ChatWeb Backend

Spring Boot 3.5 REST API and STOMP WebSocket server for ChatWeb.

## Stack

- **Java 21** & **Spring Boot 3.5**
- **Spring Security** + **JWT (`jjwt`)**
- **Spring Data JPA** (**PostgreSQL** in production, **H2** in tests)
- **Spring WebSocket** (STOMP over SockJS)
- **Spring Mail** (password recovery)

## Running Locally

Copy `.env.example` or export the required variables and start the server:

```sh
export JWT_SECRET=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=
export DB_PASSWORD=postgres
./mvnw spring-boot:run
```

Run tests:

```sh
./mvnw test
```

## REST Endpoints

### Health & Authentication

- `GET /health` — Service health check (`{"status":"ok"}`).
- `POST /auth/register` — Create an account (`{username, email, password}`) and return a JWT.
- `POST /auth/login` — Authenticate (`{email, password}`) and return a JWT.
- `POST /auth/forgot-password` — Request a 15-minute password reset link (`{email}`).
- `POST /auth/reset-password` — Set a new password (`{token, newPassword}`).

### User Profile (`Authorization: Bearer <token>`)

- `GET /api/user/profile` — Get current user profile.
- `PATCH /api/user/profile` — Update username/description (`{username, description}`) and return `{user, token}`.
- `POST /api/user/password` — Change password (`{currentPassword, newPassword}`).
- `POST /api/user/avatar` — Upload profile image (`multipart/form-data`, field `avatar`, PNG/JPG/WebP up to 5 MB).

### Friends & Invitations (`Authorization: Bearer <token>`)

- `GET /api/user-friends` — List friends with `lastMessage`, `lastMessageAt`, `unread` count, and `online` status.
- `DELETE /api/user-friends/{friendId}` — Remove friendship by user ID.
- `POST /api/friends/request` — Send a friend invitation by email (`{toEmail}`).
- `GET /api/friends/requests/pending` — List incoming pending friend requests.
- `GET /api/friends/requests/sent` — List outgoing pending friend requests.
- `POST /api/friends/request/{requestId}/accept` — Accept an incoming friend request.
- `POST /api/friends/request/{requestId}/reject` — Reject an incoming friend request.
- `DELETE /api/friends/request/{requestId}` — Cancel an outgoing pending friend request.

### Messages (`Authorization: Bearer <token>`)

- `GET /api/messages/history?friendUsername=<username>` — Fetch conversation history with a friend.
- `PATCH /api/messages/{messageId}` — Edit a sent message (`{content}`).
- `DELETE /api/messages/{messageId}` — Delete a sent message.
- `POST /api/messages/read?friendId=<uuid>` — Mark unread messages from `friendId` as read.

## WebSocket (STOMP)

- **Endpoint:** `/ws?token=<jwt>` (SockJS enabled; principal is bound to the authenticated user's UUID).
- **Client → Server:**
  - `/app/chat/send` — `{receiverUsername, content, clientMessageId}`
  - `/app/chat/typing` — `{receiverUsername, typing}`
- **Server → Client (user destinations):**
  - `/user/queue/messages` — Newly persisted `MessageDTO` (sent to receiver and echoed to sender with `clientMessageId`).
  - `/user/queue/events` — Real-time events (`type`: `edited`, `deleted`, `read`, `typing`, `presence`, `friend-request`, `friend-request-cancelled`, `friend-accepted`).
