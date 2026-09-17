import { useEffect, useRef, type ReactNode } from 'react'
import { IconClose } from './Icons'
import './Modal.css'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

export default function Modal({ title, onClose, children, footer, wide }: Props) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const first = panel.current?.querySelector<HTMLElement>(
      'input, textarea, select, button',
    )
    first?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <button className="modal__scrim" aria-label="Close" onClick={onClose} />
      <div className={`modal__panel${wide ? ' modal__panel--wide' : ''}`} ref={panel}>
        <header className="modal__head">
          <h3>{title}</h3>
          <button className="btn btn--ghost modal__x" onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>
  )
}
