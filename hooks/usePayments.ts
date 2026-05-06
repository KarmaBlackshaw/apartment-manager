import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPayment,
  createPayment,
  voidPayment,
  type CreatePaymentInput,
} from '../lib/api/payments'
import { BILLS_KEY } from './useBills'

export const PAYMENTS_KEY = ['payments'] as const

export function usePayment(id: string) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, id],
    queryFn: () => fetchPayment(id),
    enabled: !!id,
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAYMENTS_KEY })
      qc.invalidateQueries({ queryKey: BILLS_KEY })
    },
  })
}

export function useVoidPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: voidPayment,
    onSuccess: () => qc.invalidateQueries({ queryKey: PAYMENTS_KEY }),
  })
}
