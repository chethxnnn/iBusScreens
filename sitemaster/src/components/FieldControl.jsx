import { BUILDERS, OPTIONS } from '../data/siteFields'
import Icon from './icons'
import { StatusPill } from './StatusBits'

const fmtNumber = (v) => {
  if (v === '' || v === null || v === undefined) return '-'
  const n = Number(v)
  return Number.isNaN(n) ? v : n.toLocaleString('en-IN')
}

const Select = ({ children, className = '', ...props }) => (
  <div className={`select-wrap ${className}`}>
    <select className="input" {...props}>
      {children}
    </select>
    <span className="select-caret" aria-hidden="true">
      <Icon name="chevronDown" size={14} stroke={2.2} />
    </span>
  </div>
)

export default function FieldControl({ field, form, mode, error, changed, onChange }) {
  const value = form[field.key] ?? ''
  const id = `f-${field.key}`

  if (mode === 'read') {
    let display = value
    if (field.type === 'checkbox') display = value ? 'Yes' : 'No'
    if (field.type === 'number' || field.type === 'computed') display = fmtNumber(value)
    const empty = display === '' || display === null || display === undefined || display === '-'
    if (empty) display = '-'
    return (
      <div className={`field read${empty ? ' is-empty' : ''}`} id={`field-${field.key}`}>
        <span className="field-label">{field.label}</span>
        <span className="field-value">
          {field.key === 'siteStatus' && !empty ? (
            <StatusPill status={value} size="sm" />
          ) : (
            display
          )}
          {field.uom && value !== '' && <span className="field-unit">{form[field.uom]}</span>}
        </span>
      </div>
    )
  }

  const disabled = field.type === 'auto'
  let control = null

  if (field.type === 'select') {
    control = (
      <Select id={id} value={value} onChange={(e) => onChange(field.key, e.target.value)}>
        <option value="">Select</option>
        {OPTIONS[field.options].map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
    )
  } else if (field.type === 'builder') {
    control = (
      <Select
        id={id}
        value={value}
        onChange={(e) => {
          const b = BUILDERS.find((x) => x.id === e.target.value)
          onChange('builderId', e.target.value)
          onChange('builderName', b ? b.name : '')
        }}
      >
        <option value="">Select</option>
        {BUILDERS.map((b) => (
          <option key={b.id} value={b.id}>
            {b.id} - {b.name}
          </option>
        ))}
      </Select>
    )
  } else if (field.type === 'checkbox') {
    control = (
      <div className="switch-row">
        <button
          id={id}
          type="button"
          className={`switch${value ? ' on' : ''}`}
          role="switch"
          aria-checked={!!value}
          aria-label={field.label}
          onClick={() => onChange(field.key, !value)}
        >
          <span className="switch-knob" />
        </button>
        <span className="switch-text">{value ? 'Yes' : 'No'}</span>
      </div>
    )
  } else if (field.type === 'computed' || field.type === 'auto') {
    control = (
      <input
        id={id}
        className="input is-locked"
        value={field.type === 'computed' ? fmtNumber(value).replace(/^-$/, '') : value}
        disabled
        readOnly
      />
    )
  } else {
    control = (
      <input
        id={id}
        className="input"
        type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
        value={value}
        disabled={disabled}
        autoComplete="off"
        onChange={(e) => onChange(field.key, e.target.value)}
      />
    )
  }

  return (
    <div
      className={`field edit${error ? ' has-error' : ''}${changed ? ' changed' : ''}`}
      id={`field-${field.key}`}
    >
      <label className="field-label" htmlFor={id}>
        {field.label}
        {field.mandatory && <span className="req" aria-label="required">*</span>}
        {changed && <span className="changed-tag">Edited</span>}
      </label>
      {field.uom ? (
        <div className="input-with-uom">
          {control}
          <Select
            className="uom-select"
            value={form[field.uom] ?? ''}
            onChange={(e) => onChange(field.uom, e.target.value)}
            aria-label={`${field.label} unit`}
          >
            {OPTIONS[field.uomOptions].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </div>
      ) : (
        control
      )}
      {error && (
        <span className="field-error">
          <Icon name="alert" size={12} /> Enter {field.label.toLowerCase()}
        </span>
      )}
    </div>
  )
}
