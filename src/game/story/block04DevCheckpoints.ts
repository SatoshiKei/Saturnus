import type { StoryActionRef } from '../types'
import { HEX_EVIDENCE_IDS } from '../../data/block04/hexagonPuzzle'
import { block03EntryActions } from './block03DevCheckpoints'

/** Estado final do Bloco 3 — entrada do Bloco 4. */
export const block04EntryActions: StoryActionRef[] = [
  ...block03EntryActions,
  {
    type: 'markTriggersFired',
    ids: ['block03_start', 'block04_start'],
  },
  { type: 'setFlag', id: 'block01_opening_seen', value: true },
  { type: 'setFlag', id: 'block03_nico_located', value: true },
  { type: 'setFlag', id: 'block03_nico_interview_done', value: true },
  { type: 'setFlag', id: 'block03_janus_done', value: true },
  { type: 'setFlag', id: 'block03_reanalysis_unlocked', value: true },
  { type: 'setFlag', id: 'block03_maralto_recording_found', value: true },
  { type: 'setFlag', id: 'block03_maralto_search_unlocked', value: true },
  { type: 'setFlag', id: 'block03_maralto_researched', value: true },
  { type: 'setFlag', id: 'block03_livia_located', value: true },
  { type: 'setFlag', id: 'block03_livia_interview_done', value: true },
  { type: 'setFlag', id: 'block03_saturnalia_done', value: true },
  { type: 'setFlag', id: 'block03_maralto_no_link', value: true },
  { type: 'setFlag', id: 'block03_complete', value: true },
  { type: 'addEvidence', id: 'nico_dj_identified' },
  { type: 'addEvidence', id: 'nico_current_record' },
  { type: 'addEvidence', id: 'nico_mariana_visit' },
  { type: 'addEvidence', id: 'mariana_night_x_focus' },
  { type: 'addEvidence', id: 'nico_recording_booth' },
  { type: 'addEvidence', id: 'nico_recording_portable' },
  { type: 'addEvidence', id: 'vertice_timeline_inconsistent' },
  { type: 'addEvidence', id: 'mariana_maralto_recording' },
  { type: 'addEvidence', id: 'maralto_public_record' },
  { type: 'addEvidence', id: 'maralto_no_elisa_link' },
  { type: 'addEvidence', id: 'livia_sought_by_mariana' },
  { type: 'addEvidence', id: 'livia_radio_archive_raw' },
  { type: 'addEvidence', id: 'protest_masked_core' },
  { type: 'addEvidence', id: 'morsa_unidentified' },
  { type: 'addEvidence', id: 'samuel_protest_lead' },
  { type: 'discoverPerson', id: 'nico', status: 'interviewed' },
  { type: 'discoverPerson', id: 'livia', status: 'interviewed' },
  { type: 'discoverPerson', id: 'morsa', status: 'identified' },
  { type: 'discoverPerson', id: 'samuel', status: 'identified' },
  { type: 'addHypothesis', id: 'hyp_andre_imprecise_chronology' },
  { type: 'addHypothesis', id: 'hyp_maralto_disappearance' },
  { type: 'addHypothesis', id: 'hyp_elisa_maralto_open' },
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
  { type: 'setFlag', id: 'block04_started', value: true },
  { type: 'setFlag', id: 'block04_samuel_search_unlocked', value: true },
  { type: 'addHypothesis', id: 'hyp_morsa_key' },
]

export const block04DevCheckpoints: { id: string; label: string; actions: StoryActionRef[] }[] = [
  {
    id: 'b04-start',
    label: 'Bloco 4 — início (fim Bloco 3)',
    actions: block04EntryActions,
  },
  {
    id: 'b04-samuel-ready',
    label: 'Samuel disponível',
    actions: [
      { type: 'addEvidence', id: 'samuel_current_record' },
      { type: 'setFlag', id: 'block04_samuel_located', value: true },
      { type: 'discoverPerson', id: 'samuel', status: 'contactable' },
      { type: 'completeTask', id: 'task_identify_morsa' },
      {
        type: 'addTask',
        id: 'task_interview_samuel',
        label: 'Ouvir Samuel sobre Morsa e os protestos',
      },
    ],
  },
  {
    id: 'b04-after-samuel',
    label: 'Após Samuel',
    actions: [
      { type: 'setFlag', id: 'block04_samuel_interview_done', value: true },
      { type: 'discoverPerson', id: 'samuel', status: 'interviewed' },
      { type: 'addEvidence', id: 'samuel_confirms_morsa' },
      { type: 'addEvidence', id: 'mariana_sought_samuel' },
      { type: 'addEvidence', id: 'mariana_morsa_timing' },
      { type: 'setFlag', id: 'block04_andre_records_unlocked', value: true },
      {
        type: 'addTask',
        id: 'task_andre_visits',
        label: 'Verificar registros de visita Mariana × André',
      },
    ],
  },
  {
    id: 'b04-andre-ready',
    label: 'André disponível',
    actions: [
      { type: 'addEvidence', id: 'mariana_andre_visit_record' },
      { type: 'setFlag', id: 'block04_andre_visit_found', value: true },
      { type: 'unlockLocation', id: 'presidio', status: 'visitAvailable' },
      { type: 'discoverPerson', id: 'andre', status: 'contactable' },
      {
        type: 'addTask',
        id: 'task_interview_andre',
        label: 'Visitar André na unidade prisional',
      },
    ],
  },
  {
    id: 'b04-after-andre',
    label: 'Após André',
    actions: [
      { type: 'setFlag', id: 'block04_andre_interview_done', value: true },
      { type: 'discoverPerson', id: 'andre', status: 'interviewed' },
      { type: 'addEvidence', id: 'andre_confirms_shift' },
      { type: 'addEvidence', id: 'andre_told_her_to_stop' },
      { type: 'addEvidence', id: 'andre_no_maralto_link' },
      { type: 'addHypothesis', id: 'hyp_andre_manipulating' },
      { type: 'setFlag', id: 'block04_chronology_search_unlocked', value: true },
      {
        type: 'addTask',
        id: 'task_check_andre_chronology',
        label: 'Cruzar cronologia: André × contato desconhecido',
      },
    ],
  },
  {
    id: 'b04-chronology-done',
    label: 'Comparação temporal concluída',
    actions: [
      { type: 'addEvidence', id: 'andre_contact_chronology_mismatch' },
      { type: 'setFlag', id: 'block04_andre_chronology_done', value: true },
      { type: 'updateHypothesis', id: 'hyp_andre_manipulating', state: 'weakened' },
      { type: 'setFlag', id: 'block04_hex_received', value: true },
      { type: 'pushProvocation', id: 'prov_hex_six' },
      ...HEX_EVIDENCE_IDS.map((id) => ({ type: 'addEvidence' as const, id })),
      { type: 'setFlag', id: 'block04_hexagon_available', value: true },
      {
        type: 'addTask',
        id: 'task_hexagon',
        label: 'Analisar os seis áudios anônimos (bancada)',
      },
    ],
  },
  {
    id: 'b04-hex-ready',
    label: 'Puzzle 6 disponível',
    actions: [{ type: 'setFlag', id: 'block04_hexagon_available', value: true }],
  },
  {
    id: 'b04-hex-done',
    label: 'Puzzle 6 resolvido',
    actions: [
      { type: 'setFlag', id: 'block04_hexagon_done', value: true },
      { type: 'addEvidence', id: 'hex_phrase_recovered' },
      { type: 'setFlag', id: 'block04_forensics_unlocked', value: true },
      {
        type: 'addTask',
        id: 'task_phone_forensics',
        label: 'Perícia: procurar o que a tela omite no celular de Mariana',
      },
    ],
  },
  {
    id: 'b04-hidden-app',
    label: 'Aplicativo oculto encontrado',
    actions: [
      { type: 'setFlag', id: 'block04_forensics_done', value: true },
      { type: 'addEvidence', id: 'hidden_app_detected' },
      { type: 'addEvidence', id: 'hidden_diary_recovered' },
      { type: 'revealHiddenApps', device: 'mariana' },
      { type: 'discoverPassword', which: 'diary' },
      {
        type: 'addTask',
        id: 'task_read_diary',
        label: 'Consultar o diário oculto de Mariana',
      },
    ],
  },
  {
    id: 'b04-diary-open',
    label: 'Diário aberto',
    actions: [
      { type: 'setFlag', id: 'block04_diary_opened', value: true },
      { type: 'addEvidence', id: 'diary_memory_fear' },
      { type: 'addEvidence', id: 'diary_julia_contradiction' },
      { type: 'addHypothesis', id: 'hyp_julia_manipulating' },
      { type: 'setFlag', id: 'block04_unknown_recording_unlocked', value: true },
      {
        type: 'addTask',
        id: 'task_unknown_recording',
        label: 'Localizar e ouvir CHK_UNK (Downloads)',
      },
    ],
  },
  {
    id: 'b04-unknown-found',
    label: 'Gravação desconhecida encontrada',
    actions: [
      { type: 'setFlag', id: 'block04_unknown_recording_found', value: true },
      { type: 'addEvidence', id: 'unknown_contact_recording' },
      {
        type: 'addTask',
        id: 'task_analyze_unknown',
        label: 'Analisar a gravação do contato desconhecido',
      },
    ],
  },
  {
    id: 'b04-unknown-analyzed',
    label: 'Gravação desconhecida analisada',
    actions: [
      { type: 'setFlag', id: 'block04_unknown_analyzed', value: true },
      { type: 'addEvidence', id: 'unknown_knows_mariana' },
      { type: 'addHypothesis', id: 'hyp_memory_interference' },
    ],
  },
  {
    id: 'b04-end',
    label: 'Fim do Bloco 4',
    actions: [
      { type: 'setFlag', id: 'block04_complete', value: true },
      {
        type: 'replaceTasks',
        tasks: [
          {
            id: 'task_press_nico',
            label: 'Pressionar Nico sobre o que omitiu da Noite X',
            completed: false,
          },
        ],
      },
    ],
  },
]
