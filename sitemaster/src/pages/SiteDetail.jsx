import { useEffect, useMemo, useRef, useState } from 'react'
import { MANDATORY_KEYS, SECTIONS } from '../data/siteFields'
import FieldControl from '../components/FieldControl'
import SectionNav, { SECTION_ICONS } from '../components/SectionNav'
import Icon from '../components/icons'
import MeshCanvas from '../components/MeshCanvas'
import { BrandSlash, CoverageRing, Lifecycle, StatusPill } from '../components/StatusBits'

const SUMMARY_FIELDS = [
  ['ibusProjectId', 'iBUS Project ID'],
  ['customerSiteId', 'Customer Site ID'],
  ['customerSiteLocatorId', 'Customer Site Locator ID'],
  ['country', 'Country'],
  ['regionCode', 'Region Code'],
  ['companyCode', 'Company Code'],
]

const isFilled = (field, form) => {
  if (field.type === 'checkbox') return form[field.key] !== undefined
  return String(form[field.key] ?? '').trim() !== ''
}

export default function SiteDetail({ site, initialMode, onBack, onSave, notify }) {
  const [mode] = useState(initialMode)
  const [form, setForm] = useState(() => ({ ...site }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const [scrolled, setScrolled] = useState(false)

  const remaining = useMemo(() => {
    const total = parseFloat(form.totalDasArea)
    const done = parseFloat(form.completedDasArea)
    if (Number.isNaN(total) || Number.isNaN(done)) return ''
    return String(Math.max(total - done, 0))
  }, [form.totalDasArea, form.completedDasArea])

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash.startsWith('section-')) {
      const t = setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'auto', block: 'start' })
      }, 500)
      return () => clearTimeout(t)
    }
  }, [])

  const navLock = useRef(0)

  useEffect(() => {
    // Scroll-spy: the current section is the last one whose top has passed
    // under the sticky top bar + section nav.
    let frame = 0
    const update = () => {
      frame = 0
      setScrolled(window.scrollY > 8)
      if (Date.now() < navLock.current) return
      const line = Math.max(160, window.innerHeight * 0.35)
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      if (nearBottom) {
        setActiveSection(SECTIONS[SECTIONS.length - 1].id)
        return
      }
      let current = SECTIONS[0].id
      for (const s of SECTIONS) {
        const el = document.getElementById(`section-${s.id}`)
        if (el && el.getBoundingClientRect().top <= line) current = s.id
      }
      setActiveSection(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scrollend', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scrollend', update)
    }
  }, [])

  const jumpToSection = (id) => {
    navLock.current = Date.now() + 900
    setActiveSection(id)
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const set = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      const total = parseFloat(next.totalDasArea)
      const done = parseFloat(next.completedDasArea)
      next.remainingDasArea =
        Number.isNaN(total) || Number.isNaN(done) ? '' : String(Math.max(total - done, 0))
      return next
    })
    setErrors((prev) => ({ ...prev, [key]: false }))
  }

  const save = async () => {
    const missing = {}
    MANDATORY_KEYS.forEach((k) => {
      if (!String(form[k] ?? '').trim()) missing[k] = true
    })
    if (Object.keys(missing).length > 0) {
      setErrors(missing)
      const n = Object.keys(missing).length
      notify(`Fill ${n} required ${n === 1 ? 'field' : 'fields'} marked with *`, 'error')
      setTimeout(() => {
        const first = document.querySelector('.field.has-error')
        if (!first) return
        navLock.current = Date.now() + 800
        const sec = first.closest('[data-section]')
        if (sec) setActiveSection(sec.dataset.section)
        first.scrollIntoView({ behavior: 'smooth', block: 'center' })
        first.querySelector('input, select, button')?.focus({ preventScroll: true })
      }, 30)
      return
    }
    setSaving(true)
    await onSave(site?.siteId, form, mode === 'create')
    setSaving(false)
  }

  const changedKeys = useMemo(() => {
    if (mode === 'read') return new Set()
    const changed = new Set()
    Object.keys(form).forEach((k) => {
      if (k === 'remainingDasArea') return
      const orig = site ? site[k] : ''
      if (String(form[k] ?? '') !== String(orig ?? '')) changed.add(k)
    })
    return changed
  }, [form, site, mode])

  const errorSections = useMemo(() => {
    const flags = {}
    SECTIONS.forEach((s) => {
      if (s.fields.some((f) => errors[f.key])) flags[s.id] = true
    })
    return flags
  }, [errors])

  const view = mode === 'read' ? { ...form, remainingDasArea: remaining || form.remainingDasArea } : form
  const editing = mode === 'edit' || mode === 'create'
  const changeCount = [...changedKeys].filter((k) => !k.endsWith('Uom') && k !== 'builderName').length

  return (
    <main className={`page detail-page mode-${mode}`}>
      <header className={`topbar${scrolled ? ' is-scrolled' : ''}`}>
        <div className="topbar-inner">
          <button className="back-link" onClick={onBack}>
            <span className="back-icon">
              <Icon name="back" size={15} />
            </span>
            <span className="back-text">Back</span>
          </button>

          <div className={`topbar-title${scrolled || mode === 'create' ? ' is-visible' : ''}`}>
            {mode === 'create' ? (
              <>
                <span className="new-tag">New</span>
                <span>Create site</span>
              </>
            ) : (
              <>
                <span className="mono">{site.siteId}</span>
                <span className="tt-sep" aria-hidden="true" />
                <span className="tt-name">{form.siteName || 'Untitled site'}</span>
              </>
            )}
          </div>

          {editing && (
            <div className="topbar-actions">
              {mode === 'edit' && changeCount > 0 && (
                <span className="change-count" key={changeCount}>
                  {changeCount} unsaved {changeCount === 1 ? 'change' : 'changes'}
                </span>
              )}
              <button className="btn btn-ghost" onClick={onBack}>
                Cancel
              </button>
              <button className={`btn btn-cta${saving ? ' is-busy' : ''}`} onClick={save} disabled={saving}>
                {saving ? (
                  <span className="spinner" aria-hidden="true" />
                ) : (
                  <Icon name={mode === 'create' ? 'plus' : 'save'} size={15} stroke={2} />
                )}
                {saving ? (mode === 'create' ? 'Creating' : 'Saving') : mode === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </header>

      {mode !== 'create' ? (
        <section className="hero">
          <div className="hero-top">
            <MeshCanvas variant="dark" className="mesh-header" />
            <BrandSlash />
            <div className="hero-id">
              <span className="mono id-chip">{site.siteId}</span>
              <StatusPill status={form.siteStatus} />
            </div>
            <h1 className="hero-title">{form.siteName || 'Untitled site'}</h1>
            <p className="hero-sub">
              {[form.addressLine, form.cityName, form.postalCode].filter(Boolean).join(', ') || 'No address yet'}
            </p>
          </div>
          <div className="hero-body">
            <div className="hero-lifecycle">
              <Lifecycle status={form.siteStatus} />
            </div>
            <CoverageRing
              total={form.totalDasArea}
              completed={form.completedDasArea}
              uom={form.totalDasAreaUom}
            />
          </div>
          <dl className="summary-grid">
            {SUMMARY_FIELDS.map(([key, label]) => (
              <div className="summary-item" key={key}>
                <dt>{label}</dt>
                <dd>{form[key] || '-'}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : (
        <section className="hero hero-create">
          <div className="hero-top">
            <MeshCanvas variant="dark" className="mesh-header" />
            <BrandSlash />
            <div className="hero-id">
              <span className="mono id-chip">{site.siteId}</span>
            </div>
            <h1 className="hero-title">New site</h1>
            <p className="hero-sub">Fields marked with * are required. Everything else can be added later.</p>
          </div>
        </section>
      )}

      <SectionNav
        sections={SECTIONS}
        activeId={activeSection}
        onSection={jumpToSection}
        flags={errorSections}
      />

      <div className="section-stack">
        {SECTIONS.map((section) => {
          const filled = section.fields.filter((f) => isFilled(f, view)).length
          const total = section.fields.length
          return (
            <section
              className={`section-card${activeSection === section.id ? ' is-current' : ''}`}
              key={section.id}
              id={`section-${section.id}`}
              data-section={section.id}
              aria-label={section.title}
            >
              <header className="section-head">
                <span className="section-icon">
                  <Icon name={SECTION_ICONS[section.id] || 'pin'} size={18} />
                </span>
                <div className="section-titles">
                  <h2>{section.title}</h2>
                  <p>{section.note}</p>
                </div>
                <div className="section-meter" title={`${filled} of ${total} fields filled`}>
                  <span className="meter-text">
                    {filled}/{total}
                  </span>
                  <span className="meter-track">
                    <span className="meter-fill" style={{ width: `${(filled / total) * 100}%` }} />
                  </span>
                </div>
              </header>
              <div className="field-grid">
                {section.fields.map((field) => (
                  <FieldControl
                    key={field.key}
                    field={field}
                    form={view}
                    mode={mode}
                    error={errors[field.key]}
                    changed={changedKeys.has(field.key)}
                    onChange={set}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
