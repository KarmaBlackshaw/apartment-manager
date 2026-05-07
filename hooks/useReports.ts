import { useQuery } from '@tanstack/react-query'
import {
  fetchMonthlyCollection,
  fetchOutstandingBalances,
  fetchOccupancyReport,
  fetchPerUnitIncome,
  fetchAnnualSummary,
  fetchMaintenanceCosts,
  fetchDepositSummary,
} from '~/lib/api/reports'

export const MONTHLY_COLLECTION_KEY = ['monthly_collection'] as const
export const OUTSTANDING_BALANCES_KEY = ['outstanding_balances'] as const
export const OCCUPANCY_REPORT_KEY = ['occupancy_report'] as const
export const PER_UNIT_INCOME_KEY = ['per_unit_income'] as const
export const ANNUAL_SUMMARY_KEY = ['annual_summary'] as const
export const MAINTENANCE_COSTS_KEY = ['maintenance_costs'] as const
export const DEPOSIT_SUMMARY_KEY = ['deposit_summary'] as const

export function useMonthlyCollection(month: string, propertyId?: string) {
  return useQuery({
    queryKey: [...MONTHLY_COLLECTION_KEY, month, propertyId],
    queryFn: () => fetchMonthlyCollection(month, propertyId),
    enabled: !!month,
  })
}

export function useOutstandingBalances(propertyId?: string) {
  return useQuery({
    queryKey: [...OUTSTANDING_BALANCES_KEY, propertyId],
    queryFn: () => fetchOutstandingBalances(propertyId),
  })
}

export function useOccupancyReport(propertyId?: string) {
  return useQuery({
    queryKey: [...OCCUPANCY_REPORT_KEY, propertyId],
    queryFn: () => fetchOccupancyReport(propertyId),
  })
}

export function usePerUnitIncome(month: string, propertyId?: string) {
  return useQuery({
    queryKey: [...PER_UNIT_INCOME_KEY, month, propertyId],
    queryFn: () => fetchPerUnitIncome(month, propertyId),
    enabled: !!month,
  })
}

export function useAnnualSummary(year: number, propertyId?: string) {
  return useQuery({
    queryKey: [...ANNUAL_SUMMARY_KEY, year, propertyId],
    queryFn: () => fetchAnnualSummary(year, propertyId),
    enabled: !!year,
  })
}

export function useMaintenanceCosts(month: string, propertyId?: string) {
  return useQuery({
    queryKey: [...MAINTENANCE_COSTS_KEY, month, propertyId],
    queryFn: () => fetchMaintenanceCosts(month, propertyId),
    enabled: !!month,
  })
}

export function useDepositSummary(propertyId?: string) {
  return useQuery({
    queryKey: [...DEPOSIT_SUMMARY_KEY, propertyId],
    queryFn: () => fetchDepositSummary(propertyId),
  })
}
