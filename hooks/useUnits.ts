import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchUnits, fetchUnit, createUnit, updateUnit, deleteUnit, fetchUnitCounts,
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

export function useUnitCounts() {
  return useQuery({ queryKey: unitCountsKey, queryFn: fetchUnitCounts })
}

export function useUnit(id: string) {
  return useQuery({
    queryKey: ['unit', id],
    queryFn: () => fetchUnit(id),
    enabled: !!id,
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
