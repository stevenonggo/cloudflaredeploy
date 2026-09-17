import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { elapsedOf, useApp, useDispatch } from '../store/store'
import { customSession, sessionForBlock, sessionForTask } from '../features/focus/session'
import { sortByUrgency, openTasks } from '../features/tasks/select'
import { upNext } from '../features/scheduling/current'
import MusicPlayer from '../components/MusicPlayer'
import LyricsPanel from '../components/LyricsPanel'
import { IconMusic, IconPause, IconPlay, IconTarget } from '../components/Icons'
import { formatClock, formatDuration, formatMinutes, nowMinutes, todayISO } from '../lib/date'
import { useTick } from '../lib/useTick'
import './Focus.css'

const PRESETS = [25, 45, 50, 90]

export default function FocusPage() {
  const state = useApp()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { session, focusMode, settings } = state

  const [lyrics, setLyrics] = useState(false)
  const [custom, setCustom] = useState(settings.defaultFocusMin)

  useTick(500, !!session?.running)

  const elapsed = session ? elapsedOf(session) : 0
  const remaining = session ? Math.max(0, session.lengthSec - elapsed) : 0
  const progress = session ? Math.min(1, elapsed / session.lengthSec) : 0
  const finished = !!session && remaining <= 0

  // Stop the clock the moment a session runs out.
  useEffect(() => {
    if (finished && session?.running) dispatch({ type: 'session/pause' })
  }, [finished, session?.running, dispatch])

  const today = todayISO()
  const schedule = state.schedules[today]
  const next = upNext(schedule, nowMinutes())
  const suggestions = sortByUrgency(openTasks(state.tasks), today).slice(0, 4)
  const activeTask = session?.taskId
    ? state.tasks.find((t) => t.id === session.taskId)
    : undefined

  const R = 132
  const C = 2 * Math.PI * R

  return (
    <div className={`focus${focusMode ? ' is-immersive' : ''}`}>
      <div className="focus__main">
        <header className="focus__top">
          <span className="focus__badge">
            <IconTarget size={15} /> Focus Mode {focusMode ? 'ON' : 'OFF'}
          </span>
          <div className="row" style={{ gap: 8 }}>
            <button
              className={`btn btn--sm${lyrics ? ' btn--primary' : ''}`}
              onClick={() => setLyrics((v) => !v)}
            >
              <IconMusic size={16} /> Lyrics
            </button>
            <button
              className={`btn btn--sm${focusMode ? ' btn--primary' : ''}`}
              onClick={() => dispatch({ type: 'focus/set', on: !focusMode })}
              aria-pressed={focusMode}
            >
              {focusMode ? 'Exit focus' : 'Enter focus'}
            </button>
          </div>
        </header>

        {session ? (
          <div className="focus__stage">
            <div className="dial">
              <svg viewBox="0 0 300 300" className="dial__svg" aria-hidden="true">
                <circle cx="150" cy="150" r={R} className="dial__track" />
                <circle
                  cx="150" cy="150" r={R}
                  className="dial__value"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - progress)}
                />
              </svg>
              <div className="dial__center">
                <span className="dial__time tabular">{formatClock(remaining)}</span>
                <span className="dial__task">{session.title}</span>
                {activeTask && (
                  <span className="dial__meta dim">
                    {formatDuration(activeTask.estimateMin)} estimated
                  </span>
                )}
              </div>
            </div>

            {finished ? (
              <div className="focus__done fade-in">
                <strong>Session complete.</strong>
                <div className="focus__controls">
                  <button
                    className="btn"
                    onClick={() => {
                      dispatch({ type: 'session/extend', sec: 5 * 60 })
                      dispatch({ type: 'session/resume' })
                    }}
                  >
                    +5 min
                  </button>
                  {activeTask && (
                    <button
                      className="btn btn--primary"
                      onClick={() => {
                        dispatch({ type: 'task/toggle', id: activeTask.id })
                        if (session.blockId) {
                          dispatch({
                            type: 'block/patch', date: today,
                            id: session.blockId, patch: { done: true },
                          })
                        }
                        dispatch({ type: 'session/end' })
                      }}
                    >
                      Mark done
                    </button>
                  )}
                  <button
                    className="btn btn--ghost"
                    onClick={() => dispatch({ type: 'session/end' })}
                  >
                    End
                  </button>
                </div>
              </div>
            ) : (
              <div className="focus__controls">
                <button
                  className="btn btn--primary focus__primary"
                  onClick={() =>
                    dispatch({ type: session.running ? 'session/pause' : 'session/resume' })}
                >
                  {session.running ? <IconPause size={18} /> : <IconPlay size={18} />}
                  {session.running ? 'Pause' : 'Resume'}
                </button>
                <button className="btn" onClick={() => dispatch({ type: 'session/reset' })}>
                  Reset
                </button>
                <button
                  className="btn btn--ghost"
                  onClick={() => dispatch({ type: 'session/extend', sec: 5 * 60 })}
                >
                  +5 min
                </button>
                <button
                  className="btn btn--ghost btn--danger"
                  onClick={() => dispatch({ type: 'session/end' })}
                >
                  End
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="focus__stage focus__start">
            <h1>What are you working on?</h1>

            {next && (next.block.type === 'task' || next.block.type === 'commitment') && (
              <button
                className="focus__suggest focus__suggest--lead"
                onClick={() =>
                  dispatch({ type: 'session/start', session: sessionForBlock(next.block) })}
              >
                <span className="focus__suggest-label">
                  {next.live ? 'On your plan now' : 'Next on your plan'}
                </span>
                <strong>{next.block.title}</strong>
                <span className="dim">
                  {formatMinutes(next.block.start)}–{formatMinutes(next.block.end)}
                </span>
              </button>
            )}

            <div className="focus__suggests">
              {suggestions.map((t) => (
                <button
                  key={t.id}
                  className="focus__suggest"
                  onClick={() =>
                    dispatch({ type: 'session/start', session: sessionForTask(t, settings) })}
                >
                  <strong>{t.title}</strong>
                  <span className="dim">{formatDuration(t.estimateMin)}</span>
                </button>
              ))}
            </div>

            <div className="focus__custom">
              <span className="section-title" style={{ margin: 0 }}>Or just a timer</span>
              <div className="segmented">
                {PRESETS.map((m) => (
                  <button
                    key={m}
                    className={`segmented__item${custom === m ? ' is-on' : ''}`}
                    onClick={() => setCustom(m)}
                  >
                    {m}m
                  </button>
                ))}
              </div>
              <button
                className="btn btn--primary"
                onClick={() =>
                  dispatch({ type: 'session/start', session: customSession('Focus', custom) })}
              >
                Start {custom} minutes
              </button>
            </div>

            {!schedule && (
              <button className="btn btn--ghost" onClick={() => navigate('/build')}>
                No plan today — build one
              </button>
            )}
          </div>
        )}

        {schedule && !focusMode && (
          <section className="focus__checklist card">
            <span className="section-title">Rest of today</span>
            <ul>
              {schedule.blocks
                .filter((b) => b.type === 'task' && !b.done)
                .map((b) => (
                  <li key={b.id}>
                    <button
                      onClick={() =>
                        dispatch({ type: 'session/start', session: sessionForBlock(b) })}
                    >
                      <span className="tabular dim">{formatMinutes(b.start)}</span>
                      <span>{b.title}</span>
                    </button>
                  </li>
                ))}
              {schedule.blocks.filter((b) => b.type === 'task' && !b.done).length === 0 && (
                <li className="dim" style={{ padding: '6px 4px' }}>All planned work is done.</li>
              )}
            </ul>
          </section>
        )}

        <section className="focus__music card">
          <span className="section-title">Currently playing</span>
          <MusicPlayer />
        </section>
      </div>

      {lyrics && <LyricsPanel onCollapse={() => setLyrics(false)} />}
    </div>
  )
}
