import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Icon from './icons'

export const SECTION_ICONS = {
  basic: 'pin',
  org: 'org',
  technical: 'chip',
  business: 'briefcase',
  das: 'area',
  network: 'signal',
  infra: 'tower',
  builder: 'building',
  history: 'history',
}

export default function SectionNav({ sections, activeId, onSection, flags = {}, navRef, stuck = false }) {
  const listRef = useRef(null)
  const [bar, setBar] = useState(null)
  const [hScroll, setHScroll] = useState({ prev: false, next: false })

  const syncArrows = useCallback(() => {
    const el = listRef.current
    if (!el) return
    const prev = el.scrollLeft > 2
    const next = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
    setHScroll((s) => (s.prev === prev && s.next === next ? s : { prev, next }))
  }, [])

  useLayoutEffect(() => {
    const measure = () => {
      const list = listRef.current
      const el = list?.querySelector(`[data-tab="${activeId}"]`)
      if (!el) return
      setBar({ left: el.offsetLeft, width: el.offsetWidth })
      const target = el.offsetLeft - list.clientWidth / 2 + el.offsetWidth / 2
      list.scrollTo({ left: target, behavior: 'smooth' })
      syncArrows()
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeId, Object.keys(flags).join(), syncArrows])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    let raf = 0
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0
          syncArrows()
        })
      }
    }
    syncArrows()
    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(syncArrows)
    ro.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [syncArrows])

  const scrollTabs = (dir) => {
    const el = listRef.current
    if (!el) return
    const step = Math.max(180, el.clientWidth * 0.45)
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <nav ref={navRef} className={`section-nav${stuck ? ' is-stuck' : ''}`} aria-label="Form sections">
      <div className="nav-wrap">
        <button
          type="button"
          className={`nav-arrow nav-arrow-prev${hScroll.prev ? ' is-visible' : ''}`}
          onClick={() => scrollTabs(-1)}
          aria-label="Scroll sections left"
          tabIndex={hScroll.prev ? 0 : -1}
        >
          <Icon name="chevronLeft" size={15} stroke={2.4} />
        </button>
        <div className="nav-list" ref={listRef}>
          {bar && (
            <span
              className={`nav-indicator${activeId === sections[0]?.id ? ' is-first' : ''}${activeId === sections[sections.length - 1]?.id ? ' is-last' : ''}`}
              style={{ transform: `translateX(${bar.left}px)`, width: bar.width }}
              aria-hidden="true"
            />
          )}
          {sections.map((section) => (
            <button
              key={section.id}
              data-tab={section.id}
              className={`nav-tab${section.id === activeId ? ' active' : ''}`}
              aria-current={section.id === activeId ? 'true' : undefined}
              onClick={() => onSection(section.id)}
              type="button"
            >
              <Icon name={SECTION_ICONS[section.id] || 'pin'} size={15} />
              {section.title}
              {flags[section.id] && <span className="nav-flag" aria-label="Has missing required fields" />}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`nav-arrow nav-arrow-next${hScroll.next ? ' is-visible' : ''}`}
          onClick={() => scrollTabs(1)}
          aria-label="Scroll sections right"
          tabIndex={hScroll.next ? 0 : -1}
        >
          <Icon name="chevronRight" size={15} stroke={2.4} />
        </button>
      </div>
    </nav>
  )
}
