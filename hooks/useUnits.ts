import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchUnits, fetchUnit, fetchUnitsWithStatus, fetchUnitDetail,
  createUnit, updateUnit, deleteUnit, fetchUnitCounts,
  fetchUnitStatusCounts, fetchVacantUnits,
} from '../lib/api/units'
import type { Unit } from '../types'

export const unitCountsKey = ['unit-counts'] as const

export const unitsKey = (propertyId: string) => ['units', propertyId] as const

export function useUnits(propertyId: string) {
  return useQuery({
    queryKey: unitsKey(propertyId),
    queryFn: () => fetchUnits(propertyId),
    enabled: !!propertyId,
  })
}

export function useUnitsWithStatus(propertyId: string, floor?: number | null) {
  return useQuery({
    queryKey: ['units-with-status', propertyId, floor ?? 'all'],
    queryFn: async () => {
      const all = await fetchUnitsWithStatus(propertyId)
      return floor != null ? all.filter((u) => u.floor === floor) : all
    },
    enabled: !!propertyId,
  })
}

export function useUnitCounts() {
  return useQuery({ queryKey: unitCountsKey, queryFn: fetchUnitCounts })
}

export function useUnitStatusCounts() {
  return useQuery({ queryKey: ['unit-status-counts'], queryFn: fetchUnitStatusCounts })
}

export function useVacantUnits() {
  return useQuery({ queryKey: ['vacant-units'], queryFn: fetchVacantUnits })
}

export function useUnit(id: string) {
  return useQuery({
    queryKey: ['unit', id],
    queryFn: () => fetchUnit(id),
    enabled: !!id,
  })
}

export function useUnitDetail(unitId: string) {
  return useQuery({
    queryKey: ['unit-detail', unitId],
    queryFn: () => fetchUnitDetail(unitId),
    enabled: !!unitId,
  })
}

export function useCreateUnit(propertyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: unitsKey(propertyId) })
      qc.invalidateQueries({ queryKey: unitCountsKey })
    },
  })
}

export function useUpdateUnit(propertyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateUnit>[1] }) =>
      updateUnit(id, input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: unitsKey(propertyId) })
      qc.invalidateQueries({ queryKey: ['unit', data.id] })
      qc.invalidateQueries({ queryKey: ['unit-detail', data.id] })
    },
  })
}

export function useDeleteUnit(propertyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUnit(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: ['unit', id] })
      qc.invalidateQueries({ queryKey: unitsKey(propertyId) })
      qc.invalidateQueries({ queryKey: unitCountsKey })
    },
  })
}
