# Atividade_PDM

Projeto da atividade de gestao financeira com frontend React Native/Expo e backend Node + Prisma + Postgres.

## Frontend

```bash
cd gestao-financeira-mobile
npm install
npm run start:tunnel
```

## Backend

Subir API e Postgres:

```bash
docker compose up --build
```

A API ficara disponivel em:

```text
http://localhost:3000
```

Health-check:

```bash
curl http://localhost:3000/
```

Resposta esperada:

```json
{ "ok": true, "name": "gestao-financeira-api" }
```

Login de teste:

```text
Email: aluno@pdm.com
Senha: 123456
```

As rotas de categorias e transacoes exigem token JWT retornado em `POST /auth/login`.

## Banco

O Postgres roda com:

- Host local: `localhost`
- Porta: `5432`
- Database: `gestao_financeira`
- Usuario: `postgres`
- Senha: `postgres`

Dentro do Docker, a API usa:

```text
postgresql://postgres:postgres@postgres:5432/gestao_financeira?schema=public
```

O container da API aplica as migrations versionadas do Prisma antes de rodar o seed.
