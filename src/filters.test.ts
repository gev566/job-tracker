import { describe, expect, it } from 'vitest'
import { countByStatus, filterApplications } from './filters'
import { parseApplications } from './storage'
import type { Application } from './types'

const make = (over: Partial<Application>): Application => ({
  id: '1',
  company: 'Acme',
  position: 'Frontend Developer',
  url: '',
  date: '2026-11-01',
  status: 'sent',
  note: '',
  ...over,
})

const items = [
  make({ id: '1', company: 'Acme', date: '2026-11-01', status: 'sent' }),
  make({ id: '2', company: 'Globex', date: '2026-11-10', status: 'interview', note: 'Vue и Nuxt' }),
  make({ id: '3', company: 'Initech', date: '2026-11-05', status: 'rejected' }),
]

describe('filterApplications', () => {
  it('сортирует по дате, новые сверху', () => {
    expect(filterApplications(items, 'all', '').map((i) => i.id)).toEqual(['2', '3', '1'])
  })

  it('фильтрует по статусу', () => {
    expect(filterApplications(items, 'rejected', '').map((i) => i.id)).toEqual(['3'])
  })

  it('ищет без учёта регистра по компании, должности и заметке', () => {
    expect(filterApplications(items, 'all', 'GLOBEX').map((i) => i.id)).toEqual(['2'])
    expect(filterApplications(items, 'all', 'nuxt').map((i) => i.id)).toEqual(['2'])
  })

  it('не меняет исходный массив', () => {
    filterApplications(items, 'all', '')
    expect(items.map((i) => i.id)).toEqual(['1', '2', '3'])
  })
})

describe('countByStatus', () => {
  it('считает отклики по статусам, включая нулевые', () => {
    expect(countByStatus(items)).toEqual({ sent: 1, viewed: 0, interview: 1, offer: 0, rejected: 1 })
  })
})

describe('parseApplications', () => {
  it('возвращает пустой список для мусора', () => {
    expect(parseApplications('не json')).toEqual([])
    expect(parseApplications('{"a":1}')).toEqual([])
  })

  it('отбрасывает записи с неверной структурой', () => {
    const text = JSON.stringify([items[0], { id: 'x', company: 'Без статуса' }, { ...items[1], status: 'unknown' }])
    expect(parseApplications(text).map((i) => i.id)).toEqual(['1'])
  })
})
