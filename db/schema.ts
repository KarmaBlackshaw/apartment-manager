import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const properties = sqliteTable('properties', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  description: text('description'),
  created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

export const units = sqliteTable('units', {
  id: text('id').primaryKey(),
  property_id: text('property_id').notNull().references(() => properties.id),
  unit_number: text('unit_number').notNull(),
  floor: integer('floor'),
  bedrooms: integer('bedrooms').notNull().default(1),
  bathrooms: integer('bathrooms').notNull().default(1),
  monthly_rate: real('monthly_rate'),
  daily_rate: real('daily_rate'),
  billing_type: text('billing_type', { enum: ['monthly', 'daily'] }).notNull(),
  status: text('status', { enum: ['available', 'occupied', 'maintenance'] }).notNull().default('available'),
  unit_type: text('unit_type', { enum: ['studio', '1br', '2br', 'bedspacer'] }).default('studio'),
  amenities: text('amenities').default('[]'),
  size_sqm: real('size_sqm'),
  billing_day: integer('billing_day').default(1),
  created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, (t) => ({
  unitNumberUnique: uniqueIndex('units_property_unit_unique').on(t.property_id, t.unit_number),
}))

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  unit_id: text('unit_id').references(() => units.id),
  full_name: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  billing_type: text('billing_type', { enum: ['monthly', 'daily'] }).notNull(),
  move_in_date: text('move_in_date').notNull(),
  move_out_date: text('move_out_date'),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  address: text('address'),
  emergency_contact: text('emergency_contact'),
  water_reading: real('water_reading'),
  electricity_reading: real('electricity_reading'),
  due_day: integer('due_day'),
  include_internet: integer('include_internet').notNull().default(0),
})

export const bills = sqliteTable('bills', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  unit_id: text('unit_id').notNull().references(() => units.id),
  amount: real('amount').notNull(),
  billing_type: text('billing_type', { enum: ['monthly', 'daily'] }).notNull(),
  period_start: text('period_start').notNull(),
  period_end: text('period_end').notNull(),
  due_date: text('due_date').notNull(),
  paid_at: text('paid_at'),
  status: text('status', { enum: ['pending', 'paid', 'overdue'] }).notNull().default('pending'),
  notes: text('notes'),
  created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  water_previous: real('water_previous'),
  water_current: real('water_current'),
  electricity_previous: real('electricity_previous'),
  electricity_current: real('electricity_current'),
})

export const appSettings = sqliteTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
})

export const contracts = sqliteTable('contracts', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  unit_id: text('unit_id').notNull().references(() => units.id),
  start_date: text('start_date').notNull(),
  end_date: text('end_date').notNull(),
  monthly_rate: real('monthly_rate').notNull(),
  deposit: real('deposit').notNull().default(0),
  terms: text('terms'),
  status: text('status', { enum: ['active', 'expired', 'terminated'] }).notNull().default('active'),
  signed_at: text('signed_at'),
  created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  ref_type: text('ref_type').notNull(),
  ref_id: text('ref_id').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull().default('other'),
  uri: text('uri'),
  created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  bill_id: text('bill_id').references(() => bills.id),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  unit_id: text('unit_id').notNull().references(() => units.id),
  amount: real('amount').notNull(),
  date: text('date').notNull(),
  notes: text('notes'),
  receipt_no: text('receipt_no').notNull(),
  method: text('method').notNull().default('cash'),
  balance_before: real('balance_before').notNull().default(0),
  balance_after: real('balance_after').notNull().default(0),
  voided_at: text('voided_at'),
  created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

export const beds = sqliteTable('beds', {
  id: text('id').primaryKey(),
  unit_id: text('unit_id').notNull().references(() => units.id),
  label: text('label').notNull(),
  daily_rate: real('daily_rate').notNull().default(0),
  tenant_id: text('tenant_id').references(() => tenants.id),
  vacated_at: text('vacated_at'),
  created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

export const utilityReadings = sqliteTable('utility_readings', {
  id: text('id').primaryKey(),
  unit_id: text('unit_id').notNull().references(() => units.id),
  month: text('month').notNull(),
  type: text('type', { enum: ['electricity', 'water'] }).notNull(),
  previous_reading: real('previous_reading').notNull(),
  current_reading: real('current_reading').notNull(),
  rate: real('rate').notNull(),
  computed_charge: real('computed_charge').notNull(),
  created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, (t) => ({
  uniqueReading: uniqueIndex('utility_readings_unit_month_type_unique').on(t.unit_id, t.month, t.type),
}))

export const maintenanceIssues = sqliteTable('maintenance_issues', {
  id: text('id').primaryKey(),
  unit_id: text('unit_id').notNull().references(() => units.id),
  category: text('category').notNull(),
  priority: text('priority').notNull().default('MEDIUM'),
  description: text('description').notNull(),
  status: text('status').notNull().default('REPORTED'),
  photo_uri: text('photo_uri'),
  repair_cost: real('repair_cost'),
  charged_to_tenant: integer('charged_to_tenant').default(0),
  reported_at: text('reported_at').notNull(),
  resolved_at: text('resolved_at'),
  created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})
