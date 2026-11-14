import { verticeTopicFlags, type VerticeTopicId } from '../../data/block02/verticeInterview'
import { dispatchActions, getInvestigationState, setFlag } from '../state/investigationStore'
import type { StoryActionRef } from '../types'

/**
 * Rafael envia a gravação da balada (P3) — NÃO a própria mensagem de voz do P2.
 * Cadeia: Mariana → Rafael → Augusto.
 */
export function onRafaelClubAudioPlayed() {
  const s = getInvestigationState()
  if (s.flags.block02_rafael_club_received || s.flags.block02_rafael_forward_received) {
    // Já recebeu (flag nova ou legado do forward).
    if (!s.evidenceOwned.includes('rec_vtx_old_01')) {
      dispatchActions([{ type: 'addEvidence', id: 'rec_vtx_old_01' }])
    }
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block02_rafael_club_received', value: true },
    // Legado: testes/saves antigos ainda leem este flag como “áudio recebido de Rafael”.
    { type: 'setFlag', id: 'block02_rafael_forward_received', value: true },
    { type: 'addEvidence', id: 'rec_vtx_old_01' },
    { type: 'completeTask', id: 'task_rafael_recording' },
    {
      type: 'addTask',
      id: 'task_match_vertice_set',
      label: 'Analisar a gravação da balada e extrair a transição musical',
    },
  ])
}

/** @deprecated alias — preferir onRafaelClubAudioPlayed */
export function onRafaelForwardAudioPlayed() {
  onRafaelClubAudioPlayed()
}

/** P2 — Iapetus: áudio de Rafael no celular de Mariana → Vértice + mídia original ausente. */
export function runProvisionalRafaelForwardAnalysis() {
  const s = getInvestigationState()
  if (s.flags.block02_rafael_forward_provisional) return
  const hasSource =
    s.evidenceOwned.includes('rafael_audio_reply') ||
    s.evidenceOwned.includes('rafael_voice_to_augusto')
  if (!hasSource) return
  dispatchActions([
    { type: 'setFlag', id: 'block02_rafael_forward_provisional', value: true },
    { type: 'addEvidence', id: 'rafael_recording_vertice_tag' },
    { type: 'addEvidence', id: 'mariana_club_recording_missing' },
    { type: 'unlockLocation', id: 'vertice', status: 'visitAvailable' },
    {
      type: 'addTask',
      id: 'task_vertice_dj',
      label: 'Investigar o Vértice — o que Mariana perguntou lá',
    },
    {
      type: 'addTask',
      id: 'task_rafael_recording',
      label: 'Recuperar a gravação original que Mariana enviou a Rafael',
    },
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

/** Conclui um tópico da visita ao Vértice (mesma lógica da cena). */
export function completeVerticeTopicById(topic: VerticeTopicId) {
  const flag = verticeTopicFlags[topic]
  if (topic === 'iara') {
    completeVerticeTopic(flag, [
      { type: 'addEvidence', id: 'mariana_vertice_visit' },
      { type: 'addEvidence', id: 'mariana_repeated_questions' },
    ])
  } else if (topic === 'archive') {
    finishVerticeArchive()
    setFlag(flag, true)
  } else if (topic === 'set_crossref') {
    finishVerticeSetCrossRef()
    setFlag(flag, true)
  } else {
    completeVerticeTopic(flag)
  }
}

export function finishVerticeVisit() {
  const s = getInvestigationState()
  // Se P3 técnico está pronto e a 2ª visita ainda não ocorreu, manter visitável.
  const needsSecond =
    s.flags.block02_rings_provisional && !s.flags.block02_vertice_set_crossref
  dispatchActions([
    {
      type: 'unlockLocation',
      id: 'vertice',
      status: needsSecond ? 'visitAvailable' : 'visited',
    },
    { type: 'setFlag', id: 'block02_vertice_visit_done', value: true },
  ])
}

/**
 * 1ª visita — arquivos históricos EXISTEM (contexto).
 * NÃO entrega áudio P3, NÃO identifica Nico.
 */
export function finishVerticeArchive() {
  const s = getInvestigationState()
  if (s.flags.block02_vertice_archive) return
  dispatchActions([
    { type: 'setFlag', id: 'block02_vertice_archive', value: true },
    { type: 'addDocument', id: 'doc-vertice-escala' },
    { type: 'completeTask', id: 'task_rafael_venue_staff' },
    {
      type: 'addTask',
      id: 'task_get_club_from_rafael',
      label: 'Pedir a Rafael a gravação original que Mariana lhe enviou',
    },
  ])
}

/**
 * P3 — ANÉIS (técnico): fingerprints A→B / chave de busca.
 * NÃO identifica Nico. Reabre Vértice para cruzamento institucional.
 */
export function runProvisionalRingsAnalysis() {
  const s = getInvestigationState()
  if (s.flags.block02_rings_provisional) return
  if (!s.evidenceOwned.includes('rec_vtx_old_01')) return
  dispatchActions([
    { type: 'setFlag', id: 'block02_rings_provisional', value: true },
    { type: 'addEvidence', id: 'rec_vtx_fingerprint_transition' },
    { type: 'completeTask', id: 'task_match_vertice_set' },
    { type: 'unlockLocation', id: 'vertice', status: 'visitAvailable' },
    {
      type: 'addTask',
      id: 'task_vertice_cross_reference',
      label: 'Cruzar a transição A→B com os registros históricos do Vértice',
    },
    {
      type: 'notifyInvestigationUpdate',
      id: 'ach-rings',
      kind: 'evidence',
      presentation: 'card',
      label: 'CONQUISTA',
      title: 'ANÉIS',
      summary: 'Extraiu a transição musical A→B da gravação da balada.',
      refId: 'rec_vtx_fingerprint_transition',
    },
  ])
}

/**
 * 2ª visita — cruzamento institucional → Nico.
 * Só após análise técnica do P3.
 */
export function finishVerticeSetCrossRef() {
  const s = getInvestigationState()
  if (s.flags.block02_vertice_set_crossref) return
  if (!s.flags.block02_rings_provisional) return
  dispatchActions([
    { type: 'setFlag', id: 'block02_vertice_set_crossref', value: true },
    { type: 'addEvidence', id: 'nico_dj_identified' },
    { type: 'addEvidence', id: 'rec_vtx_set_nico_match' },
    { type: 'discoverPerson', id: 'nico', status: 'identified' },
    { type: 'discoverSearchTerm', term: 'nico' },
    { type: 'setFlag', id: 'block03_nico_search_unlocked', value: true },
    { type: 'completeTask', id: 'task_vertice_dj' },
    { type: 'completeTask', id: 'task_vertice_cross_reference' },
    {
      type: 'addTask',
      id: 'task_locate_nico',
      label: 'Localizar Nico',
    },
    { type: 'unlockLocation', id: 'vertice', status: 'visited' },
  ])
}

export function finishLucasInterview() {
  const s = getInvestigationState()
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
  if (s.flags.nico_early_done) {
    actions.push({ type: 'unlockLocation', id: 'titan', status: 'visitAvailable' })
  }
  dispatchActions(actions)
}
