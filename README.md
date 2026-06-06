# Atividade_PDM

Aplicacao de gestao financeira com frontend React Native/Expo e backend Node.js + Express + Prisma + Postgres.

## Roteiro para apresentar a atividade

### 1. Subir o backend e o banco

Na raiz do projeto:

```bash
docker compose up -d --build
```

Conferir se os containers estao rodando:

```bash
docker compose ps
```

Ver logs da API:

```bash
docker compose logs -f api
```

A API ficara em:

```text
http://localhost:3000
```

O Docker executa automaticamente:

```bash
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

### 2. Testar a API no Postman

Importe a collection versionada:

```text
gestao-financeira-api/postman/collection.json
```

Configure a variavel:

```text
baseUrl = http://localhost:3000
```

Usuario seedado para login:

```text
Email: aluno@pdm.com
Senha: 123456
```

As rotas de categorias e transacoes exigem token JWT. Primeiro execute o request `Login` da collection. Ele salva o token na variavel `authToken`.

### 3. Ordem dos testes no Postman

#### Health-check

```http
GET {{baseUrl}}/
```

Resposta esperada:

```json
{ "ok": true, "name": "gestao-financeira-api" }
```

#### Login

```http
POST {{baseUrl}}/auth/login
```

Body:

```json
{
  "email": "aluno@pdm.com",
  "password": "123456"
}
```

Resposta esperada: `200 OK` com `token` e `user`.

Use o token nas proximas requisicoes:

```text
Authorization: Bearer {{authToken}}
```

#### Listar categorias

```http
GET {{baseUrl}}/categories
```

Deve trazer as 5 categorias inseridas pelo seed. Copie o `id` da categoria `income` para criar uma transacao depois.

#### Criar categoria

```http
POST {{baseUrl}}/categories
```

Body:

```json
{
  "name": "health",
  "displayName": "Saúde",
  "icon": "favorite",
  "background": "#FFB6B6",
  "isIncome": false
}
```

Resposta esperada: `201 Created` com o objeto criado e o `id` gerado.

#### Atualizar categoria

```http
PUT {{baseUrl}}/categories/:id
```

Body:

```json
{ "displayName": "Saúde e Bem-estar" }
```

#### Excluir categoria

```http
DELETE {{baseUrl}}/categories/:id
```

Resposta esperada: `204 No Content`.

Teste tambem excluir uma categoria padrao, como `income`.

Resposta esperada:

```json
{ "error": "Categorias padrão não podem ser excluídas" }
```

#### Criar transacao

```http
POST {{baseUrl}}/transactions
```

Body usando o `id` da categoria `income`:

```json
{
  "description": "Salário de outubro",
  "value": 3500.50,
  "date": "2026-04-29",
  "categoryId": "COLE_AQUI_O_ID_DA_CATEGORIA"
}
```

Resposta esperada: `201 Created` com `category` aninhada.

#### Listar transacoes

```http
GET {{baseUrl}}/transactions
```

Deve listar a transacao criada com a categoria expandida.

Tambem pode testar filtro de mes/ano:

```http
GET {{baseUrl}}/transactions?month=4&year=2026
```

#### Excluir transacao

```http
DELETE {{baseUrl}}/transactions/:id
```

Resposta esperada: `204 No Content`.

#### Validar erros

```http
POST {{baseUrl}}/transactions
```

Body invalido:

```json
{ "description": "" }
```

Resposta esperada: `400 Bad Request` com:

```json
{
  "error": "Dados inválidos",
  "details": []
}
```

## Rodar o frontend

Antes de abrir no celular, confirme a URL da API no arquivo:

```text
gestao-financeira-mobile/.env
```

No celular com Expo Go, `localhost` aponta para o proprio celular. Use o IP da maquina na rede:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000
```

Entrar na pasta do app:

```bash
cd gestao-financeira-mobile
```

Instalar dependencias:

```bash
npm install
```

Rodar com tunnel:

```bash
npm run start:tunnel
```

Abrir o QR Code no Expo Go.

Login no app:

```text
Email: aluno@pdm.com
Senha: 123456
```

## Requisitos demonstrados no frontend

- Filtro de mes/ano nas telas de lista e resumo.
- Grafico de pizza na aba de resumo.
- Edicao e exclusao de transacoes por toque/toque longo e modal.
- Categorias customizadas alem das cinco fixas.
- Criacao, edicao e exclusao de categorias customizadas.
- Tela de login com validacao real pela API.
- Mensagem de boas-vindas com o nome do usuario autenticado.
- Dados salvos no Postgres via API, nao mais apenas em memoria.

## Requisitos demonstrados no backend

- Base Postgres para salvar despesas, receitas e categorias.
- Prisma com migration versionada.
- Seed com usuario e 5 categorias padrao.
- Rotas de categoria e transacao no servidor.
- Validacao no servidor com Zod.
- Autenticacao com token JWT.
- API Client HTTP no frontend.
- Arquivos `.env.example` e `.env.exemple`.
- Collection Postman versionada em `gestao-financeira-api/postman/collection.json`.

## Comandos uteis

Parar os containers:

```bash
docker compose down
```

Parar e apagar o volume local do banco:

```bash
docker compose down -v
```

Validar frontend:

```bash
cd gestao-financeira-mobile
npx tsc --noEmit
```

Validar backend:

```bash
cd gestao-financeira-api
npm run build
```
