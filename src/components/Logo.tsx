import { useId } from 'react'

/** Caelora mark: a bold C with a celestial spark in its opening. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  const id = useId()
  return (
    <svg
      width={size} height={size} viewBox="0 0 32 32"
      className={className} aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--purple)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <path
        fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round"
        d="M19.8 9.4A8.2 8.2 0 1 0 19.8 22.6"
      />
      <path fill="#fff" d="M24.2 12.9Q24.2 16 27.3 16Q24.2 16 24.2 19.1Q24.2 16 21.1 16Q24.2 16 24.2 12.9Z" />
    </svg>
  )
}
