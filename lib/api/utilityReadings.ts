import { db } from '~/db'
import { utilityReadings } from '~/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid/non-secure'
import type { UtilityReading, UtilityType } from '~/types'

export async function fetchUtilityReading(
  unitId: string,
  month: string,
  type: UtilityType,
): Promise<UtilityReading | null> {
  const rows = await db
    .select()
    .from(utilityReadings)
    .where(and(
      eq(utilityReadings.unit_id, unitId),
      eq(utilityReadings.month, month),
      eq(utilityReadings.type, type),
    ))
  return (rows[0] as UtilityReading) ?? null
}

export interface UpsertUtilityReadingInput {
  unit_id: string
  month: string
  type: UtilityType
  previous_reading: number
  current_reading: number
  rate: number
}

export async function upsertUtilityReading(input: UpsertUtilityReadingInput): Promise<UtilityReading> {
  const computed_charge = parseFloat(
    ((input.current_reading - input.previous_reading) * input.rate).toFixed(2),
  )
  const existing = await fetchUtilityReading(input.unit_id, input.month, input.type)
  if (existing) {
    await db.update(utilityReadings)
      .set({ current_reading: input.current_reading, rate: input.rate, computed_charge })
      .where(eq(utilityReadings.id, existing.id))
    return { ...existing, current_reading: input.current_reading, rate: input.rate, computed_charge }
  }
  const id = nanoid()
  await db.insert(utilityReadings).values({ id, ...input, computed_charge })
  const rows = await db.select().from(utilityReadings).where(eq(utilityReadings.id, id))
  return rows[0] as UtilityReading
}
