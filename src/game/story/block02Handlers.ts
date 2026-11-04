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
  if (!s.evidenceOwned.includes('rafael_forward_from_mariana')) return
  dispatchActions([
    { type: 'setFlag', id: 'block02_rafael_forward_provisional', value: true },
    { type: 'addEvidence', id: 'rafael_recording_vertice_tag' },
    { type: 'unlockLocation', id: 'vertice', status: 'visitAvailable' },
    { type: 'addTask', id: 'task_vertice_dj', label: 'Descobrir quem trabalhava no Vértice quando a gravação foi feita' },
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
    { type: 'addEvidence', id: 'nico_dj_identified' },
    { type: 'discoverPerson', id: 'nico', status: 'identified' },
    { type: 'completeTask', id: 'task_vertice_dj' },
    { type: 'completeTask', id: 'task_rafael_venue_staff' },
  ])
}

export function finishLucasInterview() {
  const s = getInvestigationState()
  if (s.flags.block02_lucas_interview_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block02_lucas_interview_done', value: true },
    { type: 'addEvidence', id: 'lucas_knew_elisa' },
    { type: 'addEvidence', id: 'mariana_andre_innocence' },
    { type: 'discoverPerson', id: 'lucas', status: 'interviewed' },
    { type: 'setFlag', id: 'block02_elisa_search_unlocked', value: true },
    { type: 'addHypothesis', id: 'hyp_voluntary_disappearance' },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_voluntary_disappearance',
      evidenceId: 'mariana_andre_innocence',
      role: 'support',
    },
  ])
}
