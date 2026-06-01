const ID_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const ID_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

function toDate(date: string | Date): Date {
  return typeof date === 'string' ? new Date(date + 'T00:00:00') : date
}

export function formatDate(date: string | Date): string {
  const d = toDate(date)
  return `${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDateShort(date: string | Date): string {
  const d = toDate(date)
  return `${d.getDate()} ${ID_MONTHS[d.getMonth()]}`
}

export function formatDayDate(date: string | Date): string {
  const d = toDate(date)
  return `${ID_DAYS[d.getDay()]}, ${formatDate(d)}`
}

export function getMonthRange(month: number, year: number): { start: string; end: string } {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

export function isToday(date: string | Date): boolean {
  const d = toDate(date)
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

export function currentMonthRange(): { start: string; end: string } {
  const now = new Date()
  return getMonthRange(now.getMonth(), now.getFullYear())
}
