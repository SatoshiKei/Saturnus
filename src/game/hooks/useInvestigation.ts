import { useSyncExternalStore } from 'react'
import { getInvestigationState, subscribeInvestigation } from '../state/investigationStore'

export function useInvestigation() {
  return useSyncExternalStore(subscribeInvestigation, getInvestigationState, getInvestigationState)
}
