import { STATUSES, STATUS_LABELS, type Status } from '../types'

interface StatsProps {
  total: number
  counts: Record<Status, number>
}

// Сводка: сколько всего откликов и сколько в каждом статусе
export function Stats({ total, counts }: StatsProps) {
  return (
    <dl className="stats">
      <div className="stat">
        <dt>Всего</dt>
        <dd>{total}</dd>
      </div>
      {STATUSES.map((status) => (
        <div className={`stat stat--${status}`} key={status}>
          <dt>{STATUS_LABELS[status]}</dt>
          <dd>{counts[status]}</dd>
        </div>
      ))}
    </dl>
  )
}
