import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp, useCourseMap, useDispatch } from '../store/store'
import { eventsOn } from '../features/calendar/occurrences'
import { dueOn } from '../features/tasks/select'
import EventEditor from '../components/EventEditor'
import type { CalendarEvent } from '../types'
import { IconChevronLeft, IconChevronRight, IconPlus } from '../components/Icons'
import {
  formatLongDate, formatMinutes, formatMonthYear, fromISODate, monthGrid,
  monthNames, todayISO,
} from '../lib/date'
import './Calendar.css'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = monthNames()

function MonthPicker({
  cursor, trigger, onPick, onClose,
}: {
  cursor: Date
  /** The toggle button, so its own click is left to close the picker. */
  trigger: React.RefObject<HTMLButtonElement | null>
  onPick: (d: Date) => void
  onClose: () => void
}) {
  const [year, setYear] = useState(cursor.getFullYear())
  const [draft, setDraft] = useState(`${cursor.getFullYear()}`)
  const ref = useRef<HTMLDivElement>(null)

  const setYearFrom = (text: string) => {
    setDraft(text)
    const y = Number(text)
    if (/^\d{4}$/.test(text) && y >= 1970 && y <= 2200) setYear(y)
  }
  const commitYear = () => setDraft(`${year}`)
  const stepYear = (n: number) => {
    const y = Math.min(2200, Math.max(1970, year + n))
    setYear(y)
    setDraft(`${y}`)
  }

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (!ref.current?.contains(t) && !trigger.current?.contains(t)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      onClose()
      trigger.current?.focus()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose, trigger])

  return (
    <div
      className="cal__picker card" ref={ref}
      role="dialog" aria-label="Choose month and year"
    >
      <div className="cal__picker-year">
        <button
          className="btn btn--ghost cal__arrow" onClick={() => stepYear(-1)}
          aria-label="Previous year"
        >
          <IconChevronLeft size={17} />
        </button>
        <input
          className="field tabular cal__picker-input"
          type="text" inputMode="numeric" maxLength={4} value={draft}
          onChange={(e) => setYearFrom(e.target.value.replace(/\D/g, ''))}
          onBlur={commitYear}
          onKeyDown={(e) => { if (e.key === 'Enter') commitYear() }}
          aria-label="Year"
        />
        <button
          className="btn btn--ghost cal__arrow" onClick={() => stepYear(1)}
          aria-label="Next year"
        >
          <IconChevronRight size={17} />
        </button>
      </div>
      <div className="cal__picker-months">
        {MONTHS.map((name, m) => (
          <button
            key={name}
            className={[
              'btn btn--sm cal__picker-month',
              m === cursor.getMonth() && year === cursor.getFullYear() ? 'is-active' : '',
            ].join(' ').trim()}
            onClick={() => onPick(new Date(year, m, 1))}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const state = useApp()
  const dispatch = useDispatch()
  const courses = useCourseMap()
  const today = todayISO()

  const [cursor, setCursor] = useState(() => fromISODate(today))
  const [selected, setSelected] = useState(today)
  const [editing, setEditing] = useState<CalendarEvent | 'new' | null>(null)
  const [picking, setPicking] = useState(false)
  const titleRef = useRef<HTMLButtonElement>(null)

  const cells = useMemo(() => monthGrid(cursor), [cursor])
  const month = cursor.getMonth()

  const dayEvents = eventsOn(state.events, selected)
  const dayTasks = dueOn(state.tasks, selected)

  const shift = (n: number) =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1))

  return (
    <div className="cal wide">
      <header className="cal__head">
        <div className="cal__title-wrap">
          <h1>
            <button
              ref={titleRef}
              className="cal__title" onClick={() => setPicking((p) => !p)}
              aria-haspopup="dialog" aria-expanded={picking}
            >
              {formatMonthYear(cursor)}
            </button>
          </h1>
          <span className="dim">Classes, events and deadlines</span>
          {picking && (
            <MonthPicker
              cursor={cursor}
              trigger={titleRef}
              onPick={(d) => { setCursor(d); setPicking(false) }}
              onClose={() => setPicking(false)}
            />
          )}
        </div>
        <div className="cal__nav">
          <button className="btn btn--ghost cal__arrow" onClick={() => shift(-1)} aria-label="Previous month">
            <IconChevronLeft size={19} />
          </button>
          <button
            className="btn btn--sm"
            onClick={() => { setCursor(fromISODate(today)); setSelected(today) }}
          >
            Today
          </button>
          <button className="btn btn--ghost cal__arrow" onClick={() => shift(1)} aria-label="Next month">
            <IconChevronRight size={19} />
          </button>
        </div>
      </header>

      <div className="cal__layout">
        <section className="card cal__grid-wrap">
          <div className="cal__weekdays">
            {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="cal__grid">
            {cells.map((iso) => {
              const d = fromISODate(iso)
              const evs = eventsOn(state.events, iso)
              const due = dueOn(state.tasks, iso).filter((t) => !t.done)
              return (
                <button
                  key={iso}
                  className={[
                    'day',
                    d.getMonth() !== month ? 'is-out' : '',
                    iso === today ? 'is-today' : '',
                    iso === selected ? 'is-selected' : '',
                  ].join(' ').trim()}
                  onClick={() => setSelected(iso)}
                  aria-current={iso === today ? 'date' : undefined}
                  aria-label={formatLongDate(iso)}
                >
                  <span className="day__n">{d.getDate()}</span>
                  <span className="day__dots">
                    {evs.slice(0, 3).map((e) => (
                      <i
                        key={e.id}
                        style={{
                          background: e.courseId
                            ? courses[e.courseId]?.color ?? 'var(--accent)'
                            : 'var(--accent)',
                        }}
                      />
                    ))}
                    {due.length > 0 && <i className="day__due" />}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <aside className="card cal__day">
          <div className="cal__day-head">
            <h3>{formatLongDate(selected)}</h3>
            <button className="btn btn--ghost btn--sm" onClick={() => setEditing('new')}>
              <IconPlus size={16} /> Event
            </button>
          </div>

          <span className="section-title">Schedule</span>
          {dayEvents.length ? (
            <ul className="cal__list">
              {dayEvents.map((e) => (
                <li key={e.id}>
                  <button className="cal__item" onClick={() => setEditing(e)}>
                    <span className="tabular cal__item-time">
                      {formatMinutes(e.start)}
                    </span>
                    <span className="cal__item-body">
                      <strong>{e.title}</strong>
                      <span className="dim">
                        {formatMinutes(e.start)}–{formatMinutes(e.end)}
                        {e.location ? ` · ${e.location}` : ''}
                        {e.repeatDays.length ? ' · Weekly' : ''}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dim cal__none">Nothing scheduled.</p>
          )}

          <span className="section-title" style={{ marginTop: 20 }}>Due</span>
          {dayTasks.length ? (
            <ul className="cal__list">
              {dayTasks.map((t) => (
                <li key={t.id}>
                  <label className="cal__due">
                    <input
                      type="checkbox" checked={t.done}
                      onChange={() => dispatch({ type: 'task/toggle', id: t.id })}
                    />
                    <span className={t.done ? 'cal__due-done' : ''}>{t.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dim cal__none">Nothing due.</p>
          )}
        </aside>
      </div>

      {editing && (
        <EventEditor
          event={editing === 'new' ? undefined : editing}
          date={selected}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
