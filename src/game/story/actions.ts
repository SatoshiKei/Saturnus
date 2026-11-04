import { extraTimelineOnContradiction, hypothesisCatalog } from '../../data/game/seedStory'
import { seedEvidenceCatalog } from '../../data/game/seedEvidence'
import { block01MarianaChatIds } from '../../data/block01/marianaChats'
import { appDefinitions } from '../../data/game/seedApps'
import type { InvestigationState, StoryActionRef } from '../types'
import { maxPersonStatus } from '../state/personStatusOrder'

function catalogEvidence(id: string) {
  return seedEvidenceCatalog.find((e) => e.id === id)
}

function defaultPhoneApps(device: 'mariana' | 'augusto') {
  return appDefinitions
    .filter((a) => a.preinstalled && (a.device === device || a.device === 'both'))
    .map((a) => a.id)
}

export function applyStoryActions(
  state: InvestigationState,
  actions: StoryActionRef[],
): InvestigationState {
  let next = state
  for (const action of actions) {
    next = applyOne(next, action)
  }
  return next
}

function applyOne(state: InvestigationState, action: StoryActionRef): InvestigationState {
  switch (action.type) {
    case 'setFlag':
      return {
        ...state,
        flags: { ...state.flags, [action.id]: action.value ?? true },
      }
    case 'addEvidence': {
      if (state.evidenceOwned.includes(action.id)) return state
      const def = catalogEvidence(action.id)
      if (!def) return state
      return {
        ...state,
        evidence: { ...state.evidence, [action.id]: def },
        evidenceOwned: [...state.evidenceOwned, action.id],
        toastQueue: [...state.toastQueue, 'Nova evidência adicionada'],
      }
    }
    case 'discoverPerson': {
      const p = state.people[action.id]
      if (!p) return state
      const status = action.status ?? p.status
      return {
        ...state,
        people: {
          ...state.people,
          [action.id]: { ...p, status: maxPersonStatus(p.status, status) },
        },
      }
    }
    case 'unlockLocation': {
      const loc = state.locations[action.id]
      if (!loc) return state
      return {
        ...state,
        locations: {
          ...state.locations,
          [action.id]: { ...loc, status: action.status ?? 'known' },
        },
      }
    }
    case 'unlockContact': {
      const c = state.contacts[action.contactId]
      if (!c) return state
      return { ...state, contacts: { ...state.contacts, [action.contactId]: { ...c, unlocked: true } } }
    }
    case 'unlockTopic':
      if (state.interviewTopicsUnlocked.includes(action.id)) return state
      return {
        ...state,
        interviewTopicsUnlocked: [...state.interviewTopicsUnlocked, action.id],
      }
    case 'addTask': {
      if (state.tasks.some((t) => t.id === action.id)) return state
      return {
        ...state,
        tasks: [...state.tasks, { id: action.id, label: action.label ?? action.id, completed: false }],
      }
    }
    case 'removeTask':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) }
    case 'replaceTasks':
      return { ...state, tasks: action.tasks.map((t) => ({ ...t })) }
    case 'completeTask':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, completed: true } : t)),
      }
    case 'addTimelineEvent': {
      if (action.id === 'evt_memory_conflict') {
        if (state.timeline.some((e) => e.id === 'evt_memory_conflict')) return state
        return { ...state, timeline: [...state.timeline, extraTimelineOnContradiction] }
      }
      return state
    }
    case 'updateTimelineEvent':
      return state
    case 'unlockChat': {
      const phone = state.phones[action.device]
      if (phone.unlockedChatIds.includes(action.chatId)) return state
      return {
        ...state,
        phones: {
          ...state.phones,
          [action.device]: {
            ...phone,
            unlockedChatIds: [...phone.unlockedChatIds, action.chatId],
          },
        },
      }
    }
    case 'revealHiddenApps':
      return {
        ...state,
        phones: {
          ...state.phones,
          mariana: { ...state.phones.mariana, hiddenAppsRevealed: true },
        },
      }
    case 'discoverPassword':
      return {
        ...state,
        passwordsDiscovered: {
          ...state.passwordsDiscovered,
          [action.which]: true,
        },
      }
    case 'installApp': {
      const phone = state.phones[action.device]
      if (phone.installedAppIds.includes(action.appId)) return state
      return {
        ...state,
        phones: {
          ...state.phones,
          [action.device]: {
            ...phone,
            installedAppIds: [...phone.installedAppIds, action.appId],
          },
        },
        toastQueue: [...state.toastQueue, 'Aplicativo instalado'],
      }
    }
    case 'addHypothesis': {
      if (state.hypotheses[action.id]) return state
      const def = hypothesisCatalog.find((h) => h.id === action.id)
      if (!def) return state
      return {
        ...state,
        hypotheses: { ...state.hypotheses, [action.id]: { ...def, supportingEvidenceIds: [...def.supportingEvidenceIds], contradictingEvidenceIds: [...def.contradictingEvidenceIds] } },
      }
    }
    case 'linkHypothesis': {
      const h = state.hypotheses[action.hypothesisId]
      if (!h) return state
      const key = action.role === 'support' ? 'supportingEvidenceIds' : 'contradictingEvidenceIds'
      if (h[key].includes(action.evidenceId)) return state
      return {
        ...state,
        hypotheses: {
          ...state.hypotheses,
          [action.hypothesisId]: { ...h, [key]: [...h[key], action.evidenceId] },
        },
      }
    }
    case 'updateHypothesis': {
      const h = state.hypotheses[action.id]
      if (!h) return state
      return {
        ...state,
        hypotheses: {
          ...state.hypotheses,
          [action.id]: { ...h, state: action.state },
        },
      }
    }
    case 'confirmContradiction':
      if (state.contradictionsConfirmed.some((c) => c.id === action.id)) return state
      return {
        ...state,
        contradictionsConfirmed: [
          ...state.contradictionsConfirmed,
          { id: action.id, confirmedAt: new Date().toISOString() },
        ],
        toastQueue: [...state.toastQueue, 'Contradição registrada'],
      }
    case 'pushProvocation':
      if (state.provocationsPending.includes(action.id)) return state
      return {
        ...state,
        provocationsPending: [...state.provocationsPending, action.id],
        toastQueue: [...state.toastQueue, 'Nova mensagem recebida'],
      }
    case 'discoverSearchTerm': {
      const term = action.term.toLowerCase()
      if (state.searchTermsDiscovered.includes(term)) return state
      return {
        ...state,
        searchTermsDiscovered: [...state.searchTermsDiscovered, term],
      }
    }
    case 'markTriggersFired': {
      const next = new Set(state.triggersFired)
      for (const id of action.ids) next.add(id)
      return { ...state, triggersFired: [...next] }
    }
    default:
      return state
  }
}

export function createInitialPhoneState(device: 'mariana' | 'augusto') {
  return {
    installedAppIds: defaultPhoneApps(device),
    hiddenAppsRevealed: false,
    diaryUnlocked: false,
    diaryPasswordAttempts: 0,
    unlockedChatIds: device === 'mariana' ? [...block01MarianaChatIds] : ['chat-camila-augusto'],
    readMessageIds: [] as string[],
  }
}
