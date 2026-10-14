import type { CalendarEvent } from '../types/calendar'

const year = 2026
const month = 9 // October (0-indexed)

export const mockCalendarMonth = { year, month }

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'ev-jana',
    title: 'Encontrar Jana',
    date: `${year}-10-14`,
    time: '18:30',
    location: 'Praça lateral',
    notes: 'Mock — sem significado narrativo.',
  },
  {
    id: 'ev-bar',
    title: 'Bar do Geraldo',
    date: `${year}-10-16`,
    time: '21:00',
    location: 'Centro',
  },
  {
    id: 'ev-andre',
    title: 'Ligar pro André',
    date: `${year}-10-17`,
    time: '10:15',
    notes: 'Confirmar horário.',
  },
  {
    id: 'ev-papelada',
    title: 'Entregar papelada',
    date: `${year}-10-20`,
    time: '09:00',
  },
]
