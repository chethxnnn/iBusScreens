import { useLayoutEffect, useRef, useState } from 'react'
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

export default function SectionNav({ sections, activeId, onSection, flags = {} }) {
  const listRef = useRef(null)
  const [bar, setBar] = useState(null)

  useLayoutEffect(() => {
    const measure = () => {
      const list = listRef.current
      const el = list?.querySelector(`[data-tab="${activeId}"]`)
      if (!el) return
      setBar({ left: el.offsetLeft, width: el.offsetWidth })
      const target = el.offsetLeft - list.clientWidth / 2 + el.offsetWidth / 2
      list.scrollTo({ left: target, behavior: 'smooth' })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeId, Object.keys(flags).join()])

  return (
    <nav className="section-nav" aria-label="Form sections">
      <div className="nav-list" ref={listRef}>
        {bar && (
          <span
            className="nav-indicator"
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
    </nav>
  )
}
