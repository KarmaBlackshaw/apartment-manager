import { db } from '~/db/index'
import { properties, units } from '~/db/schema'
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
    { id: nanoid(), property_id: propId, unit_number: '101', monthly_rate: 5000, billing_day: 1 },
    { id: nanoid(), property_id: propId, unit_number: '102', monthly_rate: 4500, billing_day: 1 },
  ])
}
