import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/icons'
import MeshCanvas from '../components/MeshCanvas'
import ValueHelp from '../components/ValueHelp'
import Dialog from '../components/Dialog'
import Attachments from '../components/Attachments'
import { BrandSlash, SequenceTrack, StatusPill, StatusTrack } from '../components/StatusBits'
import { ChangeHistoryList } from '../components/HistoryBits'
import {
  ALL_FIELDS,
  MANDATORY_KEYS,
  MAX_FILE_BYTES,
  OPTIONS,
  PENDING_STATUSES,
  SECTIONS,
  formatDate,
  isActive,
} from '../data/tenancyFields'

const ERROR_TEXT = {
  customerId: 'Select a customer',
  refSiteId: 'Select a reference site',
  contractId: 'Select a reference contract',
  onAirDate: 'Select the on-air date',
  sequence: 'Select the tenancy sequence',
  seqEffectiveDate: 'Select the sequence effective date',
  billableArea: 'Enter the billable area',
  billingFrequency: 'Select the billing frequency',
  rentApplicable: 'Select whether rent applies',
  pfApplicable: 'Select whether P & F applies',
}

const F4_TYPES = ['customer', 'site', 'contract']
const attKey = (list) => (list || []).map((a) => a.id).join('|')

/* ------------------------------------------------------------- field */
function TenancyField({ field, form, mode, error, changed, hint, onChange, onOpenHelp }) {
  const value = form[field.key] ?? ''
  const id = `f-${field.key}`

  if (mode === 'read') {
    let display = value
    if (field.type === 'date') display = formatDate(value)
    if (field.type === 'yesno') display = value ? 'Yes' : 'No'
    const empty = display === '' || display === undefined || display === null
    return (
      <div className={`field read${empty ? ' is-empty' : ''}`} id={`field-${field.key}`}>
        <span className="field-label">{field.label}</span>
        <span className="field-value">
          {field.type === 'select' && field.options === 'sequence' && !empty ? <span className="seq-tag">{display}</span> : empty ? '-' : display}
        </span>
        {hint && <span className="field-hint">{hint}</span>}
      </div>
    )
  }

  let control
  if (F4_TYPES.includes(field.type)) {
    control = (
      <div className="filter-input ref-input">
        <input
          id={id}
          className="input"
          value={value}
          readOnly
          placeholder="Select"
          onClick={onOpenHelp}
          onKeyDown={(e) => {
            if (e.key === 'F4' || e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onOpenHelp()
            }
          }}
        />
        <button type="button" className="f4-btn" onClick={onOpenHelp} aria-label={`Value help for ${field.label}`} title="Value help (F4)">
          <Icon name="valueHelp" size={16} />
        </button>
      </div>
    )
  } else if (field.type === 'date') {
    control = <input id={id} className="input" type="date" value={value} onChange={(e) => onChange(field.key, e.target.value)} />
  } else if (field.type === 'select') {
    control = (
      <div className="select-wrap">
        <select id={id} className="input" value={value} onChange={(e) => onChange(field.key, e.target.value)}>
          <option value="">Select</option>
          {OPTIONS[field.options].map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <span className="select-caret" aria-hidden="true">
          <Icon name="chevronDown" size={14} stroke={2.2} />
        </span>
      </div>
    )
  } else if (field.type === 'yesno') {
    control = (
      <div className="segmented" role="radiogroup" aria-label={field.label}>
        {[
          [true, 'Yes'],
          [false, 'No'],
        ].map(([v, label]) => (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={!!value === v}
            className={`seg-btn${!!value === v ? ' is-on' : ''}`}
            onClick={() => onChange(field.key, v)}
          >
            {label}
          </button>
        ))}
      </div>
    )
  } else {
    control = (
      <input
        id={id}
        className="input"
        value={value}
        maxLength={field.length}
        autoComplete="off"
        onChange={(e) => onChange(field.key, e.target.value)}
      />
    )
  }

  return (
    <div className={`field edit${error ? ' has-error' : ''}${changed ? ' changed' : ''}`} id={`field-${field.key}`}>
      <label className="field-label" htmlFor={field.type === 'yesno' ? undefined : id}>
        {field.label}
        {field.mandatory && <span className="req" aria-label="required">*</span>}
        {changed && <span className="changed-tag">Edited</span>}
      </label>
      {control}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && (
        <span className="field-error">
          <Icon name="alert" size={12} /> {ERROR_TEXT[field.key] || `Enter ${field.label}`}
        </span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- page */
export default function TenancyDetail({ record, masters, initialMode, onBack, onSave, onStatus, notify }) {
  const [mode] = useState(initialMode)
  const [form, setForm] = useState(() => ({ ...record, attachments: [...(record.attachments || [])] }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [helpFor, setHelpFor] = useState(null)
  const [rejected, setRejected] = useState([])
  const [confirm, setConfirm] = useState(null) // 'Approved' | 'Rejected'
  const [scrolled, setScrolled] = useState(false)
  const [heroOut, setHeroOut] = useState(false)

  const customers = useMemo(() => Object.fromEntries(masters.customers.map((c) => [c.customerId, c])), [masters.customers])
  const sites = useMemo(() => Object.fromEntries(masters.sites.map((s) => [s.siteId, s])), [masters.sites])
  const contracts = useMemo(() => Object.fromEntries(masters.contracts.map((c) => [c.contractId, c])), [masters.contracts])

  const customer = customers[form.customerId]
  const site = sites[form.refSiteId]
  const contract = contracts[form.contractId]

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
      setHeroOut(window.scrollY > 96)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: false }))
  }

  const pick = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // A contract belongs to one customer: clear it when the customer changes to another
      if (key === 'customerId' && prev.contractId && contracts[prev.contractId]?.customerId !== value) next.contractId = ''
      return next
    })
    setErrors((prev) => ({ ...prev, [key]: false }))
    setHelpFor(null)
  }

  const addFiles = (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    const ok = []
    const bad = []
    files.forEach((f) => (f.size < MAX_FILE_BYTES ? ok.push(f) : bad.push({ name: f.name, size: f.size })))
    setRejected(bad)
    if (ok.length) {
      setForm((prev) => {
        const existing = new Set(prev.attachments.map((a) => a.id))
        const added = ok
          .map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified}`, name: f.name, size: f.size, type: f.type, file: f }))
          .filter((a) => !existing.has(a.id))
        return { ...prev, attachments: [...prev.attachments, ...added] }
      })
    }
  }
  const removeFile = (id) => setForm((prev) => ({ ...prev, attachments: prev.attachments.filter((a) => a.id !== id) }))

  const changedKeys = useMemo(() => {
    if (mode !== 'edit') return new Set()
    const c = new Set()
    ALL_FIELDS.forEach((f) => {
      if (String(form[f.key] ?? '') !== String(record[f.key] ?? '')) c.add(f.key)
    })
    if (attKey(form.attachments) !== attKey(record.attachments)) c.add('attachments')
    return c
  }, [form, record, mode])

  const seqWillLog = mode === 'edit' && (changedKeys.has('sequence') || changedKeys.has('seqEffectiveDate'))

  const save = async () => {
    const missing = {}
    MANDATORY_KEYS.forEach((k) => {
      if (!String(form[k] ?? '').trim()) missing[k] = true
    })
    if (Object.keys(missing).length) {
      setErrors(missing)
      const n = Object.keys(missing).length
      notify(`Fill ${n} required ${n === 1 ? 'field' : 'fields'} marked with *`, 'error')
      setTimeout(() => {
        const first = document.querySelector('.field.has-error')
        if (!first) return
        first.scrollIntoView({ behavior: 'smooth', block: 'center' })
        first.querySelector('input, select, button')?.focus({ preventScroll: true })
      }, 30)
      return
    }
    setSaving(true)
    await onSave(record.tenancyId, form, mode === 'create')
    setSaving(false)
  }

  const decide = async (status, close) => {
    setSaving(true)
    await onStatus(record.tenancyId, status)
    setSaving(false)
    close()
  }

  const editing = mode !== 'read'
  const canDecide = mode === 'read' && PENDING_STATUSES.includes(form.status)
  const changeCount = changedKeys.size

  const helpConfig = {
    customerId: {
      title: 'Customer ID',
      values: masters.customers.map((c) => ({ value: c.customerId, label: c.customerId, sub: c.name })),
    },
    refSiteId: {
      title: 'Reference Site ID',
      values: masters.sites.map((s) => ({ value: s.siteId, label: s.siteId, sub: `${s.siteName}, ${s.cityName}` })),
    },
    contractId: {
      title: form.customerId ? `Reference Contract ID for ${form.customerId}` : 'Reference Contract ID',
      values: masters.contracts
        .filter((c) => !form.customerId || c.customerId === form.customerId)
        .map((c) => ({ value: c.contractId, label: c.contractId, sub: `${c.type}, ${customers[c.customerId]?.name || c.customerId}` })),
    },
  }

  const hints = {
    customerId: customer?.name,
    refSiteId: site?.siteName,
    contractId: contract ? `${contract.type}` : '',
  }

  const summary = [
    ['Customer ID', form.customerId || '-'],
    ['Reference Site ID', form.refSiteId || '-'],
    ['Reference Contract ID', form.contractId || '-'],
    ['Active Indicator', isActive(form) ? 'Active' : 'Inactive'],
    ['Created On', formatDate(form.createdOn) || '-'],
    ['Created By', form.createdBy || '-'],
    ['Changed On', formatDate(form.changedOn) || '-'],
    ['Changed By', form.changedBy || '-'],
  ]

  return (
    <main className={`page detail-page tenancy-detail mode-${mode}${canDecide ? ' has-actions' : ''}${heroOut ? ' is-hero-out' : ''}`}>
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
                <span>Create Tenancy</span>
              </>
            ) : (
              <>
                <span className="mono">{record.tenancyId}</span>
                <span className="tt-sep" aria-hidden="true" />
                <span className="tt-name">{customer?.name || 'Tenancy'}</span>
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
                {saving ? <span className="spinner" aria-hidden="true" /> : <Icon name={mode === 'create' ? 'check' : 'save'} size={15} stroke={mode === 'create' ? 2.4 : 2} />}
                {saving ? (mode === 'create' ? 'Submitting' : 'Saving') : mode === 'create' ? 'Submit' : 'Save'}
              </button>
            </div>
          )}

          {canDecide && (
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

      {mode !== 'create' ? (
        <section className="hero">
          <div className="hero-top">
            <MeshCanvas variant="dark" className="mesh-header" />
            <BrandSlash />
            <div className="hero-id">
              {mode === 'read' && (
                <button type="button" className="band-back" onClick={onBack} aria-label="Back" title="Back">
                  <Icon name="back" size={16} stroke={2.2} />
                </button>
              )}
              <span className="mono id-chip">{record.tenancyId}</span>
              <StatusPill status={form.status} />
            </div>
            <h1 className="hero-title">{customer?.name || 'Tenancy'}</h1>
            <p className="hero-sub">
              {[site ? `${form.refSiteId}, ${site.siteName}` : form.refSiteId, form.contractId].filter(Boolean).join(' / ')}
            </p>
          </div>
          <div className="hero-body">
            <div className="hero-lifecycle">
              <StatusTrack status={form.status} />
            </div>
            <SequenceTrack sequence={form.sequence} effectiveDate={formatDate(form.seqEffectiveDate)} />
          </div>
          <dl className="summary-grid summary-4">
            {summary.map(([label, value]) => (
              <div className="summary-item" key={label}>
                <dt>{label}</dt>
                <dd>
                  {label === 'Active Indicator' ? (
                    <span className={`active-tag${isActive(form) ? ' is-active' : ''}`}>
                      <span className="active-dot" aria-hidden="true" />
                      {value}
                    </span>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : (
        <section className="hero hero-create">
          <div className="hero-top">
            <MeshCanvas variant="dark" className="mesh-header" />
            <BrandSlash />
            <div className="hero-create-row">
              <div className="hero-create-left">
                <div className="hero-create-head">
                  <button type="button" className="band-back" onClick={onBack} aria-label="Back" title="Back">
                    <Icon name="back" size={16} stroke={2.2} />
                  </button>
                  <h1 className="hero-title">Create Tenancy</h1>
                </div>
                <p className="hero-sub">Fields marked with * are required. Tenancy ID is generated by the system.</p>
              </div>
              <div className="hero-create-actions">
                <button type="button" className="btn hero-cancel" onClick={onBack}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn btn-primary hero-submit${saving ? ' is-busy' : ''}`}
                  onClick={save}
                  disabled={saving}
                >
                  {saving ? <span className="spinner" aria-hidden="true" /> : <Icon name="check" size={15} stroke={2.4} />}
                  {saving ? 'Submitting' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="area-layout">
        <div className="col-stack">
          {SECTIONS.map((section) => {
            const filled = section.fields.filter((f) => f.type === 'yesno' || String(form[f.key] ?? '').trim()).length
            return (
              <section className="section-card" key={section.id} aria-label={section.title}>
                <header className="section-head">
                  <span className="section-icon">
                    <Icon name={section.icon} size={18} />
                  </span>
                  <div className="section-titles">
                    <h2>{section.title}</h2>
                    <p>{section.note}</p>
                  </div>
                  <div className="section-meter" title={`${filled} of ${section.fields.length} fields filled`}>
                    <span className="meter-text">
                      {filled}/{section.fields.length}
                    </span>
                    <span className="meter-track">
                      <span className="meter-fill" style={{ width: `${(filled / section.fields.length) * 100}%` }} />
                    </span>
                  </div>
                </header>
                <div className="field-grid field-grid-2">
                  {section.fields.map((field) => (
                    <TenancyField
                      key={field.key}
                      field={field}
                      form={form}
                      mode={mode}
                      error={errors[field.key]}
                      changed={changedKeys.has(field.key)}
                      hint={hints[field.key]}
                      onChange={set}
                      onOpenHelp={() => setHelpFor(field.key)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        <div className="col-stack">
          <section className={`section-card att-card${changedKeys.has('attachments') ? ' is-changed' : ''}`} aria-label="Attachments">
            <header className="section-head">
              <span className="section-icon">
                <Icon name="paperclip" size={18} />
              </span>
              <div className="section-titles">
                <h2>Attachments</h2>
                <p>{form.attachments.length === 1 ? '1 document' : `${form.attachments.length} documents`}</p>
              </div>
              {changedKeys.has('attachments') && <span className="changed-tag">Edited</span>}
            </header>
            <Attachments
              items={form.attachments}
              mode={mode}
              onAdd={addFiles}
              onRemove={removeFile}
              rejected={rejected}
              onDismiss={() => setRejected([])}
              changed={mode === 'edit'}
            />
          </section>

          {mode !== 'create' && (
            <section className="section-card" aria-label="Change history">
              <header className="section-head">
                <span className="section-icon">
                  <Icon name="history" size={18} />
                </span>
                <div className="section-titles">
                  <h2>Change history</h2>
                  <p>Tenancy sequence and effective date</p>
                </div>
              </header>
              {seqWillLog && (
                <div className="log-note">
                  <Icon name="alert" size={14} />
                  <span>
                    Saving adds a new entry: <span className="seq-tag">{form.sequence || '-'}</span> effective{' '}
                    {formatDate(form.seqEffectiveDate) || '-'}
                  </span>
                </div>
              )}
              <ChangeHistoryList entries={record.changeHistory} />
            </section>
          )}
        </div>
      </div>

      {helpFor && helpConfig[helpFor] && (
        <ValueHelp
          title={helpConfig[helpFor].title}
          values={helpConfig[helpFor].values}
          onSelect={(v) => pick(helpFor, v)}
          onClose={() => setHelpFor(null)}
        />
      )}

      {confirm && (
        <Dialog
          title={confirm === 'Approved' ? 'Approve tenancy' : 'Reject tenancy'}
          sub={`${record.tenancyId}, ${customer?.name || form.customerId}`}
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
              ? 'The status changes to Approved and the tenancy becomes active.'
              : 'The status changes to Rejected. The tenancy stays inactive.'}
          </p>
        </Dialog>
      )}
    </main>
  )
}
