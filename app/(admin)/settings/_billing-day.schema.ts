import { z } from 'zod'

export const billingDaySchema = z.object({
  billingDay: z
    .string()
    .refine((v) => {
      const n = parseInt(v, 10)
      return Number.isInteger(n) && n >= 1 && n <= 28
    }, 'Must be a day between 1 and 28'),
})

export type BillingDayFormData = z.infer<typeof billingDaySchema>
