import type { StoryActionRef } from '../types'
import { block05EntryActions } from './block05DevCheckpoints'
import { HEX_EVIDENCE_IDS } from '../../data/block04/hexagonPuzzle'
import { PASTOR_LOCATION_ID } from '../../data/block06/pastorMoonsPuzzle'

/** Estado final do Bloco 5 — entrada do Bloco 6. */
export const block06EntryActions: StoryActionRef[] = [
  ...block05EntryActions,
  {
    type: 'markTriggersFired',
    ids: ['block03_start', 'block04_start', 'block05_start', 'block06_start'],
  },
  { type: 'setFlag', id: 'block05_nico_followup_done', value: true },
  { type: 'setFlag', id: 'block05_jana_interview_done', value: true },
  { type: 'setFlag', id: 'block05_elisa_review_done', value: true },
  { type: 'setFlag', id: 'block05_chronology_done', value: true },
  { type: 'setFlag', id: 'block05_compare_done', value: true },
  { type: 'setFlag', id: 'block05_emergency_revisited', value: true },
  { type: 'setFlag', id: 'block05_complete', value: true },
  { type: 'setFlag', id: 'block06_entry_ready', value: true },
  { type: 'setFlag', id: 'block06_started', value: true },
  { type: 'setFlag', id: 'block06_geraldo_search_unlocked', value: true },
  { type: 'addDocument', id: 'doc-elisa-geraldo-depoimento' },
  { type: 'addHypothesis', id: 'hyp_deliberate_path' },
  { type: 'addEvidence', id: 'jana_confirms_jacket' },
  { type: 'addEvidence', id: 'jana_loan_explanation' },
  { type: 'discoverPerson', id: 'jana', status: 'interviewed' },
  { type: 'unlockLocation', id: 'jana-casa', status: 'visited' },
  { type: 'unlockLocation', id: 'titan', status: 'visited' },
  ...HEX_EVIDENCE_IDS.map((id) => ({ type: 'addEvidence' as const, id })),
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
]

export const block06DevCheckpoints: { id: string; label: string; actions: StoryActionRef[] }[] = [
  {
    id: 'b06-start',
    label: 'Bloco 6 — início (fim Bloco 5)',
    actions: block06EntryActions,
  },
  {
    id: 'b06-geraldo-ready',
    label: 'Geraldo localizado (mapa)',
    actions: [
      { type: 'addDocument', id: 'doc-geraldo-ficha' },
      { type: 'addDocument', id: 'doc-vertice-comanda-noitex' },
      { type: 'addEvidence', id: 'vertice_comanda_night_x' },
      { type: 'discoverPerson', id: 'geraldo', status: 'located' },
      { type: 'unlockLocation', id: 'geraldo-casa', status: 'visitAvailable' },
      { type: 'completeTask', id: 'task_reexamine_elisa_from_scratch' },
      {
        type: 'addTask',
        id: 'task_talk_geraldo',
        label: 'Ir ao endereço de Geraldo Mota',
      },
    ],
  },
  {
    id: 'b06-after-geraldo',
    label: 'Após Geraldo (+ reflexão)',
    actions: [
      { type: 'setFlag', id: 'block06_geraldo_interview_done', value: true },
      { type: 'discoverPerson', id: 'geraldo', status: 'interviewed' },
      { type: 'addEvidence', id: 'geraldo_minimized_alcohol' },
      { type: 'addEvidence', id: 'elisa_more_alcohol_than_stated' },
      { type: 'addEvidence', id: 'geraldo_suspected_underage' },
      { type: 'unlockLocation', id: 'geraldo-casa', status: 'visited' },
      { type: 'setFlag', id: 'block06_geraldo_reflection_done', value: true },
      { type: 'setFlag', id: 'refl-b06-geraldo_seen', value: true },
      { type: 'unlockLocation', id: 'jana-casa', status: 'visitAvailable' },
      {
        type: 'addTask',
        id: 'task_press_jana_again',
        label: 'Voltar a falar com Jana — jaqueta e condição de Elisa',
      },
    ],
  },
  {
    id: 'b06-after-jana2',
    label: 'Após Jana 2 (Válter)',
    actions: [
      { type: 'setFlag', id: 'block06_jana_followup_done', value: true },
      { type: 'addEvidence', id: 'jana_gave_belongings_deliberately' },
      { type: 'addEvidence', id: 'jana_feared_valter_people' },
      { type: 'addHypothesis', id: 'hyp_jana_hid_info' },
      { type: 'updateHypothesis', id: 'hyp_jana_hid_info', state: 'confirmed' },
      { type: 'addHypothesis', id: 'hyp_follower_sought_jana' },
      { type: 'unlockLocation', id: 'jana-casa', status: 'visited' },
      { type: 'discoverPerson', id: 'valter', status: 'identified' },
      { type: 'setFlag', id: 'block06_valter_search_unlocked', value: true },
      {
        type: 'addTask',
        id: 'task_investigate_valter',
        label: 'Investigar Válter e a estrutura criminosa ligada a ele',
      },
    ],
  },
  {
    id: 'b06-valter-trail',
    label: 'Trilha Válter → Miro + interceptações',
    actions: [
      { type: 'addDocument', id: 'doc-valter-ocorrencias' },
      { type: 'addDocument', id: 'doc-valter-associados' },
      { type: 'addDocument', id: 'doc-valter-interceptacao' },
      { type: 'addDocument', id: 'doc-tabela-logistica-g17n' },
      { type: 'addEvidence', id: 'valter_criminal_structure' },
      { type: 'addEvidence', id: 'miro_linked_to_valter_group' },
      { type: 'addEvidence', id: 'valter_group_active_intercepts' },
      { type: 'setFlag', id: 'block06_valter_trail_done', value: true },
      { type: 'discoverPerson', id: 'miro', status: 'identified' },
      { type: 'setFlag', id: 'block06_pastor_available', value: true },
      { type: 'completeTask', id: 'task_investigate_valter' },
      {
        type: 'addTask',
        id: 'task_pastor_moons',
        label: 'Analisar as interceptações de rádio (bancada) — localizar a entrega',
      },
    ],
  },
  {
    id: 'b06-pastor-done',
    label: 'Puzzle 7 resolvido (G17N)',
    actions: [
      { type: 'setFlag', id: 'block06_pastor_done', value: true },
      { type: 'addEvidence', id: 'pastor_token_g17n' },
      { type: 'addEvidence', id: 'galpao17_operational_site' },
      { type: 'completeTask', id: 'task_pastor_moons' },
      { type: 'unlockLocation', id: PASTOR_LOCATION_ID, status: 'visitAvailable' },
      { type: 'setFlag', id: 'block06_operation_ready', value: true },
      {
        type: 'addTask',
        id: 'task_valter_operation',
        label: 'Deflagrar operação no Galpão 17 — Pátio Norte',
      },
    ],
  },
  {
    id: 'b06-after-operation',
    label: 'Após operação (Miro preso)',
    actions: [
      { type: 'setFlag', id: 'block06_operation_done', value: true },
      { type: 'addEvidence', id: 'miro_arrested_current_crimes' },
      { type: 'unlockLocation', id: PASTOR_LOCATION_ID, status: 'visited' },
      { type: 'discoverPerson', id: 'miro', status: 'located' },
      { type: 'unlockLocation', id: 'detencao-miro', status: 'visitAvailable' },
      {
        type: 'addTask',
        id: 'task_interview_miro',
        label: 'Interrogar Miro na detenção — Noite X',
      },
    ],
  },
  {
    id: 'b06-end',
    label: 'Fim do Bloco 6',
    actions: [
      { type: 'setFlag', id: 'block06_miro_interview_done', value: true },
      { type: 'discoverPerson', id: 'miro', status: 'interviewed' },
      { type: 'addEvidence', id: 'miro_sought_jana_night_x' },
      { type: 'addEvidence', id: 'miro_followed_elisa_by_mistake' },
      { type: 'addEvidence', id: 'miro_denies_killing_elisa' },
      { type: 'unlockLocation', id: 'detencao-miro', status: 'visited' },
      { type: 'addHypothesis', id: 'hyp_miro_followed_to_fall' },
      { type: 'addHypothesis', id: 'hyp_lookalike_may_not_be_andre' },
      { type: 'addHypothesis', id: 'hyp_andre_killed_elisa' },
      { type: 'updateHypothesis', id: 'hyp_andre_killed_elisa', state: 'weakened' },
      { type: 'addHypothesis', id: 'hyp_mariana_right_on_ignored_aspects' },
      { type: 'updateHypothesis', id: 'hyp_mariana_right_on_ignored_aspects', state: 'confirmed' },
      { type: 'setFlag', id: 'block06_complete', value: true },
      { type: 'setFlag', id: 'block07_entry_ready', value: true },
      { type: 'setFlag', id: 'block07_miro_followup_done', value: true },
      { type: 'addEvidence', id: 'miro_descended_fall_area' },
      { type: 'addEvidence', id: 'miro_recovered_jana_bag' },
      { type: 'setFlag', id: 'block07_sandra_search_unlocked', value: true },
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
    ],
  },
]
