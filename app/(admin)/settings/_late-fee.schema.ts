import { z } from 'zod'

export const lateFeeSchema = z.object({
  amount: z
    .string()
    .refine((v) => {
      const n = parseFloat(v)
      return !isNaN(n) && n >= 0
    }, 'Must be 0 or more'),
  graceDays: z
    .string()
    .refine((v) => {
      const n = parseInt(v, 10)
      return Number.isInteger(n) && n >= 0 && n <= 30
    }, 'Must be 0–30 days'),
})

export type LateFeeFormData = z.infer<typeof lateFeeSchema>
