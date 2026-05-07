import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchBillingOverview,
  fetchBillPreview,
  generateBillsForMonth,
  type GenerateBillsInput,
} from '~/lib/api/billingOverview'
import { BILLS_KEY } from '~/hooks/useBills'

export const BILLING_OVERVIEW_KEY = ['billing_overview'] as const
export const BILL_PREVIEW_KEY = ['bill_preview'] as const

export function useBillingOverview(month: string, propertyId?: string) {
  return useQuery({
    queryKey: [...BILLING_OVERVIEW_KEY, month, propertyId],
    queryFn: () => fetchBillingOverview(month, propertyId),
    enabled: !!month,
  })
}

export function useBillPreview(month: string, propertyId?: string) {
  return useQuery({
    queryKey: [...BILL_PREVIEW_KEY, month, propertyId],
    queryFn: () => fetchBillPreview(month, propertyId),
    enabled: !!month,
  })
}

export function useGenerateBills() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: generateBillsForMonth,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BILLS_KEY })
      qc.invalidateQueries({ queryKey: BILLING_OVERVIEW_KEY })
      qc.invalidateQueries({ queryKey: BILL_PREVIEW_KEY })
    },
  })
}
