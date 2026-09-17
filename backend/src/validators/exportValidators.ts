import { z } from 'zod';

export const EXPORTABLE_FIELDS = ['id', 'date', 'amount', 'category', 'status', 'user_id', 'user_profile'] as const;

export const exportRequestSchema = z.object({
  columns: z
    .array(z.enum(EXPORTABLE_FIELDS))
    .min(1, 'Select at least one column to export')
    .max(EXPORTABLE_FIELDS.length),
  filters: z
    .object({
      search: z.string().trim().max(100).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      minAmount: z.number().optional(),
      maxAmount: z.number().optional(),
      category: z.enum(['Revenue', 'Expense']).optional(),
      status: z.enum(['Paid', 'Pending']).optional(),
      userId: z.string().trim().max(50).optional(),
    })
    .optional()
    .default({}),
});

export type ExportRequestInput = z.infer<typeof exportRequestSchema>;
