# ChatWeb

Interface em React 19, TypeScript e Vite. Página inicial, autenticação, recuperação de senha e chat com mensagens em tempo real, perfis e convites de amizade.

## Executar

Requer Node.js 20.19+ ou 22.12+.

```sh
npm install
npm run dev
```

Abra `http://localhost:5173`. O backend Spring Boot deve rodar em `http://localhost:8080` para autenticação e conversas reais. O Vite encaminha `/auth`, `/api`, `/ws` e `/uploads` ao backend.

A rota `/demo` funciona sem backend. Seus contatos e mensagens são ilustrativos, e as alterações ficam no armazenamento local do navegador. Convites de demonstração não enviam e-mails nem criam amizades reais.

## Rotas

- `/`: apresentação do produto.
- `/auth/login`, `/auth/register`: acesso e cadastro.
- `/auth/forgot-password`, `/auth/reset-password?token=…`: recuperação.
- `/app`: chat autenticado.
- `/demo`: demonstração interativa.

## Experiência

Temas claro e escuro, navegação adaptada a celular, busca de contatos e mensagens, filtro de não lidas, rascunhos por conversa durante a sessão, seletor de emojis e mensagens com quebra de linha. Use Enter para enviar e Shift + Enter para inserir uma nova linha. Os diálogos usam o elemento nativo `dialog`, com foco contido e fechamento por Escape.

Uma conexão STOMP compartilha as atualizações entre lista e conversa. O backend confirma os envios com o ID persistido e o `clientMessageId`, evitando duplicação quando mensagens idênticas são enviadas em sequência. O frontend preserva atualizações recebidas durante o carregamento do histórico. Atualize frontend e backend juntos.

## Configuração e produção

Use `.env.example` como referência. Sem `VITE_API_URL`, as requisições usam a mesma origem. Para um backend separado, informe sua origem em `VITE_API_URL` e configure CORS no Spring Boot. Essa variável é pública: não inclua segredos.

```sh
npm test
npm run build
npm run preview
```

Sirva `dist/` com fallback de rotas para `index.html`. Em uma implantação de mesma origem, o servidor deve encaminhar `/auth`, `/api`, `/ws` e `/uploads` ao Spring Boot, incluindo o transporte WebSocket. A configuração de proxy do Vite vale somente durante desenvolvimento.

## Verificação

Os testes em `tests/messageUtils.test.mjs` validam a reconciliação de envios idênticos, redelivery, confirmação após histórico, preservação de mensagens durante requisições e remoção de mensagens antigas excluídas. Executam com o test runner do Node e o TypeScript já presente no projeto.

Os testes unitários do backend podem ser executados, sem PostgreSQL, com:

```sh
cd ../../backend/chatweb
bash ./mvnw -Dtest=ChatControllerTest,MessageServiceTest,UserServiceTest test
```

O teste `ChatwebApplicationTests` original carrega o contexto completo e depende da configuração de banco e dos serviços.
