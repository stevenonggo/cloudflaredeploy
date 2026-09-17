import { useEffect, useRef } from 'react'
import { TRACKS } from '../../data/seed'
import { useApp, useDispatch } from '../../store/store'

/** Mock playback: no audio element yet, just a clock that advances the track.
 *  Swapping in the Spotify Web Playback SDK only needs to replace this hook. */
export function useMusic() {
  const { music } = useApp()
  const dispatch = useDispatch()
  const track = TRACKS[music.trackIndex] ?? TRACKS[0]

  return {
    track,
    playing: music.playing,
    position: music.positionSec,
    progress: track.durationSec ? music.positionSec / track.durationSec : 0,
    toggle: () => dispatch({ type: 'music/toggle' }),
    next: () => dispatch({ type: 'music/step', delta: 1 }),
    prev: () =>
      dispatch(
        music.positionSec > 4
          ? { type: 'music/seek', sec: 0 }
          : { type: 'music/step', delta: -1 },
      ),
    seek: (sec: number) => dispatch({ type: 'music/seek', sec }),
  }
}

/** Mounted once, at the app root. */
export function useMusicClock() {
  const { music } = useApp()
  const dispatch = useDispatch()

  // Read through a ref: depending on the position would rebuild the interval on
  // every tick, and each restart drops the fraction of a second already served.
  const latest = useRef(music)
  latest.current = music

  useEffect(() => {
    if (!music.playing) return
    const id = window.setInterval(() => {
      const { trackIndex, positionSec } = latest.current
      const track = TRACKS[trackIndex] ?? TRACKS[0]
      const next = positionSec + 1
      if (next >= track.durationSec) dispatch({ type: 'music/step', delta: 1 })
      else dispatch({ type: 'music/tick', sec: next })
    }, 1000)
    return () => window.clearInterval(id)
  }, [music.playing, dispatch])
}

export function currentLyricIndex(
  lyrics: { t: number; text: string }[],
  position: number,
): number {
  let i = -1
  for (let k = 0; k < lyrics.length; k++) {
    if (lyrics[k].t <= position) i = k
    else break
  }
  return i
}
