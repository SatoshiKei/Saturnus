import { mockCalendarEvents, mockCalendarMonth } from '../../data/mockCalendar'
import { usePhoneSession } from '../../app/PhoneSessionContext'
import { openCalendarEvent } from '../../lib/phoneRouter'

interface CalendarHomeProps {
  onBack: () => void
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function CalendarHome({ onBack }: CalendarHomeProps) {
  const { push } = usePhoneSession()
  const { year, month } = mockCalendarMonth
  const cells = buildMonthGrid(year, month)

  const eventDays = new Set(
    mockCalendarEvents.map((e) => {
      const d = new Date(e.date)
      return d.getDate()
    }),
  )

  return (
    <div className="calendar-app" data-testid="calendar-home">
      <header className="ios-app-header ios-app-header--calendar">
        <button type="button" className="ios-app-header__back" onClick={onBack}>
          ‹ Início
        </button>
        <h1>
          {MONTH_NAMES[month]} {year}
        </h1>
      </header>
      <div className="calendar-grid">
        <div className="calendar-grid__weekdays">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="calendar-grid__days">
          {cells.map((day, i) => (
            <span
              key={i}
              className={`calendar-grid__day${day && eventDays.has(day) ? ' calendar-grid__day--event' : ''}`}
            >
              {day ?? ''}
            </span>
          ))}
        </div>
      </div>
      <ul className="calendar-events">
        {mockCalendarEvents.map((ev) => (
          <li key={ev.id}>
            <button
              type="button"
              className="calendar-events__row"
              data-testid={`calendar-event-${ev.id}`}
              onClick={() => push(openCalendarEvent(ev.id))}
            >
              <span className="calendar-events__time">{ev.time}</span>
              <span className="calendar-events__title">{ev.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
