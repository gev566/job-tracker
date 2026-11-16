import type { StatusFilter } from '../filters'
import { STATUSES, STATUS_LABELS } from '../types'

interface FiltersProps {
  status: StatusFilter
  query: string
  onStatusChange: (status: StatusFilter) => void
  onQueryChange: (query: string) => void
}

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  ...STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
]

// Поиск и фильтр по статусу. Компонент ничего не хранит сам:
// значения и обработчики приходят из App через пропсы.
export function Filters({ status, query, onStatusChange, onQueryChange }: FiltersProps) {
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
      </div>
    </div>
  )
}
