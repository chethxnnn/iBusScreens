import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './icons'

// values: array of strings, or { value, label, sub } objects
const norm = (v) => (typeof v === 'object' && v !== null ? v : { value: v, label: String(v) })

export default function ValueHelp({ title, values, onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const [closing, setClosing] = useState(false)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const items = useMemo(() => values.map(norm), [values])

  const close = () => {
    setClosing(true)
    setTimeout(onClose, 160)
  }
  const pick = (v) => {
    setClosing(true)
    setTimeout(() => onSelect(v), 120)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((v) => `${v.label} ${v.sub || ''}`.toLowerCase().includes(q))
  }, [query, items])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => setCursor(0), [query])

  useEffect(() => {
    listRef.current?.querySelector('.vh-row.is-cursor')?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const onKey = (e) => {
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, filtered.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    }
    if (e.key === 'Enter' && filtered[cursor] !== undefined) pick(filtered[cursor].value)
  }

  const highlight = (text) => {
    const q = query.trim()
    const s = String(text)
    if (!q) return s
    const i = s.toLowerCase().indexOf(q.toLowerCase())
    if (i < 0) return s
    return (
      <>
        {s.slice(0, i)}
        <mark>{s.slice(i, i + q.length)}</mark>
        {s.slice(i + q.length)}
      </>
    )
  }

  return (
    <div
      className={`overlay${closing ? ' is-closing' : ''}`}
      onMouseDown={(e) => e.target === e.currentTarget && close()}
      onKeyDown={onKey}
    >
      <div className="dialog value-help" role="dialog" aria-modal="true" aria-label={`Value help for ${title}`}>
        <div className="dialog-head">
          <div>
            <p className="dialog-title">{title}</p>
          </div>
          <button className="icon-btn" onClick={close} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="vh-search">
          <Icon name="search" size={15} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search values"
          />
        </div>
        <div className="vh-list" ref={listRef} role="listbox">
          {filtered.length === 0 && (
            <p className="vh-empty">{query.trim() ? `No values contain “${query}”.` : 'No values available.'}</p>
          )}
          {filtered.map((v, i) => (
            <button
              key={v.value}
              role="option"
              aria-selected={i === cursor}
              className={`vh-row${i === cursor ? ' is-cursor' : ''}`}
              onMouseEnter={() => setCursor(i)}
              onClick={() => pick(v.value)}
            >
              <span className="vh-text">
                <span>{highlight(v.label)}</span>
                {v.sub && <span className="vh-sub">{highlight(v.sub)}</span>}
              </span>
              <Icon name="chevronRight" size={14} />
            </button>
          ))}
        </div>
        <div className="dialog-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> move</span>
          <span><kbd>Enter</kbd> select</span>
          <span><kbd>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
