import { db } from '../../db'
import { properties } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { Property } from '../../types'
import { nanoid } from 'nanoid/non-secure'

export async function fetchProperties(): Promise<Property[]> {
  return db.select().from(properties).orderBy(properties.created_at)
}

export async function fetchProperty(id: string): Promise<Property | null> {
  const rows = await db.select().from(properties).where(eq(properties.id, id))
  return rows[0] ?? null
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
