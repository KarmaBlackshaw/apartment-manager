import { db } from '~/db'
import { tenants, units, bills } from '~/db/schema'
import { eq, and, like } from 'drizzle-orm'
import { nanoid } from 'nanoid/non-secure'
import dayjs from 'dayjs'
import type { BillingOverview, BillingOverviewEntry, BillPreview } from '~/types'

export async function fetchBillingOverview(
  month: string,
  propertyId?: string,
): Promise<BillingOverview> {
  const monthPrefix = `${month}-%`

  const activeTenants = await db
    .select({
      id: tenants.id,
      full_name: tenants.full_name,
      unit_id: tenants.unit_id,
      unit_number: units.unit_number,
      monthly_rate: units.monthly_rate,
      property_id: units.property_id,
    })
    .from(tenants)
    .leftJoin(units, eq(tenants.unit_id, units.id))
    .where(eq(tenants.status, 'active'))

  const filtered = propertyId
    ? activeTenants.filter(t => t.property_id === propertyId)
    : activeTenants

  const monthBills = await db
    .select({ id: bills.id, tenant_id: bills.tenant_id, amount: bills.amount, status: bills.status })
    .from(bills)
    .where(like(bills.due_date, monthPrefix))

  const billByTenant = new Map<string, typeof monthBills[number]>()
  for (const b of monthBills) {
    if (!billByTenant.has(b.tenant_id)) billByTenant.set(b.tenant_id, b)
  }

  const entries: BillingOverviewEntry[] = filtered.map(t => {
    const bill = billByTenant.get(t.id) ?? null
    let month_status: BillingOverviewEntry['month_status'] = 'no_bill'
    if (bill) {
      if (bill.status === 'paid') month_status = 'paid'
      else if (bill.status === 'overdue') month_status = 'overdue'
      else month_status = 'unpaid'
    }
    return {
      tenant_id: t.id,
      unit_id: t.unit_id ?? null,
      tenant_full_name: t.full_name,
      unit_number: t.unit_number ?? null,
      monthly_rate: t.monthly_rate ?? 0,
      bill_id: bill?.id ?? null,
      bill_amount: bill?.amount ?? 0,
      bill_status: bill?.status ?? null,
      month_status,
    }
  })

  const billed = entries.filter(e => e.bill_id).reduce((s, e) => s + e.bill_amount, 0)
  const collected = entries.filter(e => e.month_status === 'paid').reduce((s, e) => s + e.bill_amount, 0)
  const overdueCount = entries.filter(e => e.month_status === 'overdue').length
  const rate = billed > 0 ? Math.round((collected / billed) * 100) : 0

  return { entries, stats: { collected, billed, rate, overdueCount } }
}

export async function fetchBillPreview(month: string, propertyId?: string): Promise<BillPreview> {
  const overview = await fetchBillingOverview(month, propertyId)
  return {
    activeTenants: overview.entries.length,
    toGenerate: overview.entries.filter(e => !e.bill_id).length,
    alreadyGenerated: overview.entries.filter(e => !!e.bill_id).length,
    totalBilled: overview.stats.billed,
  }
}

export interface GenerateBillsInput {
  month: string
  propertyId?: string
}

export async function generateBillsForMonth(input: GenerateBillsInput): Promise<number> {
  const overview = await fetchBillingOverview(input.month, input.propertyId)
  const toGenerate = overview.entries.filter(e => !e.bill_id && e.monthly_rate > 0 && e.unit_id)

  const firstDay = dayjs(`${input.month}-01`)
  const lastDay = firstDay.endOf('month')
  const dueDate = firstDay.date(5).format('YYYY-MM-DD')

  for (const entry of toGenerate) {
    await db.insert(bills).values({
      id: nanoid(),
      tenant_id: entry.tenant_id,
      unit_id: entry.unit_id!,
      amount: entry.monthly_rate,
      billing_type: 'monthly',
      period_start: firstDay.format('YYYY-MM-DD'),
      period_end: lastDay.format('YYYY-MM-DD'),
      due_date: dueDate,
      status: 'pending',
    })
  }
  return toGenerate.length
}
