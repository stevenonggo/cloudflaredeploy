import type {
  CalendarEvent, DaySchedule, ScheduleBlock, Settings, Task,
} from '../../types'
import { uid } from '../../lib/id'

export interface BuildOptions {
  date: string
  events: CalendarEvent[]
  tasks: Task[]
  settings: Settings
  /** Earliest minute work may start — "now" when planning the current day. */
  availableFrom: number
  /** Latest minute the plan may run to. */
  availableUntil: number
}

interface Interval { start: number; end: number }

/** Shortest stretch still worth scheduling work into. */
const MIN_WORK_CHUNK = 20
/** Leave part of every free stretch unplanned — a packed day is not followable. */
const MAX_FILL_RATIO = 0.8

const MEALS = [
  { title: 'Breakfast', start: 8 * 60, len: 30 },
  { title: 'Lunch', start: 12 * 60 + 30, len: 60 },
  { title: 'Dinner', start: 18 * 60 + 30, len: 60 },
]

function merge(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].sort((a, b) => a.start - b.start)
  const out: Interval[] = []
  for (const iv of sorted) {
    const last = out[out.length - 1]
    if (last && iv.start <= last.end) last.end = Math.max(last.end, iv.end)
    else out.push({ ...iv })
  }
  return out
}

function gapsBetween(busy: Interval[], from: number, until: number): Interval[] {
  const gaps: Interval[] = []
  let cursor = from
  for (const b of merge(busy)) {
    if (b.end <= from || b.start >= until) continue
    if (b.start > cursor) gaps.push({ start: cursor, end: Math.min(b.start, until) })
    cursor = Math.max(cursor, b.end)
  }
  if (cursor < until) gaps.push({ start: cursor, end: until })
  return gaps.filter((g) => g.end - g.start >= MIN_WORK_CHUNK)
}

function overlapsAny(busy: Interval[], start: number, end: number): boolean {
  return busy.some((b) => start < b.end && end > b.start)
}

/**
 * Turn today's commitments and open tasks into a schedule that can actually be
 * followed: commitments are never moved, work is split into blocks no longer
 * than `maxBlockMin` with breaks between them, and a share of the free time is
 * deliberately left unplanned.
 */
export function buildDay(opts: BuildOptions): DaySchedule {
  const { date, events, tasks, settings, availableFrom, availableUntil } = opts
  const windowStart = Math.max(settings.dayStart, availableFrom)
  const windowEnd = Math.min(settings.dayEnd, availableUntil)

  const blocks: ScheduleBlock[] = []
  const busy: Interval[] = []

  // 1. Commitments are fixed points the plan must work around.
  for (const e of events) {
    blocks.push({
      id: uid('blk'),
      title: e.title,
      type: 'commitment',
      start: e.start,
      end: e.end,
      eventId: e.id,
      done: false,
    })
    busy.push({ start: e.start, end: e.end })
  }

  // 2. Meals, where they fit without pushing a commitment aside.
  if (settings.includeMeals) {
    for (const meal of MEALS) {
      const end = meal.start + meal.len
      // Only whole meals inside the window — a clipped one would run past the
      // end the user asked the plan to stop at.
      if (meal.start < windowStart || end > windowEnd) continue
      if (overlapsAny(busy, meal.start, end)) continue
      blocks.push({
        id: uid('blk'),
        title: meal.title,
        type: 'meal',
        start: meal.start,
        end,
        done: false,
      })
      busy.push({ start: meal.start, end })
    }
  }

  // 3. Fit work into what is left.
  const gaps = gapsBetween(busy, windowStart, windowEnd)
  const totalFree = gaps.reduce((n, g) => n + (g.end - g.start), 0)
  let budget = Math.floor(totalFree * MAX_FILL_RATIO)

  const queue = tasks
    .filter((t) => !t.done)
    .map((t) => ({ task: t, remaining: Math.max(MIN_WORK_CHUNK, t.estimateMin) }))

  for (const gap of gaps) {
    let cursor = gap.start
    let placedInGap = false

    while (budget >= MIN_WORK_CHUNK && cursor + MIN_WORK_CHUNK <= gap.end) {
      const next = queue.find((q) => q.remaining >= MIN_WORK_CHUNK)
      if (!next) break

      // A break separates consecutive work blocks inside the same stretch.
      if (placedInGap) {
        const breakEnd = cursor + settings.breakMin
        if (breakEnd + MIN_WORK_CHUNK > gap.end) break
        blocks.push({
          id: uid('blk'),
          title: 'Break',
          type: 'break',
          start: cursor,
          end: breakEnd,
          done: false,
        })
        cursor = breakEnd
      }

      // Splitting at maxBlockMin can leave a tail too short to ever place
      // again, so shorten this block to leave a placeable one instead.
      const tail = next.remaining - settings.maxBlockMin
      const wanted = tail <= 0
        ? next.remaining
        : tail < MIN_WORK_CHUNK && next.remaining - MIN_WORK_CHUNK >= MIN_WORK_CHUNK
          ? next.remaining - MIN_WORK_CHUNK
          : settings.maxBlockMin
      const len = Math.min(wanted, gap.end - cursor, budget)
      if (len < MIN_WORK_CHUNK) break

      blocks.push({
        id: uid('blk'),
        title: next.task.title,
        type: 'task',
        start: cursor,
        end: cursor + len,
        taskId: next.task.id,
        done: false,
      })
      cursor += len
      budget -= len
      next.remaining -= len
      placedInGap = true
    }

    // Whatever is left of the stretch stays the user's own time.
    if (gap.end - cursor >= 30) {
      blocks.push({
        id: uid('blk'),
        title: 'Free time',
        type: 'free',
        start: cursor,
        end: gap.end,
        done: false,
      })
    }
  }

  blocks.sort((a, b) => a.start - b.start || a.end - b.end)
  return { date, blocks, generatedAt: Date.now() }
}

/** How much of each task the plan actually covers — shown after generating. */
export function coverage(schedule: DaySchedule, tasks: Task[]) {
  const planned = new Map<string, number>()
  for (const b of schedule.blocks) {
    if (b.type !== 'task' || !b.taskId) continue
    planned.set(b.taskId, (planned.get(b.taskId) ?? 0) + (b.end - b.start))
  }
  return tasks
    .filter((t) => !t.done)
    .map((t) => ({
      task: t,
      plannedMin: planned.get(t.id) ?? 0,
      covered: (planned.get(t.id) ?? 0) >= t.estimateMin,
    }))
}
