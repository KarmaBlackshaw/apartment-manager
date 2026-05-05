import { db } from '../../db'
import { appSettings } from '../../db/schema'
import type { AppSettings } from '../../types'

const DEFAULTS = {
  water_rate: 35,
  electricity_rate: 13,
  internet_rate: 0,
  apartment_name: 'Apartment Manager',
  owner_name: '',
}

export async function fetchSettings(): Promise<AppSettings> {
  const rows = await db.select().from(appSettings)
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return {
    water_rate:       parseFloat(map['water_rate']       ?? String(DEFAULTS.water_rate)),
    electricity_rate: parseFloat(map['electricity_rate'] ?? String(DEFAULTS.electricity_rate)),
    internet_rate:    parseFloat(map['internet_rate']    ?? String(DEFAULTS.internet_rate)),
    apartment_name:   map['apartment_name'] ?? DEFAULTS.apartment_name,
    owner_name:       map['owner_name']     ?? DEFAULTS.owner_name,
  }
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: appSettings.key, set: { value } })
}
