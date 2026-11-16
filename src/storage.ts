import { STATUSES, type Application } from './types'

const STORAGE_KEY = 'job-tracker:applications'

// Проверяем, что значение из localStorage или из файла действительно похоже на отклик.
// Данные приходят «снаружи», поэтому доверять их типу нельзя.
export function isApplication(value: unknown): value is Application {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.company === 'string' &&
    typeof item.position === 'string' &&
    typeof item.url === 'string' &&
    typeof item.date === 'string' &&
    typeof item.note === 'string' &&
    STATUSES.includes(item.status as Application['status'])
  )
}

// Разбирает JSON-текст в список откликов. Всё, что не прошло проверку, отбрасывается.
export function parseApplications(text: string): Application[] {
  try {
    const data: unknown = JSON.parse(text)
    return Array.isArray(data) ? data.filter(isApplication) : []
  } catch {
    return []
  }
}

export function loadApplications(): Application[] {
  try {
    return parseApplications(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    // localStorage может быть недоступен (например, в приватном режиме)
    return []
  }
}

export function saveApplications(applications: Application[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
  } catch {
    // если сохранить не удалось, приложение продолжает работать до перезагрузки страницы
  }
}
