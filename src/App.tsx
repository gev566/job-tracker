import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { needsFollowUp } from './analytics'
import { Analytics } from './components/Analytics'
import { ApplicationForm } from './components/ApplicationForm'
import { ApplicationList } from './components/ApplicationList'
import { Filters } from './components/Filters'
import { Stats } from './components/Stats'
import { toCsv } from './csv'
import { countByStatus, filterApplications, type StatusFilter } from './filters'
import { sampleApplications } from './sample'
import { loadApplications, parseApplications, saveApplications } from './storage'
import { applyTheme, loadTheme, THEMES, THEME_LABELS, type Theme } from './theme'
import type { Application, ApplicationDraft, Status } from './types'

// Что сейчас открыто в форме: ничего, новый отклик или редактирование существующего
type FormState = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; application: Application }

// Отдаёт браузеру файл на скачивание, собранный прямо в памяти
function download(content: string, fileName: string, type: string) {
  const blob = new Blob([content], { type })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  URL.revokeObjectURL(link.href)
}

export default function App() {
  // Функция в useState выполняется один раз — при первом показе страницы
  const [applications, setApplications] = useState<Application[]>(loadApplications)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [followUpOnly, setFollowUpOnly] = useState(false)
  const [form, setForm] = useState<FormState>({ mode: 'closed' })
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const [message, setMessage] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  // «Сегодня» фиксируем один раз при открытии страницы
  const [today] = useState(() => new Date())

  // Сохраняем список в localStorage при каждом его изменении
  useEffect(() => {
    saveApplications(applications)
  }, [applications])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // id откликов, по которым пора напомнить о себе
  const followUpIds = useMemo(
    () => new Set(applications.filter((item) => needsFollowUp(item, today)).map((item) => item.id)),
    [applications, today],
  )

  // useMemo: пересчитываем только когда изменились сами данные или фильтры
  const visible = useMemo(() => {
    const filtered = filterApplications(applications, status, query)
    return followUpOnly ? filtered.filter((item) => followUpIds.has(item.id)) : filtered
  }, [applications, status, query, followUpOnly, followUpIds])
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

  const handleExportJson = () =>
    download(JSON.stringify(applications, null, 2), 'applications.json', 'application/json')

  // BOM в начале файла нужен, чтобы Excel правильно показал кириллицу
  const handleExportCsv = () => download('﻿' + toCsv(applications), 'applications.csv', 'text/csv;charset=utf-8')

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

  const handleLoadSample = () => {
    setApplications(sampleApplications(today))
    setMessage('Загружен пример с вымышленными компаниями. Его можно удалить или изменить.')
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Трекер откликов</h1>
          <p className="subtitle">Все отклики на вакансии в одном месте. Данные хранятся в вашем браузере.</p>
        </div>
        <div className="header-actions">
          <label className="theme-select">
            <span className="visually-hidden">Тема</span>
            <select value={theme} onChange={(event) => setTheme(event.target.value as Theme)}>
              {THEMES.map((value) => (
                <option key={value} value={value}>
                  {THEME_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="button button--primary" onClick={() => setForm({ mode: 'new' })}>
            Добавить отклик
          </button>
        </div>
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
        <div className="empty">
          <p>Пока нет ни одного отклика. Нажмите «Добавить отклик», чтобы записать первый.</p>
          <button type="button" className="button" onClick={handleLoadSample}>
            Показать на примере
          </button>
        </div>
      ) : (
        <>
          <Analytics applications={applications} today={today} />
          <Filters
            status={status}
            query={query}
            followUpOnly={followUpOnly}
            followUpCount={followUpIds.size}
            onStatusChange={setStatus}
            onQueryChange={setQuery}
            onFollowUpChange={setFollowUpOnly}
          />
          <ApplicationList
            applications={visible}
            followUpIds={followUpIds}
            onEdit={(application) => setForm({ mode: 'edit', application })}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </>
      )}

      <footer className="footer">
        <button type="button" className="button" onClick={handleExportCsv} disabled={applications.length === 0}>
          Экспорт в CSV (Excel)
        </button>
        <button type="button" className="button" onClick={handleExportJson} disabled={applications.length === 0}>
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
