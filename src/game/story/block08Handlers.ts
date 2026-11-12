import { dispatchActions, getInvestigationState } from '../state/investigationStore'
import type { StoryActionRef } from '../types'
import { ROTATION_CALLSIGN } from '../../data/block08/rotationPuzzle'

export function startBlock08() {
  const s = getInvestigationState()
  if (s.flags.block08_started) return
  if (!s.flags.block07_complete && !s.flags.block08_entry_ready) return
  dispatchActions([
    { type: 'setFlag', id: 'block08_started', value: true },
    { type: 'setFlag', id: 'block08_rings_available', value: true },
    { type: 'addEvidence', id: 'protest_heterogeneous_sources' },
    { type: 'completeTask', id: 'task_compare_henrique_mariana_system' },
    {
      type: 'addTask',
      id: 'task_rings_puzzle',
      label: 'Reconstruir o percurso de Morsa na noite dos protestos',
    },
  ])
}

/**
 * Etapa 1 — passagem de serviço deduzida + cobertura CFTV.
 * NÃO registra `morsa_was_andre`.
 */
export function onRingsTimelineSolved() {
  const s = getInvestigationState()
  if (s.flags.block08_rings_timeline_solved || s.flags.block08_rings_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block08_rings_timeline_solved', value: true },
    { type: 'addEvidence', id: 'protest_timeline_reconstructed' },
    { type: 'completeTask', id: 'task_rings_puzzle' },
    {
      type: 'addTask',
      id: 'task_rings_dvr',
      label: 'Inspecionar o arquivo CFTV da passagem de serviço',
    },
  ])
}

/**
 * Etapa 2 — cutscene CAM11: revelação. Abre Reflection.
 */
export function onMorsaContinuityConfirmed() {
  const s = getInvestigationState()
  if (s.flags.block08_morsa_continuity_confirmed || s.flags.block08_rings_done) return
  if (!s.flags.block08_rings_timeline_solved) return
  dispatchActions([
    { type: 'setFlag', id: 'block08_morsa_continuity_confirmed', value: true },
    { type: 'setFlag', id: 'block08_morsa_reveal_played', value: true },
    { type: 'addEvidence', id: 'morsa_was_andre' },
    { type: 'completeTask', id: 'task_rings_dvr' },
    { type: 'setFlag', id: 'block08_refl_morsa_pending', value: true },
  ])
}

/**
 * Compat / checkpoints: completa a cadeia Rings → continuidade.
 * Evidência `morsa_was_andre` só em `onMorsaReflectionDone` (ou checkpoint DEV).
 */
export function onRingsSolved() {
  const s = getInvestigationState()
  if (s.flags.block08_rings_done) return
  onRingsTimelineSolved()
  onMorsaContinuityConfirmed()
}

/** Etapa 4 — após Reflection: formaliza Morsa = André e libera confrontação. */
export function onMorsaReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block08_morsa_reflection_done) return
  const actions: StoryActionRef[] = [
    { type: 'setFlag', id: 'block08_morsa_reflection_done', value: true },
    { type: 'setFlag', id: 'block08_refl_morsa_pending', value: false },
    { type: 'setFlag', id: 'block08_rings_done', value: true },
    { type: 'setFlag', id: 'block08_rings_timeline_solved', value: true },
    { type: 'setFlag', id: 'block08_morsa_continuity_confirmed', value: true },
  ]
  if (!s.evidenceOwned.includes('morsa_was_andre')) {
    actions.push({ type: 'addEvidence', id: 'morsa_was_andre' })
  }
  if (!s.evidenceOwned.includes('andre_morsa_alibi_interval')) {
    actions.push(
      { type: 'addEvidence', id: 'andre_morsa_alibi_interval' },
      { type: 'completeTask', id: 'task_identify_morsa' },
      { type: 'updateHypothesis', id: 'hyp_morsa_bridges_elisa_protests', state: 'confirmed' },
      { type: 'addHypothesis', id: 'hyp_protests_needed_for_andre_alibi' },
      { type: 'updateHypothesis', id: 'hyp_protests_needed_for_andre_alibi', state: 'confirmed' },
      { type: 'addHypothesis', id: 'hyp_maralto_direct_elisa_death' },
      { type: 'updateHypothesis', id: 'hyp_maralto_direct_elisa_death', state: 'discarded' },
    )
  }
  actions.push(
    { type: 'unlockLocation', id: 'presidio', status: 'visitAvailable' },
    {
      type: 'addTask',
      id: 'task_confront_andre_morsa',
      label: 'Confrontar André com a reconstrução de Morsa',
    },
  )
  dispatchActions(actions)
}

export function finishAndreFollowup() {
  const s = getInvestigationState()
  const mark = { type: 'unlockLocation' as const, id: 'presidio', status: 'visited' as const }
  if (s.flags.block08_andre_followup_done) {
    if (s.locations.presidio?.status === 'visitAvailable') dispatchActions([mark])
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block08_andre_followup_done', value: true },
    { type: 'addEvidence', id: 'andre_admits_morsa' },
    { type: 'addEvidence', id: 'andre_hid_morsa_to_protect_nucleus' },
    { type: 'completeTask', id: 'task_confront_andre_morsa' },
    mark,
    { type: 'updateHypothesis', id: 'hyp_andre_killed_elisa', state: 'discarded' },
    { type: 'addHypothesis', id: 'hyp_andre_wrongly_convicted' },
    { type: 'setFlag', id: 'block08_refl_andre_pending', value: true },
  ])
}

export function onAndreWronglyReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block08_andre_reflection_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block08_andre_reflection_done', value: true },
    { type: 'setFlag', id: 'block08_refl_andre_pending', value: false },
    { type: 'unlockLocation', id: 'detencao-miro', status: 'visitAvailable' },
    {
      type: 'addTask',
      id: 'task_press_miro_third',
      label: 'Pressionar Miro — André tinha álibi; o que aconteceu na queda?',
    },
  ])
}

export function finishMiroThird() {
  const s = getInvestigationState()
  const mark = { type: 'unlockLocation' as const, id: 'detencao-miro', status: 'visited' as const }
  if (s.flags.block08_miro_third_done) {
    if (s.locations['detencao-miro']?.status === 'visitAvailable') dispatchActions([mark])
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block08_miro_third_done', value: true },
    { type: 'addEvidence', id: 'miro_says_guardrail_gave_way' },
    { type: 'addEvidence', id: 'miro_denies_physical_push' },
    { type: 'completeTask', id: 'task_press_miro_third' },
    mark,
    { type: 'updateHypothesis', id: 'hyp_miro_may_be_involved_elisa', state: 'weakened' },
    { type: 'setFlag', id: 'block08_refl_miro_guardrail_pending', value: true },
  ])
}

/** Reflection pós-Miro — libera ligação à Perícia. */
export function onMiroGuardrailReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block08_miro_guardrail_reflection_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block08_miro_guardrail_reflection_done', value: true },
    { type: 'setFlag', id: 'block08_refl_miro_guardrail_pending', value: false },
    { type: 'setFlag', id: 'block08_guardrail_reexam_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_reexamine_guardrail',
      label:
        'Solicitar à Perícia (telefone fixo) uma nova análise das fotografias e vestígios do guardrail',
    },
  ])
}

/**
 * Laudo complementar (fonte: Perícia, após abrir documento).
 */
export function requestGuardrailReexam() {
  const s = getInvestigationState()
  if (s.flags.block08_guardrail_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block08_guardrail_done', value: true },
    { type: 'addEvidence', id: 'guardrail_impact_signs' },
    { type: 'addEvidence', id: 'jaguar_x300_paint_fragment' },
    { type: 'completeTask', id: 'task_reexamine_guardrail' },
    { type: 'setFlag', id: 'block08_refl_jaguar_lead_pending', value: true },
  ])
}

/** Reflection pós-laudo — libera ponte humana até oficina (peças/importados). */
export function onJaguarLeadReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block08_jaguar_lead_reflection_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block08_jaguar_lead_reflection_done', value: true },
    { type: 'setFlag', id: 'block08_refl_jaguar_lead_pending', value: false },
    { type: 'setFlag', id: 'block08_parts_call_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_find_jaguar_workshop',
      label: 'Localizar oficina que trabalhava com Jaguar antigo na cidade',
    },
  ])
}

/** Ligação genérica peças/importados → indica Dênis. */
export function onPartsShopDenisLead() {
  const s = getInvestigationState()
  if (s.flags.block08_denis_contact_unlocked) return
  dispatchActions([
    { type: 'setFlag', id: 'block08_denis_contact_unlocked', value: true },
    { type: 'discoverPerson', id: 'denis', status: 'located' },
    { type: 'unlockLocation', id: 'oficina-denis', status: 'visitAvailable' },
    { type: 'completeTask', id: 'task_find_jaguar_workshop' },
    {
      type: 'addTask',
      id: 'task_talk_denis',
      label: 'Ir à oficina de Dênis — memória do Jaguar verde',
    },
  ])
}

export function finishDenisInterview() {
  const s = getInvestigationState()
  const mark = { type: 'unlockLocation' as const, id: 'oficina-denis', status: 'visited' as const }
  if (s.flags.block08_denis_interview_done) {
    if (s.locations['oficina-denis']?.status === 'visitAvailable') dispatchActions([mark])
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block08_denis_interview_done', value: true },
    { type: 'discoverPerson', id: 'denis', status: 'interviewed' },
    { type: 'addEvidence', id: 'denis_remembers_jaguar_green' },
    { type: 'addEvidence', id: 'denis_gothic_client_pair' },
    { type: 'completeTask', id: 'task_talk_denis' },
    mark,
    { type: 'setFlag', id: 'block08_detran_call_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_detran_jaguar_fleet',
      label: 'Solicitar ao DETRAN levantamento histórico de Jaguar XJ6 verde (X300)',
    },
  ])
}

/** Ligação formal DETRAN — proprietário Mauro. */
export function onDetranMauroCallDone() {
  const s = getInvestigationState()
  if (s.flags.block08_detran_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block08_detran_done', value: true },
    { type: 'setFlag', id: 'block08_mauro_located', value: true },
    { type: 'discoverPerson', id: 'mauro', status: 'located' },
    { type: 'addEvidence', id: 'jaguar_registered_mauro' },
    { type: 'completeTask', id: 'task_detran_jaguar_fleet' },
    { type: 'unlockLocation', id: 'mauro-casa', status: 'visitAvailable' },
    {
      type: 'addTask',
      id: 'task_talk_mauro',
      label: 'Falar com Mauro sobre o Jaguar XJ6',
    },
  ])
}

export function finishMauroInterview() {
  const s = getInvestigationState()
  const mark = { type: 'unlockLocation' as const, id: 'mauro-casa', status: 'visited' as const }
  if (s.flags.block08_mauro_interview_done) {
    if (s.locations['mauro-casa']?.status === 'visitAvailable') dispatchActions([mark])
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block08_mauro_interview_done', value: true },
    { type: 'discoverPerson', id: 'mauro', status: 'interviewed' },
    { type: 'discoverPerson', id: 'bia', status: 'identified' },
    { type: 'addEvidence', id: 'mauro_bia_said_scraped_car' },
    { type: 'addEvidence', id: 'bia_used_jaguar_without_permission' },
    { type: 'completeTask', id: 'task_talk_mauro' },
    mark,
    { type: 'unlockLocation', id: 'bia-casa', status: 'visitAvailable' },
    {
      type: 'addTask',
      id: 'task_talk_bia',
      label: 'Falar com Bia sobre o Jaguar do Mauro',
    },
  ])
}

/** Compat: saves antigos / laudo câmera. */
export function onMauroVehicleFound() {
  const s = getInvestigationState()
  if (s.flags.block08_mauro_located) return
  onDetranMauroCallDone()
}

export function finishBiaInterview() {
  const s = getInvestigationState()
  const mark = { type: 'unlockLocation' as const, id: 'bia-casa', status: 'visited' as const }
  if (s.flags.block08_bia_interview_done) {
    if (s.locations['bia-casa']?.status === 'visitAvailable') dispatchActions([mark])
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block08_bia_interview_done', value: true },
    { type: 'discoverPerson', id: 'bia', status: 'interviewed' },
    { type: 'discoverPerson', id: 'rui', status: 'identified' },
    { type: 'addEvidence', id: 'bia_was_with_rui' },
    { type: 'addEvidence', id: 'rui_drove_drunk_hit_rail' },
    { type: 'completeTask', id: 'task_talk_bia' },
    mark,
    { type: 'unlockLocation', id: 'rui-casa', status: 'visitAvailable' },
    {
      type: 'addTask',
      id: 'task_talk_rui',
      label: 'Falar com Rui',
    },
  ])
}

export function finishRuiInterview() {
  const s = getInvestigationState()
  const mark = { type: 'unlockLocation' as const, id: 'rui-casa', status: 'visited' as const }
  if (s.flags.block08_rui_interview_done) {
    if (s.locations['rui-casa']?.status === 'visitAvailable') dispatchActions([mark])
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block08_rui_interview_done', value: true },
    { type: 'discoverPerson', id: 'rui', status: 'interviewed' },
    { type: 'addEvidence', id: 'rui_admits_drunk_crash' },
    { type: 'addEvidence', id: 'rui_stopped_by_police_before' },
    { type: 'addEvidence', id: 'elisa_death_accident_reconstruction' },
    { type: 'completeTask', id: 'task_talk_rui' },
    mark,
    { type: 'addHypothesis', id: 'hyp_elisa_died_accident' },
    { type: 'updateHypothesis', id: 'hyp_elisa_died_accident', state: 'confirmed' },
    { type: 'setFlag', id: 'block08_refl_accident_pending', value: true },
  ])
}

export function onAccidentReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block08_accident_reflection_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block08_accident_reflection_done', value: true },
    { type: 'setFlag', id: 'block08_refl_accident_pending', value: false },
    { type: 'setFlag', id: 'block08_rotation_available', value: true },
    { type: 'addEvidence', id: 'police_clock_drift_logs' },
    {
      type: 'addTask',
      id: 'task_rotation_puzzle',
      label: 'Cruzar passagem ferroviária, CAD e rádios da abordagem (bancada)',
    },
  ])
}

export function onRotationSolved() {
  const s = getInvestigationState()
  if (s.flags.block08_rotation_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block08_rotation_done', value: true },
    { type: 'addEvidence', id: 'approach_callsign_reconstructed' },
    { type: 'completeTask', id: 'task_rotation_puzzle' },
    { type: 'setFlag', id: 'block08_scale_search_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_lookup_callsign_scale',
      label: `Consultar a escala da ${ROTATION_CALLSIGN}`,
    },
  ])
}

export function onScaleLinksAugusto() {
  const s = getInvestigationState()
  if (s.flags.block08_augusto_linked) return
  dispatchActions([
    { type: 'setFlag', id: 'block08_augusto_linked', value: true },
    { type: 'setFlag', id: 'block08_augusto_revealed', value: true },
    { type: 'addEvidence', id: 'scale_links_callsign_to_augusto' },
    { type: 'completeTask', id: 'task_lookup_callsign_scale' },
    { type: 'addHypothesis', id: 'hyp_augusto_causal_in_chain' },
    { type: 'updateHypothesis', id: 'hyp_augusto_causal_in_chain', state: 'confirmed' },
    { type: 'addHypothesis', id: 'hyp_mariana_chose_augusto' },
    { type: 'updateHypothesis', id: 'hyp_mariana_chose_augusto', state: 'confirmed' },
    { type: 'setFlag', id: 'block08_refl_final_pending', value: true },
  ])
}

export function onFinalReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block08_complete) return
  const actions: StoryActionRef[] = [
    { type: 'setFlag', id: 'block08_final_reflection_done', value: true },
    { type: 'setFlag', id: 'block08_refl_final_pending', value: false },
    { type: 'setFlag', id: 'block08_complete', value: true },
    { type: 'setFlag', id: 'block09_entry_ready', value: true },
    {
      type: 'replaceTasks',
      tasks: [
        {
          id: 'task_how_mariana_knew',
          label: 'Como Mariana descobriu tudo isso?',
          completed: false,
        },
      ],
    },
  ]
  dispatchActions(actions)
}
