export type Priority = 'low' | 'medium' | 'high'

export interface Course {
  id: string
  name: string
  color: string
}

export interface Task {
  id: string
  title: string
  notes?: string
  /** YYYY-MM-DD, or undefined for someday work */
  due?: string
  /** minutes of focused work the task is expected to need */
  estimateMin: number
  priority: Priority
  done: boolean
  courseId?: string
  /** an assignment is a task with a hard external deadline */
  isAssignment: boolean
  createdAt: number
  completedAt?: number
}

export type EventKind = 'class' | 'event'

export interface CalendarEvent {
  id: string
  title: string
  kind: EventKind
  /** YYYY-MM-DD — the first (or only) occurrence */
  date: string
  /** minutes from midnight */
  start: number
  end: number
  courseId?: string
  location?: string
  /** 0=Sun … 6=Sat. Non-empty means the event repeats weekly on these days. */
  repeatDays: number[]
}

export type BlockType = 'commitment' | 'task' | 'break' | 'meal' | 'free'

export interface ScheduleBlock {
  id: string
  title: string
  type: BlockType
  /** minutes from midnight */
  start: number
  end: number
  taskId?: string
  eventId?: string
  done: boolean
}

export interface DaySchedule {
  /** YYYY-MM-DD */
  date: string
  blocks: ScheduleBlock[]
  generatedAt: number
}

export interface Shortcut {
  id: string
  label: string
  url: string
  icon: string
}

export type ThemePref = 'system' | 'light' | 'dark'

export interface Settings {
  username: string
  theme: ThemePref
  /** minutes from midnight — the window Build Your Day may schedule inside */
  dayStart: number
  dayEnd: number
  /** longest single stretch of work before a break is inserted */
  maxBlockMin: number
  breakMin: number
  defaultFocusMin: number
  includeMeals: boolean
  shortcuts: Shortcut[]
  onboarded: boolean
}

export interface LyricLine {
  /** seconds into the track */
  t: number
  text: string
}

export interface Track {
  id: string
  title: string
  artist: string
  durationSec: number
  lyrics: LyricLine[]
}

export interface FocusSession {
  taskId?: string
  blockId?: string
  title: string
  /** total length in seconds */
  lengthSec: number
  /** seconds already elapsed before the current run */
  elapsedSec: number
  running: boolean
  /** Date.now() when the current run started, null when paused */
  startedAt: number | null
}

export interface AppState {
  settings: Settings
  courses: Course[]
  tasks: Task[]
  events: CalendarEvent[]
  schedules: Record<string, DaySchedule>
  focusMode: boolean
  session: FocusSession | null
  music: {
    trackIndex: number
    playing: boolean
    positionSec: number
  }
}
