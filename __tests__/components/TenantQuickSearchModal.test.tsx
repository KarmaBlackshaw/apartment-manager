import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { TenantQuickSearchModal } from '~/components/tenants/TenantQuickSearchModal'
jest.mock('../../hooks/useTenants', () => ({
  useTenants: () => ({
    data: [
      {
        id: 't1', full_name: 'Ana Reyes', email: 'ana@test.com', phone: '09171234567',
        billing_type: 'monthly', move_in_date: '2026-01-01', status: 'active',
        unit_id: 'u1', unit: { unit_number: '1A', floor: null, billing_type: 'monthly' },
        due_day: 5, include_internet: false, water_reading: null, electricity_reading: null,
        address: null, emergency_contact: null, move_out_date: null, created_at: '2026-01-01',
      },
      {
        id: 't2', full_name: 'Ben Cruz', email: 'ben@test.com', phone: '09179876543',
        billing_type: 'monthly', move_in_date: '2026-01-01', status: 'active',
        unit_id: 'u2', unit: { unit_number: '2B', floor: null, billing_type: 'monthly' },
        due_day: 10, include_internet: false, water_reading: null, electricity_reading: null,
        address: null, emergency_contact: null, move_out_date: null, created_at: '2026-01-01',
      },
    ],
  }),
}))

jest.mock('../../hooks/useBills', () => ({
  useBills: () => ({
    data: [
      { id: 'b1', tenant_id: 't1', amount: 4500, status: 'overdue', due_date: '2026-05-01', paid_at: null },
    ],
  }),
}))

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))

describe('TenantQuickSearchModal', () => {
  const onClose = jest.fn()

  beforeEach(() => onClose.mockClear())

  it('does not render when visible=false', () => {
    render(<TenantQuickSearchModal visible={false} onClose={onClose} />)
    expect(screen.queryByPlaceholderText('Search tenants...')).toBeNull()
  })

  it('renders search input when visible=true', () => {
    render(<TenantQuickSearchModal visible={true} onClose={onClose} />)
    expect(screen.getByPlaceholderText('Search tenants...')).toBeTruthy()
  })

  it('shows no results before typing', () => {
    render(<TenantQuickSearchModal visible={true} onClose={onClose} />)
    expect(screen.queryByText('No tenants found')).toBeNull()
    expect(screen.queryByText('Ana Reyes')).toBeNull()
  })

  it('shows matching results after typing', () => {
    render(<TenantQuickSearchModal visible={true} onClose={onClose} />)
    fireEvent.changeText(screen.getByPlaceholderText('Search tenants...'), 'Ana')
    expect(screen.getByText('Ana Reyes')).toBeTruthy()
  })

  it('filters case-insensitively', () => {
    render(<TenantQuickSearchModal visible={true} onClose={onClose} />)
    fireEvent.changeText(screen.getByPlaceholderText('Search tenants...'), 'ana')
    expect(screen.getByText('Ana Reyes')).toBeTruthy()
    expect(screen.queryByText('Ben Cruz')).toBeNull()
  })

  it('shows no results text when query matches nothing', () => {
    render(<TenantQuickSearchModal visible={true} onClose={onClose} />)
    fireEvent.changeText(screen.getByPlaceholderText('Search tenants...'), 'zzz')
    expect(screen.getByText('No tenants found')).toBeTruthy()
  })

  it('shows Record Payment button for tenant with overdue bill', () => {
    render(<TenantQuickSearchModal visible={true} onClose={onClose} />)
    fireEvent.changeText(screen.getByPlaceholderText('Search tenants...'), 'Ana')
    expect(screen.getByText('Record Payment')).toBeTruthy()
  })

  it('calls onClose when close button pressed', () => {
    render(<TenantQuickSearchModal visible={true} onClose={onClose} />)
    fireEvent.press(screen.getByLabelText('Close search'))
    expect(onClose).toHaveBeenCalled()
  })
})
