import { useNavigate } from 'react-router-dom'
import { useApp, useDispatch } from '../store/store'
import { eventsOn } from '../features/calendar/occurrences'
import { sessionForBlock } from '../features/focus/session'
import { upNext } from '../features/scheduling/current'
import { openTasks, sortByUrgency } from '../features/tasks/select'
import TaskCard from '../components/TaskCard'
import Timeline from '../components/Timeline'
import MusicPlayer from '../components/MusicPlayer'
import { IconPlus, IconSparkle, IconTarget } from '../components/Icons'
import {
  formatLongDate, formatMinutes, nowMinutes, todayISO,
} from '../lib/date'
import { useTick } from '../lib/useTick'
import './Home.css'

export default function HomePage({ onQuickAdd }: { onQuickAdd: () => void }) {
  const state = useApp()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  useTick(30_000)

  const today = todayISO()
  const now = nowMinutes()
  const schedule = state.schedules[today]
  const next = upNext(schedule, now)
  const todayEvents = eventsOn(state.events, today)
  const openWork = sortByUrgency(openTasks(state.tasks), today).slice(0, 5)

  function continueDay() {
    if (state.session) return navigate('/focus')
    if (next?.live && next.block.type === 'task') {
      dispatch({ type: 'session/start', session: sessionForBlock(next.block) })
      dispatch({ type: 'focus/set', on: true })
      return navigate('/focus')
    }
    navigate(schedule ? '/focus' : '/tasks')
  }

  return (
    <div className="home">
      <header className="home__head">
        <span className="dim">{formatLongDate(today)}</span>
        <h1>Hello, {state.settings.username}</h1>
      </header>

      <div className="home__actions">
        <button className="btn" onClick={continueDay}>
          <IconTarget size={18} /> Continue
        </button>
        <button className="btn btn--primary" onClick={() => navigate('/build')}>
          <IconSparkle size={18} /> Build Your Day
        </button>
      </div>

      {next && (
        <section className={`upnext${next.live ? ' is-live' : ''}`}>
          <span className="upnext__label">
            {next.live ? 'Right now' : `Up next · ${formatMinutes(next.block.start)}`}
          </span>
          <h2 className="upnext__title">{next.block.title}</h2>
          <span className="upnext__time tabular dim">
            {formatMinutes(next.block.start)}–{formatMinutes(next.block.end)}
          </span>
          {(next.block.type === 'task' || next.block.type === 'commitment') && (
            <button
              className="btn btn--primary btn--sm upnext__go"
              onClick={() => {
                dispatch({ type: 'session/start', session: sessionForBlock(next.block) })
                dispatch({ type: 'focus/set', on: true })
                navigate('/focus')
              }}
            >
              Start focus
            </button>
          )}
        </section>
      )}

      <div className="home__grid">
        <section className="card home__panel">
          <div className="home__panel-head">
            <h3>Today’s plan</h3>
            {schedule && (
              <button className="btn btn--ghost btn--sm" onClick={() => navigate('/build')}>
                Edit
              </button>
            )}
          </div>

          {schedule ? (
            <Timeline
              schedule={schedule}
              nowMin={now}
              onToggleDone={(b) =>
                dispatch({
                  type: 'block/patch', date: today, id: b.id, patch: { done: !b.done },
                })}
              onFocus={(b) => {
                dispatch({ type: 'session/start', session: sessionForBlock(b) })
                dispatch({ type: 'focus/set', on: true })
                navigate('/focus')
              }}
            />
          ) : (
            <div className="empty">
              <div className="empty__icon" aria-hidden="true">✦</div>
              <p>No plan for today yet.</p>
              <button
                className="btn btn--primary btn--sm"
                style={{ marginTop: 14 }}
                onClick={() => navigate('/build')}
              >
                Build Your Day
              </button>
            </div>
          )}
        </section>

        <div className="home__side">
          <section className="card home__panel home__music">
            <span className="section-title">Currently playing</span>
            <MusicPlayer />
          </section>

          <section className="card home__panel">
            <div className="home__panel-head">
              <h3>Open tasks</h3>
              <button className="btn btn--ghost btn--sm" onClick={onQuickAdd}>
                <IconPlus size={16} /> Add
              </button>
            </div>
            {openWork.length ? (
              <div className="stack">
                {openWork.map((t) => (
                  <TaskCard key={t.id} task={t} onOpen={() => navigate('/tasks')} />
                ))}
              </div>
            ) : (
              <div className="empty">
                <div className="empty__icon" aria-hidden="true">✓</div>
                Nothing outstanding.
              </div>
            )}
          </section>

          <section className="card home__panel">
            <span className="section-title">Today’s classes</span>
            {todayEvents.length ? (
              <ul className="home__events">
                {todayEvents.map((e) => (
                  <li key={e.id}>
                    <span className="tabular">{formatMinutes(e.start)}</span>
                    <span className="home__event-title">{e.title}</span>
                    {e.location && <span className="dim">{e.location}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dim" style={{ fontSize: 13 }}>No classes today.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
