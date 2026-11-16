import { STATUSES, type Application, type Status } from './types'

export type StatusFilter = Status | 'all'

// Оставляет отклики, подходящие под статус и строку поиска, и сортирует: новые сверху.
export function filterApplications(
  applications: Application[],
  status: StatusFilter,
  query: string,
): Application[] {
  const needle = query.trim().toLowerCase()
  return applications
    .filter((item) => status === 'all' || item.status === status)
    .filter(
      (item) =>
        needle === '' ||
        item.company.toLowerCase().includes(needle) ||
        item.position.toLowerCase().includes(needle) ||
        item.note.toLowerCase().includes(needle),
    )
    .sort((a, b) => b.date.localeCompare(a.date))
}

// Считает, сколько откликов в каждом статусе.
export function countByStatus(applications: Application[]): Record<Status, number> {
  const counts = Object.fromEntries(STATUSES.map((status) => [status, 0])) as Record<Status, number>
  for (const item of applications) counts[item.status] += 1
  return counts
}
