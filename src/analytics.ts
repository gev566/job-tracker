import type { Application, Status } from './types'

// Дата в формате ГГГГ-ММ-ДД по местному времени (без сдвига в UTC)
export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Разбирает ГГГГ-ММ-ДД как местную дату (полночь), а не как UTC
export function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Понедельник той недели, в которую попадает дата
export function startOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const shift = (result.getDay() + 6) % 7 // воскресенье = 6, понедельник = 0
  result.setDate(result.getDate() - shift)
  return result
}

export interface WeekCount {
  weekStart: string // понедельник недели, ГГГГ-ММ-ДД
  count: number
}

// Сколько откликов было отправлено в каждую из последних `weeks` недель, включая текущую.
// Пустые недели тоже попадают в результат — иначе на графике будут «дыры».
export function weeklyCounts(applications: Application[], today: Date, weeks = 8): WeekCount[] {
  const current = startOfWeek(today)
  const result: WeekCount[] = []
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const start = new Date(current)
    start.setDate(start.getDate() - i * 7)
    result.push({ weekStart: toIsoDate(start), count: 0 })
  }
  const index = new Map(result.map((week, i) => [week.weekStart, i]))
  for (const item of applications) {
    const key = toIsoDate(startOfWeek(fromIsoDate(item.date)))
    const i = index.get(key)
    if (i !== undefined) result[i].count += 1
  }
  return result
}

// Насколько далеко продвинулся отклик. Отказ может случиться на любом этапе,
// поэтому для воронки он считается «дошёл только до отправки».
const STAGE: Record<Status, number> = { sent: 0, rejected: 0, viewed: 1, interview: 2, offer: 3 }

export interface FunnelStep {
  label: string
  count: number
  percent: number // доля от всех откликов, 0–100
}

// Воронка: сколько откликов дошло хотя бы до каждого этапа.
export function funnel(applications: Application[]): FunnelStep[] {
  const total = applications.length
  const reached = (stage: number) => applications.filter((item) => STAGE[item.status] >= stage).length
  const steps: [string, number][] = [
    ['Отправлено', total],
    ['Просмотрено', reached(1)],
    ['Собеседование', reached(2)],
    ['Оффер', reached(3)],
  ]
  return steps.map(([label, count]) => ({
    label,
    count,
    percent: total === 0 ? 0 : Math.round((count / total) * 100),
  }))
}

export const FOLLOW_UP_DAYS = 7

// Пора ли напомнить о себе: отклик отправлен или просмотрен, но ответа нет дольше недели.
export function needsFollowUp(item: Application, today: Date, days = FOLLOW_UP_DAYS): boolean {
  if (item.status !== 'sent' && item.status !== 'viewed') return false
  const ageMs = startOfDay(today).getTime() - fromIsoDate(item.date).getTime()
  return ageMs >= days * 24 * 60 * 60 * 1000
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
