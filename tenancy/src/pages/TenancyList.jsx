import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../components/icons'
import MeshCanvas from '../components/MeshCanvas'
import ValueHelp from '../components/ValueHelp'
import HistoryPopover from '../components/HistoryPopover'
import { ActiveTag, BrandSlash, StatusPill } from '../components/StatusBits'
import { formatDate, isActive } from '../data/tenancyFields'

// Filters from the Screen Design sheet. F4 = value help, date = DATS picker.
const FILTER_FIELDS = [
  { key: 'customerId', label: 'Customer ID', kind: 'f4' },
  { key: 'tenancyId', label: 'Tenancy ID', kind: 'f4' },
  { key: 'seqEffectiveDate', label: 'Sequence Effective Date', kind: 'date' },
  { key: 'createdBy', label: 'Created By', kind: 'f4' },
  { key: 'createdOn', label: 'Created On', kind: 'date' },
  { key: 'contractId', label: 'Reference Contract ID', kind: 'f4' },
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

export default function TenancyList({ tenancies, masters, loading, onOpen, onCreate }) {
  const [draft, setDraft] = useState(emptyFilters)
  const [applied, setApplied] = useState(emptyFilters)
  const [helpFor, setHelpFor] = useState(null)
  const [runKey, setRunKey] = useState(0)
  const [dialog, setDialog] = useState(null) // { kind: 'change' | 'history', record }

  const customerName = useMemo(
    () => Object.fromEntries(masters.customers.map((c) => [c.customerId, c.name])),
    [masters.customers],
  )
  const siteName = useMemo(() => Object.fromEntries(masters.sites.map((s) => [s.siteId, s.siteName])), [masters.sites])

  const helpValues = useMemo(() => {
    if (!helpFor) return []
    const raw = [...new Set(tenancies.map((t) => t[helpFor]).filter(Boolean))].sort()
    if (helpFor === 'customerId') return raw.map((v) => ({ value: v, label: v, sub: customerName[v] }))
    return raw
  }, [helpFor, tenancies, customerName])

  const rows = useMemo(
    () =>
      tenancies.filter((t) =>
        FILTER_FIELDS.every((f) => {
          const q = (applied[f.key] || '').trim().toLowerCase()
          if (!q) return true
          if (f.kind === 'date') return t[f.key] === applied[f.key]
          return String(t[f.key] || '').toLowerCase().includes(q)
        }),
      ),
    [tenancies, applied],
  )

  const activeFilters = FILTER_FIELDS.filter(({ key }) => applied[key].trim()).length
  const dirty = FILTER_FIELDS.some(({ key }) => draft[key] !== applied[key])

  const isMobile = useIsMobile()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const showFilters = !isMobile || filtersOpen

  const scrollRef = useRef(null)
  const [hScroll, setHScroll] = useState({ prev: false, next: false })

  const syncScrollButtons = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const prev = el.scrollLeft > 2
    const next = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
    setHScroll((s) => (s.prev === prev && s.next === next ? s : { prev, next }))
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let raf = 0
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0
          syncScrollButtons()
        })
      }
    }
    syncScrollButtons()
    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(syncScrollButtons)
    ro.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [syncScrollButtons, rows.length, loading])

  const scrollCols = (dir) => {
    const el = scrollRef.current
    if (!el) return
    const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth)
    const step = Math.max(220, el.clientWidth * 0.5)
    const rawTarget = Math.max(0, Math.min(maxLeft, el.scrollLeft + dir * step))
    const ths = [...el.querySelectorAll('thead th')]
    let target = rawTarget
    if (ths.length && rawTarget > 0 && rawTarget < maxLeft) {
      let best = rawTarget
      let bestDiff = Infinity
      for (const th of ths) {
        const left = th.offsetLeft
        if (left <= maxLeft) {
          const diff = Math.abs(left - rawTarget)
          if (diff < bestDiff) {
            bestDiff = diff
            best = left
          }
        }
      }
      if ((dir > 0 && best > el.scrollLeft + 24) || (dir < 0 && best < el.scrollLeft - 24)) {
        target = best
      }
    }
    el.scrollTo({ left: target, behavior: 'smooth' })
  }

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
            <h1 className="band-title">Tenancy Master</h1>
          </div>
          <button className="btn btn-primary band-create" onClick={onCreate} aria-label="Create tenancy">
            <Icon name="plus" size={16} stroke={2.2} />
            <span className="btn-text">Create</span>
          </button>
        </div>
      </section>

      <section className={`filter-card filter-card-6${showFilters ? ' is-open' : ''}`} aria-label="Filters">
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
                      <button
                        className="f4-btn"
                        onClick={() => setHelpFor(key)}
                        aria-label={`Value help for ${label}`}
                        title="Value help (F4)"
                      >
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

      <section className="table-card" aria-label="Tenancies">
        <button
          type="button"
          className={`tbl-nav tbl-nav-prev${hScroll.prev ? ' is-visible' : ''}`}
          onClick={() => scrollCols(-1)}
          aria-label="Scroll columns left"
          title="Previous columns"
          tabIndex={hScroll.prev ? 0 : -1}
        >
          <Icon name="chevronLeft" size={16} stroke={2.4} />
        </button>
        <button
          type="button"
          className={`tbl-nav tbl-nav-next${hScroll.next ? ' is-visible' : ''}`}
          onClick={() => scrollCols(1)}
          aria-label="Scroll columns right"
          title="Next columns"
          tabIndex={hScroll.next ? 0 : -1}
        >
          <Icon name="chevronRight" size={16} stroke={2.4} />
        </button>
        <div className="table-scroll" ref={scrollRef}>
          <table className="site-table wide-table">
            <thead>
              <tr>
                <th>Tenancy ID</th>
                <th>Reference Site ID</th>
                <th>Customer ID</th>
                <th>On-Air Date</th>
                <th>Current Tenancy Sequence</th>
                <th>Sequence Effective Date</th>
                <th>Reference Contract ID</th>
                <th>Tenancy Status</th>
                <th>Billable Area</th>
                <th>Billing Frequency</th>
                <th>Rent Applicable</th>
                <th>Rental Basis ID</th>
                <th>P &amp; F Applicable</th>
                <th>P &amp; F Derivation</th>
                <th>Active Indicator</th>
                <th className="center">Change History</th>
                <th className="center">History</th>
                <th className="col-action">Edit</th>
              </tr>
            </thead>
            <tbody key={runKey}>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="skeleton-row">
                    {Array.from({ length: 18 }).map((__, j) => (
                      <td key={j}>
                        <span className="sk" style={{ width: `${50 + ((i * 7 + j * 13) % 40)}%`, minWidth: 40 }} />
                      </td>
                    ))}
                  </tr>
                ))}
              {!loading &&
                rows.map((t, i) => (
                  <tr key={t.tenancyId} style={{ '--row': Math.min(i, 12) }}>
                    <td className="cell-id">
                      <button className="site-link" onClick={() => onOpen(t.tenancyId, 'read')}>
                        <span className="site-id">{t.tenancyId}</span>
                      </button>
                    </td>
                    <td>
                      <span className="ref-site">
                        <span className="ref-id">{t.refSiteId}</span>
                        {siteName[t.refSiteId] && <span className="site-name">{siteName[t.refSiteId]}</span>}
                      </span>
                    </td>
                    <td>
                      <span className="ref-site">
                        <span className="ref-id">{t.customerId}</span>
                        {customerName[t.customerId] && <span className="site-name">{customerName[t.customerId]}</span>}
                      </span>
                    </td>
                    <td>{formatDate(t.onAirDate) || '-'}</td>
                    <td>
                      <span className="seq-tag">{t.sequence || '-'}</span>
                    </td>
                    <td>{formatDate(t.seqEffectiveDate) || '-'}</td>
                    <td className="cell-mono">{t.contractId || '-'}</td>
                    <td>
                      <StatusPill status={t.status} size="sm" />
                    </td>
                    <td className="cell-clip" title={t.billableArea}>
                      {t.billableArea || '-'}
                    </td>
                    <td>{t.billingFrequency || '-'}</td>
                    <td>{t.rentApplicable || '-'}</td>
                    <td>
                      <span className={`yn${t.rentalBasis ? ' is-yes' : ''}`}>{t.rentalBasis ? 'Yes' : 'No'}</span>
                    </td>
                    <td>{t.pfApplicable || '-'}</td>
                    <td className="cell-clip" title={t.pfDerivation}>
                      {t.pfDerivation || '-'}
                    </td>
                    <td>
                      <ActiveTag active={isActive(t)} />
                    </td>
                    <td className="center">
                      <button
                        className="link-btn"
                        onClick={(e) => {
                          const btn = e.currentTarget.getBoundingClientRect()
                          const box = e.currentTarget.closest('.table-scroll').getBoundingClientRect()
                          setDialog({ kind: 'change', record: t, anchor: { btn, box } })
                        }}
                      >
                        <Icon name="history" size={14} />
                        View ({(t.changeHistory || []).length})
                      </button>
                    </td>
                    <td className="center">
                      <button
                        className="icon-btn"
                        onClick={(e) => {
                          const btn = e.currentTarget.getBoundingClientRect()
                          const box = e.currentTarget.closest('.table-scroll').getBoundingClientRect()
                          setDialog({ kind: 'history', record: t, anchor: { btn, box } })
                        }}
                        aria-label={`History of ${t.tenancyId}`}
                        title="History"
                      >
                        <Icon name="history" size={15} />
                      </button>
                    </td>
                    <td className="col-action">
                      <button
                        className="icon-btn"
                        onClick={() => onOpen(t.tenancyId, 'edit')}
                        aria-label={`Edit ${t.tenancyId}`}
                        title="Edit"
                      >
                        <Icon name="edit" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan="18" className="empty-row">
                    <div className="empty">
                      <Icon name="search" size={22} />
                      {tenancies.length === 0 ? (
                        <>
                          <p>No tenancies yet.</p>
                          <button className="btn btn-ghost" onClick={onCreate}>
                            Create tenancy
                          </button>
                        </>
                      ) : (
                        <>
                          <p>No tenancies match these filters.</p>
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
        <HistoryPopover
          kind={dialog.kind}
          record={dialog.record}
          anchor={dialog.anchor}
          onClose={() => setDialog(null)}
        />
      )}
    </main>
  )
}
