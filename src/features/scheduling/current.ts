import type { DaySchedule, ScheduleBlock } from '../../types'

/** The block happening right now, if any. */
export function activeBlock(
  schedule: DaySchedule | undefined,
  nowMin: number,
): ScheduleBlock | undefined {
  return schedule?.blocks.find((b) => nowMin >= b.start && nowMin < b.end)
}

/** The next block that has not started yet. */
export function nextBlock(
  schedule: DaySchedule | undefined,
  nowMin: number,
): ScheduleBlock | undefined {
  return schedule?.blocks.find((b) => b.start > nowMin)
}

/** What the user should be doing right now — the question Caelora answers. */
export function upNext(
  schedule: DaySchedule | undefined,
  nowMin: number,
): { block: ScheduleBlock; live: boolean } | undefined {
  const active = activeBlock(schedule, nowMin)
  if (active) return { block: active, live: true }
  const next = nextBlock(schedule, nowMin)
  return next ? { block: next, live: false } : undefined
}

export const WORKABLE: ScheduleBlock['type'][] = ['task', 'commitment']
