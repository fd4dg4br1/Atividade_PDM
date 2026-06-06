"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("./auth");
const prisma_1 = require("./prisma");
const schemas_1 = require("./schemas");
exports.routes = (0, express_1.Router)();
function toDateOnly(value) {
    return new Date(`${value}T00:00:00.000Z`);
}
function serializeTransaction(transaction) {
    return {
        ...transaction,
        value: Number(transaction.value),
        date: transaction.date.toISOString().slice(0, 10),
    };
}
function validationError(error) {
    return {
        error: 'Dados inválidos',
        details: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
        })),
    };
}
exports.routes.get('/', (_request, response) => {
    response.json({ ok: true, name: 'gestao-financeira-api' });
});
exports.routes.post('/auth/login', async (request, response) => {
    const parsed = schemas_1.loginSchema.safeParse(request.body);
    if (!parsed.success) {
        response.status(400).json(validationError(parsed.error));
        return;
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { email: parsed.data.email },
    });
    if (!user) {
        response.status(401).json({ error: 'Email ou senha inválidos' });
        return;
    }
    const passwordMatches = await bcryptjs_1.default.compare(parsed.data.password, user.passwordHash);
    if (!passwordMatches) {
        response.status(401).json({ error: 'Email ou senha inválidos' });
        return;
    }
    const publicUser = {
        id: user.id,
        name: user.name,
        email: user.email,
    };
    const token = jsonwebtoken_1.default.sign(publicUser, (0, auth_1.getJwtSecret)(), { expiresIn: '8h' });
    response.json({
        token,
        user: publicUser,
    });
});
exports.routes.use(auth_1.authenticate);
exports.routes.get('/categories', async (_request, response) => {
    const categories = await prisma_1.prisma.category.findMany({
        orderBy: [{ isDefault: 'desc' }, { displayName: 'asc' }],
    });
    response.json(categories);
});
exports.routes.post('/categories', async (request, response) => {
    const parsed = schemas_1.createCategorySchema.safeParse(request.body);
    if (!parsed.success) {
        response.status(400).json(validationError(parsed.error));
        return;
    }
    try {
        const category = await prisma_1.prisma.category.create({
            data: parsed.data,
        });
        response.status(201).json(category);
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            response.status(400).json({ error: 'Categoria já cadastrada' });
            return;
        }
        throw error;
    }
});
exports.routes.put('/categories/:id', async (request, response) => {
    const parsed = schemas_1.updateCategorySchema.safeParse(request.body);
    if (!parsed.success) {
        response.status(400).json(validationError(parsed.error));
        return;
    }
    try {
        const category = await prisma_1.prisma.category.update({
            where: { id: request.params.id },
            data: parsed.data,
        });
        response.json(category);
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            response.status(404).json({ error: 'Categoria não encontrada' });
            return;
        }
        throw error;
    }
});
exports.routes.delete('/categories/:id', async (request, response) => {
    const category = await prisma_1.prisma.category.findUnique({
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
        await prisma_1.prisma.category.delete({
            where: { id: request.params.id },
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            response.status(400).json({ error: 'Categoria possui transações vinculadas' });
            return;
        }
        throw error;
    }
    response.status(204).send();
});
exports.routes.get('/transactions', async (request, response) => {
    const month = request.query.month ? Number(request.query.month) : undefined;
    const year = request.query.year ? Number(request.query.year) : undefined;
    const where = month && year
        ? {
            date: {
                gte: new Date(Date.UTC(year, month - 1, 1)),
                lt: new Date(Date.UTC(year, month, 1)),
            },
        }
        : undefined;
    const transactions = await prisma_1.prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
    });
    response.json(transactions.map(serializeTransaction));
});
exports.routes.post('/transactions', async (request, response) => {
    const parsed = schemas_1.createTransactionSchema.safeParse(request.body);
    if (!parsed.success) {
        response.status(400).json(validationError(parsed.error));
        return;
    }
    try {
        const transaction = await prisma_1.prisma.transaction.create({
            data: {
                ...parsed.data,
                date: toDateOnly(parsed.data.date),
            },
            include: { category: true },
        });
        response.status(201).json(serializeTransaction(transaction));
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            response.status(400).json({ error: 'Categoria inválida' });
            return;
        }
        throw error;
    }
});
exports.routes.put('/transactions/:id', async (request, response) => {
    const parsed = schemas_1.updateTransactionSchema.safeParse(request.body);
    if (!parsed.success) {
        response.status(400).json(validationError(parsed.error));
        return;
    }
    try {
        const transaction = await prisma_1.prisma.transaction.update({
            where: { id: request.params.id },
            data: {
                ...parsed.data,
                date: parsed.data.date ? toDateOnly(parsed.data.date) : undefined,
            },
            include: { category: true },
        });
        response.json(serializeTransaction(transaction));
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            response.status(404).json({ error: 'Transação não encontrada' });
            return;
        }
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            response.status(400).json({ error: 'Categoria inválida' });
            return;
        }
        throw error;
    }
});
exports.routes.delete('/transactions/:id', async (request, response) => {
    try {
        await prisma_1.prisma.transaction.delete({
            where: { id: request.params.id },
        });
        response.status(204).send();
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            response.status(404).json({ error: 'Transação não encontrada' });
            return;
        }
        throw error;
    }
});
