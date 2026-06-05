import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2),
  displayName: z.string().trim().min(2),
  icon: z.string().trim().min(1),
  background: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  isIncome: z.boolean().default(false),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createTransactionSchema = z.object({
  description: z.string().trim().min(1),
  value: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  categoryId: z.string().uuid(),
});

export const updateTransactionSchema = createTransactionSchema.partial();
