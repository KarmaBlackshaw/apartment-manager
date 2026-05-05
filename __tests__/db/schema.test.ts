import { properties, units, tenants, bills, contracts } from '../../db/schema'

test('properties table has required columns', () => {
  expect(properties.name).toBeDefined()
  expect(properties.address).toBeDefined()
})

test('units table has billing_type column', () => {
  expect(units.billing_type).toBeDefined()
})

test('bills table has status column', () => {
  expect(bills.status).toBeDefined()
})
