import { z } from 'zod'

export const editUnitSchema = z.object({
  unit_number: z.string().trim().min(1, 'Unit number / name is required'),
  monthly_rate: z.string().refine(
    (v) => { const n = parseFloat(v); return !isNaN(n) && n >= 0 },
    'Monthly rent must be 0 or more',
  ),
  billing_day: z.string().refine(
    (v) => { if (!v) return true; const n = parseInt(v, 10); return !isNaN(n) && n >= 1 && n <= 31 },
    'Billing day must be 1–31',
  ),
  notes: z.string(),
})

export type EditUnitFormData = z.infer<typeof editUnitSchema>
