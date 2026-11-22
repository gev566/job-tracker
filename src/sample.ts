import { toIsoDate } from './analytics'
import type { Application } from './types'

// Пример данных, чтобы посмотреть приложение без ручного ввода.
// Компании вымышленные. Даты считаются от сегодняшнего дня, чтобы графики были «живыми».
export function sampleApplications(today: Date): Application[] {
  const daysAgo = (n: number) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - n)
    return toIsoDate(date)
  }
  const rows: [string, string, number, Application['status'], string][] = [
    ['Северный Ветер', 'Frontend-разработчик (Vue)', 1, 'sent', ''],
    ['Пиксель и Ко', 'Fullstack-разработчик', 3, 'viewed', 'Попросили тестовое'],
    ['Облако-7', 'Vue.js разработчик', 5, 'interview', 'Созвон в четверг в 15:00'],
    ['ТехноСад', 'Frontend Developer', 9, 'sent', ''],
    ['Карта Мира', 'Middle Frontend', 12, 'viewed', ''],
    ['Синий Кит', 'Frontend-разработчик (Nuxt)', 16, 'rejected', 'Нужен был опыт с Next.js'],
    ['Лаборатория 42', 'JavaScript-разработчик', 20, 'interview', 'Техническое интервью пройдено'],
    ['Зелёный Свет', 'Frontend Developer', 27, 'rejected', ''],
    ['Маяк', 'Веб-разработчик', 33, 'offer', 'Оффер, думаю до пятницы'],
    ['Восход', 'Frontend-разработчик', 40, 'sent', ''],
  ]
  return rows.map(([company, position, ago, status, note], i) => ({
    id: `sample-${i + 1}`,
    company,
    position,
    url: '',
    date: daysAgo(ago),
    status,
    note,
  }))
}
