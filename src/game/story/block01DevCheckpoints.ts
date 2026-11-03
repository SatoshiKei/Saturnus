import type { StoryActionRef } from '../types'
import { block01EndTasks } from '../../data/game/seedStory'

/** Atalhos DEV — Bloco 1 (não expor em produção). */
export const block01DevCheckpoints: { id: string; label: string; actions: StoryActionRef[] }[] = [
  { id: 'b01-start', label: 'Bloco 1 — início', actions: [] },
  {
    id: 'b01-after-bo',
    label: 'Após BO',
    actions: [
      { type: 'setFlag', id: 'block01_bo_registered', value: true },
      { type: 'setFlag', id: 'block01_opening_seen', value: true },
      { type: 'addEvidence', id: 'initial_police_report' },
      { type: 'addHypothesis', id: 'hyp_kidnapping' },
      { type: 'completeTask', id: 'task_review_bo' },
    ],
  },
  {
    id: 'b01-after-call',
    label: 'Após ligação (análise prov.)',
    actions: [
      { type: 'setFlag', id: 'block01_emergency_provisional', value: true },
      { type: 'addEvidence', id: 'emergency_call_restored' },
      { type: 'completeTask', id: 'task_listen_emergency' },
    ],
  },
  {
    id: 'b01-after-phone',
    label: 'Após celular (Júlia + Rafael)',
    actions: [
      { type: 'setFlag', id: 'block01_julia_memory', value: true },
      { type: 'setFlag', id: 'block01_rafael_memory', value: true },
      { type: 'addEvidence', id: 'mariana_memory_lapses' },
      { type: 'addEvidence', id: 'rafael_call_memory' },
      { type: 'addEvidence', id: 'call_history_gap' },
      { type: 'completeTask', id: 'task_mariana_phone' },
    ],
  },
  {
    id: 'b01-hospital-open',
    label: 'Hospital desbloqueado',
    actions: [
      { type: 'setFlag', id: 'block01_contradiction_memory', value: true },
      { type: 'unlockLocation', id: 'hospital', status: 'visitAvailable' },
    ],
  },
  {
    id: 'b01-after-interviews',
    label: 'Após entrevistas',
    actions: [
      { type: 'setFlag', id: 'block01_hospital_done', value: true },
      { type: 'addEvidence', id: 'julia_kept_folder' },
      { type: 'addEvidence', id: 'camila_witness_note' },
    ],
  },
  {
    id: 'b01-end',
    label: 'Fim do bloco',
    actions: [
      { type: 'setFlag', id: 'block01_hospital_done', value: true },
      { type: 'setFlag', id: 'block01_complete', value: true },
      { type: 'discoverPerson', id: 'rafael', status: 'identified' },
      { type: 'unlockContact', contactId: 'contact-rafael' },
      { type: 'unlockChat', device: 'augusto', chatId: 'chat-rafael-augusto' },
      { type: 'replaceTasks', tasks: block01EndTasks },
    ],
  },
]
