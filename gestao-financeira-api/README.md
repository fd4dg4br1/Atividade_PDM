# Gestao Financeira API

API Node com Express, Prisma, Zod e Postgres.

## Rodar com Docker

Na raiz do projeto:

```bash
docker compose up --build
```

O container executa:

```bash
npx prisma db push
npx prisma db seed
npm run dev
```

## Rodar localmente

```bash
npm install
npm run prisma:generate
npm run dev
```

Configure o `.env` usando `.env.example`.

## Rotas iniciais

- `GET /`
- `GET /categories`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`
- `GET /transactions`
- `POST /transactions`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`
