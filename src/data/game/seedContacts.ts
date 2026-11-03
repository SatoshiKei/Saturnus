import type { Contact } from '../../game/types'

export const seedContacts: Contact[] = [
  { id: 'contact-julia', personId: 'julia', displayName: 'Júlia Martins', phone: '21 9xxxx-1102', unlocked: false },
  { id: 'contact-camila', personId: 'camila', displayName: 'Camila', phone: '21 9xxxx-1188', unlocked: true },
  {
    id: 'contact-rafael',
    personId: 'rafael',
    displayName: 'Rafael',
    phone: '21 9xxxx-3340',
    unlocked: false,
  },
  {
    id: 'contact-paula',
    personId: 'paula',
    displayName: 'Paula',
    phone: '21 9xxxx-2210',
    unlocked: false,
  },
]
