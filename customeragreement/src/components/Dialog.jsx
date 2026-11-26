import { useEffect, useRef, useState } from 'react'
import Icon from './icons'

/**
 * Generic dialog (bottom sheet on mobile).
 * Children can be a function receiving close() so actions animate out.
 */
export default function Dialog({ title, sub, onClose, children, footer, size = 'md' }) {
  const [closing, setClosing] = useState(false)
  const ref = useRef(null)

  const close = () => {
    setClosing(true)
    setTimeout(onClose, 160)
  }

  useEffect(() => {
    ref.current?.focus()
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`overlay${closing ? ' is-closing' : ''}`} onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className={`dialog dialog-${size}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="dialog-head">
          <div>
            <p className="dialog-title">{title}</p>
            {sub && <p className="dialog-sub">{sub}</p>}
          </div>
          <button className="icon-btn" onClick={close} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="dialog-body">{typeof children === 'function' ? children(close) : children}</div>
        {footer && <div className="dialog-actions">{typeof footer === 'function' ? footer(close) : footer}</div>}
      </div>
    </div>
  )
}
