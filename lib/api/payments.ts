import { db } from '~/db'
import { payments, bills, tenants, units } from '~/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid/non-secure'
import dayjs from 'dayjs'
import type { PaymentWithDetails } from '~/types'

export interface CreatePaymentInput {
  bill_id?: string
  tenant_id: string
  unit_id: string
  amount: number
  date: string
  notes?: string
  method?: string
  balance_before: number
  balance_after: number
}

function generateReceiptNo(): string {
  return `REC-${dayjs().format('YYYYMMDD')}-${nanoid(4).toUpperCase()}`
}

export async function fetchPayment(id: string): Promise<PaymentWithDetails | null> {
  const rows = await db
    .select({
      id: payments.id,
      bill_id: payments.bill_id,
      tenant_id: payments.tenant_id,
      unit_id: payments.unit_id,
      amount: payments.amount,
      date: payments.date,
      notes: payments.notes,
      receipt_no: payments.receipt_no,
      method: payments.method,
      balance_before: payments.balance_before,
      balance_after: payments.balance_after,
      voided_at: payments.voided_at,
      created_at: payments.created_at,
      tenant_full_name: tenants.full_name,
      tenant_email: tenants.email,
      unit_number: units.unit_number,
    })
    .from(payments)
    .innerJoin(tenants, eq(payments.tenant_id, tenants.id))
    .innerJoin(units, eq(payments.unit_id, units.id))
    .where(eq(payments.id, id))

  if (rows.length === 0) return null
  const r = rows[0]
  return {
    id: r.id,
    bill_id: r.bill_id,
    tenant_id: r.tenant_id,
    unit_id: r.unit_id,
    amount: r.amount,
    date: r.date,
    notes: r.notes,
    receipt_no: r.receipt_no,
    method: r.method,
    balance_before: r.balance_before,
    balance_after: r.balance_after,
    voided_at: r.voided_at,
    created_at: r.created_at,
    tenant: { full_name: r.tenant_full_name, email: r.tenant_email },
    unit: { unit_number: r.unit_number },
  }
}

export async function createPayment(input: CreatePaymentInput): Promise<PaymentWithDetails> {
  const id = nanoid()
  const receipt_no = generateReceiptNo()
  await db.insert(payments).values({
    id,
    bill_id: input.bill_id ?? null,
    tenant_id: input.tenant_id,
    unit_id: input.unit_id,
    amount: input.amount,
    date: input.date,
    notes: input.notes ?? null,
    receipt_no,
    method: input.method ?? 'cash',
    balance_before: input.balance_before,
    balance_after: input.balance_after,
  })
  if (input.bill_id && input.balance_after <= 0) {
    await db.update(bills)
      .set({ status: 'paid', paid_at: new Date().toISOString() })
      .where(eq(bills.id, input.bill_id))
  }
  const result = await fetchPayment(id)
  return result!
}

export async function voidPayment(id: string): Promise<void> {
  await db.update(payments).set({ voided_at: new Date().toISOString() }).where(eq(payments.id, id))
}
