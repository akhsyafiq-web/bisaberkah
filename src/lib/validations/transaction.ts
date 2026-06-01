import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Jumlah harus lebih dari 0'),
  category_id: z.string().uuid('Pilih kategori'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  note: z.string().max(255, 'Catatan maksimal 255 karakter').optional(),
  receipt_url: z.string().url().optional().or(z.literal('')),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>
