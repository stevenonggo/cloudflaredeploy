import type { FocusSession, ScheduleBlock, Settings, Task } from '../../types'

export function sessionForBlock(block: ScheduleBlock): FocusSession {
  return {
    taskId: block.taskId,
    blockId: block.id,
    title: block.title,
    lengthSec: (block.end - block.start) * 60,
    elapsedSec: 0,
    running: true,
    startedAt: Date.now(),
  }
}

export function sessionForTask(task: Task, settings: Settings): FocusSession {
  return {
    taskId: task.id,
    title: task.title,
    lengthSec: Math.min(task.estimateMin, settings.maxBlockMin) * 60,
    elapsedSec: 0,
    running: true,
    startedAt: Date.now(),
  }
}

export function customSession(title: string, minutes: number): FocusSession {
  return {
    title,
    lengthSec: minutes * 60,
    elapsedSec: 0,
    running: true,
    startedAt: Date.now(),
  }
}
