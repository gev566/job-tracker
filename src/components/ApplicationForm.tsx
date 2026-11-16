import { useState, type FormEvent } from 'react'
import { STATUSES, STATUS_LABELS, type Application, type ApplicationDraft, type Status } from '../types'

interface ApplicationFormProps {
  initial: Application | null // null — добавляем новый отклик, иначе редактируем этот
  onSubmit: (draft: ApplicationDraft) => void
  onCancel: () => void
}

type Errors = Partial<Record<'company' | 'position' | 'url' | 'date', string>>

const today = () => new Date().toISOString().slice(0, 10)

const emptyDraft = (): ApplicationDraft => ({
  company: '',
  position: '',
  url: '',
  date: today(),
  status: 'sent',
  note: '',
})

// Проверка формы. Возвращает объект с ошибками; пустой объект — ошибок нет.
function validate(draft: ApplicationDraft): Errors {
  const errors: Errors = {}
  if (!draft.company.trim()) errors.company = 'Укажите компанию'
  if (!draft.position.trim()) errors.position = 'Укажите должность'
  if (!draft.date) errors.date = 'Укажите дату'
  if (draft.url.trim() && !/^https?:\/\/\S+$/i.test(draft.url.trim())) {
    errors.url = 'Ссылка должна начинаться с http:// или https://'
  }
  return errors
}

export function ApplicationForm({ initial, onSubmit, onCancel }: ApplicationFormProps) {
  const [draft, setDraft] = useState<ApplicationDraft>(initial ?? emptyDraft())
  const [errors, setErrors] = useState<Errors>({})

  // Обновляет одно поле формы, остальные оставляет как были
  const update = <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault() // не даём браузеру перезагрузить страницу
    const found = validate(draft)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSubmit({
      ...draft,
      company: draft.company.trim(),
      position: draft.position.trim(),
      url: draft.url.trim(),
      note: draft.note.trim(),
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h2>{initial ? 'Изменить отклик' : 'Новый отклик'}</h2>

      <div className="field">
        <label htmlFor="company">Компания</label>
        <input
          id="company"
          value={draft.company}
          onChange={(event) => update('company', event.target.value)}
          aria-invalid={Boolean(errors.company)}
          autoFocus
        />
        {errors.company && <p className="error">{errors.company}</p>}
      </div>

      <div className="field">
        <label htmlFor="position">Должность</label>
        <input
          id="position"
          value={draft.position}
          onChange={(event) => update('position', event.target.value)}
          aria-invalid={Boolean(errors.position)}
        />
        {errors.position && <p className="error">{errors.position}</p>}
      </div>

      <div className="field">
        <label htmlFor="url">Ссылка на вакансию</label>
        <input
          id="url"
          type="url"
          value={draft.url}
          placeholder="https://"
          onChange={(event) => update('url', event.target.value)}
          aria-invalid={Boolean(errors.url)}
        />
        {errors.url && <p className="error">{errors.url}</p>}
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="date">Дата отклика</label>
          <input
            id="date"
            type="date"
            value={draft.date}
            onChange={(event) => update('date', event.target.value)}
            aria-invalid={Boolean(errors.date)}
          />
          {errors.date && <p className="error">{errors.date}</p>}
        </div>

        <div className="field">
          <label htmlFor="status">Статус</label>
          <select
            id="status"
            value={draft.status}
            onChange={(event) => update('status', event.target.value as Status)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="note">Заметка</label>
        <textarea
          id="note"
          rows={3}
          value={draft.note}
          onChange={(event) => update('note', event.target.value)}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="button" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className="button button--primary">
          {initial ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  )
}
