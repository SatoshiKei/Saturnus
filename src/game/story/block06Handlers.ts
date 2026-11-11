import { dispatchActions, getInvestigationState } from '../state/investigationStore'
import type { StoryActionRef } from '../types'
import { PASTOR_LOCATION_ID, PASTOR_TOKEN } from '../../data/block06/pastorMoonsPuzzle'

export function startBlock06() {
  const s = getInvestigationState()
  if (s.flags.block06_started) return
  if (!s.flags.block05_complete && !s.flags.block06_entry_ready) return
  dispatchActions([
    { type: 'setFlag', id: 'block06_started', value: true },
    { type: 'setFlag', id: 'block06_geraldo_search_unlocked', value: true },
    { type: 'discoverSearchTerm', term: 'geraldo' },
    // Reabre Geraldo se a visita precoce já tinha marcado o local como visitado.
    { type: 'unlockLocation', id: 'geraldo-casa', status: 'visitAvailable' },
  ])
}

export function finishGeraldoInterview() {
  const s = getInvestigationState()
  const markVisited = { type: 'unlockLocation' as const, id: 'geraldo-casa', status: 'visited' as const }
  if (s.flags.block06_geraldo_interview_done) {
    if (s.locations['geraldo-casa']?.status === 'visitAvailable') dispatchActions([markVisited])
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block06_geraldo_interview_done', value: true },
    { type: 'discoverPerson', id: 'geraldo', status: 'interviewed' },
    { type: 'addEvidence', id: 'geraldo_minimized_alcohol' },
    { type: 'addEvidence', id: 'elisa_more_alcohol_than_stated' },
    { type: 'addEvidence', id: 'geraldo_suspected_underage' },
    { type: 'completeTask', id: 'task_reexamine_elisa_from_scratch' },
    { type: 'completeTask', id: 'task_talk_geraldo' },
    markVisited,
    { type: 'setFlag', id: 'block06_refl_geraldo_pending', value: true },
  ])
}

export function onGeraldoReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block06_geraldo_reflection_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block06_geraldo_reflection_done', value: true },
    { type: 'setFlag', id: 'block06_refl_geraldo_pending', value: false },
    { type: 'unlockLocation', id: 'jana-casa', status: 'visitAvailable' },
    {
      type: 'addTask',
      id: 'task_press_jana_again',
      label: 'Voltar a falar com Jana — jaqueta e condição de Elisa',
    },
  ])
}

export function finishJanaFollowup() {
  const s = getInvestigationState()
  if (s.flags.block06_jana_followup_done) {
    if (s.locations['jana-casa']?.status === 'visitAvailable') {
      dispatchActions([{ type: 'unlockLocation', id: 'jana-casa', status: 'visited' }])
    }
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block06_jana_followup_done', value: true },
    { type: 'addEvidence', id: 'jana_gave_belongings_deliberately' },
    { type: 'addEvidence', id: 'jana_feared_valter_people' },
    { type: 'addHypothesis', id: 'hyp_jana_hid_info' },
    { type: 'updateHypothesis', id: 'hyp_jana_hid_info', state: 'confirmed' },
    { type: 'addHypothesis', id: 'hyp_follower_sought_jana' },
    { type: 'completeTask', id: 'task_press_jana_again' },
    { type: 'unlockLocation', id: 'jana-casa', status: 'visited' },
    { type: 'discoverPerson', id: 'valter', status: 'identified' },
    { type: 'setFlag', id: 'block06_valter_search_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_investigate_valter',
      label: 'Investigar Válter e a estrutura criminosa ligada a ele',
    },
  ])
}

/** Depois de abrir as peças-chave de Válter / Miro. */
export function onValterTrailComplete() {
  const s = getInvestigationState()
  if (s.flags.block06_valter_trail_done) return
  const need = ['valter_criminal_structure', 'miro_linked_to_valter_group', 'valter_group_active_intercepts']
  if (!need.every((id) => s.evidenceOwned.includes(id))) return
  dispatchActions([
    { type: 'setFlag', id: 'block06_valter_trail_done', value: true },
    { type: 'completeTask', id: 'task_investigate_valter' },
    { type: 'discoverPerson', id: 'miro', status: 'identified' },
    { type: 'setFlag', id: 'block06_pastor_available', value: true },
    {
      type: 'addTask',
      id: 'task_pastor_moons',
      label: 'Analisar as interceptações de rádio (bancada) — localizar a entrega',
    },
  ])
}

export function onPastorMoonsSolved() {
  const s = getInvestigationState()
  if (s.flags.block06_pastor_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block06_pastor_done', value: true },
    { type: 'addEvidence', id: 'pastor_token_g17n' },
    { type: 'addEvidence', id: 'galpao17_operational_site' },
    { type: 'completeTask', id: 'task_pastor_moons' },
    { type: 'unlockLocation', id: PASTOR_LOCATION_ID, status: 'visitAvailable' },
    {
      type: 'addTask',
      id: 'task_valter_operation',
      label: `Deflagrar operação no ponto ${PASTOR_TOKEN} — ${PASTOR_LOCATION_ID}`,
    },
    { type: 'setFlag', id: 'block06_operation_ready', value: true },
  ])
}

export function finishPoliceOperation() {
  const s = getInvestigationState()
  if (s.flags.block06_operation_done) {
    if (s.locations[PASTOR_LOCATION_ID]?.status === 'visitAvailable') {
      dispatchActions([{ type: 'unlockLocation', id: PASTOR_LOCATION_ID, status: 'visited' }])
    }
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block06_operation_done', value: true },
    { type: 'addEvidence', id: 'miro_arrested_current_crimes' },
    { type: 'completeTask', id: 'task_valter_operation' },
    { type: 'unlockLocation', id: PASTOR_LOCATION_ID, status: 'visited' },
    { type: 'discoverPerson', id: 'miro', status: 'located' },
    { type: 'unlockLocation', id: 'detencao-miro', status: 'visitAvailable' },
    {
      type: 'addTask',
      id: 'task_interview_miro',
      label: 'Interrogar Miro na detenção — Noite X',
    },
  ])
}

export function finishMiroInterview() {
  const s = getInvestigationState()
  const markVisited = {
    type: 'unlockLocation' as const,
    id: 'detencao-miro',
    status: 'visited' as const,
  }
  if (s.flags.block06_miro_interview_done) {
    if (s.locations['detencao-miro']?.status === 'visitAvailable') dispatchActions([markVisited])
    return
  }
  const actions: StoryActionRef[] = [
    { type: 'setFlag', id: 'block06_miro_interview_done', value: true },
    { type: 'discoverPerson', id: 'miro', status: 'interviewed' },
    { type: 'addEvidence', id: 'miro_sought_jana_night_x' },
    { type: 'addEvidence', id: 'miro_followed_elisa_by_mistake' },
    { type: 'addEvidence', id: 'miro_denies_killing_elisa' },
    { type: 'addEvidence', id: 'miro_descended_fall_area' },
    { type: 'addEvidence', id: 'miro_recovered_jana_bag' },
    { type: 'setFlag', id: 'block07_miro_followup_done', value: true },
    { type: 'setFlag', id: 'block07_miro2_gap', value: true },
    { type: 'setFlag', id: 'block07_miro2_descent', value: true },
    { type: 'setFlag', id: 'block07_miro2_bag', value: true },
    { type: 'setFlag', id: 'block07_miro2_deny', value: true },
    { type: 'completeTask', id: 'task_press_miro_further' },
    { type: 'addHypothesis', id: 'hyp_miro_may_be_involved_elisa' },
    { type: 'completeTask', id: 'task_interview_miro' },
    markVisited,
    { type: 'addHypothesis', id: 'hyp_miro_followed_to_fall' },
    { type: 'updateHypothesis', id: 'hyp_miro_followed_to_fall', state: 'confirmed' },
    { type: 'addHypothesis', id: 'hyp_lookalike_may_not_be_andre' },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_miro_followed_to_fall',
      evidenceId: 'miro_followed_elisa_by_mistake',
      role: 'support',
    },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_lookalike_may_not_be_andre',
      evidenceId: 'miro_followed_elisa_by_mistake',
      role: 'support',
    },
    { type: 'updateHypothesis', id: 'hyp_andre_imprecise_chronology', state: 'active' },
    // André permanece plausível, mas perde força relativa.
    { type: 'addHypothesis', id: 'hyp_andre_killed_elisa' },
    { type: 'updateHypothesis', id: 'hyp_andre_killed_elisa', state: 'weakened' },
    { type: 'addHypothesis', id: 'hyp_mariana_right_on_ignored_aspects' },
    { type: 'updateHypothesis', id: 'hyp_mariana_right_on_ignored_aspects', state: 'confirmed' },
    { type: 'setFlag', id: 'block06_refl_miro_pending', value: true },
    {
      type: 'notifyInvestigationUpdate',
      id: 'miro-followed-elisa',
      kind: 'evidence',
      presentation: 'card',
      label: 'EVIDÊNCIA REGISTRADA',
      title: 'Miro esteve na trajetória de Elisa',
      summary: 'A admissão de Miro altera a reconstrução que condenou André.',
      refId: 'miro_followed_elisa_by_mistake',
    },
  ]
  dispatchActions(actions)
}

export function onMiroReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block06_complete) return
  dispatchActions([
    { type: 'setFlag', id: 'block06_miro_reflection_done', value: true },
    { type: 'setFlag', id: 'block06_refl_miro_pending', value: false },
    { type: 'setFlag', id: 'block06_complete', value: true },
    { type: 'setFlag', id: 'block07_entry_ready', value: true },
    { type: 'setFlag', id: 'block07_started', value: true },
    { type: 'setFlag', id: 'block07_sandra_search_unlocked', value: true },
    { type: 'discoverSearchTerm', term: 'sandra' },
    {
      type: 'replaceTasks',
      tasks: [
        {
          id: 'task_locate_sandra',
          label: 'Quem Sandra viu voltando da região da queda?',
          completed: false,
        },
      ],
    },
  ])
}
