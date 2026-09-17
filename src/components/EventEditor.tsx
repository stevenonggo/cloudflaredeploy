import { useState } from 'react'
import Modal from './Modal'
import type { CalendarEvent, EventKind } from '../types'
import { useApp, useDispatch, uid } from '../store/store'
import { formatMinutes, parseMinutes } from '../lib/date'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Props {
  event?: CalendarEvent
  date: string
  onClose: () => void
}

export default function EventEditor({ event, date, onClose }: Props) {
  const { courses } = useApp()
  const dispatch = useDispatch()

  const [title, setTitle] = useState(event?.title ?? '')
  const [kind, setKind] = useState<EventKind>(event?.kind ?? 'class')
  const [start, setStart] = useState(formatMinutes(event?.start ?? 9 * 60))
  const [end, setEnd] = useState(formatMinutes(event?.end ?? 10 * 60 + 30))
  const [location, setLocation] = useState(event?.location ?? '')
  const [courseId, setCourseId] = useState(event?.courseId ?? '')
  const [repeatDays, setRepeat] = useState<number[]>(event?.repeatDays ?? [])
  const [day, setDay] = useState(event?.date ?? date)

  const valid = title.trim() && day && parseMinutes(end) > parseMinutes(start)

  function save() {
    if (!valid) return
    const patch = {
      title: title.trim(),
      kind,
      date: day,
      start: parseMinutes(start),
      end: parseMinutes(end),
      location: location.trim() || undefined,
      courseId: courseId || undefined,
      repeatDays,
    }
    if (event) dispatch({ type: 'event/patch', id: event.id, patch })
    else dispatch({ type: 'event/add', event: { id: uid('ev'), ...patch } })
    onClose()
  }

  return (
    <Modal
      title={event ? 'Edit event' : 'New event'}
      onClose={onClose}
      footer={
        <>
          {event && (
            <button
              className="btn btn--ghost btn--danger"
              onClick={() => {
                if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return
                dispatch({ type: 'event/remove', id: event.id })
                onClose()
              }}
            >
              Delete
            </button>
          )}
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={save} disabled={!valid}>
            {event ? 'Save' : 'Add event'}
          </button>
        </>
      }
    >
      <form className="editor" onSubmit={(e) => { e.preventDefault(); save() }}>
        <div>
          <label className="label" htmlFor="ev-title">Title</label>
          <input
            id="ev-title" className="field" value={title}
            placeholder="Linear Algebra"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <span className="label">Type</span>
          <div className="segmented">
            {(['class', 'event'] as EventKind[]).map((k) => (
              <button
                key={k} type="button"
                className={`segmented__item${kind === k ? ' is-on' : ''}`}
                onClick={() => setKind(k)}
              >
                {k === 'class' ? 'Class' : 'Event'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="ev-date">Date</label>
          <input
            id="ev-date" type="date" className="field" value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </div>

        <div className="editor__grid">
          <div>
            <label className="label" htmlFor="ev-start">Starts</label>
            <input
              id="ev-start" type="time" className="field" value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="ev-end">Ends</label>
            <input
              id="ev-end" type="time" className="field" value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>

        <div className="editor__grid">
          <div>
            <label className="label" htmlFor="ev-loc">Location</label>
            <input
              id="ev-loc" className="field" value={location}
              placeholder="Room 401"
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="ev-course">Course</label>
            <select
              id="ev-course" className="field" value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">None</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className="label">Repeats weekly on</span>
          <div className="segmented">
            {DAYS.map((d, i) => (
              <button
                key={d} type="button"
                className={`segmented__item${repeatDays.includes(i) ? ' is-on' : ''}`}
                onClick={() =>
                  setRepeat((r) =>
                    r.includes(i) ? r.filter((x) => x !== i) : [...r, i])}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}
