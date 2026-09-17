import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Downbar from './components/Downbar'
import TaskEditor from './components/TaskEditor'
import Welcome from './components/Welcome'
import HomePage from './pages/Home'
import BuildDayPage from './pages/BuildDay'
import CalendarPage from './pages/Calendar'
import TasksPage from './pages/Tasks'
import FocusPage from './pages/Focus'
import SettingsPage from './pages/Settings'
import { useApp } from './store/store'
import { useMusicClock } from './features/music/useMusic'
import { IconMenu } from './components/Icons'
import './App.css'

const TITLES: Record<string, string> = {
  '/': 'Home',
  '/build': 'Build Your Day',
  '/calendar': 'Calendar',
  '/tasks': 'Tasks',
  '/focus': 'Focus',
  '/settings': 'Settings',
}

export default function App() {
  const { settings, focusMode } = useApp()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('studyflow:collapsed') === '1'
    } catch {
      return false
    }
  })
  const [drawer, setDrawer] = useState(false)
  const [quickAdd, setQuickAdd] = useState(false)

  useMusicClock()

  useEffect(() => {
    try {
      localStorage.setItem('studyflow:collapsed', collapsed ? '1' : '0')
    } catch {
      /* storage can be unavailable (private window, blocked site data) */
    }
  }, [collapsed])

  // Cmd/Ctrl+K adds a task from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setQuickAdd(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const hideChrome = focusMode && pathname === '/focus'

  return (
    <div
      className={[
        'app',
        collapsed ? 'is-collapsed' : '',
        hideChrome ? 'is-focus' : '',
      ].join(' ').trim()}
    >
      {!settings.onboarded && <Welcome />}

      <header className="topbar">
        <button
          className="topbar__menu"
          onClick={() => setDrawer(true)}
          aria-label="Open navigation"
        >
          <IconMenu size={20} />
        </button>
        <span className="topbar__title">{TITLES[pathname] ?? 'Caelora'}</span>
      </header>

      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        open={drawer}
        onNavigate={() => setDrawer(false)}
      />

      {drawer && (
        <button
          className="app__scrim"
          aria-label="Close navigation"
          onClick={() => setDrawer(false)}
        />
      )}

      <main className="content" key={pathname}>
        <div className="content__inner fade-in">
          <Routes>
            <Route path="/" element={<HomePage onQuickAdd={() => setQuickAdd(true)} />} />
            <Route path="/build" element={<BuildDayPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<HomePage onQuickAdd={() => setQuickAdd(true)} />} />
          </Routes>
        </div>
      </main>

      <Downbar onQuickAdd={() => setQuickAdd(true)} />

      {quickAdd && <TaskEditor onClose={() => setQuickAdd(false)} />}
    </div>
  )
}
