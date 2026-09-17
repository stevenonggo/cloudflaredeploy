import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, useDispatch } from '../store/store'
import { sortByUrgency } from '../features/tasks/select'
import { sessionForTask } from '../features/focus/session'
import TaskCard from '../components/TaskCard'
import TaskEditor from '../components/TaskEditor'
import type { Task } from '../types'
import { IconPlay, IconPlus } from '../components/Icons'
import { daysBetween, formatDuration, todayISO } from '../lib/date'
import './Tasks.css'

type Filter = 'all' | 'today' | 'upcoming' | 'assignments' | 'done'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'done', label: 'Done' },
]

export default function TasksPage() {
  const state = useApp()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const today = todayISO()

  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<Task | 'new' | null>(null)

  const visible = useMemo(() => {
    const open = state.tasks.filter((t) => !t.done)
    switch (filter) {
      case 'today':
        return sortByUrgency(
          open.filter((t) => t.due && daysBetween(today, t.due) <= 0), today)
      case 'upcoming':
        return sortByUrgency(
          open.filter((t) => !t.due || daysBetween(today, t.due) > 0), today)
      case 'assignments':
        return sortByUrgency(open.filter((t) => t.isAssignment), today)
      case 'done':
        return state.tasks
          .filter((t) => t.done)
          .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
      default:
        return sortByUrgency(open, today)
    }
  }, [state.tasks, filter, today])

  const openCount = state.tasks.filter((t) => !t.done).length
  const workLeft = state.tasks
    .filter((t) => !t.done)
    .reduce((n, t) => n + t.estimateMin, 0)

  return (
    <div className="tasks">
      <header className="tasks__head">
        <div>
          <h1>Tasks</h1>
          <span className="dim">
            {openCount} open · {formatDuration(workLeft)} of work left
          </span>
        </div>
        <button className="btn btn--primary" onClick={() => setEditing('new')}>
          <IconPlus size={18} /> New task
        </button>
      </header>

      <div className="tasks__filters" role="tablist" aria-label="Task filter">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`tasks__filter${filter === f.id ? ' is-on' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="card tasks__list">
        {visible.length ? (
          visible.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onOpen={setEditing}
              action={
                !t.done && (
                  <button
                    className="tasks__focus"
                    title="Focus on this task"
                    aria-label={`Focus on ${t.title}`}
                    onClick={() => {
                      dispatch({
                        type: 'session/start',
                        session: sessionForTask(t, state.settings),
                      })
                      dispatch({ type: 'focus/set', on: true })
                      navigate('/focus')
                    }}
                  >
                    <IconPlay size={15} />
                  </button>
                )
              }
            />
          ))
        ) : (
          <div className="empty">
            <div className="empty__icon" aria-hidden="true">✓</div>
            Nothing here.
          </div>
        )}
      </section>

      {editing && (
        <TaskEditor
          task={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
