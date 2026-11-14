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
  {
    id: 'hyp_mariana_needed_brother',
    title: 'Mariana pode ter tratado falhas reais como conspiração porque precisava acreditar no irmão',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_one_line_distraction',
    title: 'Uma das duas linhas (Elisa ou Maralto) pode ter sido colocada no caminho para desorientar',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_call_to_seize_phone',
    title: 'A chamada pode ter tido a função de colocar a polícia no apartamento e apreender o celular',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_deliberate_path',
    title: 'O desaparecimento contém um percurso investigativo deliberado',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_jana_hid_info',
    title: 'Jana ocultou informação importante sobre a Noite X',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_follower_sought_jana',
    title: 'O homem que seguia a jaqueta de Jana pode ter procurado Jana, não Elisa',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_miro_followed_to_fall',
    title: 'Miro pode ter seguido Elisa até a região da queda',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_lookalike_may_not_be_andre',
    title: 'O homem visto próximo à queda pode não ter sido André',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_andre_killed_elisa',
    title: 'André matou Elisa',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_mariana_right_on_ignored_aspects',
    title: 'Mariana estava reconstruindo corretamente aspectos ignorados do caso Elisa',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_miro_may_be_involved_elisa',
    title: 'Miro pode estar envolvido na morte de Elisa',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_morsa_bridges_elisa_protests',
    title: 'A identidade de Morsa talvez seja a ponte entre Elisa e os protestos',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_memory_after_specific_period',
    title: 'Os problemas de memória de Mariana começaram depois de um período específico de plantões',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_ricardo_linked_to_onset',
    title: 'Ricardo pode estar ligado ao início das anomalias de Mariana',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_unknown_tech_origin',
    title: 'O interlocutor desconhecido pode ter origem tecnológica',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_henrique_mariana_same_system',
    title: 'Henrique e Mariana podem ter sido expostos ao mesmo sistema ou operador',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_protests_needed_for_andre_alibi',
    title: 'A linha dos protestos era necessária para descobrir o álibi de André',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_maralto_direct_elisa_death',
    title: 'Maralto estava diretamente ligada à morte de Elisa',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_andre_wrongly_convicted',
    title: 'André pode ter sido condenado injustamente',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_elisa_died_accident',
    title: 'Elisa provavelmente morreu em um acidente',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_augusto_causal_in_chain',
    title: 'Augusto participou causalmente da sequência que levou à morte de Elisa',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_mariana_chose_augusto',
    title: 'Mariana escolheu Augusto deliberadamente para investigar',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_omitido_guided_mariana',
    title: 'O Omitido guiou a investigação de Mariana sem entregar respostas prontas',
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    state: 'active',
  },
  {
    id: 'hyp_augusto_was_placed',
    title: 'Augusto foi colocado deliberadamente no comando do caso',
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
    requiredKnownTerms: ['lucas'],
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
    requiredKnownTerms: ['elisa'],
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
    requiredKnownTerms: ['nico'],
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
    requiredKnownTerms: ['maralto'],
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
    requiredKnownTerms: ['maralto'],
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
    requiredKnownTerms: ['maralto'],
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
    requiredKnownTerms: ['samuel'],
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
    id: 'block04_marcelo_cadastro',
    category: 'police',
    requiredKnownTerms: ['marcelo'],
    requiredTerms: ['marcelo'],
    results: [
      {
        title: 'Consulta histórica — Marcelo Viana',
        snippet: 'Registro antigo vinculado a operação no terminal Maralto.',
        documentId: 'doc-marcelo-historico',
      },
    ],
  },
  {
    id: 'block04_andre_records',
    category: 'police',
    requiredKnownTerms: ['andre'],
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
    id: 'block04_unknown_msisdn',
    category: 'police',
    requiredFlags: ['block04_chronology_search_unlocked', 'block04_unknown_number_seen'],
    requiredTerms: ['99184'],
    results: [
      {
        title: 'Log de interações — +55 47 99184-2207',
        snippet: 'Extração do aparelho de Mariana (interações noturnas).',
        documentId: 'doc-numero-sem-nome',
      },
    ],
  },
  {
    id: 'block04_unknown_msisdn_full',
    category: 'police',
    requiredFlags: ['block04_chronology_search_unlocked', 'block04_unknown_number_seen'],
    requiredTerms: ['47991842207'],
    results: [
      {
        title: 'Log de interações — +55 47 99184-2207',
        snippet: 'Extração do aparelho de Mariana (interações noturnas).',
        documentId: 'doc-numero-sem-nome',
      },
    ],
  },
  {
    id: 'block05_jana_cadastro_early',
    category: 'police',
    requiredKnownTerms: ['jana'],
    requiredTerms: ['jana'],
    results: [
      {
        title: 'Cadastro — Jana Ribeiro',
        snippet: 'Consulta cadastral. Endereço residencial atual.',
        documentId: 'doc-jana-cadastro',
      },
    ],
  },
  {
    id: 'block05_jana_witness',
    category: 'police',
    /** Depoimento Elisa só quando Augusto já conhece Elisa (autos / Lucas). */
    requiredKnownTerms: ['jana', 'elisa'],
    requiredTerms: ['jana'],
    results: [
      {
        title: 'Depoimento arquivado — Jana Ribeiro',
        snippet: 'Volume II do processo Elisa Duarte. Amiga da vítima.',
        documentId: 'doc-elisa-jana',
      },
    ],
  },
  {
    id: 'block05_elisa_review_pieces',
    category: 'police',
    requiredFlags: ['block05_elisa_review_unlocked'],
    requiredTerms: ['elisa'],
    results: [
      {
        title: 'Autos — Caso Elisa Duarte',
        snippet: 'Cópia integral: resumo, relação e discussão, álibi e cronologia, testemunhas, sentença.',
        documentId: 'doc-elisa-argumento',
      },
    ],
  },
  {
    id: 'block06_geraldo_cadastro_early',
    category: 'police',
    requiredKnownTerms: ['geraldo'],
    requiredTerms: ['geraldo'],
    results: [
      {
        title: 'Cadastro — Geraldo Mota',
        snippet: 'Consulta cadastral. Endereço residencial atual.',
        documentId: 'doc-geraldo-cadastro',
      },
    ],
  },
  {
    id: 'block06_geraldo',
    category: 'police',
    /** Depoimento / comanda / ficha Vértice só com Elisa nos autos. */
    requiredKnownTerms: ['geraldo', 'elisa'],
    requiredTerms: ['geraldo'],
    results: [
      {
        title: 'Depoimento arquivado — Geraldo Mota',
        snippet: 'Volume II do processo Elisa Duarte.',
        documentId: 'doc-elisa-geraldo-depoimento',
      },
      {
        title: 'Ficha — Geraldo Mota',
        snippet: 'Consulta cadastral. Endereço atual. Vínculo antigo no Vértice.',
        documentId: 'doc-geraldo-ficha',
      },
      {
        title: 'Comanda e fechamento — Vértice (Noite X)',
        snippet: 'Cópia nos autos. Volume no horário da saída.',
        documentId: 'doc-vertice-comanda-noitex',
      },
    ],
  },
  {
    id: 'block06_valter',
    category: 'police',
    requiredFlags: ['block06_valter_search_unlocked'],
    requiredTerms: ['valter'],
    results: [
      {
        title: 'Válter — ocorrências e vínculos',
        snippet: 'Consulta policial. Estrutura e associados.',
        documentId: 'doc-valter-ocorrencias',
      },
      {
        title: 'Relação de associados — núcleo Válter',
        snippet: 'Monitoramento atual. Inclui Miro.',
        documentId: 'doc-valter-associados',
      },
      {
        title: 'Interceptação de rádio — operação contemporânea',
        snippet: 'Captura multi-canal encaminhada à bancada.',
        documentId: 'doc-valter-interceptacao',
      },
    ],
  },
  {
    id: 'block06_miro_name',
    category: 'police',
    requiredFlags: ['block06_valter_search_unlocked'],
    requiredTerms: ['miro'],
    results: [
      {
        title: 'Relação de associados — núcleo Válter',
        snippet: 'Miro listado como associado atual.',
        documentId: 'doc-valter-associados',
      },
    ],
  },
  {
    id: 'block07_sandra',
    category: 'police',
    requiredKnownTerms: ['sandra'],
    requiredTerms: ['sandra'],
    results: [
      {
        title: 'Depoimento — Sandra Almeida (região da queda)',
        snippet: 'Autos do processo Elisa Duarte.',
        documentId: 'doc-sandra-depoimento',
      },
      {
        title: 'Ficha — Sandra Almeida',
        snippet: 'Cadastro. Endereço atual.',
        documentId: 'doc-sandra-ficha',
      },
    ],
  },
  {
    id: 'block07_ricardo',
    category: 'police',
    requiredFlags: ['block07_ricardo_search_unlocked'],
    requiredTerms: ['ricardo'],
    results: [
      {
        title: 'Hospital Municipal — atendimento / óbito (plantão)',
        snippet: 'Cruzamento nominal com plantão no período indicado.',
        documentId: 'doc-hospital-ricardo-freitas',
      },
    ],
  },
  {
    id: 'block07_ricardo_freitas',
    category: 'police',
    requiredFlags: ['block07_ricardo_id_check_unlocked'],
    requiredTerms: ['freitas'],
    results: [
      {
        title: 'Consulta civil — Ricardo Freitas (dados incompletos)',
        snippet: 'Sem cadastro civil compatível com o paciente do plantão.',
        documentId: 'doc-ricardo-consulta-negativa',
      },
    ],
  },
  {
    id: 'block07_ricardo_id_check',
    category: 'police',
    requiredFlags: ['block07_ricardo_id_check_unlocked'],
    requiredTerms: ['ricardo'],
    results: [
      {
        title: 'Consulta civil — Ricardo Freitas (dados incompletos)',
        snippet: 'Sem cadastro civil compatível com o paciente do plantão.',
        documentId: 'doc-ricardo-consulta-negativa',
      },
    ],
  },
  {
    /** Softlock: saves com flag antiga de crosscheck ainda encontram a consulta negativa. */
    id: 'block07_ricardo_cross_legacy',
    category: 'police',
    requiredFlags: ['block07_ricardo_crosscheck_unlocked'],
    requiredTerms: ['ricardo'],
    results: [
      {
        title: 'Consulta civil — Ricardo Freitas (dados incompletos)',
        snippet: 'Sem cadastro civil compatível com o paciente do plantão.',
        documentId: 'doc-ricardo-consulta-negativa',
      },
    ],
  },
  {
    id: 'block07_forum_hvalenca',
    category: 'police',
    requiredKnownTerms: ['hvalenca'],
    requiredTerms: ['hvalenca'],
    results: [
      {
        title: 'Arquivo de fórum técnico — usuário hvalenca (2021)',
        snippet: 'Tópico arquivado sobre sessão e autenticação; menção a empregador.',
        documentId: 'doc-forum-hvalenca',
      },
    ],
  },
  {
    id: 'block07_aster',
    category: 'police',
    requiredKnownTerms: ['aster'],
    requiredTerms: ['aster'],
    results: [
      {
        title: 'Aster Sistemas — contato administrativo',
        snippet: 'Empresa reestruturada; arquivo de pessoal da época.',
        documentId: 'doc-aster-admin',
      },
    ],
  },
  {
    id: 'block_morsa_inconclusive',
    category: 'police',
    requiredKnownTerms: ['morsa'],
    requiredTerms: ['morsa'],
    results: [
      {
        title: 'Consulta — termo “Morsa”',
        snippet: 'Resultados textuais demais; nenhuma pessoa cadastrada; sem correlação institucional clara.',
        documentId: 'doc-morsa-inconclusive',
      },
    ],
  },
  {
    /** Legado — saves com pista parcial antiga. */
    id: 'block07_hvalenca',
    category: 'police',
    requiredFlags: ['block07_partial_id_search_unlocked'],
    requiredTerms: ['hvalenca'],
    results: [
      {
        title: 'Consulta cadastral — identificador hvalenca',
        snippet: 'Correlação com registro profissional / empresarial.',
        documentId: 'doc-henrique-cadastro',
      },
    ],
  },
  {
    id: 'block07_valenca_bridge',
    category: 'police',
    requiredFlags: ['block07_partial_id_search_unlocked'],
    requiredTerms: ['valenca'],
    results: [
      {
        title: 'Consulta cadastral — identificador hvalenca',
        snippet: 'Correlação com registro profissional / empresarial.',
        documentId: 'doc-henrique-cadastro',
      },
    ],
  },
  {
    id: 'block07_henrique',
    category: 'police',
    requiredFlags: ['block07_henrique_search_unlocked'],
    requiredTerms: ['henrique'],
    results: [
      {
        title: 'Henrique Valença — vínculo empresarial',
        snippet: 'Consulta cadastral / empresas.',
        documentId: 'doc-henrique-empresa',
      },
      {
        title: 'Incidente de segurança — relatório resumido',
        snippet: 'Arquivo setorial. Alegações não comprovadas.',
        documentId: 'doc-henrique-incidente',
      },
      {
        title: 'Contato profissional — Cecília Prado',
        snippet: 'Lista de colegas / depoentes da época.',
        documentId: 'doc-cecilia-contato',
      },
    ],
  },
  {
    id: 'block07_valenca',
    category: 'police',
    requiredFlags: ['block07_henrique_search_unlocked'],
    requiredTerms: ['valença', 'valenca'],
    results: [
      {
        title: 'Henrique Valença — vínculo empresarial',
        snippet: 'Consulta cadastral / empresas.',
        documentId: 'doc-henrique-empresa',
      },
    ],
  },
  {
    id: 'block07_henrique_dump',
    category: 'police',
    requiredFlags: ['block07_henrique_dump_unlocked'],
    requiredTerms: ['captura'],
    results: [
      {
        title: 'Material digital antigo — captura de rede (Henrique)',
        snippet: 'Backup / cache recuperado do incidente de segurança. Encaminhado à bancada.',
        documentId: 'doc-henrique-pcap-note',
      },
    ],
  },
  {
    id: 'block07_henrique_dump_pcap',
    category: 'police',
    requiredFlags: ['block07_henrique_dump_unlocked'],
    requiredTerms: ['pcap'],
    results: [
      {
        title: 'Material digital antigo — captura de rede (Henrique)',
        snippet: 'Backup / cache recuperado do incidente de segurança. Encaminhado à bancada.',
        documentId: 'doc-henrique-pcap-note',
      },
    ],
  },
  {
    id: 'block07_henrique_dump_alt',
    category: 'police',
    requiredFlags: ['block07_henrique_dump_unlocked'],
    requiredTerms: ['dump'],
    results: [
      {
        title: 'Material digital antigo — captura de rede (Henrique)',
        snippet: 'Backup / cache recuperado do incidente de segurança. Encaminhado à bancada.',
        documentId: 'doc-henrique-pcap-note',
      },
    ],
  },
  {
    /** Legado — fluxo antigo (câmera viária). */
    id: 'block08_vehicle_guardrail',
    category: 'police',
    requiredFlags: ['block08_vehicle_search_unlocked'],
    requiredTerms: ['guardrail'],
    results: [
      {
        title: 'Câmera viária — veículo com dano lateral (madrugada)',
        snippet: '[Arquivo removido do fluxo atual]',
        documentId: 'doc-camera-veiculo-madrugada',
      },
    ],
  },
  {
    id: 'block08_bia',
    category: 'police',
    requiredFlags: ['block08_bia_search_unlocked'],
    requiredTerms: ['bia'],
    results: [
      {
        title: 'Ficha — Bia (vínculo familiar)',
        snippet: 'Cadastro. Endereço atual.',
        documentId: 'doc-bia-ficha',
      },
    ],
  },
  {
    id: 'block08_rui',
    category: 'police',
    requiredFlags: ['block08_rui_search_unlocked'],
    requiredTerms: ['rui'],
    results: [
      {
        title: 'Ficha — Rui',
        snippet: 'Cadastro a partir de indicação documental.',
        documentId: 'doc-rui-ficha',
      },
    ],
  },
  {
    id: 'block08_callsign_vtr',
    category: 'police',
    requiredFlags: ['block08_scale_search_unlocked'],
    requiredTerms: ['vtr-14'],
    results: [
      {
        title: 'Escala antiga — indicativo VTR-14',
        snippet: 'Arquivo institucional de equipes.',
        documentId: 'doc-escala-vtr14',
      },
    ],
  },
  {
    id: 'block08_callsign_escala',
    category: 'police',
    requiredFlags: ['block08_scale_search_unlocked'],
    requiredTerms: ['escala'],
    results: [
      {
        title: 'Escala antiga — indicativo VTR-14',
        snippet: 'Arquivo institucional de equipes.',
        documentId: 'doc-escala-vtr14',
      },
    ],
  },
  {
    id: 'block08_callsign_indicativo',
    category: 'police',
    requiredFlags: ['block08_scale_search_unlocked'],
    requiredTerms: ['indicativo'],
    results: [
      {
        title: 'Escala antiga — indicativo VTR-14',
        snippet: 'Arquivo institucional de equipes.',
        documentId: 'doc-escala-vtr14',
      },
    ],
  },
  {
    id: 'block09_roberto',
    category: 'police',
    requiredFlags: ['block09_roberto_search_unlocked'],
    requiredTerms: ['roberto'],
    results: [
      {
        title: 'Roberto Siqueira — afastamento e denúncia anônima',
        snippet: 'Timing, metadata e material correlato.',
        documentId: 'doc-roberto-denuncia',
      },
    ],
  },
  {
    id: 'block09_siqueira',
    category: 'police',
    requiredFlags: ['block09_roberto_search_unlocked'],
    requiredTerms: ['siqueira'],
    results: [
      {
        title: 'Roberto Siqueira — afastamento e denúncia anônima',
        snippet: 'Timing, metadata e material correlato.',
        documentId: 'doc-roberto-denuncia',
      },
    ],
  },
  {
    id: 'block09_omitido',
    category: 'police',
    requiredFlags: ['block09_omitido_named'],
    requiredTerms: ['omitido'],
    results: [
      {
        title: 'Log de sessão — identificador O Omitido',
        snippet: 'Registro presente no material digital recuperado.',
        documentId: 'doc-omitido-interface',
      },
    ],
  },
  {
    id: 'block09_trail_camera',
    category: 'police',
    requiredFlags: ['block09_trail_unlocked'],
    requiredTerms: ['camera'],
    results: [
      {
        title: 'Consulta — câmeras viárias (últimos deslocamentos)',
        snippet: 'Imagens do deslocamento noturno de Mariana.',
        documentId: 'doc-trilha-camera-mariana',
      },
    ],
  },
  {
    id: 'block09_trail_camera_alt',
    category: 'police',
    requiredFlags: ['block09_trail_unlocked'],
    requiredTerms: ['cameras'],
    results: [
      {
        title: 'Consulta — câmeras viárias (últimos deslocamentos)',
        snippet: 'Imagens do deslocamento noturno de Mariana.',
        documentId: 'doc-trilha-camera-mariana',
      },
    ],
  },
  {
    id: 'block09_trail_deslocamento',
    category: 'police',
    requiredFlags: ['block09_trail_unlocked'],
    requiredTerms: ['deslocamento'],
    results: [
      {
        title: 'Consulta — câmeras viárias (últimos deslocamentos)',
        snippet: 'Imagens do deslocamento noturno de Mariana.',
        documentId: 'doc-trilha-camera-mariana',
      },
    ],
  },
  {
    id: 'block09_trail_transporte',
    category: 'police',
    requiredFlags: ['block09_trail_unlocked'],
    requiredTerms: ['transporte'],
    results: [
      {
        title: 'Consulta — registro de transporte / passagem',
        snippet: 'Passagem compatível com a rota das câmeras.',
        documentId: 'doc-trilha-transporte-mariana',
      },
    ],
  },
  {
    id: 'block09_other_desaparecimento',
    category: 'police',
    requiredFlags: ['block09_other_cases_unlocked'],
    requiredTerms: ['desaparecimento'],
    results: [
      {
        title: 'Resultado de busca — outros desaparecimentos semelhantes',
        snippet: 'Padrão comportamental em casos esparsos.',
        documentId: 'doc-outros-desaparecimentos',
      },
    ],
  },
  {
    id: 'block09_other_desaparecimentos',
    category: 'police',
    requiredFlags: ['block09_other_cases_unlocked'],
    requiredTerms: ['desaparecimentos'],
    results: [
      {
        title: 'Resultado de busca — outros desaparecimentos semelhantes',
        snippet: 'Padrão comportamental em casos esparsos.',
        documentId: 'doc-outros-desaparecimentos',
      },
    ],
  },
  {
    id: 'block09_other_omitido_search',
    category: 'police',
    requiredFlags: ['block09_other_cases_unlocked'],
    requiredTerms: ['omitido'],
    results: [
      {
        title: 'Resultado de busca — outros desaparecimentos semelhantes',
        snippet: 'Ocorrências com assinatura compatível.',
        documentId: 'doc-outros-desaparecimentos',
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
  {
    id: 'block05_start',
    once: true,
    conditions: [{ type: 'flag', id: 'block04_complete', value: true }],
    actions: [
      { type: 'setFlag', id: 'block05_started', value: true },
      { type: 'unlockLocation', id: 'titan', status: 'visitAvailable' },
    ],
  },
  {
    id: 'block05_elisa_review',
    once: true,
    conditions: [
      { type: 'flag', id: 'block05_elisa_review_unlocked', value: true },
      { type: 'evidenceOwned', id: 'elisa_argument_jealousy' },
      { type: 'evidenceOwned', id: 'elisa_weak_alibi' },
      { type: 'evidenceOwned', id: 'elisa_lookalike_near_fall' },
    ],
    actions: [
      { type: 'setFlag', id: 'block05_elisa_review_done', value: true },
      { type: 'completeTask', id: 'task_review_elisa_autos' },
      { type: 'addHypothesis', id: 'hyp_mariana_needed_brother' },
      { type: 'setFlag', id: 'block05_refl_andre_pending', value: true },
      {
        type: 'addTask',
        id: 'task_weigh_maralto_line',
        label: 'Entender o que Mariana investigava além de Elisa',
      },
    ],
  },
  {
    id: 'block06_start',
    once: true,
    conditions: [{ type: 'flag', id: 'block05_complete', value: true }],
    actions: [
      { type: 'setFlag', id: 'block06_started', value: true },
      { type: 'setFlag', id: 'block06_geraldo_search_unlocked', value: true },
    ],
  },
  {
    id: 'block06_valter_trail',
    once: true,
    conditions: [
      { type: 'flag', id: 'block06_valter_search_unlocked', value: true },
      { type: 'evidenceOwned', id: 'valter_criminal_structure' },
      { type: 'evidenceOwned', id: 'miro_linked_to_valter_group' },
      { type: 'evidenceOwned', id: 'valter_group_active_intercepts' },
    ],
    actions: [
      { type: 'setFlag', id: 'block06_valter_trail_done', value: true },
      { type: 'completeTask', id: 'task_investigate_valter' },
      { type: 'discoverPerson', id: 'miro', status: 'identified' },
      { type: 'setFlag', id: 'block06_pastor_available', value: true },
      {
        type: 'addTask',
        id: 'task_pastor_moons',
        label: 'Analisar as interceptações de rádio (bancada) — localizar a entrega',
      },
      { type: 'addDocument', id: 'doc-tabela-logistica-g17n' },
    ],
  },
  {
    id: 'block07_start',
    once: true,
    conditions: [{ type: 'flag', id: 'block06_complete', value: true }],
    actions: [
      { type: 'setFlag', id: 'block07_started', value: true },
    ],
  },
  {
    id: 'block07_henrique_trail',
    once: true,
    conditions: [
      { type: 'flag', id: 'block07_henrique_search_unlocked', value: true },
      { type: 'evidenceOwned', id: 'henrique_tech_company' },
      { type: 'evidenceOwned', id: 'henrique_security_incident' },
      { type: 'evidenceOwned', id: 'cecilia_prado_contact' },
    ],
    actions: [
      { type: 'setFlag', id: 'block07_henrique_trail_done', value: true },
      { type: 'completeTask', id: 'task_investigate_henrique' },
      { type: 'discoverPerson', id: 'cecilia', status: 'located' },
      { type: 'unlockLocation', id: 'cecilia-casa', status: 'visitAvailable' },
      {
        type: 'addTask',
        id: 'task_talk_cecilia',
        label: 'Falar com Cecília Prado sobre Henrique',
      },
    ],
  },
  {
    id: 'block08_start',
    once: true,
    conditions: [{ type: 'flag', id: 'block07_complete', value: true }],
    actions: [
      { type: 'setFlag', id: 'block08_started', value: true },
      { type: 'setFlag', id: 'block08_rings_available', value: true },
      { type: 'addEvidence', id: 'protest_heterogeneous_sources' },
      { type: 'completeTask', id: 'task_compare_henrique_mariana_system' },
      {
        type: 'addTask',
        id: 'task_rings_puzzle',
        label: 'Reconstruir a timeline dos protestos (bancada) — fontes dessincronizadas',
      },
    ],
  },
  {
    id: 'block09_start',
    once: true,
    conditions: [{ type: 'flag', id: 'block08_complete', value: true }],
    actions: [
      { type: 'setFlag', id: 'block09_started', value: true },
      { type: 'setFlag', id: 'block09_compare_unlocked', value: true },
      {
        type: 'addTask',
        id: 'task_compare_omitido_system',
        label: 'Comparar os registros de Henrique com o material encontrado no caso Mariana',
      },
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
