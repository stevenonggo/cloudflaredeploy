import { NavLink } from 'react-router-dom'
import {
  IconCalendar, IconHome, IconList, IconPanel, IconSettings, IconTarget,
} from './Icons'
import { LogoMark } from './Logo'
import './Sidebar.css'

const NAV = [
  { to: '/', label: 'Home', Icon: IconHome, end: true },
  { to: '/calendar', label: 'Calendar', Icon: IconCalendar },
  { to: '/tasks', label: 'Tasks', Icon: IconList },
  { to: '/focus', label: 'Focus', Icon: IconTarget },
  { to: '/settings', label: 'Settings', Icon: IconSettings },
]

interface Props {
  collapsed: boolean
  onToggleCollapsed: () => void
  /** Mobile drawer state. */
  open: boolean
  onNavigate: () => void
}

export default function Sidebar({
  collapsed, onToggleCollapsed, open, onNavigate,
}: Props) {
  return (
    <nav
      className={`sidebar${collapsed ? ' is-collapsed' : ''}${open ? ' is-open' : ''}`}
      aria-label="Main"
    >
      <div className="sidebar__brand">
        <LogoMark size={32} className="sidebar__mark" />
        <span className="sidebar__name">Caelora</span>
      </div>

      <ul className="sidebar__list">
        {NAV.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `sidebar__link${isActive ? ' is-active' : ''}`}
            >
              <Icon size={21} />
              <span className="sidebar__label">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <button
        className="sidebar__collapse"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <IconPanel size={19} />
        <span className="sidebar__label">Collapse</span>
      </button>
    </nav>
  )
}
