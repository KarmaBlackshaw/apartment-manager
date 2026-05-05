import { db } from './index'
import { properties, units } from './schema'
import { nanoid } from 'nanoid/non-secure'

export async function seedDatabase() {
  const existing = await db.select().from(properties).limit(1)
  if (existing.length > 0) return

  const propId = nanoid()
  await db.insert(properties).values({
    id: propId,
    name: 'Sunset Apartments',
    address: '123 Main Street',
    description: 'Demo property',
  })

  await db.insert(units).values([
    { id: nanoid(), property_id: propId, unit_number: '101', floor: 1, bedrooms: 2, bathrooms: 1, billing_type: 'monthly', monthly_rate: 500, daily_rate: null },
    { id: nanoid(), property_id: propId, unit_number: '102', floor: 1, bedrooms: 1, bathrooms: 1, billing_type: 'daily', monthly_rate: null, daily_rate: 30 },
  ])
}
