import { STATUS_LABELS, type Application } from './types'

const COLUMNS: [string, (item: Application) => string][] = [
  ['Дата', (item) => item.date],
  ['Компания', (item) => item.company],
  ['Должность', (item) => item.position],
  ['Статус', (item) => STATUS_LABELS[item.status]],
  ['Ссылка', (item) => item.url],
  ['Заметка', (item) => item.note],
]

// Экранирует одно значение по правилам CSV: если внутри есть разделитель,
// кавычка или перенос строки — берём в кавычки, а кавычки удваиваем.
export function escapeCsv(value: string, separator = ';'): string {
  return value.includes(separator) || /["\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

// Собирает CSV для Excel и Google Таблиц. Разделитель «;» — так Excel с русской
// локалью сразу раскладывает данные по столбцам.
export function toCsv(applications: Application[], separator = ';'): string {
  const header = COLUMNS.map(([title]) => title).join(separator)
  const rows = [...applications]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((item) => COLUMNS.map(([, get]) => escapeCsv(get(item), separator)).join(separator))
  return [header, ...rows].join('\r\n')
}
