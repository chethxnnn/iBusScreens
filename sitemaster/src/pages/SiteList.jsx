import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/icons'
import MeshCanvas from '../components/MeshCanvas'
import ValueHelp from '../components/ValueHelp'
import HistoryPopover from '../components/HistoryPopover'
import { BrandSlash, StatusPill } from '../components/StatusBits'

const FILTER_FIELDS = [
  { key: 'siteId', label: 'Site ID' },
  { key: 'ibusProjectId', label: 'iBUS Project ID' },
  { key: 'regionCode', label: 'Region Code' },
  { key: 'companyCode', label: 'Company Code' },
]

const emptyFilters = { siteId: '', ibusProjectId: '', regionCode: '', companyCode: '' }

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

export default function SiteList({ sites, loading, onOpen, onCreate }) {
  const [draft, setDraft] = useState(emptyFilters)
  const [applied, setApplied] = useState(emptyFilters)
  const [helpFor, setHelpFor] = useState(null)
  const [historyFor, setHistoryFor] = useState(null)
  const [historyAnchor] = useState(null)
  const [runKey, setRunKey] = useState(0)

  const helpValues = useMemo(() => {
    if (!helpFor) return []
    return [...new Set(sites.map((s) => s[helpFor]).filter(Boolean))].sort()
  }, [helpFor, sites])

  const rows = useMemo(
    () =>
      sites.filter((s) =>
        FILTER_FIELDS.every(({ key }) => {
          const q = (applied[key] || '').trim().toLowerCase()
          return !q || String(s[key] || '').toLowerCase().includes(q)
        }),
      ),
    [sites, applied],
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
            <h1 className="band-title">Site Master</h1>
          </div>
          <button className="btn btn-primary band-create" onClick={onCreate} aria-label="Create site">
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
          {FILTER_FIELDS.map(({ key, label }) => (
            <div className={`filter-field${applied[key].trim() ? ' is-applied' : ''}`} key={key}>
              <label htmlFor={`flt-${key}`}>{label}</label>
              <div className="filter-input">
                <input
                  id={`flt-${key}`}
                  value={draft[key]}
                  autoComplete="off"
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') go()
                    if (e.key === 'F4') {
                      e.preventDefault()
                      setHelpFor(key)
                    }
                  }}
                  placeholder="All"
                />
                {draft[key] && (
                  <button
                    className="fi-clear"
                    onClick={() => setDraft({ ...draft, [key]: '' })}
                    aria-label={`Clear ${label}`}
                    tabIndex={-1}
                  >
                    <Icon name="x" size={12} stroke={2.4} />
                  </button>
                )}
                <button
                  className="f4-btn"
                  onClick={() => setHelpFor(key)}
                  aria-label={`Value help for ${label}`}
                  title="Value help (F4)"
                >
                  <Icon name="valueHelp" size={16} />
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

      <section className="table-card" aria-label="Sites">
        <div className="table-scroll">
          <table className="site-table">
            <thead>
              <tr>
                <th>Site ID</th>
                <th>Company Code</th>
                <th>iBUS Project ID</th>
                <th>Customer Site ID</th>
                <th>Customer Site Locator ID</th>
                <th>Country</th>
                <th>Region Code</th>
                <th>Site Status</th>
                <th className="col-action">Edit</th>
              </tr>
            </thead>
            <tbody key={runKey}>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="skeleton-row">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j}>
                        <span className="sk" style={{ width: `${50 + ((i * 7 + j * 13) % 40)}%` }} />
                      </td>
                    ))}
                  </tr>
                ))}
              {!loading &&
                rows.map((s, i) => (
                  <tr key={s.siteId} style={{ '--row': Math.min(i, 12) }}>
                    <td className="cell-id">
                      <button className="site-link" onClick={() => onOpen(s.siteId, 'read')}>
                        <span className="site-id">{s.siteId}</span>
                        <span className="site-name">{s.siteName}</span>
                      </button>
                    </td>
                    <td className="cell-company" data-label="Company Code">{s.companyCode}</td>
                    <td className="cell-code" data-label="iBUS Project ID">{s.ibusProjectId || '-'}</td>
                    <td className="cell-code" data-label="Customer Site ID">{s.customerSiteId || '-'}</td>
                    <td className="cell-code" data-label="Customer Site Locator ID">{s.customerSiteLocatorId || '-'}</td>
                    <td data-label="Country">{s.country}</td>
                    <td data-label="Region Code">
                      <span className="region-tag">{s.regionCode}</span>
                    </td>
                    <td className="cell-status" data-label="Site Status">
                      <StatusPill status={s.siteStatus} size="sm" />
                    </td>
                    <td className="col-action">
                      <button
                        className="icon-btn"
                        onClick={() => onOpen(s.siteId, 'edit')}
                        aria-label={`Edit ${s.siteId}`}
                        title="Edit"
                      >
                        <Icon name="edit" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan="9" className="empty-row">
                    <div className="empty">
                      <Icon name="search" size={22} />
                      <p>No sites match these filters.</p>
                      <button className="btn btn-ghost" onClick={clear}>
                        Clear filters
                      </button>
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
      {historyFor && (
        <HistoryPopover
          site={rows.find((r) => r.siteId === historyFor)}
          anchor={historyAnchor}
          onClose={() => setHistoryFor(null)}
        />
      )}
    </main>
  )
}
