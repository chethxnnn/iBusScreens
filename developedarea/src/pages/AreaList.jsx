import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/icons'
import MeshCanvas from '../components/MeshCanvas'
import ValueHelp from '../components/ValueHelp'
import { BrandSlash } from '../components/StatusBits'
import { formatDate } from '../data/areaFields'

// Filters from the screen design: Area ID, RFIB Date, Created By, Created On (all with F4)
const FILTER_FIELDS = [
  { key: 'areaId', label: 'Area ID' },
  { key: 'rfibDate', label: 'RFIB Date', date: true },
  { key: 'createdBy', label: 'Created By' },
  { key: 'createdOn', label: 'Created On', date: true },
]

const emptyFilters = { areaId: '', rfibDate: '', createdBy: '', createdOn: '' }

const MOBILE_QUERY = '(max-width: 760px)'
const useIsMobile = () => {
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const on = (e) => setMobile(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return mobile
}

// Value matched for a filter column (dates are ISO yyyy-mm-dd from <input type="date">)
const cellValue = (row, f) => String(row[f.key] || '')

const fmtArea = (v) => {
  const n = Number(v)
  return v !== '' && !Number.isNaN(n) ? n.toLocaleString('en-IN') : v || '-'
}

export default function AreaList({ areas, sites, loading, onOpen, onCreate }) {
  const [draft, setDraft] = useState(emptyFilters)
  const [applied, setApplied] = useState(emptyFilters)
  const [helpFor, setHelpFor] = useState(null)
  const [runKey, setRunKey] = useState(0)

  const siteName = useMemo(() => Object.fromEntries(sites.map((s) => [s.siteId, s.siteName])), [sites])

  const helpValues = useMemo(() => {
    if (!helpFor) return []
    const f = FILTER_FIELDS.find((x) => x.key === helpFor)
    const raw = [...new Set(areas.map((a) => a[helpFor]).filter(Boolean))]
    raw.sort(f.date ? (a, b) => b.localeCompare(a) : (a, b) => a.localeCompare(b))
    return f.date ? raw.map((v) => formatDate(v)) : raw
  }, [helpFor, areas])

  const rows = useMemo(
    () =>
      areas.filter((a) =>
        FILTER_FIELDS.every((f) => {
          const q = (applied[f.key] || '').trim().toLowerCase()
          return !q || cellValue(a, f).toLowerCase().includes(q)
        }),
      ),
    [areas, applied],
  )

  const activeFilters = FILTER_FIELDS.filter(({ key }) => applied[key].trim()).length
  const dirty = FILTER_FIELDS.some(({ key }) => draft[key] !== applied[key])

  const isMobile = useIsMobile()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const showFilters = !isMobile || filtersOpen

  const go = () => {
    setApplied(draft)
    setRunKey((k) => k + 1)
    if (isMobile) setFiltersOpen(false)
  }

  const clear = () => {
    setDraft(emptyFilters)
    setApplied(emptyFilters)
    setRunKey((k) => k + 1)
  }

  return (
    <main className="page list-page">
      <section className="band">
        <MeshCanvas variant="dark" className="mesh-header" />
        <BrandSlash />
        <div className="band-inner">
          <div className="band-title-row">
            <button
              className="band-back"
              onClick={() => window.history.back()}
              aria-label="Back"
              title="Back"
            >
              <Icon name="back" size={16} stroke={2.2} />
            </button>
            <h1 className="band-title">Developed Area Master</h1>
          </div>
          <button className="btn btn-primary band-create" onClick={onCreate} aria-label="Create developed area">
            <Icon name="plus" size={16} stroke={2.2} />
            <span className="btn-text">Create</span>
          </button>
        </div>
      </section>

      <section className={`filter-card${showFilters ? ' is-open' : ''}`} aria-label="Filters">
        <button
          type="button"
          className="filter-toggle"
          aria-expanded={showFilters}
          aria-controls="filter-body"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <Icon name="valueHelp" size={16} />
          <span className="ft-label">Filters</span>
          {activeFilters > 0 && <span className="ft-count">{activeFilters}</span>}
          <span className="ft-caret">
            <Icon name="chevronDown" size={16} stroke={2.2} />
          </span>
        </button>
        <div className="filter-collapse" id="filter-body">
          <div className="filter-body">
            <div className="filter-grid">
              {FILTER_FIELDS.map(({ key, label, date }) => (
                <div className={`filter-field${applied[key].trim() ? ' is-applied' : ''}`} key={key}>
                  <label htmlFor={`flt-${key}`}>{label}</label>
                  <div className="filter-input">
                    <input
                      id={`flt-${key}`}
                      type={date ? 'date' : 'text'}
                      value={draft[key]}
                      autoComplete="off"
                      onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') go()
                        if (e.key === 'F4') {
                          e.preventDefault()
                          if (date) e.currentTarget.showPicker?.()
                          else setHelpFor(key)
                        }
                      }}
                      placeholder={date ? undefined : 'All'}
                    />
                    {draft[key] && (
                      <button
                        type="button"
                        className="fi-clear"
                        onClick={() => setDraft({ ...draft, [key]: '' })}
                        aria-label={`Clear ${label}`}
                        tabIndex={-1}
                      >
                        <Icon name="x" size={12} stroke={2.4} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="f4-btn"
                      onClick={() => {
                        if (date) {
                          const el = document.getElementById(`flt-${key}`)
                          el?.focus()
                          el?.showPicker?.()
                        } else {
                          setHelpFor(key)
                        }
                      }}
                      aria-label={date ? `Open calendar for ${label}` : `Value help for ${label}`}
                      title={date ? 'Select date' : 'Value help (F4)'}
                    >
                      <Icon name={date ? 'calendar' : 'valueHelp'} size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="filter-actions">
              <button className="btn btn-ghost" onClick={clear} disabled={!activeFilters && !dirty}>
                <Icon name="reset" size={14} />
                Clear
              </button>
              <button className={`btn btn-primary${dirty ? ' is-pending' : ''}`} onClick={go}>
                <Icon name="search" size={15} stroke={2.2} />
                Go
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="table-card" aria-label="Developed areas">
        <div className="table-scroll">
          <table className="site-table area-table">
            <thead>
              <tr>
                <th>Area ID</th>
                <th>Reference Site ID</th>
                <th className="num">Developed Area</th>
                <th>UOM</th>
                <th>RFIB Date</th>
                <th className="col-action">Edit</th>
              </tr>
            </thead>
            <tbody key={runKey}>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="skeleton-row">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j}>
                        <span className="sk" style={{ width: `${50 + ((i * 7 + j * 13) % 40)}%` }} />
                      </td>
                    ))}
                  </tr>
                ))}
              {!loading &&
                rows.map((a, i) => (
                  <tr key={a.areaId} style={{ '--row': Math.min(i, 12) }}>
                    <td className="cell-id">
                      <button className="site-link" onClick={() => onOpen(a.areaId, 'read')}>
                        <span className="site-id">{a.areaId}</span>
                      </button>
                    </td>
                    <td>
                      <span className="ref-site">
                        <span className="ref-id">{a.refSiteId || '-'}</span>
                        {siteName[a.refSiteId] && <span className="site-name">{siteName[a.refSiteId]}</span>}
                      </span>
                    </td>
                    <td className="num">{fmtArea(a.developedArea)}</td>
                    <td>{a.uom || '-'}</td>
                    <td>{formatDate(a.rfibDate) || '-'}</td>
                    <td className="col-action">
                      <button
                        className="icon-btn"
                        onClick={() => onOpen(a.areaId, 'edit')}
                        aria-label={`Edit ${a.areaId}`}
                        title="Edit"
                      >
                        <Icon name="edit" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-row">
                    <div className="empty">
                      <Icon name="search" size={22} />
                      {areas.length === 0 ? (
                        <>
                          <p>No developed areas yet.</p>
                          <button className="btn btn-ghost" onClick={onCreate}>
                            Create developed area
                          </button>
                        </>
                      ) : (
                        <>
                          <p>No developed areas match these filters.</p>
                          <button className="btn btn-ghost" onClick={clear}>
                            Clear filters
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {helpFor && (
        <ValueHelp
          title={FILTER_FIELDS.find((f) => f.key === helpFor).label}
          values={helpValues}
          onSelect={(v) => {
            setDraft({ ...draft, [helpFor]: v })
            setHelpFor(null)
          }}
          onClose={() => setHelpFor(null)}
        />
      )}
    </main>
  )
}
