import Icon from './icons'
import { formatDate } from '../data/builderFields'

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
