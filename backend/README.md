# ChatWeb Backend

API and WebSocket server for the ChatWeb project, built with Java and Spring Boot. This backend provides JWT authentication, real-time chat, PostgreSQL integration, and email delivery.

## Technologies Used

- **Java 21**
- **Spring Boot**
- **Spring Security**
- **Spring Data JPA**
- **WebSocket (STOMP)**
- **JWT**
- **PostgreSQL**
- **Maven**

## Folder Structure

```
chatweb/
├── src/
│   ├── main/
│   │   ├── java/com/miguelfazio/chatweb/   # Main source
│   │   └── resources/                      # Configuration
│   └── test/                               # Tests
├── pom.xml                                 # Maven dependencies
```

## Prerequisites
- **Java 21** installed and available on `PATH`
- **PostgreSQL** running locally or reachable from the backend

## Configuration
- Edit `src/main/resources/application.properties` to match your environment.
- Update database connection settings (`spring.datasource.*`).
- Configure JWT secrets and mail credentials.
- Do not commit real secrets to source control.

## Installation and Run

1. **Configure the PostgreSQL database** and update `src/main/resources/application.properties`.
2. **Install dependencies:**
	```sh
	./mvnw install
	```
3. **Run the server:**
	```sh
	./mvnw spring-boot:run
	```
4. The backend will be available at `http://localhost:8080`.

## Features

- JWT authentication (login, register, password recovery)
- Real-time chat via WebSocket
- User and friend management
- Email delivery for password recovery

## Endpoint Testing (curl)
Base URL: `http://localhost:8080`

### Auth

Register:
```sh
curl -X POST http://localhost:8080/auth/register \
	-H "Content-Type: application/json" \
	-d '{"username":"demo","email":"demo@example.com","password":"Password123"}'
```

Login:
```sh
curl -X POST http://localhost:8080/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"demo@example.com","password":"Password123"}'
```

Forgot password:
```sh
curl -X POST http://localhost:8080/auth/forgot-password \
	-H "Content-Type: application/json" \
	-d '{"email":"demo@example.com"}'
```

Reset password:
```sh
curl -X POST http://localhost:8080/auth/reset-password \
	-H "Content-Type: application/json" \
	-d '{"token":"RESET_TOKEN","newPassword":"NewPassword123"}'
```

### User Profile (requires JWT)

Get profile:
```sh
curl -X GET http://localhost:8080/api/user/profile \
	-H "Authorization: Bearer YOUR_JWT"
```

Update profile:
```sh
curl -X PATCH http://localhost:8080/api/user/profile \
	-H "Authorization: Bearer YOUR_JWT" \
	-H "Content-Type: application/json" \
	-d '{"username":"demo","bio":"Hello","status":"ONLINE"}'
```

Update avatar:
```sh
curl -X POST http://localhost:8080/api/user/avatar \
	-H "Authorization: Bearer YOUR_JWT" \
	-F "avatar=@/path/to/avatar.png"
```

### Friends and Requests (requires JWT)

List friends:
```sh
curl -X GET "http://localhost:8080/api/friends?userId=USER_UUID" \
	-H "Authorization: Bearer YOUR_JWT"
```

Send friend request:
```sh
curl -X POST http://localhost:8080/api/friends/request \
	-H "Authorization: Bearer YOUR_JWT" \
	-H "Content-Type: application/json" \
	-d '{"fromUserId":"USER_UUID","toEmail":"friend@example.com"}'
```

Accept request:
```sh
curl -X POST "http://localhost:8080/api/friends/request/REQUEST_ID/accept?userId=USER_UUID" \
	-H "Authorization: Bearer YOUR_JWT"
```

Reject request:
```sh
curl -X POST "http://localhost:8080/api/friends/request/REQUEST_ID/reject?userId=USER_UUID" \
	-H "Authorization: Bearer YOUR_JWT"
```

Pending requests:
```sh
curl -X GET "http://localhost:8080/api/friends/requests/pending?userId=USER_UUID" \
	-H "Authorization: Bearer YOUR_JWT"
```

Remove friend by username:
```sh
curl -X DELETE http://localhost:8080/api/user-friends/remove \
	-H "Authorization: Bearer YOUR_JWT" \
	-H "Content-Type: application/json" \
	-d '{"targetUsername":"friend"}'
```

Remove friend by ID:
```sh
curl -X DELETE http://localhost:8080/api/user-friends/FRIEND_UUID \
	-H "Authorization: Bearer YOUR_JWT"
```

### Messages (requires JWT)

Message history:
```sh
curl -X GET "http://localhost:8080/api/messages/history?userId=USER_UUID&friendUsername=friend" \
	-H "Authorization: Bearer YOUR_JWT"
```

Delete message:
```sh
curl -X DELETE http://localhost:8080/api/messages/MESSAGE_UUID \
	-H "Authorization: Bearer YOUR_JWT"
```

## WebSocket Notes
- STOMP endpoints and broker configuration are defined in the WebSocket configuration classes.
- Ensure the frontend WebSocket URL matches the backend host and port.

## Useful Scripts

- `./mvnw install` — Install dependencies
- `./mvnw spring-boot:run` — Run the server
- `./mvnw test` — Run tests

## Useful Links

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [WebSocket Documentation](https://spring.io/guides/gs/messaging-stomp-websocket/)
- [JPA Documentation](https://spring.io/projects/spring-data-jpa)

## Frontend Integration
See the [frontend README](../frontend/README.md) for details about the web UI and integration.

## Troubleshooting
- **Database connection errors:** verify PostgreSQL is running and `spring.datasource.*` is correct.
- **Mail errors:** validate SMTP credentials and allow SMTP access in your provider.
- **JWT errors:** ensure JWT secrets are set and consistent across runs.

---

> For questions or suggestions, open an issue or contribute with a pull request!
