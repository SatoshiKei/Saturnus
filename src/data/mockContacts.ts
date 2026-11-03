import type { Contact } from '../types/messaging'

export const mockContacts: Contact[] = [
  { id: 'julia', name: 'Júlia', avatarHue: 55, initials: 'JU' },
  { id: 'camila', name: 'Camila', avatarHue: 280, initials: 'CA' },
  { id: 'rafael', name: 'Rafael', avatarHue: 120, initials: 'RA' },
  { id: 'diego', name: 'Diego', avatarHue: 200, initials: 'DI' },
  { id: 'paula', name: 'Paula', avatarHue: 330, initials: 'PA' },
  { id: 'fernanda', name: 'Fernanda', avatarHue: 18, initials: 'FE' },
  { id: 'hospital', name: 'Hospital — Enfermagem', avatarHue: 160, initials: 'HM' },
  { id: 'unknown', name: 'Sem nome', avatarHue: 90, initials: '?' },
  { id: 'mariana', name: 'Mariana', avatarHue: 328, initials: 'MA' },
]

export const contactById = Object.fromEntries(mockContacts.map((c) => [c.id, c])) as Record<
  string,
  Contact
>
