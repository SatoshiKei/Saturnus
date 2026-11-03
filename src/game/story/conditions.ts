import type { InvestigationState, StoryCondition } from '../types'
import { personStatusRank } from '../state/personStatusOrder'

export function evaluateCondition(state: InvestigationState, c: StoryCondition): boolean {
  switch (c.type) {
    case 'flag':
      return Boolean(state.flags[c.id]) === (c.value ?? true)
    case 'evidenceOwned':
      return state.evidenceOwned.includes(c.id)
    case 'personStatusAtLeast': {
      const p = state.people[c.personId]
      if (!p) return false
      return personStatusRank(p.status) >= personStatusRank(c.status)
    }
    case 'topicKnown':
      return state.interviewTopicsUnlocked.includes(c.id)
    case 'appInstalled':
      return state.phones[c.device].installedAppIds.includes(c.appId)
    case 'passwordDiscovered':
      return state.passwordsDiscovered[c.which]
    case 'contradictionConfirmed':
      return state.contradictionsConfirmed.some((x) => x.id === c.id)
    default:
      return false
  }
}

export function evaluateAllConditions(
  state: InvestigationState,
  conditions: StoryCondition[],
): boolean {
  return conditions.every((c) => evaluateCondition(state, c))
}
