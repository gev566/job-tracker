import { funnel, weeklyCounts } from '../analytics'
import type { Application } from '../types'

interface AnalyticsProps {
  applications: Application[]
  today: Date
}

const formatWeek = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

// Активность по неделям и воронка «отправлено → оффер».
// Графики нарисованы обычными блоками с шириной/высотой в процентах — без библиотек.
export function Analytics({ applications, today }: AnalyticsProps) {
  const weeks = weeklyCounts(applications, today)
  const steps = funnel(applications)
  const max = Math.max(1, ...weeks.map((week) => week.count))

  return (
    <section className="analytics" aria-labelledby="analytics-title">
      <h2 id="analytics-title">Статистика</h2>
      <div className="analytics-grid">
        <figure className="panel">
          <figcaption>Отклики по неделям</figcaption>
          <ol className="bars">
            {weeks.map((week) => (
              <li key={week.weekStart} className="bar-col">
                <span className="bar-value">{week.count || ''}</span>
                <span
                  className="bar"
                  style={{ height: `${(week.count / max) * 100}%` }}
                  aria-label={`Неделя с ${formatWeek(week.weekStart)}: ${week.count}`}
                />
                <span className="bar-label">{formatWeek(week.weekStart)}</span>
              </li>
            ))}
          </ol>
        </figure>

        <figure className="panel">
          <figcaption>Воронка</figcaption>
          <ul className="funnel">
            {steps.map((step) => (
              <li key={step.label}>
                <div className="funnel-head">
                  <span>{step.label}</span>
                  <span className="funnel-num">
                    {step.count} · {step.percent}%
                  </span>
                </div>
                <div className="funnel-track">
                  <div className="funnel-fill" style={{ width: `${step.percent}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </figure>
      </div>
    </section>
  )
}
