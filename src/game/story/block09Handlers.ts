import { dispatchActions, getInvestigationState, appendChatMessages } from '../state/investigationStore'
import type { StoryActionRef } from '../types'
import {
  MARIANA_CHAT_ID,
  marianaMessagesWave1,
  marianaMessagesWave2,
  marianaMessagesWave3,
} from '../../data/block09/marianaMessages'
import { MEMORY_WORD } from '../../data/block09/memoryPuzzle'

export function startBlock09() {
  const s = getInvestigationState()
  if (s.flags.block09_started) return
  if (!s.flags.block08_complete && !s.flags.block09_entry_ready) return
  dispatchActions([
    { type: 'setFlag', id: 'block09_started', value: true },
    { type: 'setFlag', id: 'block09_compare_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_compare_omitido_system',
      label: 'Reexaminar o sistema de Henrique cruzando com registros de Mariana',
    },
  ])
}

export function compareHenriqueMarianaSystem() {
  const s = getInvestigationState()
  if (s.flags.block09_omitido_named) return
  dispatchActions([
    { type: 'setFlag', id: 'block09_omitido_named', value: true },
    { type: 'addDocument', id: 'doc-omitido-interface' },
    { type: 'addEvidence', id: 'omitido_named_in_records' },
    { type: 'addEvidence', id: 'mariana_used_same_system_months' },
    { type: 'addEvidence', id: 'omitido_guided_not_answered' },
    { type: 'discoverPerson', id: 'omitido', status: 'identified' },
    { type: 'completeTask', id: 'task_how_mariana_knew' },
    { type: 'completeTask', id: 'task_compare_omitido_system' },
    { type: 'addHypothesis', id: 'hyp_omitido_guided_mariana' },
    { type: 'updateHypothesis', id: 'hyp_omitido_guided_mariana', state: 'confirmed' },
    { type: 'setFlag', id: 'block09_diary_reread_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_reread_diary_omitido',
      label: 'Revisitar entradas do diário à luz de O Omitido',
    },
  ])
}

export function rereadDiaryOmitido() {
  const s = getInvestigationState()
  if (s.flags.block09_diary_reread_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block09_diary_reread_done', value: true },
    { type: 'addDocument', id: 'doc-diario-releitura-omitido' },
    { type: 'addEvidence', id: 'diary_partly_staged_ambiguity' },
    { type: 'completeTask', id: 'task_reread_diary_omitido' },
    { type: 'setFlag', id: 'block09_assistance_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_omitido_assistance',
      label: 'Isolar o que O Omitido executou no plano do desaparecimento',
    },
  ])
}

export function mapOmitidoAssistance() {
  const s = getInvestigationState()
  if (s.flags.block09_assistance_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block09_assistance_done', value: true },
    { type: 'addDocument', id: 'doc-omitido-assistencia' },
    { type: 'addEvidence', id: 'disappearance_plan_mariana_with_omitido' },
    { type: 'completeTask', id: 'task_omitido_assistance' },
    { type: 'setFlag', id: 'block09_roberto_search_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_reexamine_roberto',
      label: 'Reexaminar o afastamento de Roberto Siqueira e a denúncia anônima',
    },
  ])
}

export function onRobertoExposed() {
  const s = getInvestigationState()
  if (s.flags.block09_roberto_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block09_roberto_done', value: true },
    { type: 'discoverPerson', id: 'roberto', status: 'identified' },
    { type: 'addEvidence', id: 'omitido_timed_roberto_denunciation' },
    { type: 'addEvidence', id: 'augusto_placed_into_case' },
    { type: 'completeTask', id: 'task_reexamine_roberto' },
    { type: 'addHypothesis', id: 'hyp_augusto_was_placed' },
    { type: 'updateHypothesis', id: 'hyp_augusto_was_placed', state: 'confirmed' },
    { type: 'setFlag', id: 'block09_messages_wave1', value: true },
    {
      type: 'addTask',
      id: 'task_read_mariana_messages',
      label: 'Novas mensagens chegaram em nome de Mariana',
    },
  ])
  injectMarianaWave(1)
}

function injectMarianaWave(wave: 1 | 2 | 3) {
  const s = getInvestigationState()
  const actions: StoryActionRef[] = [
    { type: 'unlockContact', contactId: 'contact-mariana-augusto' },
    { type: 'unlockChat', device: 'augusto', chatId: MARIANA_CHAT_ID },
  ]
  dispatchActions(actions)
  const msgs =
    wave === 1 ? marianaMessagesWave1 : wave === 2 ? marianaMessagesWave2 : marianaMessagesWave3
  const already = s.chatProgress[MARIANA_CHAT_ID]?.messages ?? []
  const ids = new Set(already.map((m) => m.id))
  const fresh = msgs.filter((m) => !ids.has(m.id))
  if (fresh.length) appendChatMessages(MARIANA_CHAT_ID, fresh, wave, false)
}

/** Garante ondas injetadas e marca leituras ao abrir o chat. */
export function onMarianaChatOpened() {
  const s = getInvestigationState()
  if (s.flags.block09_messages_wave1) injectMarianaWave(1)
  if (s.flags.block09_messages_wave3) injectMarianaWave(3)

  if (s.flags.block09_messages_wave1 && !s.flags.block09_messages_wave1_read) {
    onMarianaMessagesWave1Read()
    return
  }
  if (s.flags.block09_messages_wave3 && !s.flags.block09_post_death_message_read) {
    onPostDeathMessageRead()
  }
}

/** Chamado ao abrir/ler o chat de Mariana (onda 1). */
export function onMarianaMessagesWave1Read() {
  const s = getInvestigationState()
  if (s.flags.block09_messages_wave1_read) return
  if (!s.flags.block09_messages_wave1) return
  dispatchActions([
    { type: 'setFlag', id: 'block09_messages_wave1_read', value: true },
    { type: 'addEvidence', id: 'messages_as_mariana_convincing' },
    { type: 'completeTask', id: 'task_read_mariana_messages' },
    { type: 'setFlag', id: 'block09_messages_wave2', value: true },
    {
      type: 'addTask',
      id: 'task_weigh_mariana_messages',
      label: 'Conferir o que as mensagens “de Mariana” sabem demais',
    },
  ])
  injectMarianaWave(2)
}

export function weighMarianaMessageImpossibilities() {
  const s = getInvestigationState()
  if (s.flags.block09_messages_impossible_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block09_messages_impossible_done', value: true },
    { type: 'addDocument', id: 'doc-mensagens-impossiveis' },
    { type: 'addEvidence', id: 'messages_know_post_disappearance_facts' },
    { type: 'completeTask', id: 'task_weigh_mariana_messages' },
    { type: 'setFlag', id: 'block09_trail_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_reconstruct_physical_trail',
      label: 'Reconstruir os últimos deslocamentos físicos de Mariana',
    },
  ])
}

export function reconstructPhysicalTrail() {
  const s = getInvestigationState()
  if (s.flags.block09_trail_ready) return
  dispatchActions([
    { type: 'setFlag', id: 'block09_trail_ready', value: true },
    { type: 'addDocument', id: 'doc-trilha-fisica-mariana' },
    { type: 'addEvidence', id: 'physical_trail_last_movements' },
    { type: 'completeTask', id: 'task_reconstruct_physical_trail' },
    { type: 'unlockLocation', id: 'trilha-final', status: 'visitAvailable' },
    {
      type: 'addTask',
      id: 'task_follow_trail_location',
      label: 'Seguir a trilha até o local indicado pelos registros',
    },
  ])
}

export function finishTrailDiscovery() {
  const s = getInvestigationState()
  const mark = { type: 'unlockLocation' as const, id: 'trilha-final', status: 'visited' as const }
  if (s.flags.block09_mariana_dead) {
    if (s.locations['trilha-final']?.status === 'visitAvailable') dispatchActions([mark])
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block09_mariana_dead', value: true },
    { type: 'addEvidence', id: 'mariana_confirmed_dead' },
    { type: 'completeTask', id: 'task_follow_trail_location' },
    mark,
    { type: 'setFlag', id: 'block09_refl_death_pending', value: true },
  ])
}

export function onDeathReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block09_death_reflection_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block09_death_reflection_done', value: true },
    { type: 'setFlag', id: 'block09_refl_death_pending', value: false },
    { type: 'setFlag', id: 'block09_messages_wave3', value: true },
    {
      type: 'addTask',
      id: 'task_message_after_death',
      label: 'Uma nova mensagem chegou em nome de Mariana',
    },
  ])
  injectMarianaWave(3)
}

export function onPostDeathMessageRead() {
  const s = getInvestigationState()
  if (s.flags.block09_post_death_message_read) return
  if (!s.flags.block09_messages_wave3) return
  dispatchActions([
    { type: 'setFlag', id: 'block09_post_death_message_read', value: true },
    { type: 'addEvidence', id: 'system_speaks_as_mariana_after_death' },
    { type: 'completeTask', id: 'task_message_after_death' },
    { type: 'setFlag', id: 'block09_other_cases_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_other_disappearances',
      label: 'Cruzar Henrique/Mariana com outros desaparecimentos semelhantes',
    },
  ])
}

export function findOtherDisappearances() {
  const s = getInvestigationState()
  if (s.flags.block09_other_cases_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block09_other_cases_done', value: true },
    { type: 'addDocument', id: 'doc-outros-desaparecimentos' },
    { type: 'addEvidence', id: 'other_disappearances_pattern' },
    { type: 'completeTask', id: 'task_other_disappearances' },
    { type: 'setFlag', id: 'block09_augusto_watched_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_augusto_anomalies',
      label: 'Registrar anomalias que envolvem o próprio Augusto',
    },
  ])
}

export function registerAugustoAnomalies() {
  const s = getInvestigationState()
  if (s.flags.block09_augusto_watched_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block09_augusto_watched_done', value: true },
    { type: 'addDocument', id: 'doc-anomalias-augusto' },
    { type: 'addEvidence', id: 'augusto_was_observed' },
    { type: 'completeTask', id: 'task_augusto_anomalies' },
    { type: 'setFlag', id: 'block09_memory_audio_pending', value: true },
    {
      type: 'addTask',
      id: 'task_memory_puzzle',
      label: 'Analisar a gravação recente atribuída a Mariana (bancada)',
    },
  ])
  // Entrega o áudio
  dispatchActions([
    { type: 'addEvidence', id: 'mariana_recent_recording_claim' },
    { type: 'setFlag', id: 'block09_memory_available', value: true },
    { type: 'setFlag', id: 'block09_memory_audio_pending', value: false },
  ])
}

export function onMemoryPuzzleSolved() {
  const s = getInvestigationState()
  if (s.flags.block09_memory_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block09_memory_done', value: true },
    { type: 'addEvidence', id: 'final_audio_impossible_provenance' },
    { type: 'addEvidence', id: 'memory_word_revealed' },
    { type: 'completeTask', id: 'task_memory_puzzle' },
    { type: 'setFlag', id: 'block09_memory_word_shown', value: true },
    { type: 'setFlag', id: 'block09_refl_final_pending', value: true },
  ])
}

export function onSaturnusFinalReflectionDone() {
  const s = getInvestigationState()
  if (s.flags.block09_complete) return
  dispatchActions([
    { type: 'setFlag', id: 'block09_final_reflection_done', value: true },
    { type: 'setFlag', id: 'block09_refl_final_pending', value: false },
    { type: 'setFlag', id: 'block09_complete', value: true },
    { type: 'setFlag', id: 'saturnus_complete', value: true },
    {
      type: 'replaceTasks',
      tasks: [
        {
          id: 'task_saturnus_memory',
          label: `Saturnus — ${MEMORY_WORD}`,
          completed: true,
        },
      ],
    },
  ])
}

export function dismissMemoryWordOverlay() {
  const s = getInvestigationState()
  if (!s.flags.block09_memory_word_shown) return
  if (s.flags.block09_memory_word_dismissed) return
  dispatchActions([{ type: 'setFlag', id: 'block09_memory_word_dismissed', value: true }])
}
