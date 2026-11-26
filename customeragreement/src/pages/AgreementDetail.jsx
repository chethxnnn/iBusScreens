import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/icons'
import MeshCanvas from '../components/MeshCanvas'
import ValueHelp from '../components/ValueHelp'
import Attachments from '../components/Attachments'
import { BrandSlash, StatusPill, StatusTrack } from '../components/StatusBits'
import { FIELDS, MANDATORY_KEYS, MAX_FILE_BYTES, OPTIONS, formatDate, isActive } from '../data/agreementFields'
import { today } from '../services/agreementService'

const ERROR_TEXT = {
  customerId: 'Select a customer',
  contractType: 'Select the contract type',
  validFrom: 'Select the valid from date',
  validTo: 'Select the valid to date',
  rateCard: 'Enter the rate card',
  validToOrder: 'Valid To must be on or after Valid From',
}

const attKey = (list) => (list || []).map((a) => a.id).join('|')

/* ------------------------------------------------------------- field */
function AgreementField({ field, form, mode, error, changed, hint, onChange, onOpenHelp, onClearParent }) {
  const value = form[field.key] ?? ''
  const id = `f-${field.key}`

  if (mode === 'read') {
    const display = field.type === 'date' ? formatDate(value) : value
    return (
      <div className={`field read${display ? '' : ' is-empty'}`} id={`field-${field.key}`}>
        <span className="field-label">{field.label}</span>
        <span className="field-value">{display || '-'}</span>
        {hint && display && <span className="field-hint">{hint}</span>}
      </div>
    )
  }

  let control
  if (field.type === 'customer' || field.type === 'parent') {
    control = (
      <div className="filter-input ref-input">
        <input
          id={id}
          className="input"
          value={value}
          readOnly
          placeholder={field.type === 'parent' ? 'None' : 'Select'}
          onClick={onOpenHelp}
          onKeyDown={(e) => {
            if (e.key === 'F4' || e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onOpenHelp()
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && field.type === 'parent') onClearParent()
          }}
        />
        {field.type === 'parent' && value && (
          <button type="button" className="fi-clear" onClick={onClearParent} aria-label="Clear parent contract">
            <Icon name="x" size={12} stroke={2.4} />
          </button>
        )}
        <button type="button" className="f4-btn" onClick={onOpenHelp} aria-label={`Value help for ${field.label}`} title="Value help (F4)">
          <Icon name="valueHelp" size={16} />
        </button>
      </div>
    )
  } else if (field.type === 'date') {
    control = (
      <input
        id={id}
        className="input"
        type="date"
        value={value}
        min={field.key === 'validTo' && form.validFrom ? form.validFrom : undefined}
        onChange={(e) => onChange(field.key, e.target.value)}
      />
    )
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
  } else {
    control = (
      <input id={id} className="input" value={value} maxLength={field.length} autoComplete="off" onChange={(e) => onChange(field.key, e.target.value)} />
    )
  }

  return (
    <div className={`field edit${error ? ' has-error' : ''}${changed ? ' changed' : ''}`} id={`field-${field.key}`}>
      <label className="field-label" htmlFor={id}>
        {field.label}
        {field.mandatory && <span className="req" aria-label="required">*</span>}
        {changed && <span className="changed-tag">Edited</span>}
      </label>
      {control}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && (
        <span className="field-error">
          <Icon name="alert" size={12} /> {ERROR_TEXT[error === 'order' ? 'validToOrder' : field.key] || `Enter ${field.label}`}
        </span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- page */
export default function AgreementDetail({ record, agreements, customers, initialMode, onBack, onSave, notify }) {
  const [mode] = useState(initialMode)
  const [form, setForm] = useState(() => ({ ...record, attachments: [...(record.attachments || [])] }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [helpFor, setHelpFor] = useState(null)
  const [rejected, setRejected] = useState([])
  const [scrolled, setScrolled] = useState(false)

  const customerById = useMemo(() => Object.fromEntries(customers.map((c) => [c.customerId, c])), [customers])
  const customer = customerById[form.customerId]
  const todayIso = today()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: false, ...(key === 'validFrom' ? { validTo: false } : {}) }))
  }

  const pick = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // Parent contract belongs to one customer: clear it when the customer changes to another
      if (key === 'customerId' && prev.parentContract) {
        const parent = agreements.find((a) => a.contractId === prev.parentContract)
        if (parent && parent.customerId !== value) next.parentContract = ''
      }
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
    FIELDS.forEach((f) => {
      if (String(form[f.key] ?? '') !== String(record[f.key] ?? '')) c.add(f.key)
    })
    if (attKey(form.attachments) !== attKey(record.attachments)) c.add('attachments')
    return c
  }, [form, record, mode])

  const save = async () => {
    const problems = {}
    MANDATORY_KEYS.forEach((k) => {
      if (!String(form[k] ?? '').trim()) problems[k] = true
    })
    if (form.validFrom && form.validTo && form.validTo < form.validFrom) problems.validTo = 'order'
    if (Object.keys(problems).length) {
      setErrors(problems)
      const missing = Object.values(problems).filter((v) => v === true).length
      notify(
        missing
          ? `Fill ${missing} required ${missing === 1 ? 'field' : 'fields'} marked with *`
          : 'Valid To must be on or after Valid From',
        'error',
      )
      setTimeout(() => {
        const first = document.querySelector('.field.has-error')
        if (!first) return
        first.scrollIntoView({ behavior: 'smooth', block: 'center' })
        first.querySelector('input, select')?.focus({ preventScroll: true })
      }, 30)
      return
    }
    setSaving(true)
    await onSave(record.contractId, form, mode === 'create')
    setSaving(false)
  }

  const editing = mode !== 'read'
  const changeCount = changedKeys.size
  const filled = FIELDS.filter((f) => String(form[f.key] ?? '').trim()).length

  // Parent contract value help: contracts of the same customer that are not site agreements themselves and not rejected
  const parentOptions = agreements
    .filter(
      (a) =>
        a.contractId !== record.contractId &&
        !a.parentContract &&
        a.status !== 'Rejected' &&
        (!form.customerId || a.customerId === form.customerId),
    )
    .map((a) => ({
      value: a.contractId,
      label: a.contractId,
      sub: `${customerById[a.customerId]?.name || a.customerId}, ${a.contractType}, ${a.status}`,
    }))

  const helpConfig = {
    customerId: {
      title: 'Customer ID',
      values: customers.map((c) => ({ value: c.customerId, label: c.customerId, sub: c.name })),
    },
    parentContract: {
      title: form.customerId ? `Parent contract for ${form.customerId}` : 'Parent contract',
      values: parentOptions,
    },
  }

  const hints = {
    customerId: customer?.name,
    parentContract: editing ? 'Fill only for a site agreement' : '',
  }

  const active = isActive(form, todayIso)
  const summary = [
    ['Customer ID', form.customerId || '-'],
    ['Contract Type', form.contractType || '-'],
    ['Parent Contract', form.parentContract || '-'],
    ['Active Indicator', active ? 'Active' : 'Inactive'],
    ['Created On', formatDate(form.createdOn) || '-'],
    ['Created By', form.createdBy || '-'],
    ['Changed On', formatDate(form.changedOn) || '-'],
    ['Changed By', form.changedBy || '-'],
  ]

  return (
    <main className={`page detail-page agreement-detail mode-${mode}`}>
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
                <span>Create customer agreement</span>
              </>
            ) : (
              <>
                <span className="mono">{record.contractId}</span>
                <span className="tt-sep" aria-hidden="true" />
                <span className="tt-name">{customer?.name || 'Customer agreement'}</span>
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
                {saving ? <span className="spinner" aria-hidden="true" /> : <Icon name={mode === 'create' ? 'plus' : 'save'} size={15} stroke={2} />}
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
              <span className="mono id-chip">{record.contractId}</span>
              <StatusPill status={form.status} />
            </div>
            <h1 className="hero-title">{customer?.name || 'Customer agreement'}</h1>
            <p className="hero-sub">
              {[form.contractType, form.validFrom && `${formatDate(form.validFrom)} to ${formatDate(form.validTo) || '-'}`]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>
          <div className="hero-body">
            <div className="hero-lifecycle">
              <StatusTrack status={form.status} />
            </div>
          </div>
          <dl className="summary-grid summary-4">
            {summary.map(([label, value]) => (
              <div className="summary-item" key={label}>
                <dt>{label}</dt>
                <dd>
                  {label === 'Active Indicator' ? (
                    <span className={`active-tag${active ? ' is-active' : ''}`}>
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
            <div className="hero-id">
              <span className="mono id-chip">{record.contractId}</span>
            </div>
            <h1 className="hero-title">New customer agreement</h1>
            <p className="hero-sub">Fields marked with * are required. Contract ID is assigned when you save.</p>
          </div>
        </section>
      )}

      <div className="area-layout">
        <section className="section-card" aria-label="Agreement details">
          <header className="section-head">
            <span className="section-icon">
              <Icon name="briefcase" size={18} />
            </span>
            <div className="section-titles">
              <h2>Agreement details</h2>
              <p>Customer, contract type, validity and rate card</p>
            </div>
            <div className="section-meter" title={`${filled} of ${FIELDS.length} fields filled`}>
              <span className="meter-text">
                {filled}/{FIELDS.length}
              </span>
              <span className="meter-track">
                <span className="meter-fill" style={{ width: `${(filled / FIELDS.length) * 100}%` }} />
              </span>
            </div>
          </header>
          <div className="field-grid field-grid-2">
            {FIELDS.map((field) => (
              <AgreementField
                key={field.key}
                field={field}
                form={form}
                mode={mode}
                error={errors[field.key]}
                changed={changedKeys.has(field.key)}
                hint={hints[field.key]}
                onChange={set}
                onOpenHelp={() => setHelpFor(field.key)}
                onClearParent={() => set('parentContract', '')}
              />
            ))}
          </div>
        </section>

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
      </div>

      {helpFor && helpConfig[helpFor] && (
        <ValueHelp
          title={helpConfig[helpFor].title}
          values={helpConfig[helpFor].values}
          onSelect={(v) => pick(helpFor, v)}
          onClose={() => setHelpFor(null)}
        />
      )}
    </main>
  )
}
