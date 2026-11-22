import { describe, expect, it } from 'vitest'
import { funnel, needsFollowUp, startOfWeek, toIsoDate, weeklyCounts } from './analytics'
import { escapeCsv, toCsv } from './csv'
import type { Application } from './types'

const make = (over: Partial<Application>): Application => ({
  id: '1',
  company: 'Acme',
  position: 'Frontend Developer',
  url: '',
  date: '2026-11-02',
  status: 'sent',
  note: '',
  ...over,
})

// 19 ноября 2026 — четверг
const today = new Date(2026, 10, 19)

describe('startOfWeek', () => {
  it('возвращает понедельник', () => {
    expect(toIsoDate(startOfWeek(today))).toBe('2026-11-16')
    expect(toIsoDate(startOfWeek(new Date(2026, 10, 22)))).toBe('2026-11-16') // воскресенье
    expect(toIsoDate(startOfWeek(new Date(2026, 10, 16)))).toBe('2026-11-16') // сам понедельник
  })
})

describe('weeklyCounts', () => {
  it('раскладывает отклики по неделям и не пропускает пустые', () => {
    const items = [
      make({ id: '1', date: '2026-11-16' }),
      make({ id: '2', date: '2026-11-19' }),
      make({ id: '3', date: '2026-11-03' }),
      make({ id: '4', date: '2025-01-01' }), // слишком старый — не попадает
    ]
    expect(weeklyCounts(items, today, 3)).toEqual([
      { weekStart: '2026-11-02', count: 1 },
      { weekStart: '2026-11-09', count: 0 },
      { weekStart: '2026-11-16', count: 2 },
    ])
  })
})

describe('funnel', () => {
  it('считает, сколько откликов дошло до каждого этапа', () => {
    const items = [
      make({ id: '1', status: 'sent' }),
      make({ id: '2', status: 'viewed' }),
      make({ id: '3', status: 'interview' }),
      make({ id: '4', status: 'offer' }),
      make({ id: '5', status: 'rejected' }),
    ]
    expect(funnel(items).map((step) => [step.label, step.count, step.percent])).toEqual([
      ['Отправлено', 5, 100],
      ['Просмотрено', 3, 60],
      ['Собеседование', 2, 40],
      ['Оффер', 1, 20],
    ])
  })

  it('не делит на ноль при пустом списке', () => {
    expect(funnel([]).every((step) => step.percent === 0)).toBe(true)
  })
})

describe('needsFollowUp', () => {
  it('напоминает об откликах без ответа старше недели', () => {
    expect(needsFollowUp(make({ date: '2026-11-12', status: 'sent' }), today)).toBe(true)
    expect(needsFollowUp(make({ date: '2026-11-10', status: 'viewed' }), today)).toBe(true)
  })

  it('не трогает свежие отклики и закрытые статусы', () => {
    expect(needsFollowUp(make({ date: '2026-11-13', status: 'sent' }), today)).toBe(false)
    expect(needsFollowUp(make({ date: '2026-10-01', status: 'rejected' }), today)).toBe(false)
    expect(needsFollowUp(make({ date: '2026-10-01', status: 'interview' }), today)).toBe(false)
  })
})

describe('CSV', () => {
  it('экранирует разделитель, кавычки и переносы строк', () => {
    expect(escapeCsv('просто текст')).toBe('просто текст')
    expect(escapeCsv('a;b')).toBe('"a;b"')
    expect(escapeCsv('ООО "Ромашка"')).toBe('"ООО ""Ромашка"""')
    expect(escapeCsv('две\nстроки')).toBe('"две\nстроки"')
  })

  it('собирает таблицу с заголовком, новые отклики сверху', () => {
    const csv = toCsv([
      make({ id: '1', date: '2026-11-01', company: 'Acme' }),
      make({ id: '2', date: '2026-11-05', company: 'Globex', status: 'interview', note: 'Vue; Nuxt' }),
    ])
    expect(csv.split('\r\n')).toEqual([
      'Дата;Компания;Должность;Статус;Ссылка;Заметка',
      '2026-11-05;Globex;Frontend Developer;Собеседование;;"Vue; Nuxt"',
      '2026-11-01;Acme;Frontend Developer;Отправлен;;',
    ])
  })
})
