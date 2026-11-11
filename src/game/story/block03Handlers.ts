import { dispatchActions, getInvestigationState } from '../state/investigationStore'
import type { StoryActionRef } from '../types'

/** Fim da conversa com Nico (a localização acontece por documento + ligação, ver `callScripts`). */
export function finishNicoInterview() {
  const s = getInvestigationState()
  const markVisited = { type: 'unlockLocation' as const, id: 'titan', status: 'visited' as const }
  if (s.flags.block03_nico_interview_done) {
    if (s.locations.titan?.status === 'visitAvailable') dispatchActions([markVisited])
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block03_nico_interview_done', value: true },
    { type: 'discoverPerson', id: 'nico', status: 'interviewed' },
    { type: 'addEvidence', id: 'nico_mariana_visit' },
    { type: 'addEvidence', id: 'mariana_night_x_focus' },
    { type: 'addEvidence', id: 'nico_recording_booth' },
    { type: 'addDocument', id: 'doc-vertice-set-log-levels' },
    { type: 'addDocument', id: 'doc-vertice-clock-infra' },
    { type: 'addDocument', id: 'doc-elisa-amiga-levels' },
    { type: 'completeTask', id: 'task_talk_nico' },
    {
      type: 'addTask',
      id: 'task_janus_sync',
      label: 'Comparar a captura ambiente com o feed da mesa (bancada forense)',
    },
    { type: 'setFlag', id: 'block03_janus_available', value: true },
    markVisited,
  ])
}

/**
 * Puzzle 4 — JANUS E EPIMETHEUS
 * Alinhamento das fontes + correção do set log + finding temporal.
 */
export function runJanusEpimetheusAnalysis() {
  const s = getInvestigationState()
  if (s.flags.block03_janus_done) return
  if (!s.evidenceOwned.includes('nico_recording_booth')) return
  dispatchActions([
    { type: 'setFlag', id: 'block03_janus_done', value: true },
    { type: 'addEvidence', id: 'vertice_clocks_unsynced' },
    { type: 'addEvidence', id: 'vertice_timeline_inconsistent' },
    { type: 'addEvidence', id: 'sandra_first_sighting_not_elisa' },
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
    {
      type: 'notifyInvestigationUpdate',
      id: 'ach-janus-epimetheus',
      kind: 'evidence',
      presentation: 'card',
      label: 'CONQUISTA',
      title: 'JANUS E EPIMETHEUS',
      summary: 'Sincronizou duas fontes independentes da noite do Vértice.',
      refId: 'sandra_first_sighting_not_elisa',
    },
  ])
}

/** @deprecated Prefer runJanusEpimetheusAnalysis — mantido para checkpoints legados. */
export function runProvisionalJanusSync() {
  runJanusEpimetheusAnalysis()
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
    { type: 'discoverSearchTerm', term: 'maralto' },
    {
      type: 'addTask',
      id: 'task_research_maralto',
      label: 'Pesquisar Maralto Granéis no sistema de consulta',
    },
  ])
}

export function finishLiviaInterview() {
  const s = getInvestigationState()
  const markVisited = { type: 'unlockLocation' as const, id: 'radio', status: 'visited' as const }
  if (s.flags.block03_livia_interview_done) {
    if (s.locations.radio?.status === 'visitAvailable') dispatchActions([markVisited])
    return
  }
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
    markVisited,
  ])
  // Import dinâmico evitado: flag lida no earlyPathHandlers.
  if (getInvestigationState().flags.samuel_accidental_done) {
    dispatchActions([{ type: 'setFlag', id: 'theory_maralto_retaliation_pending', value: true }])
  }
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
    { type: 'discoverSearchTerm', term: 'morsa' },
    { type: 'discoverPerson', id: 'samuel', status: 'identified' },
    { type: 'discoverSearchTerm', term: 'samuel' },
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
  // Reabre André se a 1ª visita já ocorreu — tópico Maralto passa a existir.
  if (s.flags.block04_andre_interview_done) {
    actions.push({ type: 'unlockLocation', id: 'presidio', status: 'visitAvailable' })
  }
  // Saturnalia recontextualiza Samuel se a visita acidental já aconteceu.
  if (s.flags.samuel_accidental_done) {
    actions.push({ type: 'unlockLocation', id: 'samuel-casa', status: 'visitAvailable' })
  }
  if (!s.flags.block03_maralto_no_link && !s.evidenceOwned.includes('maralto_no_elisa_link')) {
    actions.push(
      { type: 'addEvidence', id: 'maralto_no_elisa_link' },
      { type: 'setFlag', id: 'block03_maralto_no_link', value: true },
    )
  }
  dispatchActions(actions)
}
