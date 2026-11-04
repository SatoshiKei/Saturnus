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
    title: 'Mariana pode ter desaparecido por conta própria enquanto tentava inocentar André',
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
    title: 'Morsa pode ser uma peça importante dos protestos',
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
  {
    id: 'contra_vertice_clock',
    evidenceAId: 'vertice_timeline_inconsistent',
    evidenceBId: 'elisa_original_chronology',
    summary:
      'A cronologia dos autos usa o registro sonoro da cabine como horário de referência, e esse registro não é confiável.',
    actions: [
      {
        type: 'linkHypothesis',
        hypothesisId: 'hyp_andre_imprecise_chronology',
        evidenceId: 'elisa_original_chronology',
        role: 'support',
      },
    ],
  },
  {
    id: 'contra_andre_night_hours',
    evidenceAId: 'andre_authorized_calls',
    evidenceBId: 'unknown_number_log',
    summary: 'Os horários das interações do número sem nome não cabem nas janelas de ligação autorizadas a André.',
    actions: [
      { type: 'addEvidence', id: 'andre_contact_chronology_mismatch' },
      { type: 'setFlag', id: 'block04_andre_chronology_done', value: true },
      { type: 'completeTask', id: 'task_check_andre_chronology' },
      { type: 'updateHypothesis', id: 'hyp_andre_manipulating', state: 'weakened' },
      {
        type: 'linkHypothesis',
        hypothesisId: 'hyp_andre_manipulating',
        evidenceId: 'andre_contact_chronology_mismatch',
        role: 'contradict',
      },
      { type: 'setFlag', id: 'block04_hex_call_pending', value: true },
    ],
  },
]

export const seedInterviewTopics: InterviewTopic[] = []

/** Provocações em banner não são mais usadas: eventos chegam por ligações, mensagens e documentos. */
export const seedProvocations: ProvocationEvent[] = []

export const seedSearchRules: SearchRule[] = [
  {
    id: 'block02_lucas_cadastro',
    category: 'police',
    requiredFlags: ['block02_paula_chat_done'],
    requiredTerms: ['lucas'],
    results: [
      {
        title: 'Cadastro — Lucas Moreira',
        snippet: 'Consulta cadastral. Vínculo institucional atual registrado.',
        documentId: 'doc-lucas-cadastro',
      },
    ],
  },
  {
    id: 'block02_elisa_process',
    category: 'police',
    requiredFlags: ['block02_elisa_search_unlocked'],
    requiredTerms: ['elisa'],
    results: [
      {
        title: 'Processo criminal — Elisa Duarte',
        snippet: 'Autos de 1ª instância. Resumo processual disponível.',
        documentId: 'doc-elisa-resumo',
      },
      {
        title: 'Testemunhas arquivadas — processo Elisa Duarte',
        snippet: 'Volume II (resumo): pessoas ouvidas na fase policial.',
        documentId: 'doc-elisa-testemunhas',
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
        title: 'Cadastro — Nicolas Prado Reis',
        snippet: 'Consulta cadastral. Registro atual encontrado.',
        documentId: 'doc-nico-cadastro',
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
        title: 'Maralto Granéis S.A. — cadastro empresarial',
        snippet: 'Consulta cadastral de pessoa jurídica.',
        documentId: 'doc-maralto-cadastro',
      },
      {
        title: 'Reportagem — “Porto em conflito”',
        snippet: 'Recorte de imprensa nos arquivos públicos.',
        documentId: 'doc-maralto-clipping',
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
        title: 'Pesquisa cruzada — autos Elisa / Maralto Granéis',
        snippet: 'Resultado da pesquisa conjunta nas bases disponíveis.',
        documentId: 'doc-cruzamento-maralto-elisa',
      },
    ],
  },
  {
    id: 'block04_protests_maralto',
    category: 'police',
    requiredFlags: ['block04_started'],
    requiredTerms: ['maralto'],
    results: [
      {
        title: 'Ocorrência — confronto durante manifestação',
        snippet: 'Registro antigo da delegacia regional.',
        documentId: 'doc-protesto-ocorrencia',
      },
      {
        title: 'Relação de detidos — ocorrência do terminal Maralto',
        snippet: 'Anexo nominal da ocorrência.',
        documentId: 'doc-protesto-detidos',
      },
    ],
  },
  {
    id: 'block04_protests_term',
    category: 'police',
    requiredFlags: ['block04_started'],
    requiredTerms: ['protesto'],
    results: [
      {
        title: 'Ocorrência — confronto durante manifestação',
        snippet: 'Registro antigo da delegacia regional.',
        documentId: 'doc-protesto-ocorrencia',
      },
      {
        title: 'Relação de detidos — ocorrência do terminal Maralto',
        snippet: 'Anexo nominal da ocorrência.',
        documentId: 'doc-protesto-detidos',
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
        title: 'Ficha — Samuel Teixeira',
        snippet: 'Consulta cadastral. Registro único em ocorrência antiga.',
        documentId: 'doc-samuel-ficha',
      },
    ],
  },
  {
    id: 'block04_andre_records',
    category: 'police',
    requiredFlags: ['block04_andre_records_unlocked'],
    requiredTerms: ['andre'],
    results: [
      {
        title: 'Ficha de execução penal — André Silva',
        snippet: 'Vara de Execuções. Dados da custódia.',
        documentId: 'doc-andre-ficha',
      },
      {
        title: 'Registro de visitas — André Silva',
        snippet: 'Setor de visitas da unidade prisional.',
        documentId: 'doc-andre-visitas',
      },
    ],
  },
  {
    id: 'block04_andre_calls',
    category: 'police',
    requiredFlags: ['block04_chronology_search_unlocked'],
    requiredTerms: ['andre'],
    results: [
      {
        title: 'Registro de ligações autorizadas — André Silva',
        snippet: 'Central de ligações da unidade prisional.',
        documentId: 'doc-andre-ligacoes',
      },
    ],
  },
  {
    id: 'block04_unnamed_number',
    category: 'police',
    requiredFlags: ['block04_chronology_search_unlocked'],
    requiredTerms: ['desconhecido'],
    results: [
      {
        title: 'Log de interações — número sem nome',
        snippet: 'Extração do aparelho de Mariana.',
        documentId: 'doc-numero-sem-nome',
      },
    ],
  },
  {
    id: 'block04_unnamed_number_b',
    category: 'police',
    requiredFlags: ['block04_chronology_search_unlocked'],
    requiredTerms: ['sem', 'nome'],
    results: [
      {
        title: 'Log de interações — número sem nome',
        snippet: 'Extração do aparelho de Mariana.',
        documentId: 'doc-numero-sem-nome',
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
    id: 'block02_convergence',
    once: true,
    conditions: [
      { type: 'evidenceOwned', id: 'nico_dj_identified' },
      { type: 'evidenceOwned', id: 'paula_leads_lucas' },
      { type: 'evidenceOwned', id: 'elisa_case_summary' },
      { type: 'evidenceOwned', id: 'nico_elisa_witness' },
    ],
    actions: [
      { type: 'setFlag', id: 'block02_convergence_done', value: true },
      { type: 'addEvidence', id: 'mariana_rebuilding_elisa_case' },
      { type: 'addHypothesis', id: 'hyp_own_investigation' },
      { type: 'updateHypothesis', id: 'hyp_own_investigation', state: 'confirmed' },
      {
        type: 'linkHypothesis',
        hypothesisId: 'hyp_own_investigation',
        evidenceId: 'mariana_rebuilding_elisa_case',
        role: 'support',
      },
      {
        type: 'linkHypothesis',
        hypothesisId: 'hyp_voluntary_disappearance',
        evidenceId: 'mariana_rebuilding_elisa_case',
        role: 'support',
      },
      {
        type: 'replaceTasks',
        tasks: [{ id: 'task_locate_nico', label: 'Localizar Nico — testemunha do caso Elisa', completed: false }],
      },
      { type: 'setFlag', id: 'block02_complete', value: true },
    ],
  },
  {
    id: 'block04_start',
    once: true,
    conditions: [{ type: 'flag', id: 'block03_complete', value: true }],
    actions: [
      { type: 'setFlag', id: 'block04_started', value: true },
      { type: 'setFlag', id: 'block04_andre_records_unlocked', value: true },
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
