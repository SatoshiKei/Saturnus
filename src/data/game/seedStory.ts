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
  { id: 'task_read_bo', label: 'Ler o BO inicial', completed: false, auto: true },
  { id: 'task_mariana_phone', label: 'Examinar celular apreendido', completed: false },
  { id: 'task_identify_rafael', label: 'Identificar origem do áudio de Rafael', completed: false },
]

export const seedTimeline: TimelineEvent[] = [
  {
    id: 'evt_desaparecimento',
    label: 'Último contato com Mariana',
    start: '22:14',
    precision: 'exact',
    sourceIds: ['bo_inicial'],
    confidence: 'medium',
    relatedPersonIds: ['mariana'],
    relatedLocationIds: [],
  },
]

export const seedHypotheses: Hypothesis[] = [
  {
    id: 'hyp_memory_selective',
    title: 'Episódios de memória seletiva',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
]

export const contradictionDefs: ContradictionDef[] = [
  {
    id: 'contra_julia_memory',
    evidenceAId: 'julia_statement_memory',
    evidenceBId: 'mariana_memory_audio',
    summary: 'Os episódios de memória parecem seletivos.',
    actions: [
      { type: 'updateHypothesis', id: 'hyp_memory_selective', state: 'active' },
      { type: 'unlockTopic', id: 'julia_memory_followup' },
      { type: 'addTimelineEvent', id: 'evt_memory_conflict' },
    ],
  },
]

export const seedInterviewTopics: InterviewTopic[] = [
  {
    id: 'julia_memory_followup',
    label: 'Memória e conversas recentes',
    personId: 'julia',
    unlockedByEvidence: ['julia_statement_memory', 'mariana_memory_audio'],
  },
]

export const seedProvocations: ProvocationEvent[] = [
  {
    id: 'prov_anon_sms_01',
    channel: 'sms',
    preview: 'Número desconhecido: “Você ainda não ouviu a gravação certa.”',
    triggerFlag: 'flag_contradiction_julia_confirmed',
    actions: [{ type: 'discoverSearchTerm', term: 'wavelab' }],
  },
]

export const seedSearchRules: SearchRule[] = [
  {
    id: 'search_maralto_generic',
    category: 'news',
    requiredTerms: ['maralto'],
    results: [
      {
        title: 'Protestos em Maralto — cobertura genérica',
        snippet: 'Região portuária citada em manifestações recentes. Sem detalhes novos.',
      },
    ],
    discoverTerms: ['maralto'],
  },
  {
    id: 'search_wavelab_hint',
    category: 'web',
    requiredTerms: ['wavelab'],
    results: [
      {
        title: 'WaveLab Mobile — processamento local',
        snippet:
          'Aplicativo móvel capaz de abrir gravações protegidas pelo sandbox de outros apps no mesmo aparelho.',
      },
    ],
    discoverTerms: ['wavelab mobile'],
  },
]

export const seedStoryTriggers: StoryTrigger[] = [
  {
    id: 'unlock_rafael_on_audio',
    once: true,
    conditions: [{ type: 'evidenceOwned', id: 'rafael_audio_01' }],
    actions: [
      { type: 'discoverPerson', id: 'rafael', status: 'identified' },
      { type: 'completeTask', id: 'task_identify_rafael' },
    ],
  },
  {
    id: 'unlock_vertice',
    once: true,
    conditions: [
      { type: 'evidenceOwned', id: 'rafael_audio_01' },
      { type: 'flag', id: 'topic_old_dj', value: true },
    ],
    actions: [
      { type: 'unlockLocation', id: 'vertice', status: 'known' },
      { type: 'addTask', id: 'task_visit_vertice' },
    ],
  },
  {
    id: 'flag_contradiction_julia_confirmed',
    once: true,
    conditions: [{ type: 'contradictionConfirmed', id: 'contra_julia_memory' }],
    actions: [
      { type: 'setFlag', id: 'flag_contradiction_julia_confirmed', value: true },
      { type: 'pushProvocation', id: 'prov_anon_sms_01' },
    ],
  },
]

export const extraTimelineOnContradiction: TimelineEvent = {
  id: 'evt_memory_conflict',
  label: 'Contradição — memória de Mariana',
  start: '—',
  precision: 'contested',
  sourceIds: ['julia_statement_memory', 'mariana_memory_audio'],
  confidence: 'low',
  relatedPersonIds: ['mariana', 'julia'],
  relatedLocationIds: [],
}
