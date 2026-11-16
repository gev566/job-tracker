import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { ApplicationForm } from './components/ApplicationForm'
import { ApplicationList } from './components/ApplicationList'
import { Filters } from './components/Filters'
import { Stats } from './components/Stats'
import { countByStatus, filterApplications, type StatusFilter } from './filters'
import { loadApplications, parseApplications, saveApplications } from './storage'
import type { Application, ApplicationDraft, Status } from './types'

// Что сейчас открыто в форме: ничего, новый отклик или редактирование существующего
type FormState = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; application: Application }

export default function App() {
  // Функция в useState выполняется один раз — при первом показе страницы
  const [applications, setApplications] = useState<Application[]>(loadApplications)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [form, setForm] = useState<FormState>({ mode: 'closed' })
  const [message, setMessage] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  // Сохраняем список в localStorage при каждом его изменении
  useEffect(() => {
    saveApplications(applications)
  }, [applications])

  // useMemo: пересчитываем только когда изменились сами данные или фильтры
  const visible = useMemo(() => filterApplications(applications, status, query), [applications, status, query])
  const counts = useMemo(() => countByStatus(applications), [applications])

  const handleSubmit = (draft: ApplicationDraft) => {
    if (form.mode === 'edit') {
      const id = form.application.id
      setApplications((list) => list.map((item) => (item.id === id ? { ...draft, id } : item)))
    } else {
      setApplications((list) => [...list, { ...draft, id: crypto.randomUUID() }])
    }
    setForm({ mode: 'closed' })
  }

  const handleDelete = (id: string) => setApplications((list) => list.filter((item) => item.id !== id))

  const handleStatusChange = (id: string, next: Status) =>
    setApplications((list) => list.map((item) => (item.id === id ? { ...item, status: next } : item)))

  // Экспорт: собираем JSON-файл в памяти и отдаём его браузеру на скачивание
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(applications, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'applications.json'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  // Импорт: читаем выбранный файл и добавляем из него записи, которых ещё нет
  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = '' // чтобы тот же файл можно было выбрать повторно
    if (!file) return
    const imported = parseApplications(await file.text())
    if (imported.length === 0) {
      setMessage('В файле не нашлось откликов в нужном формате.')
      return
    }
    const known = new Set(applications.map((item) => item.id))
    const fresh = imported.filter((item) => !known.has(item.id))
    setApplications((list) => [...list, ...fresh])
    setMessage(`Добавлено откликов: ${fresh.length}. Уже были в списке: ${imported.length - fresh.length}.`)
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Трекер откликов</h1>
          <p className="subtitle">Все отклики на вакансии в одном месте. Данные хранятся в вашем браузере.</p>
        </div>
        <button type="button" className="button button--primary" onClick={() => setForm({ mode: 'new' })}>
          Добавить отклик
        </button>
      </header>

      <Stats total={applications.length} counts={counts} />

      {form.mode !== 'closed' && (
        <ApplicationForm
          key={form.mode === 'edit' ? form.application.id : 'new'}
          initial={form.mode === 'edit' ? form.application : null}
          onSubmit={handleSubmit}
          onCancel={() => setForm({ mode: 'closed' })}
        />
      )}

      {applications.length === 0 ? (
        <p className="empty">Пока нет ни одного отклика. Нажмите «Добавить отклик», чтобы записать первый.</p>
      ) : (
        <>
          <Filters status={status} query={query} onStatusChange={setStatus} onQueryChange={setQuery} />
          <ApplicationList
            applications={visible}
            onEdit={(application) => setForm({ mode: 'edit', application })}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </>
      )}

      <footer className="footer">
        <button type="button" className="button" onClick={handleExport} disabled={applications.length === 0}>
          Экспорт в JSON
        </button>
        <button type="button" className="button" onClick={() => fileInput.current?.click()}>
          Импорт из JSON
        </button>
        <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={handleImport} />
        <p className="message" role="status">
          {message}
        </p>
      </footer>
    </div>
  )
}
