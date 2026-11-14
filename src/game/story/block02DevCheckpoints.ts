import type { StoryActionRef } from '../types'
import { block01EndTasks } from '../../data/game/seedStory'

/**
 * Atalhos DEV — Bloco 2 (não expor em produção).
 *
 * Cadeia canônica P2→P4 (ordem dos checkpoints):
 *  1. P2 (rafael_audio_reply no celular de Mariana) → Vértice + mídia da balada ausente.
 *  2. 1ª visita ao Vértice → arquivos existem (sem áudio P3, sem Nico).
 *  3. Rafael (exige block02_vertice_archive) → rec_vtx_old_01 (gravação da balada).
 *  4. P3 técnico (ANÉIS A→B) → reabre Vértice (sem Nico).
 *  5. 2ª visita (set_crossref) → Nico identificado.
 */
export const block02DevCheckpoints: { id: string; label: string; actions: StoryActionRef[] }[] = [
  {
    id: 'b02-start',
    label: 'Bloco 2 — início (fim Bloco 1)',
    actions: [
      { type: 'setFlag', id: 'block01_hospital_done', value: true },
      { type: 'setFlag', id: 'block01_complete', value: true },
      { type: 'setFlag', id: 'block02_started', value: true },
      { type: 'discoverPerson', id: 'rafael', status: 'identified' },
      { type: 'unlockContact', contactId: 'contact-rafael' },
      { type: 'unlockChat', device: 'augusto', chatId: 'chat-rafael-augusto' },
      { type: 'replaceTasks', tasks: block01EndTasks },
    ],
  },
  {
    id: 'b02-vertice-unlocked',
    label: 'P2 — Vértice desbloqueado (áudio de Rafael no celular de Mariana)',
    actions: [
      { type: 'setFlag', id: 'block02_rafael_forward_provisional', value: true },
      { type: 'addEvidence', id: 'rafael_recording_vertice_tag' },
      { type: 'addEvidence', id: 'mariana_club_recording_missing' },
      { type: 'unlockLocation', id: 'vertice', status: 'visitAvailable' },
      { type: 'addTask', id: 'task_vertice_dj', label: 'Investigar o Vértice — o que Mariana perguntou lá' },
      {
        type: 'addTask',
        id: 'task_rafael_recording',
        label: 'Recuperar a gravação original que Mariana enviou a Rafael',
      },
    ],
  },
  {
    id: 'b02-archive-ready',
    label: '1ª visita ao Vértice — arquivos existem',
    actions: [
      { type: 'setFlag', id: 'block02_vertice_iara', value: true },
      { type: 'setFlag', id: 'block02_vertice_sandro', value: true },
      { type: 'setFlag', id: 'block02_vertice_caio', value: true },
      { type: 'setFlag', id: 'block02_vertice_archive', value: true },
      { type: 'setFlag', id: 'block02_vertice_visit_done', value: true },
      { type: 'addEvidence', id: 'mariana_vertice_visit' },
      { type: 'addEvidence', id: 'mariana_repeated_questions' },
      { type: 'addDocument', id: 'doc-vertice-escala' },
      { type: 'completeTask', id: 'task_rafael_venue_staff' },
      {
        type: 'addTask',
        id: 'task_get_club_from_rafael',
        label: 'Pedir a Rafael a gravação original que Mariana lhe enviou',
      },
      { type: 'unlockLocation', id: 'vertice', status: 'visited' },
    ],
  },
  {
    id: 'b02-after-rafael-audio',
    label: 'Rafael envia a gravação da balada (Puzzle 03)',
    actions: [
      { type: 'setFlag', id: 'block02_rafael_chat_done', value: true },
      { type: 'setFlag', id: 'block02_rafael_club_received', value: true },
      { type: 'setFlag', id: 'block02_rafael_forward_received', value: true },
      { type: 'addEvidence', id: 'rec_vtx_old_01' },
      { type: 'completeTask', id: 'task_rafael_recording' },
      {
        type: 'addTask',
        id: 'task_match_vertice_set',
        label: 'Analisar a gravação da balada e extrair a transição musical',
      },
    ],
  },
  {
    id: 'b02-rings-provisional',
    label: 'P3 — ANÉIS técnico (A→B), Vértice reaberto',
    actions: [
      { type: 'setFlag', id: 'block02_rings_provisional', value: true },
      { type: 'addEvidence', id: 'rec_vtx_fingerprint_transition' },
      { type: 'completeTask', id: 'task_match_vertice_set' },
      { type: 'unlockLocation', id: 'vertice', status: 'visitAvailable' },
      {
        type: 'addTask',
        id: 'task_vertice_cross_reference',
        label: 'Cruzar a transição A→B com os registros históricos do Vértice',
      },
    ],
  },
  {
    id: 'b02-nico-identified',
    label: '2ª visita ao Vértice — Nico identificado',
    actions: [
      { type: 'setFlag', id: 'block02_vertice_set_crossref', value: true },
      { type: 'addEvidence', id: 'nico_dj_identified' },
      { type: 'addEvidence', id: 'rec_vtx_set_nico_match' },
      { type: 'discoverPerson', id: 'nico', status: 'identified' },
      { type: 'discoverSearchTerm', term: 'nico' },
      { type: 'setFlag', id: 'block03_nico_search_unlocked', value: true },
      { type: 'completeTask', id: 'task_vertice_dj' },
      { type: 'completeTask', id: 'task_vertice_cross_reference' },
      { type: 'addTask', id: 'task_locate_nico', label: 'Localizar Nico' },
      { type: 'unlockLocation', id: 'vertice', status: 'visited' },
    ],
  },
  {
    id: 'b02-after-paula',
    label: 'Após Paula',
    actions: [
      { type: 'setFlag', id: 'block01_note_quarta_read', value: true },
      { type: 'setFlag', id: 'block02_paula_chat_unlocked', value: true },
      { type: 'setFlag', id: 'block02_paula_chat_done', value: true },
      { type: 'unlockContact', contactId: 'contact-paula' },
      { type: 'unlockChat', device: 'augusto', chatId: 'chat-paula-augusto' },
      { type: 'addEvidence', id: 'paula_leads_lucas' },
      { type: 'discoverPerson', id: 'lucas', status: 'contactable' },
    ],
  },
  {
    id: 'b02-after-lucas',
    label: 'Após Lucas',
    actions: [
      { type: 'setFlag', id: 'block02_lucas_interview_done', value: true },
      { type: 'addEvidence', id: 'lucas_knew_elisa' },
      { type: 'addEvidence', id: 'mariana_andre_innocence' },
      { type: 'discoverPerson', id: 'lucas', status: 'interviewed' },
      { type: 'setFlag', id: 'block02_elisa_search_unlocked', value: true },
      { type: 'addHypothesis', id: 'hyp_voluntary_disappearance' },
    ],
  },
  {
    id: 'b02-convergence',
    label: 'Convergência Elisa/Nico',
    actions: [
      { type: 'addEvidence', id: 'elisa_case_summary' },
      { type: 'addEvidence', id: 'nico_elisa_witness' },
      { type: 'discoverPerson', id: 'elisa', status: 'identified' },
      { type: 'discoverPerson', id: 'andre', status: 'identified' },
      { type: 'addDocument', id: 'doc-elisa-resumo' },
      { type: 'addDocument', id: 'doc-elisa-testemunhas' },
      { type: 'markTriggersFired', ids: ['block02_convergence'] },
      { type: 'setFlag', id: 'block02_convergence_done', value: true },
      { type: 'addEvidence', id: 'mariana_rebuilding_elisa_case' },
      { type: 'updateHypothesis', id: 'hyp_own_investigation', state: 'confirmed' },
    ],
  },
  {
    id: 'b02-end',
    label: 'Fim do bloco',
    actions: [
      { type: 'setFlag', id: 'block02_complete', value: true },
      {
        type: 'replaceTasks',
        tasks: [{ id: 'task_locate_nico', label: 'Localizar Nico — testemunha do caso Elisa', completed: false }],
      },
    ],
  },
]
