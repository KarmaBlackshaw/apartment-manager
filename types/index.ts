export type Role = 'admin' | 'tenant'
export type BillingType = 'monthly' | 'daily'
export type UnitStatus = 'available' | 'occupied' | 'maintenance'
export type BillStatus = 'pending' | 'paid' | 'overdue'
export type TenantStatus = 'active' | 'inactive'
export type PaymentStatus = 'paid' | 'overdue' | 'partial' | 'vacant'

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
  monthly_rate: number | null
  billing_day: number | null
  notes: string | null
  status: UnitStatus
  created_at: string
}

export interface UnitWithStatus extends Unit {
  tenantName?: string
  tenantId?: string
  paymentStatus: PaymentStatus
}

export interface UnitDetail extends Unit {
  tenant: {
    id: string
    full_name: string
    move_in_date: string
    billing_type: BillingType
  } | null
  balance: number
  openMaintenanceCount: number
  documentCategories: string[]
  recentMaintenance: MaintenanceIssue[]
  recentDocuments: Array<{ id: string; title: string; category: string; created_at: string }>
}

export interface PropertyWithStats {
  id: string
  name: string
  address: string
  description: string | null
  created_at: string
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  expectedMonthlyIncome: number
}

export interface PropertyStats {
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  expectedMonthlyIncome: number
  collectedThisMonth: number
  expiringContracts: number
  openIssueCount: number
}

export interface Tenant {
  id: string
  unit_id: string | null
  full_name: string
  nickname?: string | null
  email: string
  phone: string
  occupation?: string | null
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
  address: string
  billing_day: number
  late_fee_amount: number
  late_fee_grace_days: number
}

// Enriched types used in UI list views
export interface TenantWithUnit extends Tenant {
  unit: Pick<Unit, 'unit_number'> | null
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

// ─── Maintenance ─────────────────────────────────────────────────────────────

export type MaintenanceStatus = 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED'
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface MaintenanceIssue {
  id: string
  unit_id: string
  category: string
  priority: MaintenancePriority
  description: string
  status: MaintenanceStatus
  photo_uri: string | null
  repair_cost: number | null
  charged_to_tenant: boolean
  reported_at: string
  resolved_at: string | null
  created_at: string
}

// ─── Report return types ──────────────────────────────────────────────────────

export interface MonthlyCollectionEntry {
  tenant_id: string
  tenant_full_name: string
  unit_number: string | null
  unit_id: string | null
  monthly_rate: number
  bill_amount: number
  bill_status: string | null
  month_status: 'paid' | 'overdue' | 'unpaid' | 'no_bill'
}

export interface MonthlyCollectionReport {
  entries: MonthlyCollectionEntry[]
  stats: {
    totalCollected: number
    totalBilled: number
    paidCount: number
    partialCount: number
    unpaidCount: number
  }
}

export interface OutstandingBalanceEntry {
  tenant_id: string
  tenant_full_name: string
  unit_number: string | null
  balance: number
  overdueMonthCount: number
}

export interface OutstandingBalancesReport {
  entries: OutstandingBalanceEntry[]
  totalOutstanding: number
  tenantCount: number
}

export interface OccupancyTrendPoint {
  month: string
  pct: number
}

export interface OccupancyByProperty {
  property_id: string
  property_name: string
  totalUnits: number
  occupiedUnits: number
  pct: number
}

export interface VacantUnitEntry {
  unit_id: string
  unit_number: string
  property_name: string
  daysVacant: number
  lostRevenue: number
}

export interface OccupancyReport {
  overallPct: number
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  trend: OccupancyTrendPoint[]
  byProperty: OccupancyByProperty[]
  vacantList: VacantUnitEntry[]
}

export type PerUnitIncomeStatus = 'success' | 'warning' | 'danger' | 'neutral'

export interface PerUnitIncomeEntry {
  unit_id: string
  unit_label: string
  unit_type: string | null
  tenant_name: string | null
  status: PerUnitIncomeStatus
  collected: number
  expected: number
  pct: number
}

export interface PerUnitIncomeReport {
  entries: PerUnitIncomeEntry[]
  totalCollected: number
  bestUnitLabel: string | null
}

export interface AnnualMonthEntry {
  month: string
  billed: number
  collected: number
}

export interface AnnualSummaryReport {
  year: number
  ytdIncome: number
  projectedFullYear: number
  totalBilled: number
  totalCollected: number
  collectionRate: number
  maintenanceSpend: number
  monthly: AnnualMonthEntry[]
}

export interface MaintenanceCostByUnit {
  unit_id: string
  unit_label: string
  categories: string
  count: number
  cost: number
  fromTenant: number | null
}

export interface MaintenanceCostsReport {
  thisMonthCost: number
  ytdCost: number
  openCount: number
  resolvedCount: number
  chargedToTenantCount: number
  byUnit: MaintenanceCostByUnit[]
}

export interface DepositSummaryEntry {
  tenant_id: string
  tenant_name: string
  unit_number: string | null
  deposit: number
  status: 'ACTIVE' | 'FORMER'
}

export interface DepositSummaryReport {
  entries: DepositSummaryEntry[]
  totalHeld: number
  tenantCount: number
}
