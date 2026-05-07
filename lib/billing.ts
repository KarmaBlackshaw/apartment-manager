import type { BillStatus } from '~/types'

export function calcDailyAmount(dailyRate: number, periodStart: string, periodEnd: string): number {
  const start = new Date(periodStart)
  const end = new Date(periodEnd)
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  return parseFloat((dailyRate * days).toFixed(2))
}

export function calcMonthlyAmount(monthlyRate: number): number {
  return monthlyRate
}

export function isOverdue(dueDateStr: string, status: BillStatus): boolean {
  if (status === 'paid') return false
  const today = new Date().toISOString().split('T')[0]
  return dueDateStr < today
}

export function formatCurrency(amount: number): string {
  return `PHP ${amount.toFixed(2)}`
}

export function calcWaterCharge(previous: number, current: number, rate: number): number {
  return parseFloat(((current - previous) * rate).toFixed(2))
}

export function calcElectricityCharge(previous: number, current: number, rate: number): number {
  return parseFloat(((current - previous) * rate).toFixed(2))
}

export function formatDateRange(start: string, end: string): string {
  if (start === end) return start
  return `${start} – ${end}`
}

export function calcInternetCharge(includeInternet: boolean, rate: number): number {
  return includeInternet ? rate : 0
}
