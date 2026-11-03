import { seedContacts } from '../../data/game/seedContacts'
import { seedHypotheses, seedTasks, seedTimeline } from '../../data/game/seedStory'
import { seedLocations } from '../../data/game/seedLocations'
import { seedPeople } from '../../data/game/seedPeople'
import type { InvestigationState } from '../types'
import { createInitialPhoneState } from '../story/actions'

export const SAVE_KEY = 'saturnus-investigation-v1'

export function createInitialState(): InvestigationState {
  return {
    version: 1,
    flags: {
      case_started: true,
      demo_flow_ready: true,
    },
    people: Object.fromEntries(seedPeople.map((p) => [p.id, { ...p }])),
    locations: Object.fromEntries(seedLocations.map((l) => [l.id, { ...l }])),
    evidence: {},
    evidenceOwned: [],
    documents: {},
    contacts: Object.fromEntries(seedContacts.map((c) => [c.id, { ...c }])),
    hypotheses: Object.fromEntries(seedHypotheses.map((h) => [h.id, { ...h }])),
    contradictionsConfirmed: [],
    timeline: [...seedTimeline],
    tasks: seedTasks.map((t) => ({ ...t })),
    interviewTopicsUnlocked: [],
    passwordsDiscovered: { marianaAccount: false, diary: false },
    searchTermsDiscovered: [],
    phones: {
      mariana: createInitialPhoneState('mariana'),
      augusto: createInitialPhoneState('augusto'),
    },
    provocationsPending: [],
    provocationsSeen: [],
    triggersFired: [],
    toastQueue: [],
  }
}
