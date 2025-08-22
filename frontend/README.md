# ChatWeb Frontend

Interface web do projeto ChatWeb, desenvolvida com React, TypeScript e Vite. Este frontend se conecta ao backend via WebSocket e REST API, oferecendo autenticação, chat em tempo real e uma experiência moderna.

## Tecnologias Utilizadas

- **React**
- **TypeScript**
- **Vite**
- **TailwindCSS**
- **React Router DOM**
- **Axios**
- **WebSocket (STOMP/SockJS)**

## Estrutura de Pastas

```
src/
├── assets/           # Imagens e arquivos estáticos
├── components/       # Componentes reutilizáveis
│   ├── app/          # Componentes do chat
│   └── auth/         # Componentes de autenticação
├── context/          # Contextos globais (ex: Auth)
├── pages/            # Páginas principais
├── routes/           # Rotas protegidas e customizadas
├── types/            # Tipos e definições
├── utils/            # Funções utilitárias
└── App.tsx           # Componente principal
```

## Instalação e Execução

1. **Instale as dependências:**
	```sh
	npm install
	```
2. **Execute o projeto em modo desenvolvimento:**
	```sh
	npm run dev
	```
3. O frontend estará disponível em `http://localhost:5173` (por padrão).

> **Obs:** Certifique-se de que o backend está rodando em `http://localhost:8080` para integração completa.

## Funcionalidades

- Autenticação JWT (login, registro, recuperação de senha)
- Chat em tempo real via WebSocket
- Interface responsiva e moderna
- Gerenciamento de usuários e amigos

## Scripts Úteis

- `npm run dev` — Executa o projeto em modo desenvolvimento
- `npm run build` — Gera build de produção
- `npm run lint` — Executa o linter
- `npm run preview` — Visualiza o build localmente

## Links Úteis

- [Documentação do Vite](https://vitejs.dev/)
- [Documentação do React](https://react.dev/)
- [Documentação do TailwindCSS](https://tailwindcss.com/)

## Integração Backend
Consulte o [README do backend](../backend/README.md) para detalhes sobre a API e WebSocket.

---

> Para dúvidas ou sugestões, abra uma issue ou contribua com um pull request!
