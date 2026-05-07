import { useQuery } from '@tanstack/react-query'
import { fetchPaymentsOverview } from '~/lib/api/paymentsOverview'

export const PAYMENTS_OVERVIEW_KEY = ['paymentsOverview'] as const

export function usePaymentsOverview(year: number, month: number) {
  return useQuery({
    queryKey: [...PAYMENTS_OVERVIEW_KEY, year, month],
    queryFn: () => fetchPaymentsOverview(year, month),
  })
}
