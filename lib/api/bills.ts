import { db } from '~/db'
import { bills, tenants } from '~/db/schema'
import { eq, and, desc, lt } from 'drizzle-orm'
import type { Bill, BillWithTenant, BillStatus, BillingType } from '~/types'
import { nanoid } from 'nanoid/non-secure'

export interface BillFilters {
  status?: BillStatus
  tenant_id?: string
  billing_type?: BillingType
}

export interface CreateBillInput {
  tenant_id: string
  unit_id: string
  amount: number
  billing_type: BillingType
  period_start: string
  period_end: string
  due_date: string
  notes?: string
  water_previous?: number
  water_current?: number
  electricity_previous?: number
  electricity_current?: number
}

// Shared select fields for bill + tenant join
const selectFields = {
  id: bills.id,
  tenant_id: bills.tenant_id,
  unit_id: bills.unit_id,
  amount: bills.amount,
  billing_type: bills.billing_type,
  period_start: bills.period_start,
  period_end: bills.period_end,
  due_date: bills.due_date,
  paid_at: bills.paid_at,
  status: bills.status,
  notes: bills.notes,
  created_at: bills.created_at,
  water_previous: bills.water_previous,
  water_current: bills.water_current,
  electricity_previous: bills.electricity_previous,
  electricity_current: bills.electricity_current,
  tenant_full_name: tenants.full_name,
  tenant_email: tenants.email,
}

function mapRows(rows: {
  id: string
  tenant_id: string
  unit_id: string
  amount: number
  billing_type: string
  period_start: string
  period_end: string
  due_date: string
  paid_at: string | null
  status: string
  notes: string | null
  created_at: string | null
  water_previous: number | null
  water_current: number | null
  electricity_previous: number | null
  electricity_current: number | null
  tenant_full_name: string
  tenant_email: string
}[]): BillWithTenant[] {
  return rows.map((r) => ({
    id: r.id,
    tenant_id: r.tenant_id,
    unit_id: r.unit_id,
    amount: r.amount,
    billing_type: r.billing_type as BillingType,
    period_start: r.period_start,
    period_end: r.period_end,
    due_date: r.due_date,
    paid_at: r.paid_at,
    status: r.status as BillStatus,
    notes: r.notes,
    created_at: r.created_at ?? '',
    water_previous: r.water_previous,
    water_current: r.water_current,
    electricity_previous: r.electricity_previous,
    electricity_current: r.electricity_current,
    tenant: {
      full_name: r.tenant_full_name,
      email: r.tenant_email,
    },
  }))
}

export async function fetchBills(filters?: BillFilters): Promise<BillWithTenant[]> {
  const whereClause = and(
    filters?.status ? eq(bills.status, filters.status) : undefined,
    filters?.tenant_id ? eq(bills.tenant_id, filters.tenant_id) : undefined,
    filters?.billing_type ? eq(bills.billing_type, filters.billing_type) : undefined,
  )

  const rows = await db
    .select(selectFields)
    .from(bills)
    .innerJoin(tenants, eq(bills.tenant_id, tenants.id))
    .where(whereClause)
    .orderBy(desc(bills.due_date))

  return mapRows(rows as Parameters<typeof mapRows>[0])
}

export async function fetchBill(id: string): Promise<BillWithTenant | null> {
  const rows = await db
    .select(selectFields)
    .from(bills)
    .innerJoin(tenants, eq(bills.tenant_id, tenants.id))
    .where(eq(bills.id, id))

  return mapRows(rows as Parameters<typeof mapRows>[0])[0] ?? null
}

export async function fetchLastBillForTenant(tenantId: string): Promise<BillWithTenant | null> {
  const rows = await db
    .select(selectFields)
    .from(bills)
    .innerJoin(tenants, eq(bills.tenant_id, tenants.id))
    .where(eq(bills.tenant_id, tenantId))
    .orderBy(desc(bills.created_at))
    .limit(1)

  const mapped = mapRows(rows as Parameters<typeof mapRows>[0])
  return mapped[0] ?? null
}

export async function createBill(input: CreateBillInput): Promise<Bill> {
  const id = nanoid()
  await db.insert(bills).values({
    id,
    tenant_id: input.tenant_id,
    unit_id: input.unit_id,
    amount: input.amount,
    billing_type: input.billing_type,
    period_start: input.period_start,
    period_end: input.period_end,
    due_date: input.due_date,
    notes: input.notes ?? null,
    status: 'pending',
    water_previous: input.water_previous ?? null,
    water_current: input.water_current ?? null,
    electricity_previous: input.electricity_previous ?? null,
    electricity_current: input.electricity_current ?? null,
  })
  const rows = await db.select().from(bills).where(eq(bills.id, id))
  return rows[0] as Bill
}

export async function markBillPaid(id: string): Promise<Bill> {
  await db.update(bills).set({ status: 'paid', paid_at: new Date().toISOString() }).where(eq(bills.id, id))
  const rows = await db.select().from(bills).where(eq(bills.id, id))
  return rows[0] as Bill
}

export async function markOverdueBills(): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  await db
    .update(bills)
    .set({ status: 'overdue' })
    .where(and(eq(bills.status, 'pending'), lt(bills.due_date, today)))
}

export async function deleteBill(id: string): Promise<void> {
  await db.delete(bills).where(eq(bills.id, id))
}
