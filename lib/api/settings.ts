import { db } from '../../db'
import { appSettings } from '../../db/schema'
import type { AppSettings } from '../../types'

const DEFAULTS = {
  water_rate: 35,
  electricity_rate: 13,
  internet_rate: 0,
  apartment_name: 'Apartment Manager',
  owner_name: '',
  owner_phone: '',
  notif_rent_reminders: '1',
  notif_contract_expiry: '1',
  notif_vacancy_alerts: '1',
}

export async function fetchSettings(): Promise<AppSettings> {
  const rows = await db.select().from(appSettings)
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return {
    water_rate:             parseFloat(map['water_rate']       ?? String(DEFAULTS.water_rate)),
    electricity_rate:       parseFloat(map['electricity_rate'] ?? String(DEFAULTS.electricity_rate)),
    internet_rate:          parseFloat(map['internet_rate']    ?? String(DEFAULTS.internet_rate)),
    apartment_name:         map['apartment_name']         ?? DEFAULTS.apartment_name,
    owner_name:             map['owner_name']             ?? DEFAULTS.owner_name,
    owner_phone:            map['owner_phone']            ?? DEFAULTS.owner_phone,
    notif_rent_reminders:   map['notif_rent_reminders']   ?? DEFAULTS.notif_rent_reminders,
    notif_contract_expiry:  map['notif_contract_expiry']  ?? DEFAULTS.notif_contract_expiry,
    notif_vacancy_alerts:   map['notif_vacancy_alerts']   ?? DEFAULTS.notif_vacancy_alerts,
  }
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: appSettings.key, set: { value } })
}
