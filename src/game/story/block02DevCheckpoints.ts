import type { StoryActionRef } from '../types'
import { block01EndTasks } from '../../data/game/seedStory'

/** Atalhos DEV — Bloco 2 (não expor em produção). */
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
    id: 'b02-after-rafael-audio',
    label: 'Após Rafael (áudio recebido)',
    actions: [
      { type: 'setFlag', id: 'block02_rafael_forward_received', value: true },
      { type: 'addEvidence', id: 'rafael_voice_to_augusto' },
      { type: 'completeTask', id: 'task_rafael_recording' },
    ],
  },
  {
    id: 'b02-vertice-unlocked',
    label: 'Vértice desbloqueado',
    actions: [
      { type: 'setFlag', id: 'block02_rafael_forward_provisional', value: true },
      { type: 'addEvidence', id: 'rafael_recording_vertice_tag' },
      { type: 'unlockLocation', id: 'vertice', status: 'visitAvailable' },
    ],
  },
  {
    id: 'b02-archive-ready',
    label: 'Arquivo Vértice + gravação (Puzzle 03)',
    actions: [
      { type: 'setFlag', id: 'block02_vertice_iara', value: true },
      { type: 'setFlag', id: 'block02_vertice_sandro', value: true },
      { type: 'setFlag', id: 'block02_vertice_caio', value: true },
      { type: 'setFlag', id: 'block02_vertice_archive', value: true },
      { type: 'addDocument', id: 'doc-vertice-escala' },
      { type: 'addEvidence', id: 'rec_vtx_old_01' },
    ],
  },
  {
    id: 'b02-nico-identified',
    label: 'Nico identificado (pós-ANÉIS)',
    actions: [
      { type: 'setFlag', id: 'block02_vertice_iara', value: true },
      { type: 'setFlag', id: 'block02_vertice_sandro', value: true },
      { type: 'setFlag', id: 'block02_vertice_caio', value: true },
      { type: 'setFlag', id: 'block02_vertice_archive', value: true },
      { type: 'setFlag', id: 'block02_rings_provisional', value: true },
      { type: 'addDocument', id: 'doc-vertice-escala' },
      { type: 'addEvidence', id: 'rec_vtx_old_01' },
      { type: 'addEvidence', id: 'rec_vtx_set_nico_match' },
      { type: 'addEvidence', id: 'nico_dj_identified' },
      { type: 'discoverPerson', id: 'nico', status: 'identified' },
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
