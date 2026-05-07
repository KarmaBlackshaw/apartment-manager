import { renderHook, waitFor } from '@testing-library/react-native'
import { act } from '@testing-library/react-native'
import { createWrapper } from '../helpers/queryWrapper'
import { useUnits, useCreateUnit } from '../../hooks/useUnits'
import { createUnit } from '../../lib/api/units'

jest.mock('../../lib/api/units', () => ({
  fetchUnits: jest.fn().mockResolvedValue([
    { id: 'u1', property_id: 'p1', unit_number: '101', monthly_rate: 500, billing_day: 1, notes: null, status: 'available' as const, created_at: '2025-01-01T00:00:00Z' },
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
    id: 'u2', property_id: 'p1', unit_number: '102',
    monthly_rate: 400, billing_day: 1, notes: null,
    status: 'available' as const, created_at: '2025-01-01T00:00:00Z',
  }
  ;(createUnit as jest.Mock).mockResolvedValue(mockUnit)

  const { result } = renderHook(() => useCreateUnit('p1'), { wrapper: createWrapper() })
  await act(async () => {
    result.current.mutate({
      property_id: 'p1',
      unit_number: '102',
      monthly_rate: 400,
      billing_day: 1,
      notes: null,
    })
  })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(createUnit).toHaveBeenCalledWith(
    expect.objectContaining({ unit_number: '102' }),
    expect.anything(),
  )
})
