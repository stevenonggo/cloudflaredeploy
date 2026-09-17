import { useEffect, useState } from 'react'

/** Re-renders on an interval — for clocks that read derived time. */
export function useTick(ms = 1000, active = true): number {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setN((v) => v + 1), ms)
    return () => window.clearInterval(id)
  }, [ms, active])
  return n
}
