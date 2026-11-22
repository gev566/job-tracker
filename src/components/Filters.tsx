import type { StatusFilter } from '../filters'
import { FOLLOW_UP_DAYS } from '../analytics'
import { STATUSES, STATUS_LABELS } from '../types'

interface FiltersProps {
  status: StatusFilter
  query: string
  followUpOnly: boolean
  followUpCount: number
  onStatusChange: (status: StatusFilter) => void
  onQueryChange: (query: string) => void
  onFollowUpChange: (value: boolean) => void
}

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  ...STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
]

// Поиск и фильтры. Компонент ничего не хранит сам:
// значения и обработчики приходят из App через пропсы.
export function Filters({
  status,
  query,
  followUpOnly,
  followUpCount,
  onStatusChange,
  onQueryChange,
  onFollowUpChange,
}: FiltersProps) {
  return (
    <div className="filters">
      <label className="search">
        <span className="visually-hidden">Поиск</span>
        <input
          type="search"
          value={query}
          placeholder="Поиск по компании, должности, заметке"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <div className="chips" role="group" aria-label="Фильтр по статусу">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className="chip"
            aria-pressed={status === option.value}
            onClick={() => onStatusChange(option.value)}
          >
            {option.label}
          </button>
        ))}
        <button
          type="button"
          className="chip chip--remind"
          aria-pressed={followUpOnly}
          title={`Отклики без ответа дольше ${FOLLOW_UP_DAYS} дней`}
          onClick={() => onFollowUpChange(!followUpOnly)}
        >
          Пора напомнить · {followUpCount}
        </button>
      </div>
    </div>
  )
}
