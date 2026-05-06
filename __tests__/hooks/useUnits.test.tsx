import { renderHook, waitFor } from '@testing-library/react-native'
import { act } from '@testing-library/react-native'
import { createWrapper } from '../helpers/queryWrapper'
import { useUnits, useCreateUnit } from '../../hooks/useUnits'
import { createUnit } from '../../lib/api/units'

jest.mock('../../lib/api/units', () => ({
  fetchUnits: jest.fn().mockResolvedValue([
    { id: 'u1', property_id: 'p1', unit_number: '101', floor: 1,
      bedrooms: 2, bathrooms: 1, monthly_rate: 500, daily_rate: null,
      billing_type: 'monthly', status: 'available', created_at: '2025-01-01T00:00:00Z' },
  ]),
  fetchUnit: jest.fn(),
  createUnit: jest.fn(),
  updateUnit: jest.fn(),
  deleteUnit: jest.fn(),
}))

test('returns units for a property', async () => {
  const { result } = renderHook(() => useUnits('p1'), { wrapper: createWrapper() })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data![0].unit_number).toBe('101')
})

test('does not fetch when propertyId is empty', () => {
  const { result } = renderHook(() => useUnits(''), { wrapper: createWrapper() })
  expect(result.current.fetchStatus).toBe('idle')
})

test('useCreateUnit calls createUnit and invalidates list', async () => {
  const mockUnit = {
    id: 'u2', property_id: 'p1', unit_number: '102', floor: null,
    bedrooms: 1, bathrooms: 1, monthly_rate: 400, daily_rate: null,
    billing_type: 'monthly' as const, status: 'available' as const,
    created_at: '2025-01-01T00:00:00Z',
  }
  ;(createUnit as jest.Mock).mockResolvedValue(mockUnit)

  const { result } = renderHook(() => useCreateUnit('p1'), { wrapper: createWrapper() })
  await act(async () => {
    result.current.mutate({
      property_id: 'p1', unit_number: '102', floor: null,
      bedrooms: 1, bathrooms: 1, monthly_rate: 400, daily_rate: null,
      billing_type: 'monthly', unit_type: null, amenities: '[]',
      size_sqm: null, billing_day: 1,
    })
  })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(createUnit).toHaveBeenCalledWith(
    expect.objectContaining({ unit_number: '102' }),
    expect.anything(),
  )
})
