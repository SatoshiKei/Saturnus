import { dispatchActions, getInvestigationState } from '../state/investigationStore'
import type { StoryActionRef } from '../types'

/** Rafael encaminhou o áudio e o jogador o abriu no WhatsApp de Augusto. */
export function onRafaelForwardAudioPlayed() {
  const s = getInvestigationState()
  if (s.flags.block02_rafael_forward_received) return
  dispatchActions([
    { type: 'setFlag', id: 'block02_rafael_forward_received', value: true },
    { type: 'addEvidence', id: 'rafael_forward_from_mariana' },
    { type: 'completeTask', id: 'task_rafael_recording' },
  ])
}

export function runProvisionalRafaelForwardAnalysis() {
  const s = getInvestigationState()
  if (s.flags.block02_rafael_forward_provisional) return
  const hasSource =
    s.evidenceOwned.includes('rafael_forward_from_mariana') ||
    s.evidenceOwned.includes('rafael_audio_reply')
  if (!hasSource) return
  dispatchActions([
    { type: 'setFlag', id: 'block02_rafael_forward_provisional', value: true },
    { type: 'addEvidence', id: 'rafael_recording_vertice_tag' },
    { type: 'unlockLocation', id: 'vertice', status: 'visitAvailable' },
    { type: 'addTask', id: 'task_vertice_dj', label: 'Descobrir quem trabalhava no Vértice quando a gravação foi feita' },
    {
      type: 'notifyInvestigationUpdate',
      id: 'ach-iapetus',
      kind: 'evidence',
      presentation: 'card',
      label: 'CONQUISTA',
      title: 'IAPETUS',
      summary: 'Reconstruiu a estrutura do áudio de Rafael.',
      refId: 'rafael_recording_vertice_tag',
    },
  ])
}

export function completeVerticeTopic(topicFlag: string, actions: StoryActionRef[] = []) {
  const s = getInvestigationState()
  if (s.flags[topicFlag]) return
  dispatchActions([{ type: 'setFlag', id: topicFlag, value: true }, ...actions])
}

export function finishVerticeArchive() {
  const s = getInvestigationState()
  if (s.flags.block02_vertice_archive) return
  dispatchActions([
    { type: 'setFlag', id: 'block02_vertice_archive', value: true },
    { type: 'addDocument', id: 'doc-vertice-escala' },
    // Gravação original + registros de set → Puzzle 03 (ANÉIS) identifica o operador.
    { type: 'addEvidence', id: 'rec_vtx_old_01' },
    { type: 'addTask', id: 'task_match_vertice_set', label: 'Identificar o set correspondente à gravação antiga' },
    { type: 'completeTask', id: 'task_rafael_venue_staff' },
  ])
}

/** Puzzle 03 — ANÉIS: gravação ligada ao set de Nico. */
export function runProvisionalRingsAnalysis() {
  const s = getInvestigationState()
  if (s.flags.block02_rings_provisional) return
  if (!s.evidenceOwned.includes('rec_vtx_old_01')) return
  dispatchActions([
    { type: 'setFlag', id: 'block02_rings_provisional', value: true },
    { type: 'addEvidence', id: 'nico_dj_identified' },
    { type: 'addEvidence', id: 'rec_vtx_set_nico_match' },
    { type: 'discoverPerson', id: 'nico', status: 'identified' },
    { type: 'completeTask', id: 'task_vertice_dj' },
    { type: 'completeTask', id: 'task_match_vertice_set' },
    {
      type: 'notifyInvestigationUpdate',
      id: 'ach-rings',
      kind: 'evidence',
      presentation: 'card',
      label: 'CONQUISTA',
      title: 'ANÉIS',
      summary: 'Identificou o set correspondente à gravação antiga.',
      refId: 'rec_vtx_set_nico_match',
    },
  ])
}

export function finishLucasInterview() {
  const s = getInvestigationState()
  // Sempre marca o local como visitado (também repara save antigo com pino ainda visitável).
  const markVisited = { type: 'unlockLocation' as const, id: 'universidade', status: 'visited' as const }
  if (s.flags.block02_lucas_interview_done) {
    if (s.locations.universidade?.status === 'visitAvailable') dispatchActions([markVisited])
    return
  }
  const actions: StoryActionRef[] = [
    { type: 'setFlag', id: 'block02_lucas_interview_done', value: true },
    { type: 'addEvidence', id: 'lucas_knew_elisa' },
    { type: 'addEvidence', id: 'mariana_andre_innocence' },
    { type: 'discoverPerson', id: 'lucas', status: 'interviewed' },
    { type: 'discoverPerson', id: 'elisa', status: 'identified' },
    { type: 'discoverSearchTerm', term: 'elisa' },
    { type: 'setFlag', id: 'block02_elisa_search_unlocked', value: true },
    { type: 'addHypothesis', id: 'hyp_voluntary_disappearance' },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_voluntary_disappearance',
      evidenceId: 'mariana_andre_innocence',
      role: 'support',
    },
    markVisited,
  ]
  // Se Nico já foi visitado cedo, reabre o Titã para a conversa completa.
  if (s.flags.nico_early_done) {
    actions.push({ type: 'unlockLocation', id: 'titan', status: 'visitAvailable' })
  }
  dispatchActions(actions)
}
