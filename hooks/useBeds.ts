import { useQuery } from '@tanstack/react-query'
import { fetchBedMap } from '../lib/api/beds'

export function useBedMap(unitId: string) {
  return useQuery({
    queryKey: ['bed-map', unitId],
    queryFn: () => fetchBedMap(unitId),
    enabled: !!unitId,
  })
}
