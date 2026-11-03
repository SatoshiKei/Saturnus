import { dispatchActions, getInvestigationState } from '../state/investigationStore'
import type { StoryActionRef } from '../types'

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

export function onPaulaAugustoChatOpened() {
  const s = getInvestigationState()
  if (s.flags.block02_paula_chat_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block02_paula_chat_done', value: true },
    { type: 'addEvidence', id: 'paula_leads_lucas' },
    { type: 'discoverPerson', id: 'lucas', status: 'contactable' },
    { type: 'setFlag', id: 'block02_lucas_available', value: true },
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
    { type: 'linkHypothesis', hypothesisId: 'hyp_voluntary_disappearance', evidenceId: 'mariana_andre_innocence', role: 'support' },
  ])
}

export function applyPoliceSearchHit(evidenceId: string) {
  const s = getInvestigationState()
  if (!evidenceId || s.evidenceOwned.includes(evidenceId)) return
  const actions: StoryActionRef[] = [{ type: 'addEvidence', id: evidenceId }]
  if (evidenceId === 'elisa_case_summary') {
    actions.push(
      { type: 'discoverPerson', id: 'elisa', status: 'identified' },
      { type: 'discoverPerson', id: 'andre', status: 'identified' },
    )
  }
  dispatchActions(actions)
  tryRegisterConvergence()
}

export function tryRegisterConvergence() {
  const s = getInvestigationState()
  if (s.flags.block02_convergence_done) return
  const need = ['nico_dj_identified', 'paula_leads_lucas', 'elisa_case_summary', 'nico_elisa_witness']
  if (!need.every((id) => s.evidenceOwned.includes(id))) return
  dispatchActions([
    { type: 'setFlag', id: 'block02_convergence_done', value: true },
    { type: 'addEvidence', id: 'mariana_rebuilding_elisa_case' },
    { type: 'addHypothesis', id: 'hyp_own_investigation' },
    { type: 'updateHypothesis', id: 'hyp_own_investigation', state: 'confirmed' },
    { type: 'linkHypothesis', hypothesisId: 'hyp_own_investigation', evidenceId: 'mariana_rebuilding_elisa_case', role: 'support' },
    { type: 'linkHypothesis', hypothesisId: 'hyp_voluntary_disappearance', evidenceId: 'mariana_rebuilding_elisa_case', role: 'support' },
    { type: 'replaceTasks', tasks: [{ id: 'task_locate_nico', label: 'Localizar Nico — testemunha do caso Elisa', completed: false }] },
    { type: 'setFlag', id: 'block02_complete', value: true },
  ])
}
