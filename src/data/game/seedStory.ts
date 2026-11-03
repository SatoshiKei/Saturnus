import type {
  ContradictionDef,
  Hypothesis,
  InterviewTopic,
  ProvocationEvent,
  SearchRule,
  StoryTrigger,
  TimelineEvent,
  CaseTask,
} from '../../game/types'

export const seedTasks: CaseTask[] = [
  { id: 'task_review_bo', label: 'Revisar ocorrência inicial', completed: false },
  { id: 'task_listen_emergency', label: 'Ouvir ligação de emergência', completed: false },
  { id: 'task_mariana_phone', label: 'Examinar celular apreendido', completed: false },
]

export const block01EndTasks: CaseTask[] = [
  { id: 'task_trace_emergency_call', label: 'Analisar origem da ligação de emergência', completed: false },
  { id: 'task_julia_folder', label: 'Recolher pasta deixada com Júlia', completed: false },
  { id: 'task_rafael_recording', label: 'Identificar gravação mencionada por Rafael', completed: false },
  { id: 'task_rafael_venue_staff', label: 'Descobrir quem trabalhava no local da gravação', completed: false },
  { id: 'task_selective_lapses', label: 'Entender por que os lapsos de Mariana parecem seletivos', completed: false },
]

export const seedTimeline: TimelineEvent[] = [
  {
    id: 'evt_emergency_call',
    label: 'Chamada de emergência (central)',
    start: '08:03',
    precision: 'exact',
    sourceIds: ['emergency_call_raw'],
    confidence: 'medium',
    relatedPersonIds: ['mariana'],
    relatedLocationIds: [],
  },
]

/** Hipóteses registráveis — entram no estado via `addHypothesis`. */
export const hypothesisCatalog: Hypothesis[] = [
  {
    id: 'hyp_kidnapping',
    title: 'Possível sequestro ou intervenção de terceiro',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_memory',
    title: 'Mariana apresentava problema de memória',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_manipulation',
    title: 'Alguém pode estar interferindo na percepção de Mariana',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_own_investigation',
    title: 'Mariana conduzia uma investigação própria',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
]

export const contradictionDefs: ContradictionDef[] = [
  {
    id: 'contra_selective_memory',
    evidenceAId: 'mariana_memory_lapses',
    evidenceBId: 'rafael_call_memory',
    summary: 'Os lapsos de Mariana parecem seletivos.',
    actions: [
      { type: 'updateHypothesis', id: 'hyp_memory', state: 'weakened' },
      { type: 'addHypothesis', id: 'hyp_manipulation' },
      { type: 'linkHypothesis', hypothesisId: 'hyp_manipulation', evidenceId: 'mariana_memory_lapses', role: 'support' },
      { type: 'linkHypothesis', hypothesisId: 'hyp_manipulation', evidenceId: 'rafael_call_memory', role: 'support' },
      { type: 'setFlag', id: 'block01_contradiction_memory', value: true },
    ],
  },
]

export const seedInterviewTopics: InterviewTopic[] = []

export const seedProvocations: ProvocationEvent[] = []

export const seedSearchRules: SearchRule[] = []

export const seedStoryTriggers: StoryTrigger[] = [
  {
    id: 'block01_unlock_hospital',
    once: true,
    conditions: [{ type: 'flag', id: 'block01_contradiction_memory', value: true }],
    actions: [{ type: 'unlockLocation', id: 'hospital', status: 'visitAvailable' }],
  },
  {
    id: 'block01_complete_phone_task',
    once: true,
    conditions: [
      { type: 'flag', id: 'block01_julia_memory', value: true },
      { type: 'flag', id: 'block01_rafael_memory', value: true },
    ],
    actions: [{ type: 'completeTask', id: 'task_mariana_phone' }],
  },
  {
    id: 'block01_end_block',
    once: true,
    conditions: [{ type: 'flag', id: 'block01_hospital_done', value: true }],
    actions: [
      { type: 'discoverPerson', id: 'rafael', status: 'identified' },
      { type: 'unlockContact', contactId: 'contact-rafael' },
      { type: 'unlockChat', device: 'augusto', chatId: 'chat-rafael-augusto' },
      { type: 'replaceTasks', tasks: block01EndTasks },
      { type: 'setFlag', id: 'block01_complete', value: true },
    ],
  },
]

export const extraTimelineOnContradiction: TimelineEvent = {
  id: 'evt_memory_conflict',
  label: 'Contradição — lapsos de memória',
  start: '—',
  precision: 'contested',
  sourceIds: ['mariana_memory_lapses', 'rafael_call_memory'],
  confidence: 'low',
  relatedPersonIds: ['mariana', 'julia', 'rafael'],
  relatedLocationIds: [],
}
