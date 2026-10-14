import type { Contact } from '../types/messaging'

export const mockContacts: Contact[] = [
  { id: 'mariana', name: 'Mariana', avatarHue: 328, initials: 'MA' },
  { id: 'andre', name: 'André', avatarHue: 210, initials: 'AN' },
  { id: 'elisa', name: 'Elisa', avatarHue: 42, initials: 'EL' },
  { id: 'geraldo', name: 'Geraldo', avatarHue: 152, initials: 'GE' },
  { id: 'nico', name: 'Nico', avatarHue: 268, initials: 'NI' },
  { id: 'jana', name: 'Jana', avatarHue: 12, initials: 'JA' },
  { id: 'valter', name: 'Válter', avatarHue: 185, initials: 'VA' },
  { id: 'miro', name: 'Miro', avatarHue: 95, initials: 'MI' },
  { id: 'rui', name: 'Rui', avatarHue: 240, initials: 'RU' },
  { id: 'bia', name: 'Bia', avatarHue: 300, initials: 'BI' },
]

export const contactById = Object.fromEntries(mockContacts.map((c) => [c.id, c])) as Record<
  string,
  Contact
>
