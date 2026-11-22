import { useState } from 'react'
import { STATUSES, STATUS_LABELS, type Application, type Status } from '../types'

interface ApplicationListProps {
  applications: Application[]
  followUpIds: Set<string>
  onEdit: (application: Application) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Status) => void
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })

export function ApplicationList({ applications, followUpIds, onEdit, onDelete, onStatusChange }: ApplicationListProps) {
  // id отклика, для которого сейчас показан вопрос «Удалить?»
  const [confirmId, setConfirmId] = useState<string | null>(null)

  if (applications.length === 0) {
    return <p className="empty">Ничего не найдено. Измените фильтр или добавьте отклик.</p>
  }

  return (
    <ul className="list">
      {applications.map((item) => (
        <li className="card" key={item.id}>
          <div className="card-main">
            <h3>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.position}
                </a>
              ) : (
                item.position
              )}
            </h3>
            <p className="company">
              {item.company} · {formatDate(item.date)}
            </p>
            {followUpIds.has(item.id) && <p className="remind">Ответа нет больше недели — можно напомнить о себе</p>}
            {item.note && <p className="note">{item.note}</p>}
          </div>

          <div className="card-side">
            <label className="visually-hidden" htmlFor={`status-${item.id}`}>
              Статус отклика в {item.company}
            </label>
            <select
              id={`status-${item.id}`}
              className={`status status--${item.status}`}
              value={item.status}
              onChange={(event) => onStatusChange(item.id, event.target.value as Status)}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>

            {confirmId === item.id ? (
              <div className="card-actions">
                <button type="button" className="button button--danger" onClick={() => onDelete(item.id)}>
                  Удалить
                </button>
                <button type="button" className="button" onClick={() => setConfirmId(null)}>
                  Нет
                </button>
              </div>
            ) : (
              <div className="card-actions">
                <button type="button" className="button" onClick={() => onEdit(item)}>
                  Изменить
                </button>
                <button type="button" className="button" onClick={() => setConfirmId(item.id)}>
                  Удалить
                </button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
