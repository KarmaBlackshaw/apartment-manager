import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchTenants,
  fetchTenant,
  createTenant,
  updateTenant,
  deactivateTenant,
} from '../lib/api/tenants'
import type { TenantFilters } from '../lib/api/tenants'

export const TENANTS_KEY = ['tenants'] as const

export function useTenants(filters?: TenantFilters) {
  return useQuery({
    queryKey: [...TENANTS_KEY, filters],
    queryFn: () => fetchTenants(filters),
  })
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: [...TENANTS_KEY, id],
    queryFn: () => fetchTenant(id),
    enabled: !!id,
  })
}

export function useCreateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TENANTS_KEY })
      qc.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

export function useUpdateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateTenant>[1] }) =>
      updateTenant(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: TENANTS_KEY }),
  })
}

export function useDeactivateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, unitId }: { id: string; unitId: string }) => deactivateTenant(id, unitId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TENANTS_KEY })
      qc.invalidateQueries({ queryKey: ['units'] })
    },
  })
}
