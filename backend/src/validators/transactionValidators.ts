import { z } from 'zod';
import { ALLOWED_SORT_FIELDS } from '../types';

const numericString = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/, 'Must be a number')
  .transform(Number);

const intString = z
  .string()
  .regex(/^\d+$/, 'Must be a positive integer')
  .transform(Number);

export const transactionQuerySchema = z
  .object({
    page: intString.default('1'),
    limit: intString.default('20').refine((v) => v <= 100, 'limit cannot exceed 100'),
    search: z.string().trim().max(100).optional(),
    startDate: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
    endDate: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
    minAmount: numericString.optional(),
    maxAmount: numericString.optional(),
    category: z.enum(['Revenue', 'Expense']).optional(),
    status: z.enum(['Paid', 'Pending']).optional(),
    userId: z.string().trim().max(50).optional(),
    // Whitelist protects against arbitrary field injection into the Mongo sort stage.
    sortBy: z.enum(ALLOWED_SORT_FIELDS).default('date'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .refine(
    (data) => !(data.minAmount !== undefined && data.maxAmount !== undefined) || data.minAmount <= data.maxAmount,
    { message: 'minAmount cannot exceed maxAmount', path: ['minAmount'] }
  )
  .refine(
    (data) => !(data.startDate && data.endDate) || new Date(data.startDate) <= new Date(data.endDate),
    { message: 'startDate must be before endDate', path: ['startDate'] }
  );

export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;

export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'id must be numeric')
    .transform(Number),
});

export const dashboardQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.enum(['Revenue', 'Expense']).optional(),
  status: z.enum(['Paid', 'Pending']).optional(),
  userId: z.string().trim().max(50).optional(),
});
