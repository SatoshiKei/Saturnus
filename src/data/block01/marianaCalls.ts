import type { CallLogEntry } from '../mockCalls'

/** Histórico do aparelho de Mariana — sem chamada às 08:03. */
export const marianaDeviceCallLog: CallLogEntry[] = [
  {
    id: 'mcall-1',
    contactId: 'julia',
    direction: 'missed',
    time: '07:18',
    dateLabel: 'Hoje',
  },
  {
    id: 'mcall-2',
    contactId: 'paula',
    direction: 'outgoing',
    time: '22:41',
    dateLabel: 'Ontem',
    duration: '1:02',
  },
  {
    id: 'mcall-3',
    contactId: 'camila',
    direction: 'incoming',
    time: '16:28',
    dateLabel: '01/11',
    duration: '0:34',
  },
]
