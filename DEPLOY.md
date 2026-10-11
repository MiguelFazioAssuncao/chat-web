# Render + Vercel

## Render

Importe o repositório como Blueprint usando `render.yaml`. Docker utiliza Java 21; health check: `/health`. O Blueprint cria API e PostgreSQL gratuitos e gera o segredo JWT.

Defina `FRONTEND_URL` e `ALLOWED_ORIGINS` com a URL HTTPS definitiva da Vercel, sem barra final. `ALLOWED_ORIGIN_PATTERNS` cobre localhost, loopback e as URLs de preview da Vercel para este projeto. Múltiplos valores: separados por vírgula. Configure `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD` e `MAIL_PORT` (padrão 587). O Render gratuito restringe portas SMTP: recuperação de senha depende de um provedor acessível no plano escolhido.

O PostgreSQL gratuito expira em 30 dias. O serviço gratuito suspende por inatividade. Avatares ficam em arquivos locais e podem desaparecer após reinício/deploy. Para operação permanente, use banco e armazenamento persistentes. Contas e mensagens ficam no PostgreSQL.

## Vercel

Importe o repositório com Root Directory `frontend/chat-web` e framework Vite. Defina `VITE_API_URL=https://SEU-SERVICO.onrender.com` em Production antes do build. Essa variável é pública: não coloque segredos nela. `vercel.json` configura build e rotas SPA.

Depois de publicar, atualize `FRONTEND_URL` e `ALLOWED_ORIGINS` no Render com a URL definitiva da Vercel. Se mudar a URL da API, atualize `VITE_API_URL` e publique novamente.

## Verificação

Abra `/health` na API e confirme status ok. Abra diretamente `/auth/login` na Vercel. Cadastre duas contas e teste mensagens em duas sessões. Teste recuperação com SMTP configurado.

## Local

As credenciais locais anteriores foram preservadas no arquivo ignorado `backend/chatweb/src/main/resources/application-local.properties`. Execute com `SPRING_CONFIG_ADDITIONAL_LOCATION=file:./src/main/resources/application-local.properties`. Esse arquivo está excluído do Docker e não deve ser enviado ao Git.
