import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, useDispatch } from '../store/store'
import { eventsOn } from '../features/calendar/occurrences'
import { candidatesForDay } from '../features/tasks/select'
import { buildDay, coverage } from '../features/scheduling/buildDay'
import { sessionForBlock } from '../features/focus/session'
import Timeline from '../components/Timeline'
import { IconSparkle } from '../components/Icons'
import type { DaySchedule, Task } from '../types'
import {
  dueLabel, formatDuration, formatLongDate, formatMinutes, nowMinutes,
  parseMinutes, todayISO,
} from '../lib/date'
import { useTick } from '../lib/useTick'
import './BuildDay.css'

export default function BuildDayPage() {
  const state = useApp()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const today = todayISO()
  const { settings } = state

  useTick(30_000)

  const events = useMemo(() => eventsOn(state.events, today), [state.events, today])
  const candidates = useMemo(
    () => candidatesForDay(state.tasks, today),
    [state.tasks, today],
  )

  const [from, setFrom] = useState(() =>
    formatMinutes(Math.max(settings.dayStart, Math.ceil(nowMinutes() / 15) * 15)))
  const [until, setUntil] = useState(formatMinutes(settings.dayEnd))
  const [breakMin, setBreakMin] = useState(settings.breakMin)
  const [maxBlockMin, setMaxBlock] = useState(settings.maxBlockMin)
  const [includeMeals, setIncludeMeals] = useState(settings.includeMeals)
  const [picked, setPicked] = useState<string[]>(() =>
    candidates.slice(0, 4).map((t) => t.id))
  const [draft, setDraft] = useState<DaySchedule | null>(
    () => state.schedules[today] ?? null,
  )
  /** The tasks the current draft was built from — ticking one afterwards must
   *  not make the plan look wrong until it is regenerated. */
  const [plannedFor, setPlannedFor] = useState<Task[]>([])

  const selectedTasks = candidates.filter((t) => picked.includes(t.id))
  const totalWork = selectedTasks.reduce((n, t) => n + t.estimateMin, 0)
  const windowMin = Math.max(0, parseMinutes(until) - parseMinutes(from))

  function generate() {
    const schedule = buildDay({
      date: today,
      events,
      tasks: selectedTasks,
      settings: { ...settings, breakMin, maxBlockMin, includeMeals },
      availableFrom: parseMinutes(from),
      availableUntil: parseMinutes(until),
    })
    setDraft(schedule)
    setPlannedFor(selectedTasks)
  }

  function savePlan() {
    if (!draft) return
    dispatch({ type: 'schedule/set', schedule: draft })
    navigate('/')
  }

  const cover = draft ? coverage(draft, plannedFor) : []
  const uncovered = cover.filter((c) => !c.covered)

  return (
    <div className="build">
      <header className="build__head">
        <span className="dim">{formatLongDate(today)}</span>
        <h1>Build Your Day</h1>
        <p className="muted">
          Your classes and events stay where they are. Caelora fits the work
          around them and leaves room to breathe.
        </p>
      </header>

      <section className="card build__panel">
        <span className="section-title">1 · Available time</span>
        <div className="build__times">
          <label>
            <span className="label">From</span>
            <input
              type="time" className="field" value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            <span className="label">Until</span>
            <input
              type="time" className="field" value={until}
              onChange={(e) => setUntil(e.target.value)}
            />
          </label>
          <label>
            <span className="label">Longest work block</span>
            <select
              className="field" value={maxBlockMin}
              onChange={(e) => setMaxBlock(Number(e.target.value))}
            >
              {[30, 45, 60, 90, 120].map((m) => (
                <option key={m} value={m}>{formatDuration(m)}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Break</span>
            <select
              className="field" value={breakMin}
              onChange={(e) => setBreakMin(Number(e.target.value))}
            >
              {[5, 10, 15, 20, 30].map((m) => (
                <option key={m} value={m}>{formatDuration(m)}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="toggle-row" style={{ marginTop: 14 }}>
          <span>Reserve time for meals</span>
          <input
            type="checkbox" className="switch" checked={includeMeals}
            onChange={(e) => setIncludeMeals(e.target.checked)}
          />
        </label>

        <p className="build__hint dim">
          {formatDuration(windowMin)} in the window ·{' '}
          {events.length} commitment{events.length === 1 ? '' : 's'} today
        </p>
      </section>

      <section className="card build__panel">
        <span className="section-title">2 · What to work on</span>
        {candidates.length === 0 && (
          <div className="empty">
            <div className="empty__icon" aria-hidden="true">✓</div>
            No open work in the next week.
          </div>
        )}
        <ul className="build__tasks">
          {candidates.map((t) => {
            const on = picked.includes(t.id)
            return (
              <li key={t.id}>
                <label className={`pick${on ? ' is-on' : ''}`}>
                  <input
                    type="checkbox" checked={on}
                    onChange={() =>
                      setPicked((p) =>
                        on ? p.filter((id) => id !== t.id) : [...p, t.id])}
                  />
                  <span className="pick__body">
                    <span className="pick__title">{t.title}</span>
                    <span className="pick__meta dim">
                      {dueLabel(t.due)} · {formatDuration(t.estimateMin)}
                      {t.priority === 'high' ? ' · High priority' : ''}
                    </span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>

        <div className="build__sum">
          <span>
            <strong>{selectedTasks.length}</strong> selected ·{' '}
            <strong>{formatDuration(totalWork)}</strong> of work
          </span>
          <button
            className="btn btn--primary"
            onClick={generate}
            disabled={windowMin <= 0}
          >
            <IconSparkle size={18} />
            {draft ? 'Regenerate' : 'Generate schedule'}
          </button>
        </div>
      </section>

      {draft && (
        <section className="card build__panel fade-in">
          <div className="build__result-head">
            <span className="section-title" style={{ margin: 0 }}>3 · Your day</span>
            <div className="row" style={{ gap: 10 }}>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  const saved = state.schedules[today]
                  if (saved && !confirm(
                    'Discard the plan saved for today? This cannot be undone.',
                  )) return
                  setDraft(null)
                  setPlannedFor([])
                  dispatch({ type: 'schedule/clear', date: today })
                }}
              >
                Discard
              </button>
              <button className="btn btn--primary btn--sm" onClick={savePlan}>
                Use this plan
              </button>
            </div>
          </div>

          {uncovered.length > 0 && (
            <p className="build__warn">
              Not everything fits: {uncovered.map((c) => c.task.title).join(', ')}.
              Extend the window or move work to another day.
            </p>
          )}

          <Timeline
            schedule={draft}
            nowMin={nowMinutes()}
            editable
            onRemove={(b) =>
              setDraft({ ...draft, blocks: draft.blocks.filter((x) => x.id !== b.id) })}
            onToggleDone={(b) =>
              setDraft({
                ...draft,
                blocks: draft.blocks.map((x) =>
                  x.id === b.id ? { ...x, done: !x.done } : x),
              })}
            onFocus={(b) => {
              dispatch({ type: 'schedule/set', schedule: draft })
              dispatch({ type: 'session/start', session: sessionForBlock(b) })
              dispatch({ type: 'focus/set', on: true })
              navigate('/focus')
            }}
          />
        </section>
      )}
    </div>
  )
}
