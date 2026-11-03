import type { CallLogEntry } from '../mockCalls'

/** Histórico do celular profissional de Augusto — só contatos do Bloco 1. */
export const augustoDeviceCallLog: CallLogEntry[] = [
  {
    id: 'acall-1',
    contactId: 'camila',
    direction: 'outgoing',
    time: '18:12',
    dateLabel: 'Hoje',
    duration: '2:04',
  },
  {
    id: 'acall-2',
    contactId: 'mariana',
    direction: 'missed',
    time: '08:51',
    dateLabel: 'Hoje',
  },
  {
    id: 'acall-3',
    contactId: 'camila',
    direction: 'incoming',
    time: '16:40',
    dateLabel: 'Ontem',
    duration: '0:58',
  },
]
