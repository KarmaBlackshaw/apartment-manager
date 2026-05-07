import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
import * as schema from '~/db/schema'

const expo = openDatabaseSync('apartment-manager.db', { enableChangeListener: true })
export const db = drizzle(expo, { schema })

export function initializeDatabase() {
  // Detect old schema and wipe all tables so CREATE TABLE below runs fresh.
  // Triggers:
  //  - tenants table lacks full_name (pre-refactor first_name/last_name layout)
  //  - units table still has the legacy `floor` column
  //  - legacy `beds` table exists in sqlite_master
  const tenantCols = expo.getAllSync('PRAGMA table_info(tenants)') as { name: string }[]
  const unitCols = expo.getAllSync('PRAGMA table_info(units)') as { name: string }[]
  const hasBeds = (expo.getAllSync("SELECT name FROM sqlite_master WHERE type='table' AND name='beds'") as { name: string }[]).length > 0
  const hasOldUnitsSchema = unitCols.length > 0 && unitCols.some(c => c.name === 'floor')
  const hasOldTenantsSchema = tenantCols.length > 0 && !tenantCols.some(c => c.name === 'full_name')
  if (hasOldTenantsSchema || hasOldUnitsSchema || hasBeds) {
    expo.execSync(`
      PRAGMA foreign_keys = OFF;
      DROP TABLE IF EXISTS bills;
      DROP TABLE IF EXISTS contracts;
      DROP TABLE IF EXISTS tenants;
      DROP TABLE IF EXISTS units;
      DROP TABLE IF EXISTS properties;
      DROP TABLE IF EXISTS app_settings;
      DROP TABLE IF EXISTS documents;
      DROP TABLE IF EXISTS payments;
      DROP TABLE IF EXISTS utility_readings;
      DROP TABLE IF EXISTS maintenance_issues;
      DROP TABLE IF EXISTS beds;
      PRAGMA foreign_keys = ON;
    `)
  }

  expo.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS units (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL REFERENCES properties(id),
      unit_number TEXT NOT NULL,
      monthly_rate REAL,
      billing_type TEXT NOT NULL CHECK (billing_type IN ('monthly', 'daily')) DEFAULT 'monthly',
      status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
      billing_day INTEGER DEFAULT 1,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      UNIQUE(property_id, unit_number)
    );

    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      unit_id TEXT REFERENCES units(id),
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      billing_type TEXT NOT NULL CHECK (billing_type IN ('monthly', 'daily')),
      move_in_date TEXT NOT NULL,
      move_out_date TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id),
      unit_id TEXT NOT NULL REFERENCES units(id),
      amount REAL NOT NULL,
      billing_type TEXT NOT NULL CHECK (billing_type IN ('monthly', 'daily')),
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      due_date TEXT NOT NULL,
      paid_at TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id),
      unit_id TEXT NOT NULL REFERENCES units(id),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      monthly_rate REAL NOT NULL,
      deposit REAL NOT NULL DEFAULT 0,
      terms TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
      signed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      ref_type TEXT NOT NULL,
      ref_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'other',
      uri TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      bill_id TEXT REFERENCES bills(id),
      tenant_id TEXT NOT NULL REFERENCES tenants(id),
      unit_id TEXT NOT NULL REFERENCES units(id),
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      receipt_no TEXT NOT NULL,
      method TEXT NOT NULL DEFAULT 'cash',
      balance_before REAL NOT NULL DEFAULT 0,
      balance_after REAL NOT NULL DEFAULT 0,
      voided_at TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS utility_readings (
      id TEXT PRIMARY KEY,
      unit_id TEXT NOT NULL REFERENCES units(id),
      month TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('electricity', 'water')),
      previous_reading REAL NOT NULL,
      current_reading REAL NOT NULL,
      rate REAL NOT NULL,
      computed_charge REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      UNIQUE(unit_id, month, type)
    );

    CREATE TABLE IF NOT EXISTS maintenance_issues (
      id TEXT PRIMARY KEY,
      unit_id TEXT NOT NULL REFERENCES units(id),
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'MEDIUM',
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'REPORTED',
      photo_uri TEXT,
      repair_cost REAL,
      charged_to_tenant INTEGER DEFAULT 0,
      reported_at TEXT NOT NULL,
      resolved_at TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );
  `)

  const alterStatements = [
    "ALTER TABLE tenants ADD COLUMN address TEXT",
    "ALTER TABLE tenants ADD COLUMN emergency_contact TEXT",
    "ALTER TABLE tenants ADD COLUMN water_reading REAL",
    "ALTER TABLE tenants ADD COLUMN electricity_reading REAL",
    "ALTER TABLE tenants ADD COLUMN due_day INTEGER",
    "ALTER TABLE bills ADD COLUMN water_previous REAL",
    "ALTER TABLE bills ADD COLUMN water_current REAL",
    "ALTER TABLE bills ADD COLUMN electricity_previous REAL",
    "ALTER TABLE bills ADD COLUMN electricity_current REAL",
    "ALTER TABLE tenants ADD COLUMN include_internet INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE units ADD COLUMN notes TEXT",
  ]
  for (const stmt of alterStatements) {
    try { expo.execSync(stmt) } catch { /* column already exists */ }
  }
}
