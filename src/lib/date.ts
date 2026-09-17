/** Date & time helpers. Dates are handled as local-time YYYY-MM-DD strings so
 *  a day never shifts across timezones the way `toISOString()` would. */

export function toISODate(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function addDays(iso: string, n: number): string {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export function daysBetween(a: string, b: string): number {
  const ms = fromISODate(b).getTime() - fromISODate(a).getTime()
  return Math.round(ms / 86_400_000)
}

export function weekdayOf(iso: string): number {
  return fromISODate(iso).getDay()
}

/** Pinned so dates read the same English as the rest of the interface, whatever
 *  locale the browser happens to be set to. */
const LOCALE = 'en-US'

const LONG_DATE = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})
const SHORT_DATE = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  day: 'numeric',
})
const MONTH_YEAR = new Intl.DateTimeFormat(LOCALE, {
  month: 'long',
  year: 'numeric',
})

const MONTH_SHORT = new Intl.DateTimeFormat(LOCALE, { month: 'short' })

/** Month names, January first. */
export const monthNames = () =>
  Array.from({ length: 12 }, (_, m) => MONTH_SHORT.format(new Date(2000, m, 1)))

export const formatLongDate = (iso: string) => LONG_DATE.format(fromISODate(iso))
export const formatShortDate = (iso: string) => SHORT_DATE.format(fromISODate(iso))
export const formatMonthYear = (d: Date) => MONTH_YEAR.format(d)

/** "Overdue", "Today", "Tomorrow", "Sep 20" — whichever reads fastest. */
export function dueLabel(iso: string | undefined, from = todayISO()): string {
  if (!iso) return 'No due date'
  const diff = daysBetween(from, iso)
  if (diff < -1) return `${Math.abs(diff)} days overdue`
  if (diff === -1) return 'Yesterday'
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff <= 6) return fromISODate(iso).toLocaleDateString(LOCALE, { weekday: 'long' })
  return formatShortDate(iso)
}

export function isOverdue(iso: string | undefined, from = todayISO()): boolean {
  return !!iso && daysBetween(from, iso) < 0
}

/** 545 -> "09:05" */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${`${h}`.padStart(2, '0')}:${`${m}`.padStart(2, '0')}`
}

/** "09:05" -> 545 */
export function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

/** 90 -> "1h 30m" */
export function formatDuration(min: number): string {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

/** 3725 -> "1:02:05", 305 -> "05:05" */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = `${m}`.padStart(2, '0')
  const ss = `${sec}`.padStart(2, '0')
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export function nowMinutes(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

/** Monday-first grid of the month containing `date`, padded to whole weeks. */
export function monthGrid(date: Date): string[] {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const lead = (first.getDay() + 6) % 7 // Monday = 0
  const start = new Date(first)
  start.setDate(first.getDate() - lead)

  const cells: string[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    cells.push(toISODate(d))
    if (i >= 34 && d.getMonth() !== date.getMonth() && (i + 1) % 7 === 0) break
  }
  return cells
}
