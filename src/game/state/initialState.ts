import { seedContacts } from '../../data/game/seedContacts'
import { seedTasks, seedTimeline } from '../../data/game/seedStory'
import { seedLocations } from '../../data/game/seedLocations'
import { seedPeople } from '../../data/game/seedPeople'
import { seedEvidenceCatalog } from '../../data/game/seedEvidence'
import type { InvestigationState } from '../types'
import { createInitialPhoneState } from '../story/actions'

export const SAVE_KEY = 'saturnus-investigation-v1'
/** v3: early paths — searchTermsDiscovered gates cadastros; flavour visits; diary known≠PIN. */
export const STATE_VERSION = 3

const block01PreOwned = ['emergency_call_raw', 'mariana_phone'] as const

export function createInitialState(): InvestigationState {
  const preEvidence = Object.fromEntries(
    block01PreOwned.map((id) => {
      const def = seedEvidenceCatalog.find((e) => e.id === id)!
      return [id, def]
    }),
  )

  return {
    version: STATE_VERSION,
    flags: {
      block01_started: true,
    },
    people: Object.fromEntries(seedPeople.map((p) => [p.id, { ...p }])),
    locations: Object.fromEntries(seedLocations.map((l) => [l.id, { ...l }])),
    evidence: { ...preEvidence },
    evidenceOwned: [...block01PreOwned],
    documents: {},
    contacts: Object.fromEntries(seedContacts.map((c) => [c.id, { ...c }])),
    hypotheses: {},
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
    documentsOwned: ['doc-bo-inicial'],
    discoveries: [],
    audioSeen: [],
    chatProgress: {},
    callsDone: [],
    playTimeMs: 0,
    achievementUnlocks: {},
    forensicRecoveredSpeech: {},
  }
}
