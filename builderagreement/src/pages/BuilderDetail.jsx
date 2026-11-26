import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/icons'
import MeshCanvas from '../components/MeshCanvas'
import ValueHelp from '../components/ValueHelp'
import Attachments from '../components/Attachments'
import { BrandSlash, StatusPill, StatusTrack } from '../components/StatusBits'
import { FIELDS, MAX_FILE_BYTES, OPTIONS, formatDate, validate } from '../data/builderFields'
import { today } from '../services/builderService'

const attKey = (list) => (list || []).map((a) => a.id).join('|')

/* ------------------------------------------------------------- field */
function BuilderField({ field, form, mode, error, changed, hint, onChange, onOpenHelp }) {
  const value = form[field.key] ?? ''
  const id = `f-${field.key}`

  if (mode === 'read') {
    let display = field.type === 'date' ? formatDate(value) : value
    if (field.type === 'yn') display = value === 'Y' ? 'Y, active' : value === 'N' ? 'N, inactive' : ''
    return (
      <div className={`field read${display ? '' : ' is-empty'}`} id={`field-${field.key}`}>
        <span className="field-label">{field.label}</span>
        <span className="field-value">{display || '-'}</span>
        {hint && display && <span className="field-hint">{hint}</span>}
      </div>
    )
  }

  let control
  if (field.type === 'builder') {
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
        <button type="button" className="f4-btn" onClick={onOpenHelp} aria-label="Value help for Builder ID" title="Value help (F4)">
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
        min={field.key === 'effectiveTo' && form.effectiveFrom ? form.effectiveFrom : undefined}
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
  } else if (field.type === 'yn') {
    control = (
      <div className="segmented" role="radiogroup" aria-label={field.label}>
        {[
          ['Y', 'Y, active'],
          ['N', 'N, inactive'],
        ].map(([v, label]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            className={`seg-btn${value === v ? ' is-on' : ''}`}
            onClick={() => onChange(field.key, v)}
          >
            {label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={`field edit${error ? ' has-error' : ''}${changed ? ' changed' : ''}`} id={`field-${field.key}`}>
      <label className="field-label" htmlFor={field.type === 'yn' ? undefined : id}>
        {field.label}
        {field.mandatory && <span className="req" aria-label="required">*</span>}
        {changed && <span className="changed-tag">Edited</span>}
      </label>
      {control}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && (
        <span className="field-error">
          <Icon name="alert" size={12} /> {error}
        </span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- page */
export default function BuilderDetail({ record, builders, initialMode, onBack, onSave, notify }) {
  const [mode] = useState(initialMode)
  const [form, setForm] = useState(() => ({ ...record, attachments: [...(record.attachments || [])] }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [rejected, setRejected] = useState([])
  const [scrolled, setScrolled] = useState(false)

  const builderById = useMemo(() => Object.fromEntries(builders.map((b) => [b.builderId, b])), [builders])
  const builder = builderById[form.builderId]
  const todayIso = today()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Once a save has been tried, re-check live so messages clear as the user fixes them
  const [tried, setTried] = useState(false)
  const runValidation = (next) => validate(next, { builderIds: builders.map((b) => b.builderId), todayIso })

  const set = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (tried) setErrors(runValidation(next))
      return next
    })
  }

  const pickBuilder = (id) => {
    set('builderId', id)
    setHelpOpen(false)
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
    setTried(true)
    const problems = runValidation(form)
    if (Object.keys(problems).length) {
      setErrors(problems)
      const n = Object.keys(problems).length
      notify(`Fix ${n} ${n === 1 ? 'field' : 'fields'} before saving`, 'error')
      setTimeout(() => {
        const first = document.querySelector('.field.has-error')
        if (!first) return
        first.scrollIntoView({ behavior: 'smooth', block: 'center' })
        first.querySelector('input, select, button')?.focus({ preventScroll: true })
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

  const hints = {
    builderId: builder ? `${builder.name}, ${builder.stateCode}` : '',
  }

  const summary = [
    ['Builder ID', form.builderId || '-'],
    ['State Code', builder?.stateCode || '-'],
    ['Contract Type', form.contractType || '-'],
    ['Status', form.status === 'Y' ? 'Y' : 'N'],
    ['Created On', formatDate(form.createdOn) || '-'],
    ['Created By', form.createdBy || '-'],
    ['Changed On', formatDate(form.changedOn) || '-'],
    ['Changed By', form.changedBy || '-'],
  ]

  return (
    <main className={`page detail-page builder-detail mode-${mode}`}>
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
                <span>Create builder agreement</span>
              </>
            ) : (
              <>
                <span className="mono">{record.contractId}</span>
                <span className="tt-sep" aria-hidden="true" />
                <span className="tt-name">{builder?.name || 'Builder agreement'}</span>
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
              <StatusPill status={form.approvalStatus} />
            </div>
            <h1 className="hero-title">{builder?.name || 'Builder agreement'}</h1>
            <p className="hero-sub">
              {[form.contractType, form.effectiveFrom && `${formatDate(form.effectiveFrom)} to ${formatDate(form.effectiveTo) || '-'}`]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>
          <div className="hero-body">
            <div className="hero-lifecycle">
              <StatusTrack status={form.approvalStatus} />
            </div>
          </div>
          <dl className="summary-grid summary-4">
            {summary.map(([label, value]) => (
              <div className="summary-item" key={label}>
                <dt>{label}</dt>
                <dd>
                  {label === 'Status' ? (
                    <span className={`active-tag${value === 'Y' ? ' is-active' : ''}`}>
                      <span className="active-dot" aria-hidden="true" />
                      {value === 'Y' ? 'Y, active' : 'N, inactive'}
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
            <h1 className="hero-title">New builder agreement</h1>
            <p className="hero-sub">Fields marked with * are required. Contract ID is assigned when you save.</p>
          </div>
        </section>
      )}

      <div className="area-layout">
        <section className="section-card" aria-label="Agreement details">
          <header className="section-head">
            <span className="section-icon">
              <Icon name="building" size={18} />
            </span>
            <div className="section-titles">
              <h2>Agreement details</h2>
              <p>Builder, contract type, effective period and status</p>
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
              <BuilderField
                key={field.key}
                field={field}
                form={form}
                mode={mode}
                error={errors[field.key]}
                changed={changedKeys.has(field.key)}
                hint={hints[field.key]}
                onChange={set}
                onOpenHelp={() => setHelpOpen(true)}
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

      {helpOpen && (
        <ValueHelp
          title="Builder ID"
          values={builders.map((b) => ({ value: b.builderId, label: b.builderId, sub: `${b.name}, ${b.stateCode}` }))}
          onSelect={pickBuilder}
          onClose={() => setHelpOpen(false)}
        />
      )}
    </main>
  )
}
