import { db } from '../../db'
import { tenants, units, bills } from '../../db/schema'
import { eq, like } from 'drizzle-orm'

export type TenantMonthStatus = 'paid' | 'overdue' | 'unpaid' | 'no_bill'

export interface TenantMonthEntry {
  tenant_id: string
  tenant_full_name: string
  unit_number: string | null
  bill_id: string | null
  bill_amount: number
  bill_status: string | null
  month_status: TenantMonthStatus
}

const STATUS_ORDER: Record<TenantMonthStatus, number> = {
  overdue: 0, unpaid: 1, no_bill: 2, paid: 3,
}

export async function fetchPaymentsOverview(year: number, month: number): Promise<TenantMonthEntry[]> {
  const mm = String(month).padStart(2, '0')
  const monthPrefix = `${year}-${mm}-%`

  const activeTenants = await db
    .select({
      id: tenants.id,
      full_name: tenants.full_name,
      unit_id: tenants.unit_id,
      unit_number: units.unit_number,
    })
    .from(tenants)
    .leftJoin(units, eq(tenants.unit_id, units.id))
    .where(eq(tenants.status, 'active'))

  const monthBills = await db
    .select({
      id: bills.id,
      tenant_id: bills.tenant_id,
      amount: bills.amount,
      status: bills.status,
    })
    .from(bills)
    .where(like(bills.due_date, monthPrefix))

  const billByTenant = new Map<string, typeof monthBills[number]>()
  for (const b of monthBills) {
    if (!billByTenant.has(b.tenant_id)) billByTenant.set(b.tenant_id, b)
  }

  const entries: TenantMonthEntry[] = activeTenants.map((t) => {
    const bill = billByTenant.get(t.id) ?? null
    let month_status: TenantMonthStatus = 'no_bill'
    if (bill) {
      if (bill.status === 'paid') month_status = 'paid'
      else if (bill.status === 'overdue') month_status = 'overdue'
      else month_status = 'unpaid'
    }
    return {
      tenant_id: t.id,
      tenant_full_name: t.full_name,
      unit_number: (t as any).unit_number ?? null,
      bill_id: bill?.id ?? null,
      bill_amount: bill?.amount ?? 0,
      bill_status: bill?.status ?? null,
      month_status,
    }
  })

  return entries.sort((a, b) => {
    const od = STATUS_ORDER[a.month_status] - STATUS_ORDER[b.month_status]
    if (od !== 0) return od
    return a.tenant_full_name.localeCompare(b.tenant_full_name)
  })
}
