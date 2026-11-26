import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/icons'
import MeshCanvas from '../components/MeshCanvas'
import ValueHelp from '../components/ValueHelp'
import Dialog from '../components/Dialog'
import { ActiveTag, BrandSlash, StatusPill } from '../components/StatusBits'
import { HistoryList } from '../components/HistoryBits'
import { PENDING_STATUSES, formatDate } from '../data/builderFields'

// Filters from the sheet: Builder ID (F4), State Code (F4), Created By (F4), Created On (date, no F4)
const FILTER_FIELDS = [
  { key: 'builderId', label: 'Builder ID', kind: 'f4' },
  { key: 'stateCode', label: 'State Code', kind: 'f4' },
  { key: 'createdBy', label: 'Created By', kind: 'f4' },
  { key: 'createdOn', label: 'Created On', kind: 'date' },
]

const emptyFilters = Object.fromEntries(FILTER_FIELDS.map((f) => [f.key, '']))

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

export default function BuilderList({ agreements, builders, loading, onOpen, onCreate }) {
  const [draft, setDraft] = useState(emptyFilters)
  const [applied, setApplied] = useState(emptyFilters)
  const [helpFor, setHelpFor] = useState(null)
  const [runKey, setRunKey] = useState(0)
  const [dialog, setDialog] = useState(null)

  const builderById = useMemo(() => Object.fromEntries(builders.map((b) => [b.builderId, b])), [builders])

  // State code is not stored on the agreement: it comes from the builder master
  const rowsAll = useMemo(
    () => agreements.map((a) => ({ ...a, stateCode: builderById[a.builderId]?.stateCode || '' })),
    [agreements, builderById],
  )

  const helpValues = useMemo(() => {
    if (!helpFor) return []
    if (helpFor === 'builderId') {
      return [...new Set(rowsAll.map((a) => a.builderId).filter(Boolean))]
        .sort()
        .map((v) => ({ value: v, label: v, sub: builderById[v]?.name }))
    }
    return [...new Set(rowsAll.map((a) => a[helpFor]).filter(Boolean))].sort()
  }, [helpFor, rowsAll, builderById])

  const rows = useMemo(
    () =>
      rowsAll.filter((a) =>
        FILTER_FIELDS.every((f) => {
          const q = (applied[f.key] || '').trim().toLowerCase()
          if (!q) return true
          if (f.kind === 'date') return a[f.key] === applied[f.key]
          return String(a[f.key] || '').toLowerCase().includes(q)
        }),
      ),
    [rowsAll, applied],
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
            <button className="band-back" onClick={() => window.history.back()} aria-label="Back" title="Back">
              <Icon name="back" size={16} stroke={2.2} />
            </button>
            <h1 className="band-title">Builder Agreement</h1>
          </div>
          <button className="btn btn-primary band-create" onClick={onCreate} aria-label="Create builder agreement">
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
              {FILTER_FIELDS.map(({ key, label, kind }) => (
                <div className={`filter-field${applied[key].trim() ? ' is-applied' : ''}`} key={key}>
                  <label htmlFor={`flt-${key}`}>{label}</label>
                  <div className={`filter-input${kind === 'date' ? ' is-date' : ''}${kind === 'date' && !draft[key] ? ' is-empty' : ''}`}>
                    <input
                      id={`flt-${key}`}
                      type={kind === 'date' ? 'date' : 'text'}
                      value={draft[key]}
                      autoComplete="off"
                      onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') go()
                        if (e.key === 'F4' && kind === 'f4') {
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
                    {kind === 'f4' && (
                      <button className="f4-btn" onClick={() => setHelpFor(key)} aria-label={`Value help for ${label}`} title="Value help (F4)">
                        <Icon name="valueHelp" size={16} />
                      </button>
                    )}
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

      <section className="table-card" aria-label="Builder agreements">
        <div className="table-scroll">
          <table className="site-table wide-table pin-first">
            <thead>
              <tr>
                <th>Contract ID</th>
                <th>Builder ID</th>
                <th>State Code</th>
                <th>Contract Type</th>
                <th>Effective From</th>
                <th>Effective To</th>
                <th>Status</th>
                <th>Approval Status</th>
                <th className="center">Edit</th>
                <th className="center">History</th>
              </tr>
            </thead>
            <tbody key={runKey}>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="skeleton-row">
                    {Array.from({ length: 10 }).map((__, j) => (
                      <td key={j}>
                        <span className="sk" style={{ width: `${50 + ((i * 7 + j * 13) % 40)}%`, minWidth: 40 }} />
                      </td>
                    ))}
                  </tr>
                ))}
              {!loading &&
                rows.map((a, i) => {
                  const pending = PENDING_STATUSES.includes(a.approvalStatus)
                  return (
                    <tr key={a.contractId} style={{ '--row': Math.min(i, 12) }}>
                      <td className="cell-id">
                        <button
                          className="site-link"
                          onClick={() => onOpen(a.contractId, pending ? 'approve' : 'read')}
                          title={pending ? 'Open approval' : 'Open agreement'}
                        >
                          <span className="site-id">{a.contractId}</span>
                        </button>
                      </td>
                      <td>
                        <span className="ref-site">
                          <span className="ref-id">{a.builderId}</span>
                          {builderById[a.builderId] && <span className="site-name">{builderById[a.builderId].name}</span>}
                        </span>
                      </td>
                      <td>
                        <span className="region-tag">{a.stateCode || '-'}</span>
                      </td>
                      <td>{a.contractType || '-'}</td>
                      <td>{formatDate(a.effectiveFrom) || '-'}</td>
                      <td>{formatDate(a.effectiveTo) || '-'}</td>
                      <td>
                        <ActiveTag active={a.status === 'Y'} label={a.status === 'Y' ? 'Y' : 'N'} />
                      </td>
                      <td>
                        <StatusPill status={a.approvalStatus} size="sm" />
                      </td>
                      <td className="center">
                        <button className="icon-btn" onClick={() => onOpen(a.contractId, 'edit')} aria-label={`Edit ${a.contractId}`} title="Edit">
                          <Icon name="edit" size={15} />
                        </button>
                      </td>
                      <td className="center">
                        <button
                          className="icon-btn"
                          onClick={() => setDialog({ record: a })}
                          aria-label={`History of ${a.contractId}`}
                          title="History"
                        >
                          <Icon name="history" size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan="10" className="empty-row">
                    <div className="empty">
                      <Icon name="search" size={22} />
                      {agreements.length === 0 ? (
                        <>
                          <p>No builder agreements yet.</p>
                          <button className="btn btn-ghost" onClick={onCreate}>
                            Create builder agreement
                          </button>
                        </>
                      ) : (
                        <>
                          <p>No builder agreements match these filters.</p>
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

      {dialog && (
        <Dialog title="History" sub={dialog.record.contractId} size="sm" onClose={() => setDialog(null)}>
          <HistoryList record={dialog.record} />
        </Dialog>
      )}
    </main>
  )
}
