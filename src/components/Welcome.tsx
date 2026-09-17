import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, useDispatch } from '../store/store'
import { formatLongDate, todayISO } from '../lib/date'
import { IconSparkle } from './Icons'
import './Welcome.css'

export default function Welcome() {
  const { settings } = useApp()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [name, setName] = useState(
    settings.username === 'there' ? '' : settings.username,
  )

  function finish(to: string) {
    dispatch({
      type: 'settings/patch',
      patch: { username: name.trim() || 'there', onboarded: true },
    })
    navigate(to)
  }

  return (
    <div className="welcome">
      <div className="welcome__inner">
        <span className="welcome__date dim">{formatLongDate(todayISO())}</span>
        <h1 className="welcome__hello">
          Hello, <input
            className="welcome__name"
            value={name}
            placeholder="there"
            maxLength={24}
            aria-label="Your name"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') finish('/') }}
            size={Math.max(4, name.length || 5)}
          />
        </h1>
        <p className="welcome__sub muted">Plan your day. Focus on the work.</p>

        <div className="welcome__actions">
          <button className="btn" onClick={() => finish('/')}>Continue</button>
          <button className="btn btn--primary" onClick={() => finish('/build')}>
            <IconSparkle size={18} /> Build Your Day
          </button>
        </div>
      </div>
    </div>
  )
}
