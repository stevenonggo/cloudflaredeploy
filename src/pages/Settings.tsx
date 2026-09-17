import { useState } from 'react'
import { useApp, useDispatch, uid } from '../store/store'
import { DEFAULT_COURSE_COLORS } from '../data/seed'
import type { Settings, ThemePref } from '../types'
import { IconMoon, IconPlus, IconSun, IconTrash } from '../components/Icons'
import { formatDuration, formatMinutes, parseMinutes } from '../lib/date'
import './Settings.css'

const THEMES: { id: ThemePref; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

export default function SettingsPage() {
  const { settings, courses } = useApp()
  const dispatch = useDispatch()
  const patch = (p: Partial<Settings>) =>
    dispatch({ type: 'settings/patch', patch: p })

  const [courseName, setCourseName] = useState('')
  const [scLabel, setScLabel] = useState('')
  const [scUrl, setScUrl] = useState('')

  function addCourse() {
    const name = courseName.trim()
    if (!name) return
    dispatch({
      type: 'course/add',
      course: {
        id: uid('c'),
        name,
        color: DEFAULT_COURSE_COLORS[courses.length % DEFAULT_COURSE_COLORS.length],
      },
    })
    setCourseName('')
  }

  function addShortcut() {
    const label = scLabel.trim()
    let url = scUrl.trim()
    if (!label || !url) return
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`
    patch({
      shortcuts: [
        ...settings.shortcuts,
        { id: uid('s'), label, url, icon: label[0].toUpperCase() },
      ],
    })
    setScLabel('')
    setScUrl('')
  }

  return (
    <div className="settings">
      <header>
        <h1>Settings</h1>
        <span className="dim">Everything is stored on this device.</span>
      </header>

      <section className="card set__panel">
        <span className="section-title">You</span>
        <label className="label" htmlFor="set-name">Name</label>
        <input
          id="set-name" className="field" value={settings.username}
          onChange={(e) => patch({ username: e.target.value })}
        />

        <span className="label" style={{ marginTop: 18 }}>Appearance</span>
        <div className="segmented">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`segmented__item${settings.theme === t.id ? ' is-on' : ''}`}
              onClick={() => patch({ theme: t.id })}
            >
              {t.id === 'light' && <IconSun size={15} />}
              {t.id === 'dark' && <IconMoon size={15} />}
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card set__panel">
        <span className="section-title">Your day</span>
        <div className="set__grid">
          <label>
            <span className="label">Day starts</span>
            <input
              type="time" className="field" value={formatMinutes(settings.dayStart)}
              onChange={(e) => {
                if (!e.target.value) return
                const dayStart = parseMinutes(e.target.value)
                patch({ dayStart, dayEnd: Math.max(settings.dayEnd, dayStart + 60) })
              }}
            />
          </label>
          <label>
            <span className="label">Day ends</span>
            <input
              type="time" className="field" value={formatMinutes(settings.dayEnd)}
              onChange={(e) => {
                if (!e.target.value) return
                const dayEnd = parseMinutes(e.target.value)
                patch({ dayEnd, dayStart: Math.min(settings.dayStart, dayEnd - 60) })
              }}
            />
          </label>
          <label>
            <span className="label">Longest work block</span>
            <select
              className="field" value={settings.maxBlockMin}
              onChange={(e) => patch({ maxBlockMin: Number(e.target.value) })}
            >
              {[30, 45, 60, 90, 120].map((m) => (
                <option key={m} value={m}>{formatDuration(m)}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Break between blocks</span>
            <select
              className="field" value={settings.breakMin}
              onChange={(e) => patch({ breakMin: Number(e.target.value) })}
            >
              {[5, 10, 15, 20, 30].map((m) => (
                <option key={m} value={m}>{formatDuration(m)}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Default focus length</span>
            <select
              className="field" value={settings.defaultFocusMin}
              onChange={(e) => patch({ defaultFocusMin: Number(e.target.value) })}
            >
              {[15, 25, 45, 50, 60, 90].map((m) => (
                <option key={m} value={m}>{formatDuration(m)}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="toggle-row" style={{ marginTop: 16 }}>
          <span>Reserve time for meals when building a day</span>
          <input
            type="checkbox" className="switch" checked={settings.includeMeals}
            onChange={(e) => patch({ includeMeals: e.target.checked })}
          />
        </label>
      </section>

      <section className="card set__panel">
        <span className="section-title">Courses</span>
        <ul className="set__list">
          {courses.map((c) => (
            <li key={c.id}>
              <i className="dot" style={{ background: c.color }} />
              <span>{c.name}</span>
              <button
                className="set__remove"
                onClick={() => dispatch({ type: 'course/remove', id: c.id })}
                aria-label={`Remove ${c.name}`}
              >
                <IconTrash size={15} />
              </button>
            </li>
          ))}
        </ul>
        <form className="set__add" onSubmit={(e) => { e.preventDefault(); addCourse() }}>
          <input
            className="field" value={courseName} placeholder="Add a course"
            onChange={(e) => setCourseName(e.target.value)}
          />
          <button className="btn" type="submit"><IconPlus size={17} /> Add</button>
        </form>
      </section>

      <section className="card set__panel">
        <span className="section-title">Downbar shortcuts</span>
        <ul className="set__list">
          {settings.shortcuts.map((s) => (
            <li key={s.id}>
              <span className="set__icon" aria-hidden="true">{s.icon}</span>
              <span>
                {s.label} <span className="dim">{s.url}</span>
              </span>
              <button
                className="set__remove"
                onClick={() =>
                  patch({ shortcuts: settings.shortcuts.filter((x) => x.id !== s.id) })}
                aria-label={`Remove ${s.label}`}
              >
                <IconTrash size={15} />
              </button>
            </li>
          ))}
        </ul>
        <form className="set__add" onSubmit={(e) => { e.preventDefault(); addShortcut() }}>
          <input
            className="field" value={scLabel} placeholder="Label"
            onChange={(e) => setScLabel(e.target.value)}
          />
          <input
            className="field" value={scUrl} placeholder="https://…"
            onChange={(e) => setScUrl(e.target.value)}
          />
          <button className="btn" type="submit"><IconPlus size={17} /> Add</button>
        </form>
      </section>

      <section className="card set__panel">
        <span className="section-title">Data</span>
        <p className="muted set__note">
          Caelora keeps tasks, events and plans in this browser. Resetting
          restores the sample data.
        </p>
        <button
          className="btn btn--danger"
          onClick={() => {
            if (confirm('Reset Caelora to the sample data? This cannot be undone.')) {
              dispatch({ type: 'state/reset' })
            }
          }}
        >
          Reset all data
        </button>
      </section>
    </div>
  )
}
