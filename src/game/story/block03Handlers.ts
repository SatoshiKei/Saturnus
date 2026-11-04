import { dispatchActions, getInvestigationState } from '../state/investigationStore'
import type { StoryActionRef } from '../types'

/** Fim da conversa com Nico (a localização acontece por documento + ligação, ver `callScripts`). */
export function finishNicoInterview() {
  const s = getInvestigationState()
  if (s.flags.block03_nico_interview_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block03_nico_interview_done', value: true },
    { type: 'discoverPerson', id: 'nico', status: 'interviewed' },
    { type: 'addEvidence', id: 'nico_mariana_visit' },
    { type: 'addEvidence', id: 'mariana_night_x_focus' },
    { type: 'addEvidence', id: 'nico_recording_booth' },
    { type: 'addEvidence', id: 'nico_recording_portable' },
    { type: 'completeTask', id: 'task_talk_nico' },
    {
      type: 'addTask',
      id: 'task_janus_sync',
      label: 'Comparar as duas gravações da Noite X (bancada de áudio)',
    },
    { type: 'setFlag', id: 'block03_janus_available', value: true },
  ])
}

/**
 * Puzzle 4 — Janus/Epimetheus (placeholder).
 * TODO(puzzle-04): substituir por cross-correlation / alinhamento de waveform real.
 */
export function runProvisionalJanusSync() {
  const s = getInvestigationState()
  if (s.flags.block03_janus_done) return
  if (!s.evidenceOwned.includes('nico_recording_booth')) return
  if (!s.evidenceOwned.includes('nico_recording_portable')) return
  dispatchActions([
    { type: 'setFlag', id: 'block03_janus_done', value: true },
    { type: 'addEvidence', id: 'vertice_clocks_unsynced' },
    { type: 'addEvidence', id: 'vertice_timeline_inconsistent' },
    { type: 'addEvidence', id: 'mariana_revising_elisa_chronology' },
    { type: 'completeTask', id: 'task_janus_sync' },
    { type: 'addHypothesis', id: 'hyp_andre_imprecise_chronology' },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_andre_imprecise_chronology',
      evidenceId: 'vertice_timeline_inconsistent',
      role: 'support',
    },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_own_investigation',
      evidenceId: 'mariana_revising_elisa_chronology',
      role: 'support',
    },
    { type: 'setFlag', id: 'block03_reanalysis_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_reanalyze_mariana_files',
      label: 'Reexaminar gravações recentes no celular de Mariana',
    },
  ])
}

/** Reanálise diegética — arquivo que já existia no aparelho ganha contexto. */
export function onMarianaMaraltoRecordingFound() {
  const s = getInvestigationState()
  if (s.flags.block03_maralto_recording_found) return
  if (!s.flags.block03_reanalysis_unlocked) return
  dispatchActions([
    { type: 'setFlag', id: 'block03_maralto_recording_found', value: true },
    { type: 'addEvidence', id: 'mariana_maralto_recording' },
    { type: 'addEvidence', id: 'mariana_investigating_protests' },
    { type: 'completeTask', id: 'task_reanalyze_mariana_files' },
    { type: 'setFlag', id: 'block03_maralto_search_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_research_maralto',
      label: 'Pesquisar Maralto Granéis no sistema de consulta',
    },
  ])
}

export function finishLiviaInterview() {
  const s = getInvestigationState()
  if (s.flags.block03_livia_interview_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block03_livia_interview_done', value: true },
    { type: 'discoverPerson', id: 'livia', status: 'interviewed' },
    { type: 'addEvidence', id: 'livia_mariana_contact' },
    { type: 'addEvidence', id: 'protest_records_incomplete' },
    { type: 'addEvidence', id: 'livia_radio_archive_raw' },
    { type: 'completeTask', id: 'task_talk_livia' },
    { type: 'setFlag', id: 'block03_saturnalia_available', value: true },
    {
      type: 'addTask',
      id: 'task_saturnalia',
      label: 'Reconstruir a transmissão radiofônica (bancada de áudio)',
    },
  ])
}

/**
 * Puzzle 5 — Saturnalia (placeholder).
 * TODO(puzzle-05): substituir por ordenação de batches + inversão interna real.
 */
export function runProvisionalSaturnaliaReconstruct() {
  const s = getInvestigationState()
  if (s.flags.block03_saturnalia_done) return
  if (!s.evidenceOwned.includes('livia_radio_archive_raw')) return
  const actions: StoryActionRef[] = [
    { type: 'setFlag', id: 'block03_saturnalia_done', value: true },
    { type: 'addEvidence', id: 'protest_masked_core' },
    { type: 'addEvidence', id: 'morsa_unidentified' },
    { type: 'addEvidence', id: 'samuel_protest_lead' },
    { type: 'discoverPerson', id: 'morsa', status: 'identified' },
    { type: 'discoverPerson', id: 'samuel', status: 'identified' },
    { type: 'completeTask', id: 'task_saturnalia' },
    { type: 'setFlag', id: 'block03_complete', value: true },
    {
      type: 'replaceTasks',
      tasks: [
        {
          id: 'task_identify_morsa',
          label: 'Descobrir quem era Morsa e por que Mariana investigava os protestos',
          completed: false,
        },
      ],
    },
  ]
  if (!s.flags.block03_maralto_no_link && !s.evidenceOwned.includes('maralto_no_elisa_link')) {
    actions.push(
      { type: 'addEvidence', id: 'maralto_no_elisa_link' },
      { type: 'setFlag', id: 'block03_maralto_no_link', value: true },
    )
  }
  dispatchActions(actions)
}
