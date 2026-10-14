export type CallDirection = 'incoming' | 'outgoing' | 'missed'

export interface CallLogEntry {
  id: string
  contactId: string
  direction: CallDirection
  time: string
  dateLabel: string
  duration?: string
  video?: boolean
}

export const mockCallLog: CallLogEntry[] = [
  {
    id: 'call-1',
    contactId: 'mariana',
    direction: 'missed',
    time: '21:48',
    dateLabel: 'Hoje',
  },
  {
    id: 'call-2',
    contactId: 'andre',
    direction: 'outgoing',
    time: '19:02',
    dateLabel: 'Hoje',
    duration: '3:12',
  },
  {
    id: 'call-3',
    contactId: 'elisa',
    direction: 'incoming',
    time: '17:55',
    dateLabel: 'Hoje',
    duration: '0:47',
    video: true,
  },
  {
    id: 'call-4',
    contactId: 'geraldo',
    direction: 'outgoing',
    time: '09:14',
    dateLabel: 'Ontem',
    duration: '1:05',
  },
  {
    id: 'call-5',
    contactId: 'jana',
    direction: 'missed',
    time: '22:30',
    dateLabel: 'Ontem',
  },
  {
    id: 'call-6',
    contactId: 'valter',
    direction: 'incoming',
    time: '14:20',
    dateLabel: '12/10/2026',
    duration: '8:01',
  },
]
