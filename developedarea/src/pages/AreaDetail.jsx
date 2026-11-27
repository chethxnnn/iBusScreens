import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../components/icons'
import MeshCanvas from '../components/MeshCanvas'
import ValueHelp from '../components/ValueHelp'
import { BrandSlash } from '../components/StatusBits'
import {
  AREA_FIELDS,
  MANDATORY_KEYS,
  MAX_FILE_BYTES,
  formatBytes,
  formatDate,
  uomFromSite,
} from '../data/areaFields'
import { getAttachmentBlob } from '../services/areaService'

const fmtArea = (v) => {
  const n = Number(v)
  return v !== '' && v !== undefined && !Number.isNaN(n) ? n.toLocaleString('en-IN') : v || ''
}

const fileKind = (name = '') => {
  const ext = name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'doc'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic'].includes(ext)) return 'img'
  return 'other'
}

const ERROR_TEXT = {
  refSiteId: 'Select a reference site',
  developedArea: 'Enter the developed area',
  rfibDate: 'Select the RFIB date',
}

const attKey = (list) => (list || []).map((a) => a.id).join('|')

/* ------------------------------------------------------------- field */
function AreaField({ field, form, mode, error, changed, site, onChange, onOpenHelp }) {
  const value = form[field.key] ?? ''
  const id = `f-${field.key}`

  if (mode === 'read') {
    let display = value
    if (field.type === 'date') display = formatDate(value)
    if (field.key === 'developedArea') display = fmtArea(value)
    const empty = !display
    return (
      <div className={`field read${empty ? ' is-empty' : ''}`} id={`field-${field.key}`}>
        <span className="field-label">{field.label}</span>
        <span className="field-value">
          {empty ? '-' : display}
          {field.key === 'developedArea' && !empty && form.uom && <span className="field-unit">{form.uom}</span>}
        </span>
        {field.type === 'refsite' && site && <span className="field-hint">{site.siteName}</span>}
      </div>
    )
  }

  let control
  if (field.type === 'auto') {
    control = (
      <input
        id={id}
        className="input is-locked"
        value={value}
        placeholder={field.key === 'uom' ? 'Filled from reference site' : ''}
        disabled
        readOnly
      />
    )
  } else if (field.type === 'refsite') {
    control = (
      <div className="filter-input ref-input">
        <input
          id={id}
          className="input"
          value={value}
          readOnly
          placeholder="Select site"
          onClick={onOpenHelp}
          onKeyDown={(e) => {
            if (e.key === 'F4' || e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onOpenHelp()
            }
          }}
        />
        <button type="button" className="f4-btn" onClick={onOpenHelp} aria-label="Value help for Reference Site ID" title="Value help (F4)">
          <Icon name="valueHelp" size={16} />
        </button>
      </div>
    )
  } else if (field.type === 'date') {
    control = (
      <input id={id} className="input" type="date" value={value} onChange={(e) => onChange(field.key, e.target.value)} />
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
      <label className="field-label" htmlFor={id}>
        {field.label}
        {field.mandatory && <span className="req" aria-label="required">*</span>}
        {changed && <span className="changed-tag">Edited</span>}
      </label>
      {control}
      {field.type === 'refsite' && site && !error && <span className="field-hint">{site.siteName}</span>}
      {error && (
        <span className="field-error">
          <Icon name="alert" size={12} /> {ERROR_TEXT[field.key] || `Enter ${field.label}`}
        </span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- attachments */
function Attachments({ items, mode, onAdd, onRemove, rejected, onDismiss, changed }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const editing = mode !== 'read'

  const download = (a) => {
    const blob = getAttachmentBlob(a.id) || a.file
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = a.name
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="attachments">
      {editing && (
        <div
          className={`dropzone${drag ? ' is-drag' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            onAdd(e.dataTransfer.files)
          }}
        >
          <span className="dz-icon">
            <Icon name="upload" size={20} />
          </span>
          <p className="dz-title">
            Drop files here or{' '}
            <button type="button" className="dz-browse" onClick={() => inputRef.current?.click()}>
              browse
            </button>
          </p>
          <p className="dz-note">Multiple documents, each under 1 MB</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              onAdd(e.target.files)
              e.target.value = ''
            }}
          />
        </div>
      )}

      {rejected.length > 0 && (
        <div className="att-error" role="alert">
          <Icon name="alert" size={14} />
          <div>
            <p>
              {rejected.length === 1 ? 'This file is' : 'These files are'} 1 MB or larger and {rejected.length === 1 ? 'was' : 'were'} not added:
            </p>
            <ul>
              {rejected.map((f) => (
                <li key={f.name}>
                  {f.name} <span>({formatBytes(f.size)})</span>
                </li>
              ))}
            </ul>
          </div>
          <button type="button" className="icon-btn" onClick={onDismiss} aria-label="Dismiss">
            <Icon name="x" size={14} />
          </button>
        </div>
      )}

      {items.length === 0 && !editing && (
        <div className="att-empty">
          <Icon name="paperclip" size={18} />
          <p>No attachments</p>
        </div>
      )}

      {items.length > 0 && (
        <ul className="att-list">
          {items.map((a) => {
            const canDownload = !!(getAttachmentBlob(a.id) || a.file)
            return (
              <li key={a.id} className={`att-row${a.file && changed ? ' is-new' : ''}`}>
                <span className={`att-icon kind-${fileKind(a.name)}`}>
                  <Icon name="file" size={16} />
                </span>
                <span className="att-meta">
                  <span className="att-name" title={a.name}>
                    {a.name}
                  </span>
                  <span className="att-size">{formatBytes(a.size)}</span>
                </span>
                {canDownload && (
                  <button type="button" className="icon-btn" onClick={() => download(a)} aria-label={`Download ${a.name}`} title="Download">
                    <Icon name="download" size={15} />
                  </button>
                )}
                {editing && (
                  <button type="button" className="icon-btn icon-btn-danger" onClick={() => onRemove(a.id)} aria-label={`Remove ${a.name}`} title="Remove">
                    <Icon name="trash" size={15} />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- page */
export default function AreaDetail({ area, sites, initialMode, onBack, onSave, notify }) {
  const [mode] = useState(initialMode)
  const [form, setForm] = useState(() => ({ ...area, attachments: [...(area.attachments || [])] }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [rejected, setRejected] = useState([])
  const [scrolled, setScrolled] = useState(false)
  const [heroOut, setHeroOut] = useState(false)

  const siteById = useMemo(() => Object.fromEntries(sites.map((s) => [s.siteId, s])), [sites])
  const site = siteById[form.refSiteId]

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

  const pickSite = (siteId) => {
    const s = siteById[siteId]
    setForm((prev) => ({ ...prev, refSiteId: siteId, uom: uomFromSite(s) }))
    setErrors((prev) => ({ ...prev, refSiteId: false }))
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
    AREA_FIELDS.forEach((f) => {
      if (String(form[f.key] ?? '') !== String(area[f.key] ?? '')) c.add(f.key)
    })
    if (attKey(form.attachments) !== attKey(area.attachments)) c.add('attachments')
    return c
  }, [form, area, mode])

  const changeCount = [...changedKeys].filter((k) => k !== 'uom').length

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
        first.querySelector('input')?.focus({ preventScroll: true })
      }, 30)
      return
    }
    setSaving(true)
    await onSave(area.areaId, form, mode === 'create')
    setSaving(false)
  }

  const editing = mode !== 'read'
  const fields = AREA_FIELDS
  const filled = fields.filter((f) => String(form[f.key] ?? '').trim()).length

  const summary = [
    ['Reference Site ID', form.refSiteId || '-'],
    ['Developed Area', form.developedArea ? `${fmtArea(form.developedArea)} ${form.uom || ''}`.trim() : '-'],
    ['RFIB Date', formatDate(form.rfibDate) || '-'],
    ['Attachments', String(form.attachments.length)],
    ['Created On', formatDate(form.createdOn) || '-'],
    ['Created By', form.createdBy || '-'],
    ['Changed On', formatDate(form.changedOn) || '-'],
    ['Changed By', form.changedBy || '-'],
  ]

  return (
    <main className={`page detail-page area-detail mode-${mode}${heroOut ? ' is-hero-out' : ''}`}>
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
                <span>Create Developed Area</span>
              </>
            ) : (
              <>
                <span className="mono">{area.areaId}</span>
                <span className="tt-sep" aria-hidden="true" />
                <span className="tt-name">{site?.siteName || form.refSiteId || 'Developed area'}</span>
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
                  <Icon name={mode === 'create' ? 'check' : 'save'} size={15} stroke={mode === 'create' ? 2.4 : 2} />
                )}
                {saving ? (mode === 'create' ? 'Submitting' : 'Saving') : mode === 'create' ? 'Submit' : 'Save'}
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
            {mode === 'edit' ? (
              <div className="hero-edit-row">
                <div className="hero-edit-left">
                  <div className="hero-id">
                    <button type="button" className="band-back" onClick={onBack} aria-label="Back" title="Back">
                      <Icon name="back" size={16} stroke={2.2} />
                    </button>
                    <span className="mono id-chip">{area.areaId}</span>
                  </div>
                  <h1 className="hero-title">{site?.siteName || 'Developed area'}</h1>
                  <p className="hero-sub">
                    {[form.refSiteId, site?.cityName].filter(Boolean).join(', ') || 'No reference site yet'}
                  </p>
                </div>
                <div className="hero-create-actions">
                  {changeCount > 0 && (
                    <span className="hero-change-count" key={changeCount}>
                      {changeCount} unsaved {changeCount === 1 ? 'change' : 'changes'}
                    </span>
                  )}
                  <button type="button" className="btn hero-cancel" onClick={onBack}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`btn btn-primary hero-submit${saving ? ' is-busy' : ''}`}
                    onClick={save}
                    disabled={saving}
                  >
                    {saving ? <span className="spinner" aria-hidden="true" /> : <Icon name="save" size={15} stroke={2} />}
                    {saving ? 'Saving' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="hero-id">
                  <span className="mono id-chip">{area.areaId}</span>
                </div>
                <h1 className="hero-title">{site?.siteName || 'Developed area'}</h1>
                <p className="hero-sub">
                  {[form.refSiteId, site?.cityName].filter(Boolean).join(', ') || 'No reference site yet'}
                </p>
              </>
            )}
          </div>
          <dl className="summary-grid summary-4">
            {summary.map(([label, value]) => (
              <div className="summary-item" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
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
                  <h1 className="hero-title">Create Developed Area</h1>
                </div>
                <p className="hero-sub">Fields marked with * are required. Area ID is generated by the system.</p>
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
        <section className="section-card" aria-label="Area details">
          <header className="section-head">
            <span className="section-icon">
              <Icon name="layers" size={18} />
            </span>
            <div className="section-titles">
              <h2>Area details</h2>
              <p>Reference site, developed area and RFIB date</p>
            </div>
            <div className="section-meter" title={`${filled} of ${fields.length} fields filled`}>
              <span className="meter-text">
                {filled}/{fields.length}
              </span>
              <span className="meter-track">
                <span className="meter-fill" style={{ width: `${(filled / fields.length) * 100}%` }} />
              </span>
            </div>
          </header>
          <div className="field-grid field-grid-2">
            {fields.map((field) => (
              <AreaField
                key={field.key}
                field={field}
                form={form}
                mode={mode}
                error={errors[field.key]}
                changed={changedKeys.has(field.key)}
                site={site}
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
          title="Reference Site ID"
          values={sites.map((s) => ({ value: s.siteId, label: s.siteId, sub: `${s.siteName}, ${s.cityName}` }))}
          onSelect={pickSite}
          onClose={() => setHelpOpen(false)}
        />
      )}
    </main>
  )
}
