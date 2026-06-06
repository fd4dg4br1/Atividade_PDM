import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';

import { authenticate, getJwtSecret } from './auth';
import { prisma } from './prisma';
import {
  createCategorySchema,
  createTransactionSchema,
  loginSchema,
  updateCategorySchema,
  updateTransactionSchema,
} from './schemas';

export const routes = Router();

function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function serializeTransaction(transaction: Prisma.TransactionGetPayload<{ include: { category: true } }>) {
  return {
    ...transaction,
    value: Number(transaction.value),
    date: transaction.date.toISOString().slice(0, 10),
  };
}

function validationError(error: ZodError) {
  return {
    error: 'Dados inválidos',
    details: error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  };
}

routes.get('/', (_request, response) => {
  response.json({ ok: true, name: 'gestao-financeira-api' });
});

routes.post('/auth/login', async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json(validationError(parsed.error));
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user) {
    response.status(401).json({ error: 'Email ou senha inválidos' });
    return;
  }

  const passwordMatches = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!passwordMatches) {
    response.status(401).json({ error: 'Email ou senha inválidos' });
    return;
  }

  const publicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };
  const token = jwt.sign(publicUser, getJwtSecret(), { expiresIn: '8h' });

  response.json({
    token,
    user: publicUser,
  });
});

routes.use(authenticate);

routes.get('/categories', async (_request, response) => {
  const categories = await prisma.category.findMany({
    orderBy: [{ isDefault: 'desc' }, { displayName: 'asc' }],
  });

  response.json(categories);
});

routes.post('/categories', async (request, response) => {
  const parsed = createCategorySchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json(validationError(parsed.error));
    return;
  }

  try {
    const category = await prisma.category.create({
      data: parsed.data,
    });

    response.status(201).json(category);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      response.status(400).json({ error: 'Categoria já cadastrada' });
      return;
    }

    throw error;
  }
});

routes.put('/categories/:id', async (request, response) => {
  const parsed = updateCategorySchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json(validationError(parsed.error));
    return;
  }

  try {
    const category = await prisma.category.update({
      where: { id: request.params.id },
      data: parsed.data,
    });

    response.json(category);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      response.status(404).json({ error: 'Categoria não encontrada' });
      return;
    }

    throw error;
  }
});

routes.delete('/categories/:id', async (request, response) => {
  const category = await prisma.category.findUnique({
    where: { id: request.params.id },
  });

  if (!category) {
    response.status(404).json({ error: 'Categoria não encontrada' });
    return;
  }

  if (category.isDefault) {
    response.status(400).json({ error: 'Categorias padrão não podem ser excluídas' });
    return;
  }

  try {
    await prisma.category.delete({
      where: { id: request.params.id },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      response.status(400).json({ error: 'Categoria possui transações vinculadas' });
      return;
    }

    throw error;
  }

  response.status(204).send();
});

routes.get('/transactions', async (request, response) => {
  const month = request.query.month ? Number(request.query.month) : undefined;
  const year = request.query.year ? Number(request.query.year) : undefined;

  const where =
    month && year
      ? {
          date: {
            gte: new Date(Date.UTC(year, month - 1, 1)),
            lt: new Date(Date.UTC(year, month, 1)),
          },
        }
      : undefined;

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: 'desc' },
  });

  response.json(transactions.map(serializeTransaction));
});

routes.post('/transactions', async (request, response) => {
  const parsed = createTransactionSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json(validationError(parsed.error));
    return;
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        ...parsed.data,
        date: toDateOnly(parsed.data.date),
      },
      include: { category: true },
    });

    response.status(201).json(serializeTransaction(transaction));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      response.status(400).json({ error: 'Categoria inválida' });
      return;
    }

    throw error;
  }
});

routes.put('/transactions/:id', async (request, response) => {
  const parsed = updateTransactionSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json(validationError(parsed.error));
    return;
  }

  try {
    const transaction = await prisma.transaction.update({
      where: { id: request.params.id },
      data: {
        ...parsed.data,
        date: parsed.data.date ? toDateOnly(parsed.data.date) : undefined,
      },
      include: { category: true },
    });

    response.json(serializeTransaction(transaction));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      response.status(404).json({ error: 'Transação não encontrada' });
      return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      response.status(400).json({ error: 'Categoria inválida' });
      return;
    }

    throw error;
  }
});

routes.delete('/transactions/:id', async (request, response) => {
  try {
    await prisma.transaction.delete({
      where: { id: request.params.id },
    });

    response.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      response.status(404).json({ error: 'Transação não encontrada' });
      return;
    }

    throw error;
  }
});
