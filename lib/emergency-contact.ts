export interface EmergencyContact {
  name: string
  relation: string | null
  phone: string
}

export function serializeEmergencyContact(c: EmergencyContact): string {
  return JSON.stringify(c)
}

export function parseEmergencyContact(stored: string | null | undefined): EmergencyContact | null {
  if (!stored) return null
  try {
    const v = JSON.parse(stored)
    if (typeof v?.name === 'string' && typeof v?.phone === 'string') {
      return { name: v.name, relation: v.relation ?? null, phone: v.phone }
    }
  } catch {
    const m = stored.match(/^(.+?)(?:\s*\((.+?)\))?\s*—\s*(.+)$/)
    if (m) return { name: m[1].trim(), relation: m[2]?.trim() ?? null, phone: m[3].trim() }
  }
  return null
}

export function formatEmergencyContact(c: EmergencyContact): string {
  return c.relation ? `${c.name} (${c.relation}) — ${c.phone}` : `${c.name} — ${c.phone}`
}
