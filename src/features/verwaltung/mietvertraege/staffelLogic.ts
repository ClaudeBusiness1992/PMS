export type StaffelEntry = {
  datum: string
  betrag: number
  label: string
}

export function generateStaffeln(
  grundmiete: string,
  mietbeginn: string,
  erhoehung: string,
  jahre: string | number = 10
): StaffelEntry[] {
  const base = parseFloat(grundmiete.replace(',', '.'))
  const delta = parseFloat(erhoehung.replace(',', '.'))
  if (!base || !mietbeginn || !delta || isNaN(base) || isNaN(delta)) return []

  const start = new Date(mietbeginn)
  if (isNaN(start.getTime())) return []

  const count = Math.min(Math.max(typeof jahre === 'number' ? jahre : parseInt(jahre) || 0, 1), 30)

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start)
    d.setFullYear(d.getFullYear() + i + 1)
    const betrag = parseFloat((base + delta * (i + 1)).toFixed(2))
    return {
      datum: d.toISOString().split('T')[0],
      betrag,
      label: d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    }
  })
}

export function formatEur(val: string | number): string {
  const n = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val
  if (isNaN(n)) return '—'
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

export function formatDate(iso: string): string {
  if (!iso) return '_______________'
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export function calcKaution(grundmiete: string): { total: number; rate: number } {
  const base = parseFloat(grundmiete.replace(',', '.')) || 0
  const total = parseFloat((base * 3).toFixed(2))
  const rate = parseFloat((total / 3).toFixed(2))
  return { total, rate }
}

export function calcGesamtmiete(grundmiete: string, nk: string, hk: string, wasser: string, wasserInNk: boolean): number {
  return (
    (parseFloat(grundmiete.replace(',', '.')) || 0) +
    (parseFloat(nk.replace(',', '.')) || 0) +
    (parseFloat(hk.replace(',', '.')) || 0) +
    (!wasserInNk ? parseFloat(wasser.replace(',', '.')) || 0 : 0)
  )
}
