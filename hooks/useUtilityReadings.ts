import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchUtilityReading,
  upsertUtilityReading,
  type UpsertUtilityReadingInput,
} from '../lib/api/utilityReadings'
import type { UtilityType } from '../types'

export const UTILITY_READINGS_KEY = ['utility_readings'] as const

export function useUtilityReading(unitId: string, month: string, type: UtilityType) {
  return useQuery({
    queryKey: [...UTILITY_READINGS_KEY, unitId, month, type],
    queryFn: () => fetchUtilityReading(unitId, month, type),
    enabled: !!unitId && !!month,
  })
}

export function useUpsertUtilityReading() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: upsertUtilityReading,
    onSuccess: () => qc.invalidateQueries({ queryKey: UTILITY_READINGS_KEY }),
  })
}
