import { db } from '../../db'
import { units, properties, tenants, bills, documents } from '../../db/schema'
import { eq, asc, count, and, inArray, desc } from 'drizzle-orm'
import type { Unit, UnitStatus, UnitWithStatus, UnitDetail, BillingType } from '../../types'
import { nanoid } from 'nanoid/non-secure'

export async function fetchUnits(propertyId: string): Promise<Unit[]> {
  const rows = await db
    .select()
    .from(units)
    .where(eq(units.property_id, propertyId))
    .orderBy(asc(units.unit_number))
  return rows as Unit[]
}

export async function fetchUnit(id: string): Promise<Unit | null> {
  const rows = await db.select().from(units).where(eq(units.id, id))
  return (rows[0] as Unit) ?? null
}

export async function fetchUnitsWithStatus(propertyId: string): Promise<UnitWithStatus[]> {
  const allUnits = await fetchUnits(propertyId)
  if (allUnits.length === 0) return []

  const unitIds = allUnits.map((u) => u.id)

  const tenantRows = await db
    .select({ id: tenants.id, unit_id: tenants.unit_id, full_name: tenants.full_name })
    .from(tenants)
    .where(and(eq(tenants.status, 'active'), inArray(tenants.unit_id, unitIds as [string, ...string[]])))

  const tenantByUnit: Record<string, { id: string; full_name: string }> = {}
  for (const t of tenantRows) {
    if (t.unit_id) tenantByUnit[t.unit_id] = { id: t.id, full_name: t.full_name }
  }

  const billRows = await db
    .select({ unit_id: bills.unit_id, status: bills.status, created_at: bills.created_at })
    .from(bills)
    .where(inArray(bills.unit_id, unitIds as [string, ...string[]]))
    .orderBy(desc(bills.created_at))

  const latestBillByUnit: Record<string, string> = {}
  for (const b of billRows) {
    if (!latestBillByUnit[b.unit_id]) latestBillByUnit[b.unit_id] = b.status
  }

  return allUnits.map((unit) => {
    if (unit.status === 'available') {
      return { ...unit, paymentStatus: 'vacant' as const }
    }
    const tenant = tenantByUnit[unit.id]
    const latestBillStatus = latestBillByUnit[unit.id]
    let paymentStatus: UnitWithStatus['paymentStatus'] = 'paid'
    if (latestBillStatus === 'overdue') paymentStatus = 'overdue'
    else if (latestBillStatus === 'pending') paymentStatus = 'partial'
    return { ...unit, tenantName: tenant?.full_name, tenantId: tenant?.id, paymentStatus }
  })
}

export async function fetchUnitDetail(unitId: string): Promise<UnitDetail | null> {
  const unit = await fetchUnit(unitId)
  if (!unit) return null

  const tenantRows = await db
    .select({
      id: tenants.id,
      full_name: tenants.full_name,
      move_in_date: tenants.move_in_date,
      billing_type: tenants.billing_type,
    })
    .from(tenants)
    .where(and(eq(tenants.unit_id, unitId), eq(tenants.status, 'active')))
    .limit(1)

  const tenantRow = tenantRows[0] ?? null

  let balance = 0
  if (tenantRow) {
    const billRows = await db
      .select({ amount: bills.amount })
      .from(bills)
      .where(
        and(
          eq(bills.tenant_id, tenantRow.id),
          inArray(bills.status, ['pending', 'overdue']),
        ),
      )
    balance = billRows.reduce((sum, b) => sum + b.amount, 0)
  }

  const docRows = await db
    .select({ category: documents.category })
    .from(documents)
    .where(and(eq(documents.ref_type, 'UNIT'), eq(documents.ref_id, unitId)))

  const documentCategories = [...new Set(docRows.map((d) => d.category))]

  return {
    ...unit,
    tenant: tenantRow
      ? {
          id: tenantRow.id,
          full_name: tenantRow.full_name,
          move_in_date: tenantRow.move_in_date,
          billing_type: tenantRow.billing_type as BillingType,
        }
      : null,
    balance,
    openMaintenanceCount: 0,
    documentCategories,
  }
}

export async function createUnit(
  input: Omit<Unit, 'id' | 'created_at' | 'status'> & { status?: UnitStatus }
): Promise<Unit> {
  const id = nanoid()
  await db.insert(units).values({ id, ...input })
  const created = await fetchUnit(id)
  return created!
}

export async function updateUnit(
  id: string,
  input: Partial<Omit<Unit, 'id' | 'property_id' | 'created_at'>>
): Promise<Unit> {
  await db.update(units).set(input).where(eq(units.id, id))
  const updated = await fetchUnit(id)
  return updated!
}

export async function deleteUnit(id: string): Promise<void> {
  await db.delete(units).where(eq(units.id, id))
}

export async function fetchUnitCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({ propertyId: units.property_id, count: count() })
    .from(units)
    .groupBy(units.property_id)
  return Object.fromEntries(rows.map((r) => [r.propertyId, r.count]))
}

export async function fetchUnitStatusCounts(): Promise<{
  occupied: number
  available: number
  maintenance: number
}> {
  const rows = await db
    .select({ status: units.status, count: count() })
    .from(units)
    .groupBy(units.status)
  const map = Object.fromEntries(rows.map((r) => [r.status, r.count]))
  return {
    occupied: map.occupied ?? 0,
    available: map.available ?? 0,
    maintenance: map.maintenance ?? 0,
  }
}

export async function fetchVacantUnits(): Promise<(Unit & { property_name: string })[]> {
  const rows = await db
    .select({
      id: units.id,
      property_id: units.property_id,
      unit_number: units.unit_number,
      floor: units.floor,
      bedrooms: units.bedrooms,
      bathrooms: units.bathrooms,
      monthly_rate: units.monthly_rate,
      daily_rate: units.daily_rate,
      billing_type: units.billing_type,
      status: units.status,
      unit_type: units.unit_type,
      amenities: units.amenities,
      size_sqm: units.size_sqm,
      billing_day: units.billing_day,
      created_at: units.created_at,
      property_name: properties.name,
    })
    .from(units)
    .innerJoin(properties, eq(units.property_id, properties.id))
    .where(eq(units.status, 'available'))
    .orderBy(asc(units.unit_number))
  return rows as (Unit & { property_name: string })[]
}
