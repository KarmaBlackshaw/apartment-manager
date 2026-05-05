import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchProperties, fetchProperty, createProperty, updateProperty, deleteProperty,
} from '../lib/api/properties'
import type { Property } from '../types'

export const PROPERTIES_KEY = ['properties'] as const

export function useProperties() {
  return useQuery({ queryKey: PROPERTIES_KEY, queryFn: fetchProperties })
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: [...PROPERTIES_KEY, id],
    queryFn: () => fetchProperty(id),
    enabled: !!id,
  })
}

export function useCreateProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => qc.invalidateQueries({ queryKey: PROPERTIES_KEY }),
  })
}

export function useUpdateProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateProperty>[1] }) =>
      updateProperty(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROPERTIES_KEY }),
  })
}

export function useDeleteProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: [...PROPERTIES_KEY, id] })
      qc.invalidateQueries({ queryKey: PROPERTIES_KEY })
    },
  })
}
