export function formatPHP(n: number): string {
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}
