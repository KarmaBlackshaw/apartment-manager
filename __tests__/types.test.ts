import type { Tenant, Bill } from '../types'

test('BillingType narrows correctly', () => {
  const t: Tenant = {
    id: '1', unit_id: '2',
    full_name: 'A', email: 'a@b.com', phone: '1', billing_type: 'monthly',
    move_in_date: '2025-01-01', move_out_date: null,
    status: 'active', created_at: '2025-01-01T00:00:00Z',
  }
  expect(t.billing_type).toBe('monthly')
})
