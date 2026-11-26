import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/icons'
import MeshCanvas from '../components/MeshCanvas'
import Dialog from '../components/Dialog'
import Attachments from '../components/Attachments'
import { BrandSlash, StatusPill } from '../components/StatusBits'
import { PENDING_STATUSES, formatDate } from '../data/builderFields'

/**
 * Approval screen. The Builder Agreement sheet has Approval Status (Created, Under Approval,
 * Approved, Rejected) but no approval layout, so this mirrors the Customer Agreement approval screen:
 * left  - pending approvals, right - the agreement with Approve / Reject
 */
export default function BuilderApproval({ agreements, builders, selectedId, onSelect, onBack, onStatus }) {
  const [confirm, setConfirm] = useState(null) // 'Approved' | 'Rejected'
  const [saving, setSaving] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const builderName = useMemo(() => Object.fromEntries(builders.map((b) => [b.builderId, b.name])), [builders])
  const pending = useMemo(() => agreements.filter((a) => PENDING_STATUSES.includes(a.approvalStatus)), [agreements])
  const current = pending.find((a) => a.contractId === selectedId) || pending[0] || null

  useEffect(() => {
    if (current && current.contractId !== selectedId) onSelect(current.contractId)
  }, [current, selectedId, onSelect])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.querySelector('.pending-row.is-selected')?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [current?.contractId])

  const decide = async (status, close) => {
    setSaving(true)
    await onStatus(current.contractId, status)
    setSaving(false)
    close()
  }

  const fields = current
    ? [
        ['Contract ID', current.contractId, true],
        ['Effective From', formatDate(current.effectiveFrom)],
        ['Builder ID', current.builderId, true, builderName[current.builderId]],
        ['Effective To', formatDate(current.effectiveTo)],
        ['Contract Type', current.contractType],
        ['Status', current.status === 'Y' ? 'Y, active' : 'N, inactive'],
      ]
    : []

  return (
    <main className={`page detail-page approval-page${current ? ' has-actions' : ''}`}>
      <header className={`topbar${scrolled ? ' is-scrolled' : ''}`}>
        <div className="topbar-inner">
          <button className="back-link" onClick={onBack}>
            <span className="back-icon">
              <Icon name="back" size={15} />
            </span>
            <span className="back-text">Back</span>
          </button>
          <div className="topbar-title is-visible">
            <span>Builder agreement approval</span>
          </div>
          {current && (
            <div className="topbar-actions">
              <button className="btn btn-ghost btn-reject" onClick={() => setConfirm('Rejected')}>
                <Icon name="x" size={15} stroke={2.2} />
                Reject
              </button>
              <button className="btn btn-cta" onClick={() => setConfirm('Approved')}>
                <Icon name="check" size={15} stroke={2.4} />
                Approve
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="approval-layout">
        <aside className="section-card pending-card" aria-label="List of pending approval">
          <header className="section-head">
            <span className="section-icon">
              <Icon name="history" size={18} />
            </span>
            <div className="section-titles">
              <h2>Pending approval</h2>
              <p>{pending.length === 1 ? '1 agreement' : `${pending.length} agreements`}</p>
            </div>
          </header>
          {pending.length === 0 ? (
            <div className="att-empty">
              <Icon name="check" size={18} />
              <p>Nothing waiting for approval</p>
            </div>
          ) : (
            <ul className="pending-list" role="listbox" aria-label="Pending agreements">
              {pending.map((a) => (
                <li key={a.contractId}>
                  <button
                    role="option"
                    aria-selected={current?.contractId === a.contractId}
                    className={`pending-row${current?.contractId === a.contractId ? ' is-selected' : ''}`}
                    onClick={() => onSelect(a.contractId)}
                  >
                    <span className="pr-id">{a.contractId}</span>
                    <span className="pr-name">{builderName[a.builderId] || a.builderId}</span>
                    <span className="pr-meta">
                      <StatusPill status={a.approvalStatus} size="sm" />
                      <span className="pr-date">{formatDate(a.effectiveFrom)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {current ? (
          <div className="col-stack" key={current.contractId}>
            <section className="hero approval-hero">
              <div className="hero-top">
                <MeshCanvas variant="dark" className="mesh-header" />
                <BrandSlash />
                <div className="hero-id">
                  <span className="mono id-chip">{current.contractId}</span>
                  <StatusPill status={current.approvalStatus} />
                </div>
                <h1 className="hero-title">{builderName[current.builderId] || 'Builder agreement'}</h1>
                <p className="hero-sub">Review the agreement, then approve or reject it.</p>
              </div>
              <div className="field-grid field-grid-2 approval-fields">
                {fields.map(([label, value, mono, hint]) => (
                  <div className={`field read${value ? '' : ' is-empty'}`} key={label}>
                    <span className="field-label">{label}</span>
                    <span className={`field-value${mono ? ' mono-value' : ''}`}>{value || '-'}</span>
                    {hint && <span className="field-hint">{hint}</span>}
                  </div>
                ))}
              </div>
            </section>

            <section className="section-card att-card" aria-label="Attachments">
              <header className="section-head">
                <span className="section-icon">
                  <Icon name="paperclip" size={18} />
                </span>
                <div className="section-titles">
                  <h2>Attachments</h2>
                  <p>{current.attachments.length === 1 ? '1 document' : `${current.attachments.length} documents`}</p>
                </div>
              </header>
              <Attachments items={current.attachments} mode="read" onAdd={() => {}} onRemove={() => {}} rejected={[]} onDismiss={() => {}} />
            </section>
          </div>
        ) : (
          <section className="section-card approval-empty">
            <span className="dz-icon">
              <Icon name="check" size={20} />
            </span>
            <h2>All caught up</h2>
            <p>There are no builder agreements waiting for approval.</p>
            <button className="btn btn-primary" onClick={onBack}>
              Back to list
            </button>
          </section>
        )}
      </div>

      {confirm && current && (
        <Dialog
          title={confirm === 'Approved' ? 'Approve agreement' : 'Reject agreement'}
          sub={`${current.contractId}, ${builderName[current.builderId] || current.builderId}`}
          size="sm"
          onClose={() => !saving && setConfirm(null)}
          footer={(close) => (
            <>
              <button className="btn btn-ghost" onClick={close} disabled={saving}>
                Cancel
              </button>
              <button
                className={`btn ${confirm === 'Approved' ? 'btn-cta' : 'btn-danger'}${saving ? ' is-busy' : ''}`}
                onClick={() => decide(confirm, close)}
                disabled={saving}
              >
                {saving ? <span className="spinner" aria-hidden="true" /> : <Icon name={confirm === 'Approved' ? 'check' : 'x'} size={15} stroke={2.4} />}
                {confirm === 'Approved' ? 'Approve' : 'Reject'}
              </button>
            </>
          )}
        >
          <p className="confirm-text">
            {confirm === 'Approved'
              ? 'The approval status changes to Approved.'
              : 'The approval status changes to Rejected. The agreement stays inactive.'}
          </p>
        </Dialog>
      )}
    </main>
  )
}
