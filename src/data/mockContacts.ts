import type { Contact } from '../types/messaging'

export const mockContacts: Contact[] = [
  { id: 'julia', name: 'Júlia', avatarHue: 55, initials: 'JU' },
  { id: 'camila', name: 'Camila', avatarHue: 280, initials: 'CA' },
  { id: 'rafael', name: 'Rafael', avatarHue: 120, initials: 'RA' },
  { id: 'diego', name: 'Diego', avatarHue: 200, initials: 'DI' },
  { id: 'paula', name: 'Paula', avatarHue: 330, initials: 'PA' },
  { id: 'fernanda', name: 'Fernanda', avatarHue: 18, initials: 'FE' },
  { id: 'hospital', name: 'Hospital — Enfermagem', avatarHue: 160, initials: 'HM' },
  { id: 'lucas', name: 'Lucas', avatarHue: 42, initials: 'LU' },
  {
    id: 'radio_costeira',
    name: 'Rádio Costeira',
    avatarHue: 14,
    initials: 'RC',
    phone: '21 3xxx-4410',
    about: 'Redação',
  },
  {
    id: 'unknown',
    name: 'Sem nome',
    avatarHue: 90,
    initials: '?',
    phone: '+55 47 99184-2207',
    about: 'Contato não salvo na agenda',
  },
  {
    id: 'unsaved-a',
    name: 'Sem nome',
    avatarHue: 92,
    initials: '?',
    phone: '+55 21 9xxxx-8821',
  },
  {
    id: 'unsaved-b',
    name: 'Sem nome',
    avatarHue: 94,
    initials: '?',
    phone: '+55 21 9xxxx-7740',
  },
  {
    id: 'unsaved-c',
    name: 'Sem nome',
    avatarHue: 96,
    initials: '?',
    phone: '+55 21 3xxx-5502',
  },
  {
    id: 'unsaved-d',
    name: 'Sem nome',
    avatarHue: 98,
    initials: '?',
    phone: '+55 47 9xxxx-3310',
  },
  { id: 'mariana', name: 'Mariana', avatarHue: 328, initials: 'MA' },
]

export const contactById = Object.fromEntries(mockContacts.map((c) => [c.id, c])) as Record<
  string,
  Contact
>
