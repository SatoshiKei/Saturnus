import { dispatchActions, getInvestigationState } from '../state/investigationStore'
import type { StoryActionRef } from '../types'

/** Entrada do Bloco 5 a partir do fim real do Bloco 4. */
export function startBlock05() {
  const s = getInvestigationState()
  if (s.flags.block05_started) {
    if (s.locations.titan?.status === 'visited' && s.flags.block04_complete) {
      dispatchActions([{ type: 'unlockLocation', id: 'titan', status: 'visitAvailable' }])
    }
    return
  }
  if (!s.flags.block04_complete) return
  dispatchActions([
    { type: 'setFlag', id: 'block05_started', value: true },
    { type: 'unlockLocation', id: 'titan', status: 'visitAvailable' },
    { type: 'setFlag', id: 'block05_jana_search_unlocked', value: false },
  ])
}

export function finishNicoFollowup() {
  const s = getInvestigationState()
  if (s.flags.block05_nico_followup_done) {
    if (s.locations.titan?.status === 'visitAvailable') {
      dispatchActions([{ type: 'unlockLocation', id: 'titan', status: 'visited' }])
    }
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block05_nico_followup_done', value: true },
    { type: 'addEvidence', id: 'nico_believes_jacket_jana' },
    { type: 'completeTask', id: 'task_press_nico' },
    { type: 'setFlag', id: 'block05_jana_search_unlocked', value: true },
    { type: 'unlockLocation', id: 'titan', status: 'visited' },
    {
      type: 'addTask',
      id: 'task_locate_jana',
      label: 'Quem era Jana na noite em que Elisa morreu?',
    },
  ])
}

export function finishJanaInterview() {
  const s = getInvestigationState()
  const markVisited = { type: 'unlockLocation' as const, id: 'jana-casa', status: 'visited' as const }
  if (s.flags.block05_jana_interview_done) {
    if (s.locations['jana-casa']?.status === 'visitAvailable') dispatchActions([markVisited])
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block05_jana_interview_done', value: true },
    { type: 'discoverPerson', id: 'jana', status: 'interviewed' },
    { type: 'addEvidence', id: 'jana_confirms_jacket' },
    { type: 'addEvidence', id: 'jana_loan_explanation' },
    { type: 'completeTask', id: 'task_talk_jana' },
    markVisited,
    { type: 'setFlag', id: 'block05_elisa_review_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_review_elisa_autos',
      label: 'Testar a cronologia do caso Elisa',
    },
  ])
}

/** Depois de abrir as peças-chave do processo Elisa. */
export function onElisaReviewComplete() {
  const s = getInvestigationState()
  if (s.flags.block05_elisa_review_done) return
  const need = ['elisa_argument_jealousy', 'elisa_weak_alibi', 'elisa_lookalike_near_fall']
  if (!need.every((id) => s.evidenceOwned.includes(id))) return
  dispatchActions([
    { type: 'setFlag', id: 'block05_elisa_review_done', value: true },
    { type: 'completeTask', id: 'task_review_elisa_autos' },
    { type: 'addHypothesis', id: 'hyp_mariana_needed_brother' },
    { type: 'setFlag', id: 'block05_refl_andre_pending', value: true },
    {
      type: 'addTask',
      id: 'task_weigh_maralto_line',
      label: 'Entender o que Mariana investigava além de Elisa',
    },
  ])
}

export function onAndreStillGuiltyReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block05_andre_reflection_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block05_andre_reflection_done', value: true },
    { type: 'setFlag', id: 'block05_refl_andre_pending', value: false },
    { type: 'setFlag', id: 'block05_maralto_review_unlocked', value: true },
  ])
}

export function onMaraltoLineWeighed() {
  const s = getInvestigationState()
  if (s.flags.block05_maralto_weighed) return
  dispatchActions([
    { type: 'setFlag', id: 'block05_maralto_weighed', value: true },
    { type: 'completeTask', id: 'task_weigh_maralto_line' },
    { type: 'addHypothesis', id: 'hyp_one_line_distraction' },
    {
      type: 'addTask',
      id: 'task_mariana_contact_chronology',
      label: 'Entender a ordem em que Mariana procurou as pessoas',
    },
  ])
  onMaraltoReflectionDone()
}

/** Saves antigos que ficaram nas micro-reflections B5 — conclui flags sem cena. */
export function absorbLegacyB5MicroReflections() {
  const s = getInvestigationState()
  if (s.flags.block05_refl_maralto_pending && !s.flags.block05_maralto_reflection_done) {
    onMaraltoReflectionDone()
  }
  const s2 = getInvestigationState()
  if (s2.flags.block05_refl_coincidence_pending && !s2.flags.block05_coincidence_reflection_done) {
    onCoincidenceReflectionDone()
  }
}

export function onMaraltoReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block05_maralto_reflection_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block05_maralto_reflection_done', value: true },
    { type: 'setFlag', id: 'block05_refl_maralto_pending', value: false },
    { type: 'setFlag', id: 'block05_chronology_action_unlocked', value: true },
  ])
}

/** Disparado ao revisar a Timeline do caderno no ponto certo do Bloco 5. */
export function organizeMarianaContactChronology() {
  const s = getInvestigationState()
  if (s.flags.block05_chronology_done) return
  if (!s.flags.block05_chronology_action_unlocked) return
  dispatchActions([
    { type: 'setFlag', id: 'block05_chronology_done', value: true },
    { type: 'addEvidence', id: 'mariana_sought_people_before' },
    { type: 'completeTask', id: 'task_mariana_contact_chronology' },
    {
      type: 'addTask',
      id: 'task_compare_phone_files',
      label: 'Os arquivos do celular seguem a mesma ordem da investigação?',
    },
    { type: 'setFlag', id: 'block05_compare_unlocked', value: true },
  ])
}

/** Disparado ao abrir Arquivos no celular de Mariana (1 interação representativa). */
export function comparePhoneFilesSequence() {
  const s = getInvestigationState()
  if (s.flags.block05_compare_done) return
  if (!s.flags.block05_chronology_done || !s.flags.block05_compare_unlocked) return
  dispatchActions([
    { type: 'setFlag', id: 'block05_compare_done', value: true },
    { type: 'addEvidence', id: 'phone_files_depend_on_order' },
    { type: 'completeTask', id: 'task_compare_phone_files' },
  ])
  onCoincidenceReflectionDone()
}

/** Depois da reflexão “pode ser coincidência”: testar voltando à chamada inicial. */
export function onCoincidenceReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block05_coincidence_reflection_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block05_coincidence_reflection_done', value: true },
    { type: 'setFlag', id: 'block05_refl_coincidence_pending', value: false },
    { type: 'setFlag', id: 'block05_emergency_revisit_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_revisit_emergency_entry',
      label: 'Por que a polícia entrou no apartamento de Mariana?',
    },
  ])
}

/** Disparado ao reabrir registro da central / entrada / apreensão. */
export function revisitEmergencyEntry() {
  const s = getInvestigationState()
  if (s.flags.block05_emergency_revisited) return
  if (!s.flags.block05_emergency_revisit_unlocked) return
  dispatchActions([
    { type: 'setFlag', id: 'block05_emergency_revisited', value: true },
    { type: 'addDocument', id: 'doc-central-chamada' },
    { type: 'addDocument', id: 'doc-entrada-apartamento' },
    { type: 'addDocument', id: 'doc-apreensao-celular' },
    { type: 'addEvidence', id: 'call_enabled_apartment_entry' },
    { type: 'addEvidence', id: 'phone_seized_after_call' },
    { type: 'completeTask', id: 'task_revisit_emergency_entry' },
    { type: 'addHypothesis', id: 'hyp_call_to_seize_phone' },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_call_to_seize_phone',
      evidenceId: 'call_enabled_apartment_entry',
      role: 'support',
    },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_call_to_seize_phone',
      evidenceId: 'phone_seized_after_call',
      role: 'support',
    },
    { type: 'setFlag', id: 'block05_refl_path_pending', value: true },
  ])
}

export function onPathReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block05_complete) return
  const actions: StoryActionRef[] = [
    { type: 'setFlag', id: 'block05_path_reflection_done', value: true },
    { type: 'setFlag', id: 'block05_refl_path_pending', value: false },
    { type: 'setFlag', id: 'block05_maralto_reflection_done', value: true },
    { type: 'setFlag', id: 'block05_coincidence_reflection_done', value: true },
    { type: 'setFlag', id: 'block05_refl_maralto_pending', value: false },
    { type: 'setFlag', id: 'block05_refl_coincidence_pending', value: false },
    { type: 'setFlag', id: 'refl-b05-maralto_seen', value: true },
    { type: 'setFlag', id: 'refl-b05-coincidence_seen', value: true },
    { type: 'addHypothesis', id: 'hyp_deliberate_path' },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_deliberate_path',
      evidenceId: 'mariana_sought_people_before',
      role: 'support',
    },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_deliberate_path',
      evidenceId: 'phone_files_depend_on_order',
      role: 'support',
    },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_deliberate_path',
      evidenceId: 'call_enabled_apartment_entry',
      role: 'support',
    },
    { type: 'addHypothesis', id: 'hyp_kidnapping' },
    { type: 'updateHypothesis', id: 'hyp_kidnapping', state: 'weakened' },
    { type: 'setFlag', id: 'block05_complete', value: true },
    {
      type: 'replaceTasks',
      tasks: [
        {
          id: 'task_reexamine_elisa_from_scratch',
          label: 'Reconstruir o caso Elisa do zero — começar por Geraldo',
          completed: false,
        },
      ],
    },
    { type: 'setFlag', id: 'block06_entry_ready', value: true },
    { type: 'addDocument', id: 'doc-elisa-geraldo-depoimento' },
  ]
  dispatchActions(actions)
}
