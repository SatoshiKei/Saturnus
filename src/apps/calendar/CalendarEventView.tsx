import { mockCalendarEvents } from '../../data/mockCalendar'

interface CalendarEventViewProps {
  eventId: string
  onBack: () => void
}

export function CalendarEventView({ eventId, onBack }: CalendarEventViewProps) {
  const event = mockCalendarEvents.find((e) => e.id === eventId)

  if (!event) {
    return <p>Evento não encontrado.</p>
  }

  return (
    <div className="calendar-event-view" data-testid="calendar-event-view">
      <header className="ios-app-header ios-app-header--calendar">
        <button type="button" className="ios-app-header__back" onClick={onBack}>
          ‹ Calendário
        </button>
      </header>
      <article className="calendar-event-view__body">
        <h1>{event.title}</h1>
        <p>
          <strong>Data:</strong> {event.date}
        </p>
        <p>
          <strong>Hora:</strong> {event.time}
        </p>
        {event.location ? (
          <p>
            <strong>Local:</strong> {event.location}
          </p>
        ) : null}
        {event.notes ? <p className="calendar-event-view__notes">{event.notes}</p> : null}
      </article>
    </div>
  )
}
