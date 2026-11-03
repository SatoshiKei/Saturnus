import type { PersonStatus } from '../types'

const ORDER: PersonStatus[] = [
  'mentioned',
  'identified',
  'located',
  'contactable',
  'interviewed',
]

export function personStatusRank(status: PersonStatus): number {
  return ORDER.indexOf(status)
}

export function maxPersonStatus(a: PersonStatus, b: PersonStatus): PersonStatus {
  return personStatusRank(a) >= personStatusRank(b) ? a : b
}
