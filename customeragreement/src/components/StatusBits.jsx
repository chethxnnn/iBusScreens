import Icon from './icons'
import { statusTone } from '../data/agreementFields'

/** The diagonal cut from the iBUS “i” mark, used as the brand device */
export function BrandSlash() {
  return (
    <div className="brand-slash" aria-hidden="true">
      <span className="slash-gap" />
      <span className="slash-red" />
    </div>
  )
}

export function StatusPill({ status, size = 'md' }) {
  return (
    <span className={`pill pill-${size} tone-${statusTone(status)}`}>
      <span className="pill-dot" aria-hidden="true" />
      {status || '-'}
    </span>
  )
}

export function ActiveTag({ active }) {
  return (
    <span className={`active-tag${active ? ' is-active' : ''}`}>
      <span className="active-dot" aria-hidden="true" />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

const FLOW = ['Created', 'Under Approval', 'Approved']

/** Approval flow: Created → Under Approval → Approved (Rejected flagged) */
export function StatusTrack({ status }) {
  const rejected = status === 'Rejected'
  const at = rejected ? 1 : FLOW.indexOf(status)
  return (
    <div className={`lc-wrap${rejected ? ' is-off' : ''}`}>
      <ol className={`lifecycle${rejected ? ' is-off' : ''}`} aria-label={`Status: ${status}`}>
        {FLOW.map((label, i) => {
          let s = 'todo'
          if (!rejected) {
            if (i < at || (i === at && status === 'Approved')) s = 'done'
            else if (i === at) s = 'active'
          } else if (i < at) s = 'done'
          return (
            <li key={label} className={`lc-step lc-${s}`} style={{ '--i': i }}>
              <span className="lc-node">{s === 'done' ? <Icon name="check" size={11} stroke={3} /> : i + 1}</span>
              <span className="lc-label">{label}</span>
            </li>
          )
        })}
      </ol>
      {rejected && (
        <span className="lc-flag tone-rejected">
          <Icon name="x" size={13} stroke={2.4} />
          Rejected
        </span>
      )}
    </div>
  )
}
