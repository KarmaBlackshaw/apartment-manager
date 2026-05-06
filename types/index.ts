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
  owner_phone: string
  notif_rent_reminders: string
  notif_contract_expiry: string
  notif_vacancy_alerts: string
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

export type UtilityType = 'electricity' | 'water'

export interface Payment {
  id: string
  bill_id: string | null
  tenant_id: string
  unit_id: string
  amount: number
  date: string
  notes: string | null
  receipt_no: string
  method: string
  balance_before: number
  balance_after: number
  voided_at: string | null
  created_at: string
}

export interface PaymentWithDetails extends Payment {
  tenant: Pick<Tenant, 'full_name' | 'email'>
  unit: Pick<Unit, 'unit_number'>
}

export interface UtilityReading {
  id: string
  unit_id: string
  month: string
  type: UtilityType
  previous_reading: number
  current_reading: number
  rate: number
  computed_charge: number
  created_at: string
}

export interface BillingStats {
  collected: number
  billed: number
  rate: number
  overdueCount: number
}

export interface BillingOverviewEntry {
  tenant_id: string
  unit_id: string | null
  tenant_full_name: string
  unit_number: string | null
  monthly_rate: number
  bill_id: string | null
  bill_amount: number
  bill_status: string | null
  month_status: 'paid' | 'overdue' | 'unpaid' | 'no_bill'
}

export interface BillingOverview {
  entries: BillingOverviewEntry[]
  stats: BillingStats
}

export interface BillPreview {
  activeTenants: number
  toGenerate: number
  alreadyGenerated: number
  totalBilled: number
}
