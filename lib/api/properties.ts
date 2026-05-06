import { db } from '../../db'
import { properties, units, contracts, payments } from '../../db/schema'
import { eq, and, lte, isNull, sql } from 'drizzle-orm'
import type { Property, PropertyWithStats, PropertyStats } from '../../types'
import { nanoid } from 'nanoid/non-secure'

export async function fetchProperties(): Promise<Property[]> {
  return db.select().from(properties).orderBy(properties.created_at)
}

export async function fetchProperty(id: string): Promise<Property | null> {
  const rows = await db.select().from(properties).where(eq(properties.id, id))
  return rows[0] ?? null
}

export async function fetchPropertiesWithStats(): Promise<PropertyWithStats[]> {
  const rows = await db
    .select({
      id: properties.id,
      name: properties.name,
      address: properties.address,
      description: properties.description,
      created_at: properties.created_at,
      totalUnits: sql<number>`COUNT(${units.id})`,
      occupiedUnits: sql<number>`SUM(CASE WHEN ${units.status} = 'occupied' THEN 1 ELSE 0 END)`,
      vacantUnits: sql<number>`SUM(CASE WHEN ${units.status} = 'available' THEN 1 ELSE 0 END)`,
      expectedMonthlyIncome: sql<number>`SUM(CASE WHEN ${units.status} = 'occupied' THEN COALESCE(${units.monthly_rate}, 0) ELSE 0 END)`,
    })
    .from(properties)
    .leftJoin(units, eq(units.property_id, properties.id))
    .groupBy(properties.id)
    .orderBy(properties.created_at)
  return rows as PropertyWithStats[]
}

export async function fetchPropertyStats(propertyId: string): Promise<PropertyStats> {
  const unitRows = await db
    .select({
      totalUnits: sql<number>`COUNT(${units.id})`,
      occupiedUnits: sql<number>`SUM(CASE WHEN ${units.status} = 'occupied' THEN 1 ELSE 0 END)`,
      vacantUnits: sql<number>`SUM(CASE WHEN ${units.status} = 'available' THEN 1 ELSE 0 END)`,
      expectedMonthlyIncome: sql<number>`SUM(CASE WHEN ${units.status} = 'occupied' THEN COALESCE(${units.monthly_rate}, 0) ELSE 0 END)`,
    })
    .from(units)
    .where(eq(units.property_id, propertyId))

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const collectedRows = await db
    .select({ collected: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments)
    .innerJoin(units, eq(payments.unit_id, units.id))
    .where(
      and(
        eq(units.property_id, propertyId),
        isNull(payments.voided_at),
        sql`${payments.date} >= ${monthStart}`,
      ),
    )

  const sixtyDaysOut = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]
  const expiringRows = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(contracts)
    .innerJoin(units, eq(contracts.unit_id, units.id))
    .where(
      and(
        eq(units.property_id, propertyId),
        eq(contracts.status, 'active'),
        lte(contracts.end_date, sixtyDaysOut),
      ),
    )

  return {
    totalUnits: unitRows[0]?.totalUnits ?? 0,
    occupiedUnits: unitRows[0]?.occupiedUnits ?? 0,
    vacantUnits: unitRows[0]?.vacantUnits ?? 0,
    expectedMonthlyIncome: unitRows[0]?.expectedMonthlyIncome ?? 0,
    collectedThisMonth: collectedRows[0]?.collected ?? 0,
    expiringContracts: expiringRows[0]?.count ?? 0,
  }
}

export async function createProperty(
  input: Pick<Property, 'name' | 'address' | 'description'>
): Promise<Property> {
  const id = nanoid()
  await db.insert(properties).values({ id, ...input })
  const created = await fetchProperty(id)
  return created!
}

export async function updateProperty(
  id: string,
  input: Partial<Pick<Property, 'name' | 'address' | 'description'>>
): Promise<Property> {
  await db.update(properties).set(input).where(eq(properties.id, id))
  const updated = await fetchProperty(id)
  return updated!
}

export async function deleteProperty(id: string): Promise<void> {
  await db.delete(properties).where(eq(properties.id, id))
}
