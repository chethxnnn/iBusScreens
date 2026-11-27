import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/icons'
import MeshCanvas from '../components/MeshCanvas'
import ValueHelp from '../components/ValueHelp'
import HistoryPopover from '../components/HistoryPopover'
import { ActiveTag, BrandSlash, StatusPill } from '../components/StatusBits'
import { PENDING_STATUSES, formatDate, isActive } from '../data/agreementFields'
import { today } from '../services/agreementService'

// Filters from the Screen Design sheet, all with F4 (Created On lists dates as dd.mm.yyyy)
const FILTER_FIELDS = [
  { key: 'customerId', label: 'Customer ID', kind: 'f4' },
  { key: 'contractId', label: 'Contract ID', kind: 'f4' },
  { key: 'createdBy', label: 'Created By', kind: 'f4' },
  { key: 'createdOn', label: 'Created On', kind: 'f4', date: true },
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

export default function AgreementList({ agreements, customers, loading, onOpen, onCreate }) {
  const [draft, setDraft] = useState(emptyFilters)
  const [applied, setApplied] = useState(emptyFilters)
  const [helpFor, setHelpFor] = useState(null)
  const [runKey, setRunKey] = useState(0)
  const [dialog, setDialog] = useState(null) // { kind: 'history', record }

  const customerName = useMemo(() => Object.fromEntries(customers.map((c) => [c.customerId, c.name])), [customers])
  const todayIso = today()

  const helpValues = useMemo(() => {
    if (!helpFor) return []
    const raw = [...new Set(agreements.map((a) => a[helpFor]).filter(Boolean))].sort()
    if (helpFor === 'customerId') return raw.map((v) => ({ value: v, label: v, sub: customerName[v] }))
    if (helpFor === 'createdOn') return raw.reverse().map((v) => formatDate(v))
    return raw
  }, [helpFor, agreements, customerName])

  const rows = useMemo(
    () =>
      agreements.filter((a) =>
        FILTER_FIELDS.every((f) => {
          const q = (applied[f.key] || '').trim().toLowerCase()
          if (!q) return true
          const v = String(a[f.key] || '')
          return v.toLowerCase().includes(q)
        }),
      ),
    [agreements, applied],
  )

  const activeFilters = FILTER_FIELDS.filter(({ key }) => applied[key].trim()).length
  const dirty = FILTER_FIELDS.some(({ key }) => draft[key] !== applied[key])

  const isMobile = useIsMobile()
  const [filtersOpen, setFiltersOpen] = useState(() => !window.matchMedia(MOBILE_QUERY).matches)
  const showFilters = filtersOpen

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
            <h1 className="band-title">Customer Agreement</h1>
          </div>
          <button className="btn btn-primary band-create" onClick={onCreate} aria-label="Create customer agreement">
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
              {FILTER_FIELDS.map(({ key, label, kind, date }) => (
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
                        if (e.key === 'F4' && (kind === 'f4' || date)) {
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
                    {(kind === 'f4' || date) && (
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
        <button
          type="button"
          className="filter-handle"
          aria-expanded={showFilters}
          aria-controls="filter-body"
          aria-label={showFilters ? 'Collapse filters' : 'Expand filters'}
          title={showFilters ? 'Collapse filters' : 'Expand filters'}
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <Icon name="chevronDown" size={14} stroke={2.4} />
        </button>
      </section>

      <section className="table-card" aria-label="Customer agreements">
        <div className="table-scroll">
          <table className="site-table wide-table pin-first">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Customer Name</th>
                <th>Contract ID</th>
                <th>Contract Type</th>
                <th>Parent Contract</th>
                <th>Rate Card</th>
                <th>Active Indicator</th>
                <th>Approval Status</th>
                <th>Valid From</th>
                <th>Valid To</th>
                <th className="center">History</th>
                <th className="center">Edit</th>
              </tr>
            </thead>
            <tbody key={runKey}>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="skeleton-row">
                    {Array.from({ length: 12 }).map((__, j) => (
                      <td key={j}>
                        <span className="sk" style={{ width: `${50 + ((i * 7 + j * 13) % 40)}%`, minWidth: 40 }} />
                      </td>
                    ))}
                  </tr>
                ))}
              {!loading &&
                rows.map((a, i) => {
                  const pending = PENDING_STATUSES.includes(a.status)
                  return (
                    <tr key={a.contractId} style={{ '--row': Math.min(i, 12) }}>
                      <td className="cell-mono">{a.customerId || '-'}</td>
                      <td>{customerName[a.customerId] || '-'}</td>
                      <td>
                        <button
                          className="site-link"
                          onClick={() => onOpen(a.contractId, pending ? 'approve' : 'read')}
                          title={pending ? 'Open approval' : 'Open agreement'}
                        >
                          <span className="site-id">{a.contractId}</span>
                        </button>
                      </td>
                      <td>{a.contractType || '-'}</td>
                      <td className="cell-mono">{a.parentContract || '-'}</td>
                      <td className="cell-clip" title={a.rateCard}>
                        {a.rateCard || '-'}
                      </td>
                      <td>
                        <ActiveTag active={isActive(a, todayIso)} />
                      </td>
                      <td>
                        <StatusPill status={a.status} size="sm" />
                      </td>
                      <td>{formatDate(a.validFrom) || '-'}</td>
                      <td>{formatDate(a.validTo) || '-'}</td>
                      <td className="center">
                        <button
                          className="icon-btn"
                          onClick={(e) => {
                            const btn = e.currentTarget.getBoundingClientRect()
                            const box = e.currentTarget.closest('.table-scroll').getBoundingClientRect()
                            setDialog({ kind: 'history', record: a, anchor: { btn, box } })
                          }}
                          aria-label={`History of ${a.contractId}`}
                          title="History"
                        >
                          <Icon name="history" size={15} />
                        </button>
                      </td>
                      <td className="center">
                        <button
                          className="icon-btn"
                          onClick={() => onOpen(a.contractId, 'edit')}
                          aria-label={`Edit ${a.contractId}`}
                          title="Edit"
                        >
                          <Icon name="edit" size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan="12" className="empty-row">
                    <div className="empty">
                      <Icon name="search" size={22} />
                      {agreements.length === 0 ? (
                        <>
                          <p>No customer agreements yet.</p>
                          <button className="btn btn-ghost" onClick={onCreate}>
                            Create customer agreement
                          </button>
                        </>
                      ) : (
                        <>
                          <p>No customer agreements match these filters.</p>
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

      {dialog?.kind === 'history' && (
        <HistoryPopover record={dialog.record} anchor={dialog.anchor} onClose={() => setDialog(null)} />
      )}
    </main>
  )
}
