import { useState } from 'react'
import Modal from './Modal'
import type { Priority, Task } from '../types'
import { useApp, useDispatch, uid } from '../store/store'
import { todayISO } from '../lib/date'
import './TaskEditor.css'

interface Props {
  task?: Task
  defaultDue?: string
  onClose: () => void
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high']
const ESTIMATES = [15, 30, 45, 60, 90, 120, 180]

export default function TaskEditor({ task, defaultDue, onClose }: Props) {
  const { courses } = useApp()
  const dispatch = useDispatch()

  const [title, setTitle] = useState(task?.title ?? '')
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [due, setDue] = useState(task?.due ?? defaultDue ?? todayISO())
  const [estimateMin, setEstimate] = useState(task?.estimateMin ?? 45)
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium')
  const [courseId, setCourseId] = useState(task?.courseId ?? '')
  const [isAssignment, setIsAssignment] = useState(task?.isAssignment ?? false)

  const valid = title.trim().length > 0

  function save() {
    if (!valid) return
    const patch = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      due: due || undefined,
      estimateMin,
      priority,
      courseId: courseId || undefined,
      isAssignment,
    }
    if (task) dispatch({ type: 'task/patch', id: task.id, patch })
    else {
      dispatch({
        type: 'task/add',
        task: { id: uid('tk'), done: false, createdAt: Date.now(), ...patch },
      })
    }
    onClose()
  }

  return (
    <Modal
      title={task ? 'Edit task' : 'New task'}
      onClose={onClose}
      footer={
        <>
          {task && (
            <button
              className="btn btn--ghost btn--danger"
              onClick={() => { dispatch({ type: 'task/remove', id: task.id }); onClose() }}
            >
              Delete
            </button>
          )}
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={save} disabled={!valid}>
            {task ? 'Save' : 'Add task'}
          </button>
        </>
      }
    >
      <form className="editor" onSubmit={(e) => { e.preventDefault(); save() }}>
        <div>
          <label className="label" htmlFor="te-title">Title</label>
          <input
            id="te-title" className="field" value={title}
            placeholder="What needs to be done?"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="editor__grid">
          <div>
            <label className="label" htmlFor="te-due">Due date</label>
            <input
              id="te-due" type="date" className="field" value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="te-course">Course</label>
            <select
              id="te-course" className="field" value={courseId}
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
          <span className="label">Estimated time</span>
          <div className="segmented">
            {ESTIMATES.map((m) => (
              <button
                key={m} type="button"
                className={`segmented__item${estimateMin === m ? ' is-on' : ''}`}
                onClick={() => setEstimate(m)}
              >
                {m < 60 ? `${m}m` : `${m / 60}h`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">Priority</span>
          <div className="segmented">
            {PRIORITIES.map((p) => (
              <button
                key={p} type="button"
                className={`segmented__item${priority === p ? ' is-on' : ''}`}
                onClick={() => setPriority(p)}
              >
                {p[0].toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <label className="toggle-row">
          <span>
            <strong>Assignment</strong>
            <span className="dim"> — has a hard deadline</span>
          </span>
          <input
            type="checkbox" className="switch" checked={isAssignment}
            onChange={(e) => setIsAssignment(e.target.checked)}
          />
        </label>

        <div>
          <label className="label" htmlFor="te-notes">Notes</label>
          <textarea
            id="te-notes" className="field" value={notes}
            placeholder="Optional details"
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  )
}
