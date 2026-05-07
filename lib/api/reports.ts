import { db } from '~/db'
import { tenants, units, bills, contracts, properties, maintenanceIssues } from '~/db/schema'
import { eq, and, like, desc, asc, inArray } from 'drizzle-orm'
import dayjs from 'dayjs'
import type {
  MonthlyCollectionReport,
  MonthlyCollectionEntry,
  OutstandingBalancesReport,
  OutstandingBalanceEntry,
  OccupancyReport,
  OccupancyTrendPoint,
  OccupancyByProperty,
  VacantUnitEntry,
  PerUnitIncomeReport,
  PerUnitIncomeEntry,
  PerUnitIncomeStatus,
  AnnualSummaryReport,
  AnnualMonthEntry,
  MaintenanceCostsReport,
  MaintenanceCostByUnit,
  DepositSummaryReport,
  DepositSummaryEntry,
} from '~/types'

// ─── Shared helpers ───────────────────────────────────────────────────────────

function filterByProperty<T extends { property_id: string | null | undefined }>(
  rows: T[],
  propertyId: string | undefined,
): T[] {
  if (!propertyId) return rows
  return rows.filter((r) => r.property_id === propertyId)
}

// ─── Monthly Collection ───────────────────────────────────────────────────────

export async function fetchMonthlyCollection(
  month: string,
  propertyId?: string,
): Promise<MonthlyCollectionReport> {
  const monthPrefix = `${month}-%`

  const activeTenants = await db
    .select({
      id: tenants.id,
      full_name: tenants.full_name,
      unit_id: tenants.unit_id,
      unit_number: units.unit_number,
      monthly_rate: units.monthly_rate,
      property_id: units.property_id,
    })
    .from(tenants)
    .leftJoin(units, eq(tenants.unit_id, units.id))
    .where(eq(tenants.status, 'active'))

  const filtered = propertyId
    ? activeTenants.filter((t) => t.property_id === propertyId)
    : activeTenants

  const monthBills = await db
    .select({ id: bills.id, tenant_id: bills.tenant_id, amount: bills.amount, status: bills.status })
    .from(bills)
    .where(like(bills.due_date, monthPrefix))

  const billByTenant = new Map<string, typeof monthBills[number]>()
  for (const b of monthBills) {
    if (!billByTenant.has(b.tenant_id)) billByTenant.set(b.tenant_id, b)
  }

  const entries: MonthlyCollectionEntry[] = filtered.map((t) => {
    const bill = billByTenant.get(t.id) ?? null
    let month_status: MonthlyCollectionEntry['month_status'] = 'no_bill'
    if (bill) {
      if (bill.status === 'paid') month_status = 'paid'
      else if (bill.status === 'overdue') month_status = 'overdue'
      else month_status = 'unpaid'
    }
    return {
      tenant_id: t.id,
      tenant_full_name: t.full_name,
      unit_number: t.unit_number ?? null,
      unit_id: t.unit_id ?? null,
      monthly_rate: t.monthly_rate ?? 0,
      bill_amount: bill?.amount ?? 0,
      bill_status: bill?.status ?? null,
      month_status,
    }
  })

  const totalCollected = entries
    .filter((e) => e.month_status === 'paid')
    .reduce((s, e) => s + e.bill_amount, 0)
  const totalBilled = entries.filter((e) => e.bill_status != null).reduce((s, e) => s + e.bill_amount, 0)
  const paidCount = entries.filter((e) => e.month_status === 'paid').length
  const unpaidCount = entries.filter((e) => e.month_status === 'overdue' || e.month_status === 'unpaid').length

  return { entries, stats: { totalCollected, totalBilled, paidCount, partialCount: 0, unpaidCount } }
}

// ─── Outstanding Balances ─────────────────────────────────────────────────────

export async function fetchOutstandingBalances(
  propertyId?: string,
): Promise<OutstandingBalancesReport> {
  const activeTenants = await db
    .select({
      id: tenants.id,
      full_name: tenants.full_name,
      unit_id: tenants.unit_id,
      unit_number: units.unit_number,
      property_id: units.property_id,
    })
    .from(tenants)
    .leftJoin(units, eq(tenants.unit_id, units.id))
    .where(eq(tenants.status, 'active'))

  const filtered = propertyId
    ? activeTenants.filter((t) => t.property_id === propertyId)
    : activeTenants

  const tenantIds = filtered.map((t) => t.id)
  if (tenantIds.length === 0) {
    return { entries: [], totalOutstanding: 0, tenantCount: 0 }
  }

  const unpaidBills = await db
    .select({
      id: bills.id,
      tenant_id: bills.tenant_id,
      amount: bills.amount,
      status: bills.status,
      period_start: bills.period_start,
    })
    .from(bills)
    .where(and(inArray(bills.tenant_id, tenantIds), inArray(bills.status, ['pending', 'overdue'])))

  const billsByTenant = new Map<string, typeof unpaidBills>()
  for (const b of unpaidBills) {
    const arr = billsByTenant.get(b.tenant_id) ?? []
    arr.push(b)
    billsByTenant.set(b.tenant_id, arr)
  }

  const entries: OutstandingBalanceEntry[] = []
  for (const t of filtered) {
    const tb = billsByTenant.get(t.id) ?? []
    if (tb.length === 0) continue
    const balance = tb.reduce((s, b) => s + b.amount, 0)
    const months = new Set(tb.map((b) => b.period_start.slice(0, 7)))
    entries.push({
      tenant_id: t.id,
      tenant_full_name: t.full_name,
      unit_number: t.unit_number ?? null,
      balance,
      overdueMonthCount: months.size,
    })
  }

  entries.sort((a, b) => b.balance - a.balance)
  const totalOutstanding = entries.reduce((s, e) => s + e.balance, 0)

  return { entries, totalOutstanding, tenantCount: entries.length }
}

// ─── Occupancy Report ─────────────────────────────────────────────────────────

export async function fetchOccupancyReport(
  propertyId?: string,
): Promise<OccupancyReport> {
  const allUnits = await db
    .select({
      id: units.id,
      unit_number: units.unit_number,
      status: units.status,
      monthly_rate: units.monthly_rate,
      property_id: units.property_id,
      created_at: units.created_at,
    })
    .from(units)

  const filteredUnits = propertyId ? allUnits.filter((u) => u.property_id === propertyId) : allUnits
  const totalUnits = filteredUnits.length
  const occupiedUnits = filteredUnits.filter((u) => u.status === 'occupied').length
  const vacantUnits = totalUnits - occupiedUnits
  const overallPct = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

  // 6-month trend — derive from tenant move_in/move_out
  const allTenants = await db
    .select({
      id: tenants.id,
      unit_id: tenants.unit_id,
      move_in_date: tenants.move_in_date,
      move_out_date: tenants.move_out_date,
    })
    .from(tenants)

  const unitIdSet = new Set(filteredUnits.map((u) => u.id))

  const trend: OccupancyTrendPoint[] = []
  for (let i = 5; i >= 0; i--) {
    const d = dayjs().subtract(i, 'month')
    const monthStart = d.startOf('month').format('YYYY-MM-DD')
    const monthEnd = d.endOf('month').format('YYYY-MM-DD')
    const monthLabel = d.format('MMM')
    const occupiedInMonth = allTenants.filter((t) => {
      if (!t.unit_id || !unitIdSet.has(t.unit_id)) return false
      if (t.move_in_date > monthEnd) return false
      if (t.move_out_date && t.move_out_date < monthStart) return false
      return true
    })
    const uniqueUnits = new Set(occupiedInMonth.map((t) => t.unit_id)).size
    const pct = totalUnits > 0 ? Math.round((uniqueUnits / totalUnits) * 100) : 0
    trend.push({ month: monthLabel, pct })
  }

  // By property
  const allProperties = await db.select({ id: properties.id, name: properties.name }).from(properties)
  const propMap = new Map(allProperties.map((p) => [p.id, p.name]))

  const propGroups = new Map<string, typeof filteredUnits>()
  for (const u of filteredUnits) {
    if (!u.property_id) continue
    const arr = propGroups.get(u.property_id) ?? []
    arr.push(u)
    propGroups.set(u.property_id, arr)
  }

  const byProperty: OccupancyByProperty[] = []
  for (const [propId, propUnits] of propGroups.entries()) {
    const total = propUnits.length
    const occupied = propUnits.filter((u) => u.status === 'occupied').length
    byProperty.push({
      property_id: propId,
      property_name: propMap.get(propId) ?? propId,
      totalUnits: total,
      occupiedUnits: occupied,
      pct: total > 0 ? Math.round((occupied / total) * 100) : 0,
    })
  }

  // Vacant units list
  const vacantList: VacantUnitEntry[] = filteredUnits
    .filter((u) => u.status === 'available' || u.status === 'maintenance')
    .map((u) => {
      const daysVacant = dayjs().diff(dayjs(u.created_at), 'day')
      const lostRevenue = Math.round(((u.monthly_rate ?? 0) * daysVacant) / 30)
      return {
        unit_id: u.id,
        unit_number: u.unit_number,
        property_name: propMap.get(u.property_id ?? '') ?? '',
        daysVacant,
        lostRevenue,
      }
    })

  return { overallPct, totalUnits, occupiedUnits, vacantUnits, trend, byProperty, vacantList }
}

// ─── Per-Unit Income ──────────────────────────────────────────────────────────

export async function fetchPerUnitIncome(
  month: string,
  propertyId?: string,
): Promise<PerUnitIncomeReport> {
  const monthPrefix = `${month}-%`

  const allUnits = await db
    .select({
      id: units.id,
      unit_number: units.unit_number,
      monthly_rate: units.monthly_rate,
      status: units.status,
      property_id: units.property_id,
    })
    .from(units)

  const filteredUnits = propertyId ? allUnits.filter((u) => u.property_id === propertyId) : allUnits

  const activeTenants = await db
    .select({ id: tenants.id, full_name: tenants.full_name, unit_id: tenants.unit_id })
    .from(tenants)
    .where(eq(tenants.status, 'active'))

  const tenantByUnit = new Map<string, string>()
  for (const t of activeTenants) {
    if (t.unit_id) tenantByUnit.set(t.unit_id, t.full_name)
  }

  const monthBills = await db
    .select({ unit_id: bills.unit_id, amount: bills.amount, status: bills.status })
    .from(bills)
    .where(like(bills.due_date, monthPrefix))

  const billByUnit = new Map<string, typeof monthBills[number]>()
  for (const b of monthBills) {
    if (!billByUnit.has(b.unit_id)) billByUnit.set(b.unit_id, b)
  }

  let totalCollected = 0
  let bestUnit: { label: string; collected: number } | null = null

  const entries: PerUnitIncomeEntry[] = filteredUnits.map((u) => {
    const tenantName = tenantByUnit.get(u.id) ?? null
    const bill = billByUnit.get(u.id) ?? null
    const expected = u.monthly_rate ?? 0
    const collected = bill?.status === 'paid' ? (bill.amount) : 0
    const pct = expected > 0 ? Math.round((collected / expected) * 100) : 0

    let status: PerUnitIncomeStatus
    if (!tenantName) {
      status = 'neutral'
    } else if (pct >= 100) {
      status = 'success'
    } else if (pct >= 40) {
      status = 'warning'
    } else {
      status = 'danger'
    }

    totalCollected += collected
    if (collected > 0 && (!bestUnit || collected > bestUnit.collected)) {
      bestUnit = { label: u.unit_number, collected }
    }

    return {
      unit_id: u.id,
      unit_label: u.unit_number,
      unit_type: null,
      tenant_name: tenantName,
      status,
      collected,
      expected,
      pct,
    }
  })

  return { entries, totalCollected, bestUnitLabel: bestUnit ? (bestUnit as { label: string }).label : null }
}

// ─── Annual Summary ───────────────────────────────────────────────────────────

export async function fetchAnnualSummary(
  year: number,
  propertyId?: string,
): Promise<AnnualSummaryReport> {
  const allUnits = propertyId
    ? await db.select({ id: units.id }).from(units).where(eq(units.property_id, propertyId))
    : null
  const unitIdSet = allUnits ? new Set(allUnits.map((u) => u.id)) : null

  const yearBills = await db
    .select({ unit_id: bills.unit_id, amount: bills.amount, status: bills.status, due_date: bills.due_date })
    .from(bills)
    .where(like(bills.due_date, `${year}-%`))

  const filteredBills = unitIdSet ? yearBills.filter((b) => unitIdSet.has(b.unit_id)) : yearBills

  const monthly: AnnualMonthEntry[] = []
  for (let m = 1; m <= 12; m++) {
    const mm = String(m).padStart(2, '0')
    const prefix = `${year}-${mm}-`
    const monthBills = filteredBills.filter((b) => b.due_date.startsWith(prefix))
    const billed = monthBills.reduce((s, b) => s + b.amount, 0)
    const collected = monthBills.filter((b) => b.status === 'paid').reduce((s, b) => s + b.amount, 0)
    monthly.push({ month: dayjs(`${year}-${mm}-01`).format('MMMM'), billed, collected })
  }

  const currentMonthIndex = dayjs().year() === year ? dayjs().month() : 11
  const ytdIncome = monthly.slice(0, currentMonthIndex + 1).reduce((s, m) => s + m.collected, 0)
  const monthsElapsed = currentMonthIndex + 1
  const projectedFullYear = monthsElapsed > 0 ? Math.round((ytdIncome / monthsElapsed) * 12) : 0
  const totalBilled = monthly.reduce((s, m) => s + m.billed, 0)
  const totalCollected = monthly.reduce((s, m) => s + m.collected, 0)
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0

  // Maintenance spend for the year
  const maintRows = await db
    .select({ unit_id: maintenanceIssues.unit_id, repair_cost: maintenanceIssues.repair_cost })
    .from(maintenanceIssues)
    .where(like(maintenanceIssues.reported_at, `${year}-%`))
  const filteredMaint = unitIdSet ? maintRows.filter((r) => unitIdSet.has(r.unit_id)) : maintRows
  const maintenanceSpend = filteredMaint.reduce((s, r) => s + (r.repair_cost ?? 0), 0)

  return { year, ytdIncome, projectedFullYear, totalBilled, totalCollected, collectionRate, maintenanceSpend, monthly }
}

// ─── Maintenance Costs ────────────────────────────────────────────────────────

export async function fetchMaintenanceCosts(
  month: string,
  propertyId?: string,
): Promise<MaintenanceCostsReport> {
  const year = month.slice(0, 4)
  const monthPrefix = `${month}-%`
  const yearPrefix = `${year}-%`

  const allIssues = await db
    .select({
      id: maintenanceIssues.id,
      unit_id: maintenanceIssues.unit_id,
      category: maintenanceIssues.category,
      status: maintenanceIssues.status,
      repair_cost: maintenanceIssues.repair_cost,
      charged_to_tenant: maintenanceIssues.charged_to_tenant,
      reported_at: maintenanceIssues.reported_at,
    })
    .from(maintenanceIssues)
    .where(like(maintenanceIssues.reported_at, yearPrefix))

  // Filter by property
  let filteredIssues = allIssues
  if (propertyId) {
    const propUnits = await db
      .select({ id: units.id })
      .from(units)
      .where(eq(units.property_id, propertyId))
    const propUnitIds = new Set(propUnits.map((u) => u.id))
    filteredIssues = allIssues.filter((i) => propUnitIds.has(i.unit_id))
  }

  const thisMonthIssues = filteredIssues.filter((i) => i.reported_at.startsWith(month))
  const thisMonthCost = thisMonthIssues.reduce((s, i) => s + (i.repair_cost ?? 0), 0)
  const ytdCost = filteredIssues.reduce((s, i) => s + (i.repair_cost ?? 0), 0)
  const openCount = thisMonthIssues.filter((i) => i.status === 'REPORTED' || i.status === 'IN_PROGRESS').length
  const resolvedCount = thisMonthIssues.filter((i) => i.status === 'RESOLVED').length
  const chargedToTenantCount = thisMonthIssues.filter((i) => i.charged_to_tenant === 1).length

  // Cost by unit (this month)
  const unitGroups = new Map<string, typeof thisMonthIssues>()
  for (const issue of thisMonthIssues) {
    const arr = unitGroups.get(issue.unit_id) ?? []
    arr.push(issue)
    unitGroups.set(issue.unit_id, arr)
  }

  const unitRows = await db
    .select({ id: units.id, unit_number: units.unit_number })
    .from(units)

  const unitMap = new Map(unitRows.map((u) => [u.id, u.unit_number]))

  const byUnit: MaintenanceCostByUnit[] = []
  for (const [unitId, issues] of unitGroups.entries()) {
    const categories = [...new Set(issues.map((i) => i.category))].join(', ')
    const cost = issues.reduce((s, i) => s + (i.repair_cost ?? 0), 0)
    const fromTenantAmount = issues
      .filter((i) => i.charged_to_tenant === 1)
      .reduce((s, i) => s + (i.repair_cost ?? 0), 0)
    byUnit.push({
      unit_id: unitId,
      unit_label: unitMap.get(unitId) ?? unitId,
      categories,
      count: issues.length,
      cost,
      fromTenant: fromTenantAmount > 0 ? fromTenantAmount : null,
    })
  }
  byUnit.sort((a, b) => b.cost - a.cost)

  return { thisMonthCost, ytdCost, openCount, resolvedCount, chargedToTenantCount, byUnit }
}

// ─── Deposit Summary ──────────────────────────────────────────────────────────

export async function fetchDepositSummary(
  propertyId?: string,
): Promise<DepositSummaryReport> {
  const rows = await db
    .select({
      tenant_id: contracts.tenant_id,
      tenant_name: tenants.full_name,
      unit_id: contracts.unit_id,
      unit_number: units.unit_number,
      property_id: units.property_id,
      deposit: contracts.deposit,
      contract_status: contracts.status,
    })
    .from(contracts)
    .innerJoin(tenants, eq(contracts.tenant_id, tenants.id))
    .leftJoin(units, eq(contracts.unit_id, units.id))
    .where(inArray(contracts.status, ['active', 'expired']))
    .orderBy(asc(tenants.full_name))

  const filtered = propertyId ? rows.filter((r) => r.property_id === propertyId) : rows

  // Deduplicate by tenant_id (keep latest / active contract)
  const seen = new Map<string, typeof filtered[number]>()
  for (const r of filtered) {
    if (!seen.has(r.tenant_id) || r.contract_status === 'active') {
      seen.set(r.tenant_id, r)
    }
  }

  const entries: DepositSummaryEntry[] = [...seen.values()].map((r) => ({
    tenant_id: r.tenant_id,
    tenant_name: r.tenant_name,
    unit_number: r.unit_number ?? null,
    deposit: r.deposit,
    status: r.contract_status === 'active' ? 'ACTIVE' : 'FORMER',
  }))

  // Sort: ACTIVE first, then by name
  entries.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'ACTIVE' ? -1 : 1
    return a.tenant_name.localeCompare(b.tenant_name)
  })

  const totalHeld = entries.reduce((s, e) => s + e.deposit, 0)
  return { entries, totalHeld, tenantCount: entries.length }
}
