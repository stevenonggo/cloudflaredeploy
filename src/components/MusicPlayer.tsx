import { useMusic } from '../features/music/useMusic'
import { formatClock } from '../lib/date'
import { IconNext, IconPause, IconPlay, IconPrev } from './Icons'
import './MusicPlayer.css'

export default function MusicPlayer({ compact = false }: { compact?: boolean }) {
  const { track, playing, position, progress, toggle, next, prev, seek } = useMusic()

  return (
    <div className={`player${compact ? ' player--compact' : ''}`}>
      <div className="player__info">
        <span className="player__title">{track.title}</span>
        <span className="player__artist">{track.artist}</span>
      </div>

      <div className="player__scrub">
        <span className="player__time tabular">{formatClock(position)}</span>
        <input
          type="range"
          className="scrubber"
          min={0}
          max={track.durationSec}
          value={Math.round(position)}
          onChange={(e) => seek(Number(e.target.value))}
          style={{ ['--p' as string]: `${progress * 100}%` }}
          aria-label="Seek"
        />
        <span className="player__time tabular dim">
          {formatClock(track.durationSec)}
        </span>
      </div>

      <div className="player__controls">
        <button className="player__btn" onClick={prev} aria-label="Previous track">
          <IconPrev size={18} />
        </button>
        <button
          className="player__btn player__btn--main"
          onClick={toggle}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <IconPause size={18} /> : <IconPlay size={18} />}
        </button>
        <button className="player__btn" onClick={next} aria-label="Next track">
          <IconNext size={18} />
        </button>
      </div>
    </div>
  )
}
