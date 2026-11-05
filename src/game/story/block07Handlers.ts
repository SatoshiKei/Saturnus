import { dispatchActions, getInvestigationState } from '../state/investigationStore'
import type { StoryActionRef } from '../types'

export function startBlock07() {
  const s = getInvestigationState()
  if (s.flags.block07_started) {
    if (
      s.flags.block06_complete &&
      s.locations['detencao-miro']?.status === 'visited' &&
      !s.flags.block07_miro_followup_done
    ) {
      dispatchActions([{ type: 'unlockLocation', id: 'detencao-miro', status: 'visitAvailable' }])
    }
    return
  }
  if (!s.flags.block06_complete && !s.flags.block07_entry_ready) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_started', value: true },
    { type: 'unlockLocation', id: 'detencao-miro', status: 'visitAvailable' },
  ])
}

export function finishMiroFollowup() {
  const s = getInvestigationState()
  if (s.flags.block07_miro_followup_done) {
    if (s.locations['detencao-miro']?.status === 'visitAvailable') {
      dispatchActions([{ type: 'unlockLocation', id: 'detencao-miro', status: 'visited' }])
    }
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block07_miro_followup_done', value: true },
    { type: 'addEvidence', id: 'miro_descended_fall_area' },
    { type: 'addEvidence', id: 'miro_recovered_jana_bag' },
    { type: 'completeTask', id: 'task_press_miro_further' },
    { type: 'unlockLocation', id: 'detencao-miro', status: 'visited' },
    { type: 'updateHypothesis', id: 'hyp_miro_followed_to_fall', state: 'confirmed' },
    { type: 'addHypothesis', id: 'hyp_miro_may_be_involved_elisa' },
    { type: 'setFlag', id: 'block07_sandra_search_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_locate_sandra',
      label: 'Localizar Sandra nos autos do caso Elisa',
    },
  ])
}

export function finishSandraInterview() {
  const s = getInvestigationState()
  const mark = { type: 'unlockLocation' as const, id: 'sandra-casa', status: 'visited' as const }
  if (s.flags.block07_sandra_interview_done) {
    if (s.locations['sandra-casa']?.status === 'visitAvailable') dispatchActions([mark])
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block07_sandra_interview_done', value: true },
    { type: 'discoverPerson', id: 'sandra', status: 'interviewed' },
    { type: 'addEvidence', id: 'sandra_still_identifies_andre' },
    { type: 'addEvidence', id: 'sandra_acknowledges_miro_possibility' },
    { type: 'completeTask', id: 'task_talk_sandra' },
    mark,
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_lookalike_may_not_be_andre',
      evidenceId: 'miro_descended_fall_area',
      role: 'support',
    },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_lookalike_may_not_be_andre',
      evidenceId: 'sandra_still_identifies_andre',
      role: 'contradict',
    },
    { type: 'setFlag', id: 'block07_refl_sandra_pending', value: true },
  ])
}

export function onSandraReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block07_sandra_reflection_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_sandra_reflection_done', value: true },
    { type: 'setFlag', id: 'block07_refl_sandra_pending', value: false },
    { type: 'setFlag', id: 'block07_morsa_review_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_review_morsa_duration',
      label: 'Reavaliar a duração da atividade de Morsa nos arquivos dos protestos',
    },
  ])
}

export function reviewMorsaDuration() {
  const s = getInvestigationState()
  if (s.flags.block07_morsa_duration_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_morsa_duration_done', value: true },
    { type: 'addDocument', id: 'doc-morsa-duration-note' },
    { type: 'addEvidence', id: 'morsa_active_long_interval' },
    { type: 'addEvidence', id: 'mariana_focused_morsa_duration' },
    { type: 'addHypothesis', id: 'hyp_morsa_bridges_elisa_protests' },
    { type: 'completeTask', id: 'task_review_morsa_duration' },
    {
      type: 'addTask',
      id: 'task_memory_onset_chronology',
      label: 'Organizar quando começaram os primeiros registros anormais da memória de Mariana',
    },
    { type: 'setFlag', id: 'block07_memory_onset_unlocked', value: true },
  ])
}

export function organizeMemoryOnset() {
  const s = getInvestigationState()
  if (s.flags.block07_memory_onset_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_memory_onset_done', value: true },
    { type: 'addDocument', id: 'doc-memory-onset-chronology' },
    { type: 'addEvidence', id: 'memory_anomalies_months_before' },
    { type: 'addEvidence', id: 'onset_matches_hospital_shifts' },
    { type: 'addHypothesis', id: 'hyp_memory_after_specific_period' },
    { type: 'completeTask', id: 'task_memory_onset_chronology' },
    { type: 'setFlag', id: 'block07_julia_camila_check_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_check_julia_camila_onset',
      label: 'Conferir com Júlia/Camila se houve evento marcante naquele período',
    },
  ])
}

export function finishJuliaCamilaOnsetCheck() {
  const s = getInvestigationState()
  if (s.flags.block07_julia_camila_checked) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_julia_camila_checked', value: true },
    { type: 'addEvidence', id: 'no_dramatic_event_at_onset' },
    { type: 'completeTask', id: 'task_check_julia_camila_onset' },
    { type: 'setFlag', id: 'block07_anon_audio_received', value: true },
    { type: 'addEvidence', id: 'anon_hospital_burst_audio' },
    { type: 'setFlag', id: 'block07_enceladus_available', value: true },
    {
      type: 'addTask',
      id: 'task_anon_audio_enceladus',
      label: 'Analisar o áudio anônimo recebido (bancada)',
    },
  ])
}

export function onEnceladusSolved() {
  const s = getInvestigationState()
  if (s.flags.block07_enceladus_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_enceladus_done', value: true },
    { type: 'addEvidence', id: 'anon_audio_hospital_environment' },
    { type: 'addEvidence', id: 'anon_audio_ricardo_name' },
    { type: 'addEvidence', id: 'anon_audio_shift_window' },
    { type: 'completeTask', id: 'task_anon_audio_enceladus' },
    { type: 'setFlag', id: 'block07_ricardo_search_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_find_ricardo',
      label: 'Cruzar o nome Ricardo com o hospital e o plantão correspondente',
    },
  ])
}

export function onRicardoRecordFound() {
  const s = getInvestigationState()
  if (s.flags.block07_ricardo_found) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_ricardo_found', value: true },
    { type: 'discoverPerson', id: 'ricardo', status: 'identified' },
    { type: 'addEvidence', id: 'ricardo_freitas_died_that_shift' },
    { type: 'addEvidence', id: 'ricardo_record_poor_id' },
    { type: 'completeTask', id: 'task_find_ricardo' },
    { type: 'addHypothesis', id: 'hyp_ricardo_linked_to_onset' },
    {
      type: 'addTask',
      id: 'task_crosscheck_ricardo_mariana',
      label: 'Cruzar “Ricardo” com os dados privados de Mariana',
    },
    { type: 'setFlag', id: 'block07_ricardo_crosscheck_unlocked', value: true },
  ])
}

export function onRicardoIdentityBroken() {
  const s = getInvestigationState()
  if (s.flags.block07_henrique_identified) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_henrique_identified', value: true },
    { type: 'addEvidence', id: 'ricardo_identity_false' },
    { type: 'addEvidence', id: 'ricardo_was_henrique_valenca' },
    { type: 'discoverPerson', id: 'henrique', status: 'identified' },
    { type: 'completeTask', id: 'task_crosscheck_ricardo_mariana' },
    { type: 'setFlag', id: 'block07_henrique_search_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_investigate_henrique',
      label: 'Investigar Henrique Valença',
    },
  ])
}

export function onHenriqueTrailComplete() {
  const s = getInvestigationState()
  if (s.flags.block07_henrique_trail_done) return
  const need = ['henrique_tech_company', 'henrique_security_incident', 'cecilia_prado_contact']
  if (!need.every((id) => s.evidenceOwned.includes(id))) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_henrique_trail_done', value: true },
    { type: 'completeTask', id: 'task_investigate_henrique' },
    { type: 'discoverPerson', id: 'cecilia', status: 'located' },
    { type: 'unlockLocation', id: 'cecilia-casa', status: 'visitAvailable' },
    {
      type: 'addTask',
      id: 'task_talk_cecilia',
      label: 'Falar com Cecília Prado sobre Henrique',
    },
  ])
}

export function finishCeciliaInterview() {
  const s = getInvestigationState()
  const mark = { type: 'unlockLocation' as const, id: 'cecilia-casa', status: 'visited' as const }
  if (s.flags.block07_cecilia_interview_done) {
    if (s.locations['cecilia-casa']?.status === 'visitAvailable') dispatchActions([mark])
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block07_cecilia_interview_done', value: true },
    { type: 'discoverPerson', id: 'cecilia', status: 'interviewed' },
    { type: 'addEvidence', id: 'cecilia_describes_henrique_decline' },
    { type: 'addEvidence', id: 'henrique_feared_observation' },
    { type: 'addHypothesis', id: 'hyp_unknown_tech_origin' },
    { type: 'completeTask', id: 'task_talk_cecilia' },
    mark,
    { type: 'setFlag', id: 'block07_henrique_dump_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_henrique_digital',
      label: 'Localizar e analisar o material digital antigo de Henrique',
    },
  ])
}

export function unlockHenriqueDump() {
  const s = getInvestigationState()
  if (s.flags.block07_cassini_available) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_henrique_dump_found', value: true },
    { type: 'addEvidence', id: 'henrique_rtp_capture' },
    { type: 'addDocument', id: 'doc-henrique-pcap-note' },
    { type: 'setFlag', id: 'block07_cassini_available', value: true },
    { type: 'completeTask', id: 'task_henrique_digital' },
    {
      type: 'addTask',
      id: 'task_cassini_puzzle',
      label: 'Reconstruir a captura RTP de Henrique (bancada)',
    },
  ])
}

export function onCassiniSolved() {
  const s = getInvestigationState()
  if (s.flags.block07_complete) return
  const actions: StoryActionRef[] = [
    { type: 'setFlag', id: 'block07_cassini_done', value: true },
    { type: 'addEvidence', id: 'henrique_two_rtp_sessions' },
    { type: 'addEvidence', id: 'henrique_talked_to_contextual_system' },
    { type: 'addEvidence', id: 'system_similar_to_mariana_unknown' },
    { type: 'completeTask', id: 'task_cassini_puzzle' },
    { type: 'addHypothesis', id: 'hyp_unknown_tech_origin' },
    { type: 'updateHypothesis', id: 'hyp_unknown_tech_origin', state: 'confirmed' },
    { type: 'addHypothesis', id: 'hyp_henrique_mariana_same_system' },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_henrique_mariana_same_system',
      evidenceId: 'system_similar_to_mariana_unknown',
      role: 'support',
    },
    { type: 'setFlag', id: 'block07_refl_tech_pending', value: true },
  ]
  dispatchActions(actions)
}

export function onTechReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block07_complete) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_tech_reflection_done', value: true },
    { type: 'setFlag', id: 'block07_refl_tech_pending', value: false },
    { type: 'setFlag', id: 'block07_complete', value: true },
    { type: 'setFlag', id: 'block08_entry_ready', value: true },
    {
      type: 'replaceTasks',
      tasks: [
        {
          id: 'task_identify_morsa',
          label: 'Descobrir quem era Morsa',
          completed: false,
        },
        {
          id: 'task_compare_henrique_mariana_system',
          label: 'Determinar se o sistema de Henrique é o mesmo que falava com Mariana',
          completed: false,
        },
      ],
    },
  ])
}
