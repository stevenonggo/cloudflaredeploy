import type { Task } from '../../types'
import { daysBetween, todayISO } from '../../lib/date'

const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 } as const

/** Lower sorts first: overdue and due-soon work with high priority rises. */
export function urgencyScore(t: Task, from = todayISO()): number {
  const days = t.due ? daysBetween(from, t.due) : 60
  const overdue = days < 0 ? -100 : 0
  return overdue + Math.min(days, 60) * 10 + PRIORITY_WEIGHT[t.priority] * 3
    + (t.isAssignment ? 0 : 1)
}

export function sortByUrgency(tasks: Task[], from = todayISO()): Task[] {
  return [...tasks].sort((a, b) => urgencyScore(a, from) - urgencyScore(b, from))
}

export function openTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => !t.done)
}

/** Work worth putting on today's plan: due today, overdue, or coming up soon. */
export function candidatesForDay(tasks: Task[], iso: string, horizonDays = 7): Task[] {
  return sortByUrgency(
    tasks.filter((t) => {
      if (t.done) return false
      if (!t.due) return true
      return daysBetween(iso, t.due) <= horizonDays
    }),
    iso,
  )
}

export function dueOn(tasks: Task[], iso: string): Task[] {
  return tasks.filter((t) => t.due === iso)
}
