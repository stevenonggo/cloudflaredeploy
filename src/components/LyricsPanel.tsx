import { useEffect, useRef } from 'react'
import { currentLyricIndex, useMusic } from '../features/music/useMusic'
import { IconChevronRight } from './Icons'
import './LyricsPanel.css'

export default function LyricsPanel({ onCollapse }: { onCollapse: () => void }) {
  const { track, position } = useMusic()
  const active = currentLyricIndex(track.lyrics, position)
  const list = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const box = list.current
    const el = box?.querySelector<HTMLElement>('.is-active')
    if (!box || !el) return
    // Scroll the list itself: scrollIntoView would also scroll the page, which
    // yanks the view away from whatever the user is actually reading.
    const offset = el.getBoundingClientRect().top - box.getBoundingClientRect().top
    box.scrollTo({
      top: box.scrollTop + offset - box.clientHeight / 2 + el.clientHeight / 2,
      behavior: 'smooth',
    })
  }, [active])

  return (
    <aside className="lyrics" aria-label="Lyrics">
      <header className="lyrics__head">
        <span className="section-title" style={{ margin: 0 }}>Lyrics</span>
        <button
          className="btn btn--ghost lyrics__collapse"
          onClick={onCollapse}
          aria-label="Collapse lyrics"
        >
          <IconChevronRight size={18} />
        </button>
      </header>

      <div className="lyrics__track">
        <strong>{track.title}</strong>
        <span className="dim">{track.artist}</span>
      </div>

      <ul className="lyrics__list" ref={list}>
        {track.lyrics.map((line, i) => (
          <li
            key={`${line.t}-${i}`}
            className={`lyrics__line${i === active ? ' is-active' : ''}${
              i < active ? ' is-past' : ''
            }`}
          >
            {line.text}
          </li>
        ))}
      </ul>

      <p className="lyrics__note dim">
        Sample lyrics. Real lyrics need a licensed provider.
      </p>
    </aside>
  )
}
