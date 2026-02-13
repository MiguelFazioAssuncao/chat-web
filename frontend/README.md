# ChatWeb Frontend

Web interface for the ChatWeb project, built with React, TypeScript, and Vite. This frontend connects to the backend via WebSocket and REST API, offering authentication, real-time chat, and a modern experience.

## Technologies Used

- **React**
- **TypeScript**
- **Vite**
- **TailwindCSS**
- **React Router DOM**
- **Axios**
- **WebSocket (STOMP/SockJS)**

## Folder Structure

```
src/
├── assets/           # Images and static files
├── components/       # Reusable components
│   ├── app/          # Chat components
│   └── auth/         # Authentication components
├── context/          # Global contexts (e.g., Auth)
├── pages/            # Main pages
├── routes/           # Protected and custom routes
├── types/            # Types and definitions
├── utils/            # Utility functions
└── App.tsx           # Main component
```

## Prerequisites
- **Node.js 18+** and **npm**
- Backend running locally for full functionality

## Configuration
- If the backend runs on a different host or port, update API and WebSocket endpoints in the frontend configuration.
- Search in `src/` for axios and WebSocket settings to adjust base URLs as needed.

## Installation and Run

1. **Install dependencies:**
	```sh
	npm install
	```
2. **Run the project in development mode:**
	```sh
	npm run dev
	```
3. The frontend will be available at `http://localhost:5173` (by default).

> **Note:** Make sure the backend is running at `http://localhost:8080` for full integration.

## Features

- JWT authentication (login, register, password recovery)
- Real-time chat via WebSocket
- Responsive and modern UI
- User and friend management

## Development Tips
- Keep the backend running while developing the frontend to avoid API and WebSocket errors.
- Use the browser console and network tab to inspect REST and WebSocket traffic.

## Useful Scripts

- `npm run dev` — Run the project in development mode
- `npm run build` — Generate production build
- `npm run lint` — Run the linter
- `npm run preview` — Preview the local build

## Useful Links

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

## Backend Integration
See the [backend README](../backend/README.md) for details about the API and WebSocket.

## Troubleshooting
- **CORS errors:** confirm backend CORS settings allow the frontend origin.
- **WebSocket connection issues:** verify host/port and that the backend is running.
- **Build errors:** remove `node_modules`, reinstall, and retry.

---

> For questions or suggestions, open an issue or contribute with a pull request!
