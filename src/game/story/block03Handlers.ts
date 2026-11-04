import { dispatchActions, getInvestigationState } from '../state/investigationStore'
import type { StoryActionRef } from '../types'

/** Localização de Nico via cadastro policial (cruzamento com arquivos do Vértice). */
export function onNicoCurrentRecordFound() {
  const s = getInvestigationState()
  if (s.flags.block03_nico_located) return
  dispatchActions([
    { type: 'setFlag', id: 'block03_nico_located', value: true },
    { type: 'discoverPerson', id: 'nico', status: 'located' },
    { type: 'discoverPerson', id: 'nico', status: 'contactable' },
    { type: 'completeTask', id: 'task_locate_nico' },
    {
      type: 'addTask',
      id: 'task_interview_nico',
      label: 'Entrevistar Nico — testemunha do caso Elisa',
    },
  ])
}

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
    { type: 'completeTask', id: 'task_interview_nico' },
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

export function onMaraltoPublicResearched() {
  const s = getInvestigationState()
  if (s.flags.block03_maralto_researched) return
  dispatchActions([
    { type: 'setFlag', id: 'block03_maralto_researched', value: true },
    { type: 'completeTask', id: 'task_research_maralto' },
    { type: 'addHypothesis', id: 'hyp_maralto_disappearance' },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_maralto_disappearance',
      evidenceId: 'mariana_maralto_recording',
      role: 'support',
    },
    { type: 'addHypothesis', id: 'hyp_elisa_maralto_open' },
    { type: 'discoverPerson', id: 'livia', status: 'identified' },
    { type: 'setFlag', id: 'block03_livia_search_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_locate_livia',
      label: 'Localizar Lívia Serrano — cobertura dos protestos',
    },
  ])
}

export function onMaraltoElisaCrossFound() {
  const s = getInvestigationState()
  if (s.flags.block03_maralto_no_link) return
  dispatchActions([
    { type: 'setFlag', id: 'block03_maralto_no_link', value: true },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_elisa_maralto_open',
      evidenceId: 'maralto_no_elisa_link',
      role: 'contradict',
    },
  ])
}

export function onLiviaContactFound() {
  const s = getInvestigationState()
  if (s.flags.block03_livia_located) return
  dispatchActions([
    { type: 'setFlag', id: 'block03_livia_located', value: true },
    { type: 'discoverPerson', id: 'livia', status: 'located' },
    { type: 'discoverPerson', id: 'livia', status: 'contactable' },
    { type: 'completeTask', id: 'task_locate_livia' },
    {
      type: 'addTask',
      id: 'task_interview_livia',
      label: 'Ouvir Lívia Serrano sobre os arquivos históricos',
    },
  ])
}

export function finishLiviaInterview() {
  const s = getInvestigationState()
  if (s.flags.block03_livia_interview_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block03_livia_interview_done', value: true },
    { type: 'discoverPerson', id: 'livia', status: 'interviewed' },
    { type: 'addEvidence', id: 'protest_records_incomplete' },
    { type: 'addEvidence', id: 'livia_radio_archive_raw' },
    { type: 'completeTask', id: 'task_interview_livia' },
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

/** Hits de busca do Bloco 3 — chamado após `applyPoliceSearchHit`. */
export function applyBlock03SearchHit(evidenceId: string) {
  if (!evidenceId) return
  if (evidenceId === 'nico_current_record') onNicoCurrentRecordFound()
  if (evidenceId === 'maralto_public_record') onMaraltoPublicResearched()
  if (evidenceId === 'livia_sought_by_mariana') {
    const s = getInvestigationState()
    if (!s.flags.block03_maralto_researched) onMaraltoPublicResearched()
  }
  if (evidenceId === 'maralto_no_elisa_link') onMaraltoElisaCrossFound()
  if (evidenceId === 'livia_contact_record') onLiviaContactFound()
}
