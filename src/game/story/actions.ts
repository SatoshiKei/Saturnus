import { contradictionDefs, extraTimelineOnContradiction, hypothesisCatalog, seedProvocations } from '../../data/game/seedStory'
import { seedDocuments } from '../../data/game/seedDocuments'
import { evidenceSourceLabel } from '../../lib/labels'
import { seedEvidenceCatalog } from '../../data/game/seedEvidence'
import { block01MarianaChatIds } from '../../data/block01/marianaChats'
import { appDefinitions } from '../../data/game/seedApps'
import type { DiscoveryEvent, InvestigationState, StoryActionRef } from '../types'
import { maxPersonStatus } from '../state/personStatusOrder'

/** Empilha um evento de descoberta (sem duplicar o mesmo id). */
export function withDiscovery(state: InvestigationState, ev: DiscoveryEvent): InvestigationState {
  if (state.discoveries.some((d) => d.id === ev.id)) return state
  // Vários áudios seguidos (ex.: lote preservado pela central) viram um único aviso.
  if (ev.kind === 'audio') {
    const idx = state.discoveries.findIndex((d) => d.kind === 'audio')
    if (idx >= 0) {
      const prev = state.discoveries[idx]
      const count = (prev.count ?? 1) + 1
      const merged: DiscoveryEvent = {
        ...prev,
        title: 'Novos áudios na bancada',
        subtitle: `${count} arquivos`,
        count,
      }
      return { ...state, discoveries: state.discoveries.map((d, i) => (i === idx ? merged : d)) }
    }
  }
  return { ...state, discoveries: [...state.discoveries, ev] }
}

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
      return withDiscovery(
        {
          ...state,
          evidence: { ...state.evidence, [action.id]: def },
          evidenceOwned: [...state.evidenceOwned, action.id],
        },
        {
          id: `evidence:${action.id}`,
          kind: def.type === 'audio' ? 'audio' : 'evidence',
          title: def.type === 'audio' ? (def.displayFileName ?? def.title) : def.title,
          subtitle: def.type === 'audio' ? 'Disponível na bancada de áudio' : undefined,
          source: evidenceSourceLabel(def),
          summary: def.description,
          refId: action.id,
        },
      )
    }
    case 'addDocument': {
      if (state.documentsOwned.includes(action.id)) return state
      const doc = seedDocuments.find((d) => d.id === action.id)
      if (!doc) return state
      return withDiscovery(
        { ...state, documentsOwned: [...state.documentsOwned, action.id] },
        {
          id: `document:${action.id}`,
          kind: 'document',
          title: doc.title,
          subtitle: doc.category,
          refId: action.id,
        },
      )
    }
    case 'completeCall':
      if (state.callsDone.includes(action.id)) return state
      return { ...state, callsDone: [...state.callsDone, action.id] }
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
      const nextStatus = action.status ?? 'known'
      const moved = {
        ...state,
        locations: {
          ...state.locations,
          [action.id]: { ...loc, status: nextStatus },
        },
      }
      if (loc.status !== 'unknown' || nextStatus === 'unknown' || loc.mapX === undefined) return moved
      return withDiscovery(moved, {
        id: `location:${action.id}`,
        kind: 'location',
        title: loc.name,
        subtitle: 'Marcado no mapa',
        refId: action.id,
      })
    }
    case 'unlockContact': {
      const c = state.contacts[action.contactId]
      if (!c) return state
      const moved = { ...state, contacts: { ...state.contacts, [action.contactId]: { ...c, unlocked: true } } }
      if (c.unlocked) return moved
      return withDiscovery(moved, {
        id: `contact:${action.contactId}`,
        kind: 'contact',
        title: c.displayName,
        subtitle: c.phone ? `Número registrado: ${c.phone}` : 'Registrado na agenda',
        refId: action.contactId,
      })
    }
    case 'unlockTopic':
      if (state.interviewTopicsUnlocked.includes(action.id)) return state
      return {
        ...state,
        interviewTopicsUnlocked: [...state.interviewTopicsUnlocked, action.id],
      }
    case 'addTask': {
      if (state.tasks.some((t) => t.id === action.id)) return state
      return withDiscovery(
        {
          ...state,
          tasks: [...state.tasks, { id: action.id, label: action.label ?? action.id, completed: false }],
        },
        { id: `objective:${action.id}`, kind: 'objective', title: action.label ?? action.id, refId: action.id },
      )
    }
    case 'removeTask':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) }
    case 'replaceTasks': {
      const replaced = { ...state, tasks: action.tasks.map((t) => ({ ...t })) }
      const fresh = action.tasks.find((t) => !t.completed && !state.tasks.some((o) => o.id === t.id))
      if (!fresh) return replaced
      return withDiscovery(replaced, {
        id: `objective:${fresh.id}`,
        kind: 'objective',
        title: fresh.label,
        refId: fresh.id,
      })
    }
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
      }
    }
    case 'addHypothesis': {
      if (state.hypotheses[action.id]) return state
      const def = hypothesisCatalog.find((h) => h.id === action.id)
      if (!def) return state
      return withDiscovery(
        {
          ...state,
          hypotheses: {
            ...state.hypotheses,
            [action.id]: {
              ...def,
              supportingEvidenceIds: [...def.supportingEvidenceIds],
              contradictingEvidenceIds: [...def.contradictingEvidenceIds],
            },
          },
        },
        { id: `hypothesis:${action.id}`, kind: 'hypothesis', title: def.title, refId: action.id },
      )
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
      return withDiscovery(
        {
          ...state,
          contradictionsConfirmed: [
            ...state.contradictionsConfirmed,
            { id: action.id, confirmedAt: new Date().toISOString() },
          ],
        },
        {
          id: `contradiction:${action.id}`,
          kind: 'contradiction',
          title: 'CONTRADIÇÃO REGISTRADA',
          summary: contradictionDefs.find((c) => c.id === action.id)?.summary,
          refId: action.id,
        },
      )
    case 'pushProvocation': {
      if (state.provocationsPending.includes(action.id)) return state
      const prov = seedProvocations.find((p) => p.id === action.id)
      return withDiscovery(
        { ...state, provocationsPending: [...state.provocationsPending, action.id] },
        {
          id: `message:${action.id}`,
          kind: 'message',
          title: 'Nova mensagem',
          subtitle: prov?.preview,
          refId: action.id,
        },
      )
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

