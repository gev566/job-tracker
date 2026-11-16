// Все статусы отклика. `as const` делает массив неизменяемым,
// а тип Status ниже получается из него автоматически.
export const STATUSES = ['sent', 'viewed', 'interview', 'offer', 'rejected'] as const

export type Status = (typeof STATUSES)[number]

export const STATUS_LABELS: Record<Status, string> = {
  sent: 'Отправлен',
  viewed: 'Просмотрен',
  interview: 'Собеседование',
  offer: 'Оффер',
  rejected: 'Отказ',
}

// Один отклик на вакансию
export interface Application {
  id: string
  company: string
  position: string
  url: string // ссылка на вакансию, может быть пустой
  date: string // дата отклика в формате ГГГГ-ММ-ДД
  status: Status
  note: string
}

// Данные формы: то же самое, но без id — его назначает приложение
export type ApplicationDraft = Omit<Application, 'id'>
