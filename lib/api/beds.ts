import { db } from '../../db'
import { beds, tenants, bills } from '../../db/schema'
import { eq, inArray, desc } from 'drizzle-orm'
import type { BedWithStatus } from '../../types'
import { nanoid } from 'nanoid/non-secure'

export async function fetchBedMap(unitId: string): Promise<BedWithStatus[]> {
  const bedRows = await db
    .select({
      id: beds.id,
      unit_id: beds.unit_id,
      label: beds.label,
      daily_rate: beds.daily_rate,
      tenant_id: beds.tenant_id,
      vacated_at: beds.vacated_at,
      created_at: beds.created_at,
      tenant_full_name: tenants.full_name,
    })
    .from(beds)
    .leftJoin(tenants, eq(beds.tenant_id, tenants.id))
    .where(eq(beds.unit_id, unitId))
    .orderBy(beds.label)

  const tenantIds = bedRows.filter((b) => b.tenant_id).map((b) => b.tenant_id!)
  const latestBillByTenant: Record<string, string> = {}

  if (tenantIds.length > 0) {
    const billRows = await db
      .select({ tenant_id: bills.tenant_id, status: bills.status })
      .from(bills)
      .where(inArray(bills.tenant_id, tenantIds as [string, ...string[]]))
      .orderBy(desc(bills.created_at))

    for (const b of billRows) {
      if (!latestBillByTenant[b.tenant_id]) latestBillByTenant[b.tenant_id] = b.status
    }
  }

  return bedRows.map((bed) => {
    if (!bed.tenant_id) {
      return {
        id: bed.id,
        unit_id: bed.unit_id,
        label: bed.label,
        daily_rate: bed.daily_rate,
        tenant_id: null,
        vacated_at: bed.vacated_at,
        created_at: bed.created_at,
        tenantLastName: null,
        status: 'vacant' as const,
      }
    }
    const billStatus = latestBillByTenant[bed.tenant_id] ?? 'paid'
    const status = billStatus === 'overdue' ? 'overdue' : ('paid' as const)
    const nameParts = bed.tenant_full_name?.split(' ') ?? []
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0] ?? null
    return {
      id: bed.id,
      unit_id: bed.unit_id,
      label: bed.label,
      daily_rate: bed.daily_rate,
      tenant_id: bed.tenant_id,
      vacated_at: bed.vacated_at,
      created_at: bed.created_at,
      tenantLastName: lastName,
      status,
    }
  })
}

export async function createBed(input: {
  unit_id: string
  label: string
  daily_rate: number
  tenant_id?: string
}): Promise<void> {
  const id = nanoid()
  await db.insert(beds).values({
    id,
    unit_id: input.unit_id,
    label: input.label,
    daily_rate: input.daily_rate,
    tenant_id: input.tenant_id ?? null,
  })
}
