export type Role = 'admin' | 'tenant'
export type BillingType = 'monthly' | 'daily'
export type UnitStatus = 'available' | 'occupied' | 'maintenance'
export type BillStatus = 'pending' | 'paid' | 'overdue'
export type TenantStatus = 'active' | 'inactive'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: Role
  created_at: string
}

export interface Property {
  id: string
  name: string
  address: string
  description: string | null
  created_at: string
}

export interface Unit {
  id: string
  property_id: string
  unit_number: string
  floor: number | null
  bedrooms: number
  bathrooms: number
  monthly_rate: number | null
  daily_rate: number | null
  billing_type: BillingType
  status: UnitStatus
  created_at: string
}

export interface Tenant {
  id: string
  unit_id: string | null
  full_name: string
  email: string
  phone: string
  billing_type: BillingType
  move_in_date: string
  move_out_date: string | null
  status: TenantStatus
  created_at: string
  address?: string | null
  emergency_contact?: string | null
  water_reading?: number | null
  electricity_reading?: number | null
  due_day?: number | null
  include_internet?: boolean
}

export interface Bill {
  id: string
  tenant_id: string
  unit_id: string
  amount: number
  billing_type: BillingType
  period_start: string
  period_end: string
  due_date: string
  paid_at: string | null
  status: BillStatus
  notes: string | null
  created_at: string
  water_previous?: number | null
  water_current?: number | null
  electricity_previous?: number | null
  electricity_current?: number | null
}

export interface AppSettings {
  water_rate: number
  electricity_rate: number
  internet_rate: number
  apartment_name: string
  owner_name: string
}

// Enriched types used in UI list views
export interface TenantWithUnit extends Tenant {
  unit: Pick<Unit, 'unit_number' | 'floor' | 'billing_type'> | null
}

export interface BillWithTenant extends Bill {
  tenant: Pick<Tenant, 'full_name' | 'email'>
}

export interface UnitWithProperty extends Unit {
  property: Pick<Property, 'name' | 'address'>
}
