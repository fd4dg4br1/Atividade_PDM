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
