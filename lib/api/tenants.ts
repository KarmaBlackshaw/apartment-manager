import { db } from '../../db'
import { tenants, units } from '../../db/schema'
import { eq, and, asc } from 'drizzle-orm'
import type { Tenant, TenantWithUnit, BillingType, TenantStatus } from '../../types'
import { nanoid } from 'nanoid/non-secure'

export interface TenantFilters {
  status?: 'active' | 'inactive'
  billing_type?: 'monthly' | 'daily'
}

export interface CreateTenantInput {
  unit_id: string
  full_name: string
  email: string
  phone: string
  billing_type: 'monthly' | 'daily'
  move_in_date: string
  address?: string
  emergency_contact?: string
  water_reading?: number
  electricity_reading?: number
  due_day?: number
  include_internet?: boolean
}

function mapRowsToTenantWithUnit(rows: {
  id: string
  unit_id: string | null
  full_name: string
  email: string
  phone: string
  billing_type: string
  move_in_date: string
  move_out_date: string | null
  status: string
  created_at: string | null
  address: string | null
  emergency_contact: string | null
  water_reading: number | null
  electricity_reading: number | null
  due_day: number | null
  include_internet: number
  unit_number: string | null
  unit_floor: number | null
  unit_billing_type: string | null
}[]): TenantWithUnit[] {
  return rows.map((r) => ({
    id: r.id,
    unit_id: r.unit_id,
    full_name: r.full_name,
    email: r.email,
    phone: r.phone,
    billing_type: r.billing_type as BillingType,
    move_in_date: r.move_in_date,
    move_out_date: r.move_out_date,
    status: r.status as TenantStatus,
    created_at: r.created_at ?? '',
    address: r.address,
    emergency_contact: r.emergency_contact,
    water_reading: r.water_reading,
    electricity_reading: r.electricity_reading,
    due_day: r.due_day,
    include_internet: r.include_internet === 1,
    unit: r.unit_number
      ? {
          unit_number: r.unit_number,
          floor: r.unit_floor,
          billing_type: r.unit_billing_type as BillingType,
        }
      : null,
  }))
}

const selectFields = {
  id: tenants.id,
  unit_id: tenants.unit_id,
  full_name: tenants.full_name,
  email: tenants.email,
  phone: tenants.phone,
  billing_type: tenants.billing_type,
  move_in_date: tenants.move_in_date,
  move_out_date: tenants.move_out_date,
  status: tenants.status,
  created_at: tenants.created_at,
  address: tenants.address,
  emergency_contact: tenants.emergency_contact,
  water_reading: tenants.water_reading,
  electricity_reading: tenants.electricity_reading,
  due_day: tenants.due_day,
  include_internet: tenants.include_internet,
  unit_number: units.unit_number,
  unit_floor: units.floor,
  unit_billing_type: units.billing_type,
}

export async function fetchTenants(filters?: TenantFilters): Promise<TenantWithUnit[]> {
  const whereClause = and(
    filters?.status ? eq(tenants.status, filters.status) : undefined,
    filters?.billing_type ? eq(tenants.billing_type, filters.billing_type) : undefined,
  )

  const rows = await db
    .select(selectFields)
    .from(tenants)
    .leftJoin(units, eq(tenants.unit_id, units.id))
    .where(whereClause)
    .orderBy(asc(tenants.full_name))

  return mapRowsToTenantWithUnit(rows as Parameters<typeof mapRowsToTenantWithUnit>[0])
}

export async function fetchTenant(id: string): Promise<TenantWithUnit | null> {
  const rows = await db
    .select(selectFields)
    .from(tenants)
    .leftJoin(units, eq(tenants.unit_id, units.id))
    .where(eq(tenants.id, id))

  const mapped = mapRowsToTenantWithUnit(rows as Parameters<typeof mapRowsToTenantWithUnit>[0])
  return mapped[0] ?? null
}

export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  const id = nanoid()
  const now = new Date().toISOString()

  await db.insert(tenants).values({
    id,
    unit_id: input.unit_id,
    full_name: input.full_name,
    email: input.email,
    phone: input.phone,
    billing_type: input.billing_type,
    move_in_date: input.move_in_date,
    status: 'active',
    created_at: now,
    address: input.address ?? null,
    emergency_contact: input.emergency_contact ?? null,
    water_reading: input.water_reading ?? null,
    electricity_reading: input.electricity_reading ?? null,
    due_day: input.due_day ?? null,
    include_internet: input.include_internet ? 1 : 0,
  })

  await db
    .update(units)
    .set({ status: 'occupied' })
    .where(eq(units.id, input.unit_id))

  const rows = await db.select().from(tenants).where(eq(tenants.id, id))
  const r = rows[0]
  return { ...r, include_internet: r.include_internet === 1 } as Tenant
}

export async function updateTenant(
  id: string,
  input: Partial<Pick<Tenant, 'full_name' | 'email' | 'phone' | 'move_out_date'>>
): Promise<Tenant> {
  await db.update(tenants).set(input).where(eq(tenants.id, id))
  const rows = await db.select().from(tenants).where(eq(tenants.id, id))
  const r = rows[0]
  return { ...r, include_internet: r.include_internet === 1 } as Tenant
}

export async function deactivateTenant(id: string, unitId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  await db
    .update(tenants)
    .set({ status: 'inactive', move_out_date: today })
    .where(eq(tenants.id, id))

  await db
    .update(units)
    .set({ status: 'available' })
    .where(eq(units.id, unitId))
}
