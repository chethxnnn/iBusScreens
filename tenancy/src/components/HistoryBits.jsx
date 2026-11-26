import Icon from './icons'
import { formatDate } from '../data/tenancyFields'

/** Change History: every change of Tenancy Sequence / Sequence Effective Date, newest first */
export function ChangeHistoryList({ entries }) {
  const list = [...(entries || [])].reverse()
  if (!list.length) {
    return (
      <div className="att-empty">
        <Icon name="history" size={18} />
        <p>No changes recorded yet</p>
      </div>
    )
  }
  return (
    <ol className="timeline">
      {list.map((e, i) => (
        <li key={`${e.sequence}-${e.effectiveDate}-${e.changedOn}-${i}`} className={`tl-item${i === 0 ? ' is-latest' : ''}`}>
          <span className="tl-dot" aria-hidden="true" />
          <div className="tl-body">
            <div className="tl-main">
              <span className="seq-tag">{e.sequence}</span>
              <span>
                Effective <strong>{formatDate(e.effectiveDate)}</strong>
              </span>
              {i === 0 && <span className="tl-current">Current</span>}
            </div>
            <span className="tl-meta">
              Changed on {formatDate(e.changedOn)} by {e.changedBy}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}

/** History: created / changed on and by */
export function HistoryList({ record }) {
  const rows = [
    ['Created On', formatDate(record.createdOn)],
    ['Created By', record.createdBy],
    ['Changed On', formatDate(record.changedOn)],
    ['Changed By', record.changedBy],
  ]
  return (
    <dl className="history-list">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value || '-'}</dd>
        </div>
      ))}
    </dl>
  )
}
