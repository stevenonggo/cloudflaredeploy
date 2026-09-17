import { useNavigate } from 'react-router-dom'
import { elapsedOf, useApp, useDispatch } from '../store/store'
import { useMusic } from '../features/music/useMusic'
import { useTick } from '../lib/useTick'
import { formatClock } from '../lib/date'
import {
  IconExternal, IconNext, IconPause, IconPlay, IconPlus, IconTarget, IconTimer,
} from './Icons'
import './Downbar.css'

export default function Downbar({ onQuickAdd }: { onQuickAdd: () => void }) {
  const { session, focusMode, settings } = useApp()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { track, playing, progress, toggle, next } = useMusic()

  useTick(1000, !!session?.running)
  const remaining = session
    ? Math.max(0, session.lengthSec - elapsedOf(session))
    : 0

  return (
    <div className="downbar" role="toolbar" aria-label="Quick tools">
      <div className="downbar__music">
        <button
          className="downbar__icon"
          onClick={toggle}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <IconPause size={17} /> : <IconPlay size={17} />}
        </button>
        <div className="downbar__track">
          <span className="downbar__song">{track.title}</span>
          <span className="downbar__artist">{track.artist}</span>
          <span className="downbar__bar" aria-hidden="true">
            <i style={{ width: `${progress * 100}%` }} />
          </span>
        </div>
        <button className="downbar__icon downbar__next" onClick={next} aria-label="Next track">
          <IconNext size={16} />
        </button>
      </div>

      <button
        className={`downbar__pill${session ? ' is-live' : ''}`}
        onClick={() => navigate('/focus')}
      >
        <IconTimer size={17} />
        <span className="tabular">
          {session ? formatClock(remaining) : `${settings.defaultFocusMin}:00`}
        </span>
      </button>

      <button className="downbar__pill" onClick={onQuickAdd}>
        <IconPlus size={17} />
        <span className="downbar__pill-label">Task</span>
      </button>

      <button
        className={`downbar__pill downbar__focus${focusMode ? ' is-on' : ''}`}
        onClick={() => {
          dispatch({ type: 'focus/set', on: !focusMode })
          if (!focusMode) navigate('/focus')
        }}
        aria-pressed={focusMode}
      >
        <IconTarget size={17} />
        <span className="downbar__pill-label">
          Focus {focusMode ? 'ON' : 'OFF'}
        </span>
      </button>

      <div className="downbar__links">
        {settings.shortcuts.map((s) => (
          <a
            key={s.id}
            className="downbar__icon"
            href={s.url}
            target="_blank"
            rel="noreferrer noopener"
            title={s.label}
            aria-label={`Open ${s.label} in a new tab`}
          >
            <span aria-hidden="true">{s.icon}</span>
          </a>
        ))}
        {settings.shortcuts.length === 0 && (
          <span className="downbar__icon dim" title="Add shortcuts in Settings">
            <IconExternal size={16} />
          </span>
        )}
      </div>
    </div>
  )
}
