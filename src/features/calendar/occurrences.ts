import type { CalendarEvent } from '../../types'
import { daysBetween, weekdayOf } from '../../lib/date'

/** Every event that lands on `iso`, earliest first.
 *  A repeating event recurs weekly from its start date onward. */
export function eventsOn(events: CalendarEvent[], iso: string): CalendarEvent[] {
  return events
    .filter((e) => {
      if (e.date === iso) return true
      if (e.repeatDays.length === 0) return false
      if (daysBetween(e.date, iso) < 0) return false
      return e.repeatDays.includes(weekdayOf(iso))
    })
    .sort((a, b) => a.start - b.start)
}

export function hasEventsOn(events: CalendarEvent[], iso: string): boolean {
  return eventsOn(events, iso).length > 0
}
