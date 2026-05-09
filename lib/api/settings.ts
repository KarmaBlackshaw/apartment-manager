import { db } from '~/db'
import { appSettings } from '~/db/schema'
import type { AppSettings } from '~/types'

const DEFAULTS = {
  water_rate: 35,
  electricity_rate: 13,
  internet_rate: 0,
  apartment_name: 'Apartment Manager',
  owner_name: '',
  owner_phone: '',
  address: '',
  billing_day: 1,
  late_fee_amount: 0,
  late_fee_grace_days: 0,
}

export async function fetchSettings(): Promise<AppSettings> {
  const rows = await db.select().from(appSettings)
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return {
    water_rate:          parseFloat(map['water_rate']          ?? String(DEFAULTS.water_rate)),
    electricity_rate:    parseFloat(map['electricity_rate']    ?? String(DEFAULTS.electricity_rate)),
    internet_rate:       parseFloat(map['internet_rate']       ?? String(DEFAULTS.internet_rate)),
    apartment_name:      map['apartment_name']                 ?? DEFAULTS.apartment_name,
    owner_name:          map['owner_name']                     ?? DEFAULTS.owner_name,
    owner_phone:         map['owner_phone']                    ?? DEFAULTS.owner_phone,
    address:             map['address']                        ?? DEFAULTS.address,
    billing_day:         parseInt(map['billing_day']           ?? String(DEFAULTS.billing_day), 10),
    late_fee_amount:     parseFloat(map['late_fee_amount']     ?? String(DEFAULTS.late_fee_amount)),
    late_fee_grace_days: parseInt(map['late_fee_grace_days']   ?? String(DEFAULTS.late_fee_grace_days), 10),
  }
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: appSettings.key, set: { value } })
}
