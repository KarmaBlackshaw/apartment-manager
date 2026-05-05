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
