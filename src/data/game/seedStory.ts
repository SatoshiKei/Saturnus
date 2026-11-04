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
  {
    id: 'hyp_voluntary_disappearance',
    title: 'Mariana desapareceu voluntariamente durante tentativa de provar a inocência de André',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_andre_imprecise_chronology',
    title: 'André pode ter sido condenado com uma cronologia imprecisa',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_maralto_disappearance',
    title: 'Maralto pode estar relacionada ao desaparecimento de Mariana',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_elisa_maralto_open',
    title: 'Elisa e Maralto fazem parte da mesma investigação — pergunta em aberto',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_andre_manipulating',
    title: 'André pode estar utilizando Mariana para desmontar a própria condenação',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_julia_manipulating',
    title: 'Júlia pode estar influenciando Mariana',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_morsa_key',
    title: 'Morsa é chave para entender os protestos',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_memory_interference',
    title: 'Alguém estava fazendo Mariana duvidar da própria memória',
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

export const seedProvocations: ProvocationEvent[] = [
  {
    id: 'prov_hex_six',
    channel: 'audio',
    preview: 'Seis arquivos sem remetente. Sem legenda. Só anexos.',
    triggerFlag: 'block04_hex_received',
  },
]

export const seedSearchRules: SearchRule[] = [
  {
    id: 'block02_elisa_process',
    category: 'police',
    requiredFlags: ['block02_elisa_search_unlocked'],
    requiredTerms: ['elisa'],
    results: [
      {
        title: 'Processo criminal — Elisa Duarte',
        snippet:
          'Vítima: Elisa Duarte, 17 anos. Réu: André Silva. Homicídio doloso. Condenado em 1ª instância; recurso pendente.',
        evidenceId: 'elisa_case_summary',
      },
      {
        title: 'Testemunhas arquivadas',
        snippet: 'Nicolas “Nico” — DJ — consta como testemunha no mesmo processo.',
        evidenceId: 'nico_elisa_witness',
      },
    ],
  },
  {
    id: 'block03_nico_cadastro',
    category: 'police',
    requiredFlags: ['block03_nico_search_unlocked'],
    requiredTerms: ['nico'],
    results: [
      {
        title: 'Cadastro atual — Nicolas (Nico)',
        snippet:
          'Cruzamento com dados históricos do Vértice: endereço residencial e vínculo profissional atualizados. Contato localizável.',
        evidenceId: 'nico_current_record',
      },
    ],
  },
  {
    id: 'block03_maralto_public',
    category: 'police',
    requiredFlags: ['block03_maralto_search_unlocked'],
    requiredTerms: ['maralto'],
    results: [
      {
        title: 'Maralto Granéis — fichário público',
        snippet:
          'Operação portuária consolidada na região; protestos e confrontos na época da implantação; cobertura jornalística (Lívia Serrano). Arquivos oficiais incompletos.',
        evidenceId: 'maralto_public_record',
      },
      {
        title: 'Cobertura histórica — Lívia Serrano',
        snippet: 'Jornalista local citada nas matérias dos protestos. Mariana a teria procurado segundo anotações cruzadas.',
        evidenceId: 'livia_sought_by_mariana',
      },
    ],
  },
  {
    id: 'block03_maralto_elisa_cross',
    category: 'police',
    requiredFlags: ['block03_maralto_researched'],
    requiredTerms: ['maralto', 'elisa'],
    results: [
      {
        title: 'Cruzamento Maralto × processo Elisa',
        snippet: 'Nenhum vínculo documental direto entre Maralto Granéis e Elisa Duarte / André Silva nos sistemas disponíveis.',
        evidenceId: 'maralto_no_elisa_link',
      },
    ],
  },
  {
    id: 'block03_livia_contact',
    category: 'police',
    requiredFlags: ['block03_livia_search_unlocked'],
    requiredTerms: ['livia'],
    results: [
      {
        title: 'Lívia Serrano — contato profissional',
        snippet: 'Redação local. Aceita depoimento informal sobre cobertura histórica.',
        evidenceId: 'livia_contact_record',
      },
    ],
  },
  {
    id: 'block04_samuel_cadastro',
    category: 'police',
    requiredFlags: ['block04_samuel_search_unlocked'],
    requiredTerms: ['samuel'],
    results: [
      {
        title: 'Cadastro — Samuel',
        snippet: 'Citado em cobertura dos protestos. Endereço atual localizável. Contato possível.',
        evidenceId: 'samuel_current_record',
      },
    ],
  },
  {
    id: 'block04_andre_visits',
    category: 'police',
    requiredFlags: ['block04_andre_records_unlocked'],
    requiredTerms: ['andre'],
    results: [
      {
        title: 'Visitas/contatos — Mariana Silva × André Silva',
        snippet:
          'Após anos sem registro, Mariana solicitou contato autorizado recentemente — período em que já investigava Elisa.',
        evidenceId: 'mariana_andre_visit_record',
      },
    ],
  },
  {
    id: 'block04_prison_chronology',
    category: 'police',
    requiredFlags: ['block04_chronology_search_unlocked'],
    requiredTerms: ['cronologia'],
    results: [
      {
        title: 'Cruzamento — meios autorizados × contato desconhecido',
        snippet:
          'Horários de interação com o número sem nome incompatíveis com janelas de comunicação autorizada de André.',
        evidenceId: 'andre_contact_chronology_mismatch',
      },
    ],
  },
]

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
  {
    id: 'block02_start',
    once: true,
    conditions: [{ type: 'flag', id: 'block01_complete', value: true }],
    actions: [{ type: 'setFlag', id: 'block02_started', value: true }],
  },
  {
    id: 'block02_unlock_paula',
    once: true,
    conditions: [
      { type: 'flag', id: 'block01_complete', value: true },
      { type: 'flag', id: 'block01_note_quarta_read', value: true },
    ],
    actions: [
      { type: 'unlockContact', contactId: 'contact-paula' },
      { type: 'unlockChat', device: 'augusto', chatId: 'chat-paula-augusto' },
      { type: 'setFlag', id: 'block02_paula_chat_unlocked', value: true },
    ],
  },
  {
    id: 'block03_start',
    once: true,
    conditions: [{ type: 'flag', id: 'block02_complete', value: true }],
    actions: [
      { type: 'setFlag', id: 'block03_started', value: true },
      { type: 'setFlag', id: 'block03_nico_search_unlocked', value: true },
    ],
  },
  {
    id: 'block04_start',
    once: true,
    conditions: [{ type: 'flag', id: 'block03_complete', value: true }],
    actions: [
      { type: 'setFlag', id: 'block04_started', value: true },
      { type: 'setFlag', id: 'block04_samuel_search_unlocked', value: true },
      { type: 'addHypothesis', id: 'hyp_morsa_key' },
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
