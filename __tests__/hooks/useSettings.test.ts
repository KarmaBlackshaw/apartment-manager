import { renderHook, waitFor, act } from '@testing-library/react-native'
import { createWrapper } from '../helpers/queryWrapper'
import { useSettings, useUpdateSetting } from '../../hooks/useSettings'

const mockFetchSettings = jest.fn()
const mockUpdateSetting = jest.fn()

jest.mock('../../lib/api/settings', () => ({
  fetchSettings: (...args: unknown[]) => mockFetchSettings(...args),
  updateSetting: (...args: unknown[]) => mockUpdateSetting(...args),
}))

const defaultSettings = {
  water_rate: 35,
  electricity_rate: 13,
  internet_rate: 0,
  apartment_name: 'Apartment Manager',
  owner_name: '',
}

beforeEach(() => {
  jest.clearAllMocks()
  mockFetchSettings.mockResolvedValue(defaultSettings)
  mockUpdateSetting.mockResolvedValue(undefined)
})

test('returns settings from API', async () => {
  const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data).toEqual(defaultSettings)
})

test('returns default water_rate of 35', async () => {
  const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data!.water_rate).toBe(35)
})

test('returns default electricity_rate of 13', async () => {
  const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data!.electricity_rate).toBe(13)
})

test('returns default internet_rate of 0', async () => {
  const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data!.internet_rate).toBe(0)
})

test('useUpdateSetting calls updateSetting with key and value', async () => {
  const { result } = renderHook(() => useUpdateSetting(), { wrapper: createWrapper() })
  await act(async () => {
    await result.current.mutateAsync({ key: 'water_rate', value: '40' })
  })
  expect(mockUpdateSetting).toHaveBeenCalledWith('water_rate', '40')
})

test('useUpdateSetting accepts string keys including apartment_name', async () => {
  const { result } = renderHook(() => useUpdateSetting(), { wrapper: createWrapper() })
  await act(async () => {
    await result.current.mutateAsync({ key: 'apartment_name', value: 'My Building' })
  })
  expect(mockUpdateSetting).toHaveBeenCalledWith('apartment_name', 'My Building')
})
