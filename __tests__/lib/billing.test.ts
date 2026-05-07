import {
  calcDailyAmount,
  calcMonthlyAmount,
  calcWaterCharge,
  calcElectricityCharge,
  calcInternetCharge,
  formatCurrency,
  isOverdue,
} from '~/lib/billing'

// --- calcDailyAmount ---
test('calcDailyAmount: 5 days at 25/day = 125', () => {
  expect(calcDailyAmount(25, '2025-01-01', '2025-01-05')).toBe(125)
})

test('calcDailyAmount: same start and end = 1 day', () => {
  expect(calcDailyAmount(25, '2025-01-01', '2025-01-01')).toBe(25)
})

// --- calcMonthlyAmount ---
test('calcMonthlyAmount returns the rate', () => {
  expect(calcMonthlyAmount(500)).toBe(500)
})

// --- isOverdue ---
test('isOverdue: past due date and unpaid = true', () => {
  expect(isOverdue('2020-01-01', 'pending')).toBe(true)
})

test('isOverdue: paid = false even if past due', () => {
  expect(isOverdue('2020-01-01', 'paid')).toBe(false)
})

test('isOverdue: future due date = false', () => {
  expect(isOverdue('2099-12-31', 'pending')).toBe(false)
})

// --- calcWaterCharge ---
test('calcWaterCharge: 10 cubic meters at 35/m³ = 350', () => {
  expect(calcWaterCharge(100, 110, 35)).toBe(350)
})

test('calcWaterCharge: zero consumption = 0', () => {
  expect(calcWaterCharge(100, 100, 35)).toBe(0)
})

test('calcWaterCharge: fractional result rounds to 2 decimals', () => {
  expect(calcWaterCharge(0, 1, 33.33)).toBe(33.33)
})

// --- calcElectricityCharge ---
test('calcElectricityCharge: 50 kWh at 13/kWh = 650', () => {
  expect(calcElectricityCharge(200, 250, 13)).toBe(650)
})

test('calcElectricityCharge: zero consumption = 0', () => {
  expect(calcElectricityCharge(500, 500, 13)).toBe(0)
})

// --- calcInternetCharge ---
test('calcInternetCharge: included returns the rate', () => {
  expect(calcInternetCharge(true, 999)).toBe(999)
})

test('calcInternetCharge: not included returns 0', () => {
  expect(calcInternetCharge(false, 999)).toBe(0)
})

test('calcInternetCharge: included with 0 rate returns 0', () => {
  expect(calcInternetCharge(true, 0)).toBe(0)
})

// --- formatCurrency ---
test('formatCurrency: whole number formats with 2 decimals', () => {
  expect(formatCurrency(1500)).toBe('PHP 1500.00')
})

test('formatCurrency: fractional amount formats correctly', () => {
  expect(formatCurrency(1234.5)).toBe('PHP 1234.50')
})

test('formatCurrency: zero formats as 0.00', () => {
  expect(formatCurrency(0)).toBe('PHP 0.00')
})
