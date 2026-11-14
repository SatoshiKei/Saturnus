import { hypothesisCatalog } from '../../data/game/seedStory'
import {
  dispatchActions,
  getInvestigationState,
  setFlag,
} from '../state/investigationStore'
import type { StoryActionRef } from '../types'

export function registerInitialPoliceReport() {
  const s = getInvestigationState()
  if (s.flags.block01_bo_registered) return
  const actions: StoryActionRef[] = [
    { type: 'setFlag', id: 'block01_bo_registered', value: true },
    { type: 'addEvidence', id: 'initial_police_report' },
    { type: 'addEvidence', id: 'mariana_phone' },
    { type: 'addEvidence', id: 'emergency_call_raw' },
    { type: 'discoverPerson', id: 'mariana', status: 'identified' },
    { type: 'discoverPerson', id: 'julia', status: 'mentioned' },
    { type: 'discoverPerson', id: 'diego', status: 'mentioned' },
    { type: 'addHypothesis', id: 'hyp_kidnapping' },
    { type: 'linkHypothesis', hypothesisId: 'hyp_kidnapping', evidenceId: 'emergency_call_raw', role: 'support' },
    { type: 'linkHypothesis', hypothesisId: 'hyp_kidnapping', evidenceId: 'mariana_phone', role: 'support' },
    { type: 'completeTask', id: 'task_review_bo' },
    { type: 'addDocument', id: 'doc-central-chamada' },
    { type: 'addDocument', id: 'doc-entrada-apartamento' },
    { type: 'addDocument', id: 'doc-apreensao-celular' },
    { type: 'addDocument', id: 'doc-extracao-inicial' },
    {
      type: 'notifyInvestigationUpdate',
      id: 'bo-registered',
      kind: 'evidence',
      presentation: 'card',
      label: 'EVIDÊNCIA REGISTRADA',
      title: 'BO — desaparecimento de Mariana Silva',
      summary: 'A ocorrência inicial foi incorporada ao caderno de investigação.',
      refId: 'initial_police_report',
    },
  ]
  dispatchActions(actions)
}

export function onMarianaPhoneOpened() {
  const s = getInvestigationState()
  if (s.flags.block01_mariana_phone_opened) return
  setFlag('block01_mariana_phone_opened', true)
  if (!s.evidenceOwned.includes('call_history_gap')) {
    dispatchActions([{ type: 'addEvidence', id: 'call_history_gap' }])
  }
}

export function onMarianaPhoneClosed() {
  const s = getInvestigationState()
  if (!s.flags.block01_mariana_phone_opened || s.flags.block01_phone_reviewed) return
  if (s.flags.block01_julia_memory && s.flags.block01_rafael_memory) {
    setFlag('block01_phone_reviewed', true)
  }
}

export function onJuliaChatReviewed() {
  const s = getInvestigationState()
  if (s.flags.block01_julia_memory) return
  dispatchActions([
    { type: 'setFlag', id: 'block01_julia_memory', value: true },
    { type: 'addEvidence', id: 'mariana_memory_lapses' },
    { type: 'addHypothesis', id: 'hyp_memory' },
    { type: 'linkHypothesis', hypothesisId: 'hyp_memory', evidenceId: 'mariana_memory_lapses', role: 'support' },
  ])
}

export function onRafaelAudioPlayed() {
  const s = getInvestigationState()
  const actions: StoryActionRef[] = []
  if (!s.evidenceOwned.includes('rafael_audio_reply')) {
    actions.push({ type: 'addEvidence', id: 'rafael_audio_reply' })
  }
  if (!s.flags.block01_rafael_memory) {
    actions.push(
      { type: 'setFlag', id: 'block01_rafael_memory', value: true },
      { type: 'addEvidence', id: 'rafael_call_memory' },
      { type: 'addHypothesis', id: 'hyp_own_investigation' },
      { type: 'linkHypothesis', hypothesisId: 'hyp_own_investigation', evidenceId: 'rafael_call_memory', role: 'support' },
    )
  }
  if (actions.length) dispatchActions(actions)
}

export function onNoteRead(storyFlag: string) {
  const s = getInvestigationState()
  if (s.flags[storyFlag]) return
  const actions: StoryActionRef[] = [{ type: 'setFlag', id: storyFlag, value: true }]
  if (s.hypotheses.hyp_memory) {
    actions.push({
      type: 'linkHypothesis',
      hypothesisId: 'hyp_memory',
      evidenceId: 'mariana_memory_lapses',
      role: 'support',
    })
  }
  dispatchActions(actions)
}

/** Fim da visita ao hospital (Júlia + Camila ouvidas). */
export function finishHospitalVisit() {
  const s = getInvestigationState()
  if (s.flags.block01_hospital_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block01_hospital_done', value: true },
    { type: 'setFlag', id: 'block01_renata_seen', value: true },
    { type: 'addEvidence', id: 'camila_witness_note' },
    { type: 'unlockContact', contactId: 'contact-fernanda' },
    { type: 'unlockLocation', id: 'hospital', status: 'visited' },
  ])
}

export function runProvisionalEmergencyAnalysis() {
  const s = getInvestigationState()
  if (s.flags.block01_emergency_provisional) return
  const actions: import('../types').StoryActionRef[] = [
    { type: 'setFlag', id: 'block01_emergency_provisional', value: true },
    { type: 'addEvidence', id: 'emergency_call_restored' },
    { type: 'linkHypothesis', hypothesisId: 'hyp_kidnapping', evidenceId: 'emergency_call_restored', role: 'support' },
    { type: 'completeTask', id: 'task_listen_emergency' },
    { type: 'addTask', id: 'task_trace_emergency_call', label: 'Determinar como a chamada foi realizada' },
    {
      type: 'notifyInvestigationUpdate',
      id: 'ach-cassini-division',
      kind: 'evidence',
      presentation: 'card',
      label: 'CONQUISTA',
      title: 'DIVISÃO DE CASSINI',
      summary: 'Recuperou os cinco fragmentos inteligíveis da chamada de emergência.',
      refId: 'emergency_call_restored',
    },
  ]
  // Se o registro da central já foi lido, a origem técnica já está estabelecida.
  if (s.documents['doc-central-chamada']?.read) {
    actions.push({ type: 'completeTask', id: 'task_trace_emergency_call' })
  }
  dispatchActions(actions)
}

/** Garante hipótese no estado (catálogo). */
export function hypothesisDef(id: string) {
  return hypothesisCatalog.find((h) => h.id === id)
}
