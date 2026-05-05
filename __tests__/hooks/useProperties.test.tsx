import { renderHook, waitFor } from '@testing-library/react-native'
import { createWrapper } from '../helpers/queryWrapper'
import { useProperties } from '../../hooks/useProperties'

jest.mock('../../lib/api/properties', () => ({
  fetchProperties: jest.fn().mockResolvedValue([
    { id: '1', name: 'Building A', address: '123 Main St', description: null, created_at: '2025-01-01T00:00:00' },
  ]),
  fetchProperty: jest.fn(),
  createProperty: jest.fn(),
  updateProperty: jest.fn(),
  deleteProperty: jest.fn(),
}))

test('returns properties list', async () => {
  const { result } = renderHook(() => useProperties(), { wrapper: createWrapper() })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data).toHaveLength(1)
  expect(result.current.data![0].name).toBe('Building A')
})
