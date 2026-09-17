import type { Task } from '../types'
import { useCourseMap, useDispatch } from '../store/store'
import { dueLabel, formatDuration, isOverdue } from '../lib/date'
import { IconCheck } from './Icons'
import './TaskCard.css'

interface Props {
  task: Task
  onOpen?: (task: Task) => void
  /** Extra control rendered on the right, e.g. "Focus". */
  action?: React.ReactNode
}

export default function TaskCard({ task, onOpen, action }: Props) {
  const dispatch = useDispatch()
  const courses = useCourseMap()
  const course = task.courseId ? courses[task.courseId] : undefined
  const late = !task.done && isOverdue(task.due)

  return (
    <div className={`task${task.done ? ' is-done' : ''}`}>
      <button
        className={`task__check${task.done ? ' is-on' : ''}`}
        onClick={() => dispatch({ type: 'task/toggle', id: task.id })}
        aria-pressed={task.done}
        aria-label={task.done ? `Mark ${task.title} as not done` : `Complete ${task.title}`}
      >
        {task.done && <IconCheck size={14} />}
      </button>

      <button
        className="task__main"
        onClick={() => onOpen?.(task)}
        disabled={!onOpen}
      >
        <span className="task__title">{task.title}</span>
        <span className="task__meta">
          {course && (
            <span className="task__course">
              <i className="dot" style={{ background: course.color }} />
              {course.name}
            </span>
          )}
          <span className={late ? 'task__due is-late' : 'task__due'}>
            {dueLabel(task.due)}
          </span>
          <span className="dim">{formatDuration(task.estimateMin)}</span>
          {task.priority === 'high' && <span className="task__flag">High</span>}
        </span>
      </button>

      {action && <div className="task__action">{action}</div>}
    </div>
  )
}
