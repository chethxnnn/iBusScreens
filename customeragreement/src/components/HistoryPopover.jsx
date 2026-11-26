import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from './icons'
import { formatDate } from '../data/agreementFields'

const WIDTH = 272
const GAP = 8

export default function HistoryPopover({ record, anchor, onClose }) {
  const ref = useRef(null)
  const corrected = useRef(false)
  const [pos, setPos] = useState(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !anchor) return
    const height = el.offsetHeight
    const width = el.offsetWidth || WIDTH
    let left = anchor.btn.right - width
    left = Math.min(left, anchor.box.right - width - GAP)
    left = Math.max(left, anchor.box.left + GAP)
    left = Math.max(GAP, Math.min(left, window.innerWidth - width - GAP))
    let top = anchor.btn.bottom + GAP
    const limit = Math.min(anchor.box.bottom, window.innerHeight) - GAP
    if (top + height > limit) top = anchor.btn.top - height - GAP
    top = Math.max(GAP, top)
    setPos({ top, left })
  }, [anchor])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !pos || corrected.current) return
    const r = el.getBoundingClientRect()
    let { top, left } = pos
    if (r.right > window.innerWidth - GAP) left -= r.right - (window.innerWidth - GAP)
    if (r.left < GAP) left += GAP - r.left
    if (r.bottom > window.innerHeight - GAP) top -= r.bottom - (window.innerHeight - GAP)
    if (r.top < GAP) top += GAP - r.top
    if (left !== pos.left || top !== pos.top) {
      corrected.current = true
      setPos({ top, left })
    }
  }, [pos])

  useEffect(() => {
    const armedAt = Date.now()
    const closeOnScroll = () => {
      if (Date.now() - armedAt > 120) onClose()
    }
    const closeOnOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const closeOnKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('scroll', closeOnScroll, true)
    window.addEventListener('resize', closeOnScroll)
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnKey)
    return () => {
      window.removeEventListener('scroll', closeOnScroll, true)
      window.removeEventListener('resize', closeOnScroll)
      document.removeEventListener('pointerdown', closeOnOutside)
      document.removeEventListener('keydown', closeOnKey)
    }
  }, [onClose])

  const rows = [
    ['Created On', formatDate(record.createdOn)],
    ['Created By', record.createdBy],
    ['Changed On', formatDate(record.changedOn)],
    ['Changed By', record.changedBy],
  ]

  return createPortal(
    <div
      className="history-popover"
      ref={ref}
      role="dialog"
      aria-label={`History of ${record.contractId}`}
      style={pos ? { top: pos.top, left: pos.left } : { top: -9999, left: 0 }}
    >
      <div className="hp-head">
        <span className="hp-title">History</span>
        <span className="hp-site">{record.contractId}</span>
        <button className="hp-close" onClick={onClose} aria-label="Close history">
          <Icon name="x" size={13} />
        </button>
      </div>
      <div className="hp-rows">
        {rows.map(([label, value]) => (
          <div className="hp-row" key={label}>
            <span className="hp-label">{label}</span>
            <span className="hp-value">{value || '-'}</span>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  )
}
