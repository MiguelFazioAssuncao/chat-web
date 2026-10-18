# ChatWeb

Interface built with React 19, TypeScript, and Vite. Includes a landing page, authentication, password recovery, and chat with real-time messaging, profiles, and friend requests.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open `http://localhost:5173`. The Spring Boot backend must run at `http://localhost:8080` for authentication and live conversations. Vite forwards `/auth`, `/api`, `/ws`, and `/uploads` to the backend.

The `/demo` route works without a backend. Its contacts and messages are illustrative, and changes stay in the browser's local storage. Demo invitations do not send emails or create real friendships.

## Routes

- `/`: product introduction.
- `/auth/login`, `/auth/register`: login and registration.
- `/auth/forgot-password`, `/auth/reset-password?token=…`: password recovery.
- `/app`: authenticated chat.
- `/demo`: interactive demo.

## Experience

Light and dark themes, mobile navigation, contact and message search, an unread filter, per-conversation drafts during the session, an emoji picker, and multiline messages. Use Enter to send and Shift + Enter to insert a new line. Dialogs use the native `dialog` element, with focus trapping and Escape to close.

A single STOMP connection shares updates between the conversation list and the active conversation. The backend acknowledges sends with the persisted ID and `clientMessageId`, preventing duplication when identical messages are sent in sequence. The frontend preserves updates received while message history is loading. Update the frontend and backend together.

## Configuration and production

Use `.env.example` as a reference. Without `VITE_API_URL`, requests use the same origin. For a separate backend, set its origin in `VITE_API_URL` and configure CORS in Spring Boot. This variable is public: do not include secrets.

```sh
npm test
npm run build
npm run preview
```

Serve `dist/` with a route fallback to `index.html`. In a same-origin deployment, the server must forward `/auth`, `/api`, `/ws`, and `/uploads` to Spring Boot, including WebSocket transport. The Vite proxy configuration applies only during development.

## Verification

The tests in `tests/messageUtils.test.mjs` validate reconciliation of identical sends, redelivery, acknowledgments after history loads, preservation of messages during requests, and removal of older deleted messages. They run with the Node test runner and the TypeScript dependency already included in the project.

Backend unit tests can run without PostgreSQL:

```sh
cd ../../backend/chatweb
bash ./mvnw -Dtest=ChatControllerTest,MessageServiceTest,UserServiceTest test
```

The original `ChatwebApplicationTests` test loads the full application context and depends on the database and service configuration.
