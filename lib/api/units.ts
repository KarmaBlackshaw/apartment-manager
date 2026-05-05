import { db } from '../../db'
import { units, properties } from '../../db/schema'
import { eq, asc, count } from 'drizzle-orm'
import type { Unit, UnitStatus } from '../../types'
import { nanoid } from 'nanoid/non-secure'

export async function fetchUnits(propertyId: string): Promise<Unit[]> {
  return db.select().from(units).where(eq(units.property_id, propertyId)).orderBy(asc(units.unit_number))
}

export async function fetchUnit(id: string): Promise<Unit | null> {
  const rows = await db.select().from(units).where(eq(units.id, id))
  return rows[0] ?? null
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

export async function fetchUnitStatusCounts(): Promise<{ occupied: number; available: number; maintenance: number }> {
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
      created_at: units.created_at,
      property_name: properties.name,
    })
    .from(units)
    .innerJoin(properties, eq(units.property_id, properties.id))
    .where(eq(units.status, 'available'))
    .orderBy(asc(units.unit_number))
  return rows as (Unit & { property_name: string })[]
}
