import Icon from './icons'
import { STAGES, statusInfo } from '../ui/status'

export function StatusPill({ status, size = 'md' }) {
  const { tone } = statusInfo(status)
  return (
    <span className={`pill pill-${size} tone-${tone}`}>
      <span className="pill-dot" aria-hidden="true" />
      {status || '-'}
    </span>
  )
}

/** Five-step lifecycle: Acquired → Survey → Design → Project → Deployed */
export function Lifecycle({ status }) {
  const { stage, state, tone } = statusInfo(status)
  const off = state === 'off'
  return (
    <div className={`lc-wrap${off ? ' is-off' : ''}`}>
    <ol className={`lifecycle${off ? ' is-off' : ''}`} aria-label={`Lifecycle: ${status}`}>
      {STAGES.map((label, i) => {
        let s = 'todo'
        if (!off) {
          if (i < stage || (i === stage && state === 'done')) s = 'done'
          else if (i === stage) s = 'active'
        }
        return (
          <li key={label} className={`lc-step lc-${s}`} style={{ '--i': i }}>
            <span className="lc-node">
              {s === 'done' ? <Icon name="check" size={11} stroke={3} /> : i + 1}
            </span>
            <span className="lc-label">{label}</span>
          </li>
        )
      })}
    </ol>
      {off && (
        <span className={`lc-flag tone-${tone}`}>
          <Icon name="alert" size={13} />
          {status}
        </span>
      )}
    </div>
  )
}

/** Ring showing completed vs total DAS area, derived from existing fields */
export function CoverageRing({ total, completed, uom }) {
  const t = parseFloat(total)
  const c = parseFloat(completed)
  if (Number.isNaN(t) || t <= 0) return null
  const pct = Math.max(0, Math.min(100, Math.round(((Number.isNaN(c) ? 0 : c) / t) * 100)))
  const r = 30
  const len = 2 * Math.PI * r
  return (
    <div className="coverage" title={`${(c || 0).toLocaleString('en-IN')} of ${t.toLocaleString('en-IN')} ${uom || ''}`}>
      <svg viewBox="0 0 72 72" width="72" height="72" aria-hidden="true">
        <circle cx="36" cy="36" r={r} className="cov-track" />
        <circle
          cx="36"
          cy="36"
          r={r}
          className="cov-bar"
          strokeDasharray={len}
          style={{ '--len': len, '--off': len - (len * pct) / 100 }}
        />
      </svg>
      <div className="cov-text">
        <strong>{pct}%</strong>
        <span>DAS covered</span>
      </div>
    </div>
  )
}

/** The diagonal cut from the iBUS “i” mark, used as the brand device */
export function BrandSlash() {
  return (
    <div className="brand-slash" aria-hidden="true">
      <span className="slash-gap" />
      <span className="slash-red" />
    </div>
  )
}
