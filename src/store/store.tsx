import {
  createContext, useContext, useEffect, useMemo, useReducer, useRef,
  type ReactNode,
} from 'react'
import type {
  AppState, CalendarEvent, Course, DaySchedule, FocusSession, ScheduleBlock,
  Settings, Task,
} from '../types'
import { seedState, TRACKS } from '../data/seed'
import { uid } from '../lib/id'

const STORAGE_KEY = 'studyflow:v1'

export { uid }

export type Action =
  | { type: 'settings/patch'; patch: Partial<Settings> }
  | { type: 'task/add'; task: Task }
  | { type: 'task/patch'; id: string; patch: Partial<Task> }
  | { type: 'task/toggle'; id: string }
  | { type: 'task/remove'; id: string }
  | { type: 'course/add'; course: Course }
  | { type: 'course/remove'; id: string }
  | { type: 'event/add'; event: CalendarEvent }
  | { type: 'event/patch'; id: string; patch: Partial<CalendarEvent> }
  | { type: 'event/remove'; id: string }
  | { type: 'schedule/set'; schedule: DaySchedule }
  | { type: 'schedule/clear'; date: string }
  | { type: 'block/patch'; date: string; id: string; patch: Partial<DaySchedule['blocks'][number]> }
  | { type: 'block/remove'; date: string; id: string }
  | { type: 'focus/set'; on: boolean }
  | { type: 'session/start'; session: FocusSession }
  | { type: 'session/pause' }
  | { type: 'session/resume' }
  | { type: 'session/reset' }
  | { type: 'session/end' }
  | { type: 'session/extend'; sec: number }
  | { type: 'music/toggle' }
  | { type: 'music/seek'; sec: number }
  | { type: 'music/step'; delta: number }
  | { type: 'music/tick'; sec: number }
  | { type: 'state/reset' }
  | { type: 'state/replace'; state: AppState }

/** Drop scheduled blocks pointing at a record that no longer exists. */
function dropBlocks(
  schedules: AppState['schedules'],
  match: (b: ScheduleBlock) => boolean,
): AppState['schedules'] {
  const next: AppState['schedules'] = {}
  for (const [date, day] of Object.entries(schedules)) {
    next[date] = { ...day, blocks: day.blocks.filter((b) => !match(b)) }
  }
  return next
}

function elapsedOf(s: FocusSession): number {
  return s.running && s.startedAt
    ? s.elapsedSec + (Date.now() - s.startedAt) / 1000
    : s.elapsedSec
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'settings/patch':
      return { ...state, settings: { ...state.settings, ...action.patch } }

    case 'task/add':
      return { ...state, tasks: [action.task, ...state.tasks] }

    case 'task/patch':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, ...action.patch } : t),
      }

    case 'task/toggle':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id
            ? { ...t, done: !t.done, completedAt: t.done ? undefined : Date.now() }
            : t),
      }

    case 'task/remove':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.id),
        schedules: dropBlocks(state.schedules, (b) => b.taskId === action.id),
      }

    case 'course/add':
      return { ...state, courses: [...state.courses, action.course] }

    case 'course/remove':
      return {
        ...state,
        courses: state.courses.filter((c) => c.id !== action.id),
        tasks: state.tasks.map((t) =>
          t.courseId === action.id ? { ...t, courseId: undefined } : t),
        events: state.events.map((e) =>
          e.courseId === action.id ? { ...e, courseId: undefined } : e),
      }

    case 'event/add':
      return { ...state, events: [...state.events, action.event] }

    case 'event/patch':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.id ? { ...e, ...action.patch } : e),
      }

    case 'event/remove':
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.id),
        schedules: dropBlocks(state.schedules, (b) => b.eventId === action.id),
      }

    case 'schedule/set':
      return {
        ...state,
        schedules: { ...state.schedules, [action.schedule.date]: action.schedule },
      }

    case 'schedule/clear': {
      const next = { ...state.schedules }
      delete next[action.date]
      return { ...state, schedules: next }
    }

    case 'block/patch': {
      const day = state.schedules[action.date]
      if (!day) return state
      return {
        ...state,
        schedules: {
          ...state.schedules,
          [action.date]: {
            ...day,
            blocks: day.blocks.map((b) =>
              b.id === action.id ? { ...b, ...action.patch } : b),
          },
        },
      }
    }

    case 'block/remove': {
      const day = state.schedules[action.date]
      if (!day) return state
      return {
        ...state,
        schedules: {
          ...state.schedules,
          [action.date]: {
            ...day,
            blocks: day.blocks.filter((b) => b.id !== action.id),
          },
        },
      }
    }

    case 'focus/set':
      return { ...state, focusMode: action.on }

    case 'session/start':
      return { ...state, session: action.session }

    case 'session/pause':
      if (!state.session?.running) return state
      return {
        ...state,
        session: {
          ...state.session,
          // Capped: a session left running on another route would otherwise bank
          // the overrun, and extending it could never buy back any time.
          elapsedSec: Math.min(elapsedOf(state.session), state.session.lengthSec),
          running: false,
          startedAt: null,
        },
      }

    case 'session/resume':
      if (!state.session || state.session.running) return state
      return {
        ...state,
        session: { ...state.session, running: true, startedAt: Date.now() },
      }

    case 'session/reset':
      if (!state.session) return state
      return {
        ...state,
        session: { ...state.session, elapsedSec: 0, running: false, startedAt: null },
      }

    case 'session/extend':
      if (!state.session) return state
      return {
        ...state,
        session: {
          ...state.session,
          lengthSec: state.session.lengthSec + action.sec,
        },
      }

    case 'session/end':
      return { ...state, session: null }

    case 'music/toggle':
      return { ...state, music: { ...state.music, playing: !state.music.playing } }

    case 'music/seek':
      return { ...state, music: { ...state.music, positionSec: action.sec } }

    case 'music/tick':
      return { ...state, music: { ...state.music, positionSec: action.sec } }

    case 'music/step': {
      const n = TRACKS.length
      const trackIndex = (state.music.trackIndex + action.delta + n) % n
      return { ...state, music: { ...state.music, trackIndex, positionSec: 0 } }
    }

    case 'state/reset':
      return { ...seedState(), settings: { ...seedState().settings, onboarded: true } }

    case 'state/replace':
      return action.state

    default:
      return state
  }
}

/** Merge persisted state over a fresh seed so new fields get defaults. */
function load(): AppState {
  const base = seedState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const saved = JSON.parse(raw) as Partial<AppState>
    return {
      ...base,
      ...saved,
      settings: { ...base.settings, ...saved.settings },
      music: { ...base.music, ...saved.music, playing: false },
      // A paused session keeps its elapsed time; a running one would otherwise
      // bank every second the tab was closed.
      session: saved.session
        ? { ...saved.session, running: false, startedAt: null }
        : null,
    }
  } catch {
    return base
  }
}

const StateCtx = createContext<AppState | null>(null)
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  const lastWrite = useRef<string>('')

  useEffect(() => {
    // The music clock dispatches every second; leaving the position out keeps a
    // playing track from rewriting the whole store once a second.
    const json = JSON.stringify({
      ...state,
      music: { ...state.music, positionSec: 0 },
    })
    if (json === lastWrite.current) return
    lastWrite.current = json
    try {
      localStorage.setItem(STORAGE_KEY, json)
    } catch {
      /* storage can be unavailable (private window, blocked site data) */
    }
  }, [state])

  useEffect(() => {
    const root = document.documentElement
    if (state.settings.theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', state.settings.theme)
  }, [state.settings.theme])

  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  )
}

export function useApp(): AppState {
  const s = useContext(StateCtx)
  if (!s) throw new Error('useApp must be used inside <StoreProvider>')
  return s
}

export function useDispatch(): React.Dispatch<Action> {
  const d = useContext(DispatchCtx)
  if (!d) throw new Error('useDispatch must be used inside <StoreProvider>')
  return d
}

export function useCourseMap(): Record<string, Course> {
  const { courses } = useApp()
  return useMemo(
    () => Object.fromEntries(courses.map((c) => [c.id, c])),
    [courses],
  )
}

export { elapsedOf }
