import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchBills,
  fetchBill,
  fetchLastBillForTenant,
  createBill,
  markBillPaid,
  deleteBill,
  type BillFilters,
} from '../lib/api/bills'

export const BILLS_KEY = ['bills'] as const

export function useBills(filters?: BillFilters) {
  return useQuery({
    queryKey: [...BILLS_KEY, filters],
    queryFn: () => fetchBills(filters),
  })
}

export function useBill(id: string) {
  return useQuery({
    queryKey: [...BILLS_KEY, id],
    queryFn: () => fetchBill(id),
    enabled: !!id,
  })
}

export function useCreateBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBill,
    onSuccess: () => qc.invalidateQueries({ queryKey: BILLS_KEY }),
  })
}

export function useMarkBillPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markBillPaid,
    onSuccess: () => qc.invalidateQueries({ queryKey: BILLS_KEY }),
  })
}

export function useDeleteBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteBill,
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: [...BILLS_KEY, id] })
      qc.invalidateQueries({ queryKey: BILLS_KEY })
    },
  })
}

export function useLastBillForTenant(tenantId: string | null) {
  return useQuery({
    queryKey: [...BILLS_KEY, 'last', tenantId],
    queryFn: () => fetchLastBillForTenant(tenantId!),
    enabled: !!tenantId,
  })
}
