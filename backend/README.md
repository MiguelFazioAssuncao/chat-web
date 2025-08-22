# ChatWeb Backend

API e servidor WebSocket do projeto ChatWeb, desenvolvido com Java e Spring Boot. Este backend oferece autenticação JWT, chat em tempo real, integração com banco de dados PostgreSQL e envio de e-mails.

## Tecnologias Utilizadas

- **Java 21**
- **Spring Boot**
- **Spring Security**
- **Spring Data JPA**
- **WebSocket (STOMP)**
- **JWT**
- **PostgreSQL**
- **Maven**

## Estrutura de Pastas

```
chatweb/
├── src/
│   ├── main/
│   │   ├── java/com/miguelfazio/chatweb/   # Código principal
│   │   └── resources/                      # Configurações
│   └── test/                               # Testes
├── pom.xml                                 # Dependências Maven
```

## Instalação e Execução

1. **Configure o banco de dados PostgreSQL** e ajuste o arquivo `src/main/resources/application.properties`.
2. **Instale as dependências:**
	```sh
	./mvnw install
	```
3. **Execute o servidor:**
	```sh
	./mvnw spring-boot:run
	```
4. O backend estará disponível em `http://localhost:8080`.

## Funcionalidades

- Autenticação JWT (login, registro, recuperação de senha)
- Chat em tempo real via WebSocket
- Gerenciamento de usuários e amigos
- Envio de e-mails para recuperação de senha

## Scripts Úteis

- `./mvnw install` — Instala dependências
- `./mvnw spring-boot:run` — Executa o servidor
- `./mvnw test` — Executa os testes

## Links Úteis

- [Documentação Spring Boot](https://spring.io/projects/spring-boot)
- [Documentação Spring Security](https://spring.io/projects/spring-security)
- [Documentação WebSocket](https://spring.io/guides/gs/messaging-stomp-websocket/)
- [Documentação JPA](https://spring.io/projects/spring-data-jpa)

## Integração Frontend
Consulte o [README do frontend](../frontend/README.md) para detalhes sobre a interface web e integração.

---

> Para dúvidas ou sugestões, abra uma issue ou contribua com um pull request!
