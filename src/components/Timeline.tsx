import type { DaySchedule, ScheduleBlock } from '../types'
import { formatDuration, formatMinutes } from '../lib/date'
import { IconCheck, IconPlay, IconTrash } from './Icons'
import './Timeline.css'

interface Props {
  schedule: DaySchedule
  nowMin?: number
  /** Show per-block edit controls (remove, nudge). */
  editable?: boolean
  onToggleDone?: (block: ScheduleBlock) => void
  onRemove?: (block: ScheduleBlock) => void
  onFocus?: (block: ScheduleBlock) => void
}

const TYPE_LABEL: Record<ScheduleBlock['type'], string> = {
  commitment: 'Class / event',
  task: 'Work',
  break: 'Break',
  meal: 'Meal',
  free: 'Free',
}

export default function Timeline({
  schedule, nowMin, editable, onToggleDone, onRemove, onFocus,
}: Props) {
  if (schedule.blocks.length === 0) {
    return (
      <div className="empty">
        <div className="empty__icon" aria-hidden="true">🗓</div>
        Nothing scheduled yet.
      </div>
    )
  }

  return (
    <ol className="timeline">
      {schedule.blocks.map((b) => {
        const live = nowMin !== undefined && nowMin >= b.start && nowMin < b.end
        const past = nowMin !== undefined && nowMin >= b.end
        return (
          <li
            key={b.id}
            className={[
              'tl',
              `tl--${b.type}`,
              live ? 'is-live' : '',
              past ? 'is-past' : '',
              b.done ? 'is-done' : '',
            ].join(' ').trim()}
          >
            <div className="tl__time tabular">
              <span className="tl__start">{formatMinutes(b.start)}</span>
              <span className="tl__len dim">{formatDuration(b.end - b.start)}</span>
            </div>

            <span className="tl__rail" aria-hidden="true"><i /></span>

            <div className="tl__body">
              <div className="tl__head">
                <span className="tl__title">{b.title}</span>
                {live && <span className="tl__now">Now</span>}
              </div>
              <span className="tl__type dim">
                {TYPE_LABEL[b.type]} · {formatMinutes(b.start)}–{formatMinutes(b.end)}
              </span>
            </div>

            <div className="tl__actions">
              {onFocus && (b.type === 'task' || b.type === 'commitment') && !b.done && (
                <button
                  className="tl__btn"
                  onClick={() => onFocus(b)}
                  aria-label={`Focus on ${b.title}`}
                  title="Focus on this"
                >
                  <IconPlay size={15} />
                </button>
              )}
              {onToggleDone && b.type !== 'free' && (
                <button
                  className={`tl__btn${b.done ? ' is-on' : ''}`}
                  onClick={() => onToggleDone(b)}
                  aria-pressed={b.done}
                  aria-label={`Mark ${b.title} ${b.done ? 'not done' : 'done'}`}
                  title="Mark done"
                >
                  <IconCheck size={15} />
                </button>
              )}
              {editable && onRemove && (
                <button
                  className="tl__btn tl__btn--danger"
                  onClick={() => onRemove(b)}
                  aria-label={`Remove ${b.title}`}
                  title="Remove from plan"
                >
                  <IconTrash size={15} />
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
