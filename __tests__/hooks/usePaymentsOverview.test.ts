import { fetchPaymentsOverview } from '~/lib/api/paymentsOverview'

const mockTenants = [
  { id: 't1', full_name: 'Ana Reyes',  unit_id: 'u1', unit_number: '1A' },
  { id: 't2', full_name: 'Ben Cruz',   unit_id: 'u2', unit_number: '2B' },
  { id: 't3', full_name: 'Cara Lim',   unit_id: null, unit_number: null },
  { id: 't4', full_name: 'Dan Santos', unit_id: 'u4', unit_number: '4C' },
]
const mockBills = [
  { id: 'b1', tenant_id: 't1', amount: 5000, status: 'paid' },
  { id: 'b2', tenant_id: 't2', amount: 4500, status: 'overdue' },
  { id: 'b3', tenant_id: 't4', amount: 3500, status: 'pending' },
  // t3 has no bill
]

let tenantCallCount = 0

jest.mock('../../db', () => ({
  db: {
    select: jest.fn(),
  },
}))
jest.mock('drizzle-orm', () => ({ eq: jest.fn(), like: jest.fn(), and: jest.fn() }))
jest.mock('../../db/schema', () => ({ tenants: {}, units: {}, bills: {} }))

import { db } from '~/db'

beforeEach(() => {
  jest.clearAllMocks()
  tenantCallCount = 0
  ;(db.select as jest.Mock).mockImplementation(() => ({
    from: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockImplementation(() => {
      tenantCallCount++
      return tenantCallCount === 1
        ? Promise.resolve(mockTenants)
        : Promise.resolve(mockBills)
    }),
  }))
})

describe('fetchPaymentsOverview', () => {
  it('returns one entry per active tenant', async () => {
    const result = await fetchPaymentsOverview(2026, 5)
    expect(result).toHaveLength(4)
  })

  it('maps paid bill → paid status', async () => {
    const result = await fetchPaymentsOverview(2026, 5)
    const ana = result.find((r) => r.tenant_id === 't1')!
    expect(ana.month_status).toBe('paid')
    expect(ana.bill_amount).toBe(5000)
    expect(ana.bill_id).toBe('b1')
  })

  it('maps overdue bill → overdue status', async () => {
    const result = await fetchPaymentsOverview(2026, 5)
    const ben = result.find((r) => r.tenant_id === 't2')!
    expect(ben.month_status).toBe('overdue')
    expect(ben.bill_amount).toBe(4500)
  })

  it('maps pending bill → unpaid status', async () => {
    const result = await fetchPaymentsOverview(2026, 5)
    const dan = result.find((r) => r.tenant_id === 't4')!
    expect(dan.month_status).toBe('unpaid')
  })

  it('maps missing bill → no_bill status with zero amount', async () => {
    const result = await fetchPaymentsOverview(2026, 5)
    const cara = result.find((r) => r.tenant_id === 't3')!
    expect(cara.month_status).toBe('no_bill')
    expect(cara.bill_id).toBeNull()
    expect(cara.bill_amount).toBe(0)
  })

  it('sorts overdue first, then unpaid, then no_bill, then paid', async () => {
    const result = await fetchPaymentsOverview(2026, 5)
    const statuses = result.map((r) => r.month_status)
    expect(statuses[0]).toBe('overdue')
    expect(statuses[statuses.length - 1]).toBe('paid')
  })

  it('includes unit_number from tenant row', async () => {
    const result = await fetchPaymentsOverview(2026, 5)
    const ana = result.find((r) => r.tenant_id === 't1')!
    expect(ana.unit_number).toBe('1A')
  })
})
