import { contradictionDefs, extraTimelineOnContradiction, hypothesisCatalog, seedProvocations } from '../../data/game/seedStory'
import { seedDocuments } from '../../data/game/seedDocuments'
import { evidenceSourceLabel } from '../../lib/labels'
import { seedEvidenceCatalog } from '../../data/game/seedEvidence'
import { block01MarianaChatIds } from '../../data/block01/marianaChats'
import { appDefinitions } from '../../data/game/seedApps'
import type { DiscoveryEvent, DiscoveryKind, InvestigationState, StoryActionRef } from '../types'
import { nameSearchTokens } from '../knowledge/knownTerms'
import { maxPersonStatus } from '../state/personStatusOrder'

/** Prioridade entre notices no mesmo lote (maior vence). */
const DISCOVERY_PRIORITY: Partial<Record<DiscoveryKind, number>> = {
  contradiction: 100,
  message: 90,
  location: 80,
  evidence: 70,
  document: 60,
  objective: 50,
  audio: 40,
  contact: 30,
  hypothesis: 20,
}

/** Empilha discovery (sem duplicar id). Áudios no mesmo lote agregam. */
export function withDiscovery(state: InvestigationState, ev: DiscoveryEvent): InvestigationState {
  if (state.discoveries.some((d) => d.id === ev.id)) return state
  if (ev.kind === 'audio') {
    const idx = state.discoveries.findIndex((d) => d.kind === 'audio')
    if (idx >= 0) {
      const prev = state.discoveries[idx]
      const count = (prev.count ?? 1) + 1
      const merged: DiscoveryEvent = {
        ...prev,
        title: 'Novos áudios na bancada',
        subtitle: `${count} arquivos adicionados à bancada`,
        count,
      }
      return { ...state, discoveries: state.discoveries.map((d, i) => (i === idx ? merged : d)) }
    }
  }
  return { ...state, discoveries: [...state.discoveries, ev] }
}

function discoveryPriority(ev: DiscoveryEvent): number {
  // DiscoveryCard consome o evento causal — vence qualquer notice do mesmo lote.
  if (ev.presentation === 'card') return 1000 + (DISCOVERY_PRIORITY[ev.kind] ?? 0)
  return DISCOVERY_PRIORITY[ev.kind] ?? 0
}

/** Mantém só o discovery novo de maior prioridade no lote. */
function collapseNewDiscoveries(
  before: DiscoveryEvent[],
  after: InvestigationState,
): InvestigationState {
  const beforeIds = new Set(before.map((d) => d.id))
  const retained = after.discoveries.filter((d) => beforeIds.has(d.id))
  const brandNew = after.discoveries.filter((d) => !beforeIds.has(d.id))
  if (brandNew.length <= 1) return after
  const best = brandNew.reduce((a, b) => (discoveryPriority(b) > discoveryPriority(a) ? b : a))
  return { ...after, discoveries: [...retained, best] }
}

function catalogEvidence(id: string) {
  return seedEvidenceCatalog.find((e) => e.id === id)
}

function defaultPhoneApps(device: 'mariana' | 'augusto') {
  return appDefinitions
    .filter((a) => a.preinstalled && (a.device === device || a.device === 'both'))
    .map((a) => a.id)
}

/** Helper para handlers: feedback visual explícito (opt-in). */
export function notifyUpdate(opts: {
  id: string
  kind: DiscoveryKind
  title: string
  subtitle?: string
  summary?: string
  label?: string
  refId?: string
  presentation?: 'card' | 'notice'
}): Extract<StoryActionRef, { type: 'notifyInvestigationUpdate' }> {
  return { type: 'notifyInvestigationUpdate', ...opts }
}

export function applyStoryActions(
  state: InvestigationState,
  actions: StoryActionRef[],
): InvestigationState {
  const beforeDiscoveries = state.discoveries
  let next = state
  for (const action of actions) {
    next = applyOne(next, action)
  }
  return collapseNewDiscoveries(beforeDiscoveries, next)
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
      const next = {
        ...state,
        evidence: { ...state.evidence, [action.id]: def },
        evidenceOwned: [...state.evidenceOwned, action.id],
      }
      // Evidência comum: silenciosa. Só áudio novo notifica a bancada.
      if (def.type !== 'audio') return next
      return withDiscovery(next, {
        id: `evidence:${action.id}`,
        kind: 'audio',
        title:
          def.sourceType === 'unknown-channel'
            ? 'Arquivo anônimo recebido'
            : (def.displayFileName ?? def.title),
        subtitle:
          def.sourceType === 'unknown-channel'
            ? 'Origem desconhecida · disponível na bancada'
            : 'Disponível na bancada de áudio',
        source: evidenceSourceLabel(def),
        summary: def.description,
        refId: action.id,
      })
    }
    case 'addDocument': {
      if (state.documentsOwned.includes(action.id)) return state
      const doc = seedDocuments.find((d) => d.id === action.id)
      if (!doc) return state
      // Sempre silencioso — feedback via notifyInvestigationUpdate quando o evento merecer.
      return { ...state, documentsOwned: [...state.documentsOwned, action.id] }
    }
    case 'completeCall':
      if (state.callsDone.includes(action.id)) return state
      return { ...state, callsDone: [...state.callsDone, action.id] }
    case 'discoverPerson': {
      const p = state.people[action.id]
      if (!p) return state
      const status = action.status ?? p.status
      const tokens = [...nameSearchTokens(p.name), ...(p.aliases ?? []).flatMap(nameSearchTokens)]
      const discovered = new Set(state.searchTermsDiscovered.map((t) => t.toLowerCase()))
      const newTerms = tokens.filter((t) => !discovered.has(t))
      return {
        ...state,
        people: {
          ...state.people,
          [action.id]: { ...p, status: maxPersonStatus(p.status, status) },
        },
        searchTermsDiscovered:
          newTerms.length > 0
            ? [...state.searchTermsDiscovered, ...newTerms]
            : state.searchTermsDiscovered,
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
      // Silencioso — badge no telefone; notify explícito se o evento precisar.
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
      // Silencioso — CaseNotepad + pulse.
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
      const moved = {
        ...state,
        phones: {
          ...state.phones,
          [action.device]: {
            ...phone,
            installedAppIds: [...phone.installedAppIds, action.appId],
          },
        },
      }
      if (action.appId === 'hidden-diary') {
        return withDiscovery(moved, {
          id: 'app:hidden-diary',
          kind: 'message',
          title: 'Aplicativo oculto restaurado',
          subtitle: 'Disponível no aparelho apreendido',
          refId: 'hidden-diary',
        })
      }
      return moved
    }
    case 'addHypothesis': {
      if (state.hypotheses[action.id]) return state
      const def = hypothesisCatalog.find((h) => h.id === action.id)
      if (!def) return state
      return {
        ...state,
        hypotheses: {
          ...state.hypotheses,
          [action.id]: {
            ...def,
            supportingEvidenceIds: [...def.supportingEvidenceIds],
            contradictingEvidenceIds: [...def.contradictingEvidenceIds],
          },
        },
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
    case 'confirmContradiction': {
      if (state.contradictionsConfirmed.some((c) => c.id === action.id)) return state
      const summary = contradictionDefs.find((c) => c.id === action.id)?.summary
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
          title: summary ?? 'Contradição registrada no caderno',
          summary,
          refId: action.id,
        },
      )
    }
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
    case 'notifyInvestigationUpdate':
      return withDiscovery(state, {
        id: `notify:${action.id}`,
        kind: action.kind,
        title: action.title,
        subtitle: action.subtitle,
        summary: action.summary,
        label: action.label,
        refId: action.refId,
        presentation: action.presentation ?? 'notice',
      })
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
