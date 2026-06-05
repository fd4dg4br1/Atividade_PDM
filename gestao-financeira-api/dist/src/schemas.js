"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransactionSchema = exports.createTransactionSchema = exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2),
    displayName: zod_1.z.string().trim().min(2),
    icon: zod_1.z.string().trim().min(1),
    background: zod_1.z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
    isIncome: zod_1.z.boolean().default(false),
});
exports.updateCategorySchema = exports.createCategorySchema.partial();
exports.createTransactionSchema = zod_1.z.object({
    description: zod_1.z.string().trim().min(1),
    value: zod_1.z.number().positive(),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    categoryId: zod_1.z.string().uuid(),
});
exports.updateTransactionSchema = exports.createTransactionSchema.partial();
