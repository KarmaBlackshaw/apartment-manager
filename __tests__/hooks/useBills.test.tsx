import { renderHook, waitFor } from '@testing-library/react-native'
import { createWrapper } from '../helpers/queryWrapper'
import { useBills } from '../../hooks/useBills'

jest.mock('../../lib/api/bills', () => ({
  fetchBills: jest.fn().mockResolvedValue([
    {
      id: 'b1', tenant_id: 't1', unit_id: 'u1', amount: 500,
      billing_type: 'monthly', period_start: '2025-01-01', period_end: '2025-01-31',
      due_date: '2025-01-05', paid_at: null, status: 'pending', notes: null,
      created_at: '2025-01-01T00:00:00Z',
      tenant: { full_name: 'John Doe', email: 'john@test.com' },
    },
  ]),
  fetchBill: jest.fn(),
  createBill: jest.fn(),
  markBillPaid: jest.fn(),
  deleteBill: jest.fn(),
}))

test('returns bills list', async () => {
  const { result } = renderHook(() => useBills(), { wrapper: createWrapper() })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data![0].amount).toBe(500)
})

test('returns tenant name on bill', async () => {
  const { result } = renderHook(() => useBills(), { wrapper: createWrapper() })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data![0].tenant.full_name).toBe('John Doe')
})
