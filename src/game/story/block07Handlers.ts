import { appendChatMessages, dispatchActions, getInvestigationState } from '../state/investigationStore'
import type { StoryActionRef } from '../types'

export const ANON_CHAT_ID = 'chat-anon-augusto'

export function startBlock07() {
  const s = getInvestigationState()
  if (s.flags.block07_started) {
    // Save antigo: Miro 1 feito, segunda visita ainda pendente.
    if (
      s.flags.block06_complete &&
      !s.flags.block07_miro_followup_done &&
      s.locations['detencao-miro']?.status === 'visited'
    ) {
      dispatchActions([{ type: 'unlockLocation', id: 'detencao-miro', status: 'visitAvailable' }])
    }
    return
  }
  if (!s.flags.block06_complete && !s.flags.block07_entry_ready) return
  const actions: StoryActionRef[] = [{ type: 'setFlag', id: 'block07_started', value: true }]
  if (!s.flags.block07_miro_followup_done) {
    actions.push({ type: 'unlockLocation', id: 'detencao-miro', status: 'visitAvailable' })
  } else if (!s.flags.block07_sandra_search_unlocked) {
    actions.push(
      { type: 'setFlag', id: 'block07_sandra_search_unlocked', value: true },
      {
        type: 'addTask',
        id: 'task_locate_sandra',
        label: 'Quem Sandra viu voltando da região da queda?',
      },
    )
  }
  dispatchActions(actions)
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
      label: 'Reexaminar a duração da atividade de Morsa nos registros dos protestos',
    },
  ])
}

/** Disparado ao reabrir ocorrência/detidos/clipping Maralto. */
export function reviewMorsaDuration() {
  const s = getInvestigationState()
  if (s.flags.block07_morsa_duration_done) return
  if (!s.flags.block07_morsa_review_unlocked) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_morsa_duration_done', value: true },
    { type: 'addEvidence', id: 'morsa_active_long_interval' },
    { type: 'addEvidence', id: 'mariana_focused_morsa_duration' },
    { type: 'addHypothesis', id: 'hyp_morsa_bridges_elisa_protests' },
    { type: 'completeTask', id: 'task_review_morsa_duration' },
    {
      type: 'addTask',
      id: 'task_memory_onset_chronology',
      label: 'Revisar quando começaram os lapsos de Mariana (Timeline do caderno)',
    },
    { type: 'setFlag', id: 'block07_memory_onset_unlocked', value: true },
  ])
}

/** Disparado ao consultar a Timeline no ponto certo do Bloco 7. */
export function organizeMemoryOnset() {
  const s = getInvestigationState()
  if (s.flags.block07_memory_onset_done) return
  if (!s.flags.block07_memory_onset_unlocked) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_memory_onset_done', value: true },
    { type: 'addEvidence', id: 'memory_anomalies_months_before' },
    { type: 'addEvidence', id: 'onset_matches_hospital_shifts' },
    { type: 'addHypothesis', id: 'hyp_memory_after_specific_period' },
    { type: 'completeTask', id: 'task_memory_onset_chronology' },
    { type: 'setFlag', id: 'block07_julia_camila_check_unlocked', value: true },
    { type: 'unlockContact', contactId: 'contact-julia' },
    {
      type: 'addTask',
      id: 'task_check_julia_camila_onset',
      label: 'Ligar para Júlia sobre o período em que começaram os lapsos',
    },
  ])
}

/** Fim da ligação com Júlia: conferência feita, sem evento dramático. O áudio anônimo vem depois. */
export function finishJuliaOnsetCall() {
  const s = getInvestigationState()
  if (s.flags.block07_julia_camila_checked) return
  dispatchActions([
    { type: 'completeCall', id: 'call-julia-onset' },
    { type: 'setFlag', id: 'block07_julia_camila_checked', value: true },
    { type: 'addEvidence', id: 'no_dramatic_event_at_onset' },
    { type: 'completeTask', id: 'task_check_julia_camila_onset' },
  ])
}

/**
 * Mensagem de número desconhecido no WhatsApp de Augusto, com attachment.
 * Não revela a origem. A bancada só recebe o arquivo se o jogador encaminhar.
 */
export function deliverAnonWhatsApp() {
  const s = getInvestigationState()
  if (s.flags.block07_anon_message_received) return
  if (!s.flags.block07_julia_camila_checked) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_anon_message_received', value: true },
    { type: 'unlockChat', device: 'augusto', chatId: ANON_CHAT_ID },
    {
      type: 'addTask',
      id: 'task_anon_audio_enceladus',
      label: 'Identificar o que o arquivo anônimo contém',
    },
  ])
  const already = s.chatProgress[ANON_CHAT_ID]?.messages ?? []
  if (already.some((m) => m.id === 'anon-burst-1')) return
  appendChatMessages(
    ANON_CHAT_ID,
    [
      {
        id: 'anon-burst-1',
        kind: 'audio',
        from: 'them',
        audioSrc: '/assets/audio/emergency-call-0803.wav',
        durationSec: 80,
        timestamp: '02:14',
      },
    ],
    0,
    false,
  )
}

/**
 * Encaminhamento à bancada — libera Enceladus.
 * Checkpoints / saves antigos podem chamar direto após a checagem com Júlia.
 */
export function receiveAnonHospitalAudio() {
  const s = getInvestigationState()
  if (s.flags.block07_anon_audio_received) return
  if (!s.flags.block07_julia_camila_checked && !s.flags.block07_anon_message_received) return
  if (!s.flags.block07_anon_message_received) {
    deliverAnonWhatsApp()
  }
  dispatchActions([
    { type: 'setFlag', id: 'block07_anon_audio_received', value: true },
    { type: 'addEvidence', id: 'anon_hospital_burst_audio' },
    { type: 'setFlag', id: 'block07_enceladus_available', value: true },
  ])
}

/** Compat (checkpoints / saves): checagem + WhatsApp + bancada de uma vez. */
export function finishJuliaCamilaOnsetCheck() {
  finishJuliaOnsetCall()
  deliverAnonWhatsApp()
  receiveAnonHospitalAudio()
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

/** Hospital / busca → Ricardo Freitas (banal). Próximo passo: confirmar identidade civil. */
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
    { type: 'setFlag', id: 'block07_ricardo_id_check_unlocked', value: true },
    // Softlock saves antigos que ainda olhavam `crosscheck_unlocked`.
    { type: 'setFlag', id: 'block07_ricardo_crosscheck_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_confirm_ricardo_identity',
      label: 'Confirmar a identidade de Ricardo Freitas',
    },
  ])
}

/** Consulta civil → linha morta. Sem Henrique. */
export function onRicardoIdentityDeadEnd() {
  const s = getInvestigationState()
  if (s.flags.block07_ricardo_dead_end) return
  if (s.flags.block07_henrique_identified) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_ricardo_dead_end', value: true },
    { type: 'addEvidence', id: 'ricardo_civil_unconfirmed' },
    { type: 'completeTask', id: 'task_confirm_ricardo_identity' },
    { type: 'completeTask', id: 'task_crosscheck_ricardo_mariana' },
    { type: 'setFlag', id: 'block07_refl_ricardo_dead_pending', value: true },
  ])
}

export function onRicardoDeadReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block07_ricardo_dead_reflection_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_ricardo_dead_reflection_done', value: true },
    { type: 'setFlag', id: 'block07_refl_ricardo_dead_pending', value: false },
    { type: 'setFlag', id: 'block07_revisit_mariana_clue_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_revisit_mariana_ricardo_clue',
      label: 'Rever o material que Mariana reuniu — notas e dados do aparelho',
    },
  ])
}

/** Reabre a nota antiga `n-sess` (pista parcial hvalenca@). */
export function onMarianaPartialIdRevisited() {
  const s = getInvestigationState()
  if (s.flags.block07_partial_id_noted) return
  if (!s.flags.block07_revisit_mariana_clue_unlocked) return
  if (s.flags.block07_henrique_identified) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_partial_id_noted', value: true },
    { type: 'addEvidence', id: 'mariana_partial_account_hvalenca' },
    { type: 'completeTask', id: 'task_revisit_mariana_ricardo_clue' },
    { type: 'setFlag', id: 'block07_partial_id_search_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_verify_hvalenca_identifier',
      label: 'Verificar o identificador encontrado nos registros (hvalenca)',
    },
  ])
}

/**
 * Batida A — cadastro independente mostra Henrique Valença.
 * Conexão formal com Ricardo fica para a Reflection.
 */
export function onHenriqueCadastroOpened() {
  const s = getInvestigationState()
  if (s.flags.block07_henrique_named) return
  if (s.flags.block07_henrique_identified) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_henrique_named', value: true },
    { type: 'discoverPerson', id: 'henrique', status: 'identified' },
    { type: 'addEvidence', id: 'henrique_registry_match' },
    { type: 'completeTask', id: 'task_verify_hvalenca_identifier' },
    { type: 'setFlag', id: 'block07_refl_henrique_reveal_pending', value: true },
  ])
}

/** Batida B — Reflection: Ricardo era Henrique; libera trilha. */
export function onHenriqueRevealReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block07_henrique_identified) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_henrique_identified', value: true },
    { type: 'setFlag', id: 'block07_refl_henrique_reveal_pending', value: false },
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
    {
      type: 'notifyInvestigationUpdate',
      id: 'henrique-identified',
      kind: 'evidence',
      presentation: 'card',
      label: 'IDENTIDADE CONFIRMADA',
      title: 'Henrique Valença',
      summary: 'Ricardo Freitas era um nome falso. A identidade real entra no caderno.',
      refId: 'ricardo_was_henrique_valenca',
    },
  ])
}

/**
 * Compat / checkpoints: revela Henrique de uma vez (saves e DEV).
 * Fluxo jogável novo usa dead-end → pista → cadastro → Reflection.
 */
export function onRicardoIdentityBroken() {
  const s = getInvestigationState()
  if (s.flags.block07_henrique_identified) return
  dispatchActions([
    { type: 'setFlag', id: 'block07_ricardo_dead_end', value: true },
    { type: 'setFlag', id: 'block07_ricardo_dead_reflection_done', value: true },
    { type: 'setFlag', id: 'block07_partial_id_noted', value: true },
    { type: 'setFlag', id: 'block07_henrique_named', value: true },
    { type: 'setFlag', id: 'block07_henrique_identified', value: true },
    { type: 'addEvidence', id: 'ricardo_civil_unconfirmed' },
    { type: 'addEvidence', id: 'mariana_partial_account_hvalenca' },
    { type: 'addEvidence', id: 'henrique_registry_match' },
    { type: 'addEvidence', id: 'ricardo_identity_false' },
    { type: 'addEvidence', id: 'ricardo_was_henrique_valenca' },
    { type: 'discoverPerson', id: 'henrique', status: 'identified' },
    { type: 'completeTask', id: 'task_confirm_ricardo_identity' },
    { type: 'completeTask', id: 'task_revisit_mariana_ricardo_clue' },
    { type: 'completeTask', id: 'task_verify_hvalenca_identifier' },
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
      label: 'Localizar a captura de rede do incidente de Henrique (consulta no computador)',
    },
  ])
}

/**
 * Obtém o dump/PCAP (fonte forense real). Preferir via consulta no computador + abertura do
 * doc-henrique-pcap-note; checkpoints ainda podem chamar direto.
 */
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
