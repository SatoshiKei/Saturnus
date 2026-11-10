import type { Document } from '../../game/types'

/**
 * Catálogo de documentos do caso.
 *
 * Regras de escrita:
 *  - o texto só contém o que o documento real conteria (nada de “conclusões” do roteiro);
 *  - telefone/endereço entram em `leads` e são registrados ao ler (nunca viram botão de entrevista);
 *  - `onOpen` roda uma vez, na primeira leitura.
 */
export const seedDocuments: Document[] = [
  // ───────────────────────── Bloco 1 ─────────────────────────
  {
    id: 'doc-bo-inicial',
    title: 'Boletim de ocorrência — desaparecimento',
    category: 'BO',
    issuer: 'Delegacia — plantão',
    dateLabel: '03/11/2026',
    system: 'ocorrencias',
    blocks: [
      {
        id: 'b1',
        text: 'Mariana Silva, 26 anos, enfermeira, não compareceu ao plantão previsto para 07:00.',
      },
      {
        id: 'b2',
        text: 'Às 07:18, a colega Júlia Martins tentou contato telefônico sem resposta. Às 07:46, Júlia contatou Diego Azevedo, vizinho de Mariana, para verificar o apartamento. Diego tocou a campainha e bateu à porta, sem resposta.',
      },
      {
        id: 'b3',
        text: 'Às 08:03, a central de emergência recebeu uma chamada identificada pelo sistema como originada do número de Mariana. A gravação estava degradada; o operador compreendeu pedido de ajuda, ruído intenso e interrupção abrupta. Viatura enviada ao endereço.',
      },
      {
        id: 'b4',
        text: 'No local, ninguém respondeu. Diante da chamada, da ausência inexplicada e dos relatos, a equipe realizou entrada forçada. Mariana não foi encontrada. Não havia sinais evidentes de luta.',
      },
      {
        id: 'b5',
        text: 'O celular pessoal de Mariana foi encontrado no apartamento, ligado e sem bloqueio de tela. O número associado ao aparelho era o mesmo registrado como origem da chamada de emergência.',
      },
    ],
  },
  {
    id: 'doc-central-chamada',
    title: 'Registro da central — chamada das 08:03',
    category: 'Central de emergência',
    issuer: 'Central de atendimento',
    dateLabel: '03/11/2026',
    system: 'ocorrencias',
    blocks: [
      {
        id: 'b1',
        text: '08:03:12 — Chamada recebida, linha de entrada 3. Identificador de origem: terminal móvel registrado em nome de Mariana Silva.',
      },
      {
        id: 'b2',
        text: 'Duração registrada: 22 segundos. Áudio arquivado sob o protocolo da central. Qualidade da gravação: degradada.',
      },
      {
        id: 'b3',
        text: 'Anotação do operador: pedido de ajuda parcialmente compreendido; ruído intenso ao fundo; interrupção abrupta. Viatura despachada às 08:04.',
      },
    ],
  },
  {
    id: 'doc-entrada-apartamento',
    title: 'Relatório de entrada — apartamento de Mariana',
    category: 'Relatório de ocorrência',
    issuer: 'Equipe de viatura',
    dateLabel: '03/11/2026',
    system: 'ocorrencias',
    blocks: [
      {
        id: 'b1',
        text: '08:21 — Equipe no endereço. Campainha e chamados sem resposta. Vizinho Diego Azevedo acompanha a equipe.',
      },
      {
        id: 'b2',
        text: '08:26 — Entrada forçada pela porta principal. Luz da sala acesa; bolsa sobre a mesa; chaves no gancho da entrada. Nenhum sinal evidente de luta.',
      },
      {
        id: 'b3',
        text: 'Aparelho celular localizado sobre o sofá, ligado e sem bloqueio de tela. Recolhido pela equipe e entregue à delegacia.',
      },
    ],
  },
  {
    id: 'doc-apreensao-celular',
    title: 'Termo de apreensão — aparelho celular',
    category: 'Termo',
    issuer: 'Delegacia',
    dateLabel: '03/11/2026',
    system: 'documentos',
    blocks: [
      {
        id: 'b1',
        text: 'Item 1: smartphone, tela desbloqueada ao ser localizado. Lacre nº 0412. Apreensão determinada pela autoridade policial responsável.',
      },
      {
        id: 'b2',
        text: 'O aparelho foi entregue à delegacia e permanece sob guarda do delegado Augusto Nogueira.',
      },
    ],
  },
  {
    id: 'doc-extracao-inicial',
    title: 'Relatório de extração inicial — aparelho de Mariana',
    category: 'Relatório',
    issuer: 'Delegacia — extração superficial',
    dateLabel: '03/11/2026',
    system: 'documentos',
    blocks: [
      {
        id: 'b1',
        text: 'Extração superficial feita na própria delegacia, sem recursos periciais. Itens listados: conversas de mensagens, notas, calendário, fotos, arquivos e registro de chamadas.',
      },
      {
        id: 'b2',
        text: 'Registro de chamadas: últimos eventos em 02/11 (21:48, chamada perdida). Nenhum evento registrado em 03/11.',
      },
      {
        id: 'b3',
        text: 'A extração superficial não substitui análise pericial do aparelho.',
      },
    ],
  },

  // ───────────────────────── Bloco 2 ─────────────────────────
  {
    id: 'doc-lucas-cadastro',
    title: 'Consulta cadastral — Lucas Moreira',
    category: 'Cadastro (pessoas)',
    issuer: 'Sistema de consulta policial',
    system: 'consultas',
    blocks: [
      { id: 'b1', text: 'Nome: Lucas Moreira. Idade: 27 anos. Sem antecedentes.' },
      {
        id: 'b2',
        text: 'Vínculo atual: Universidade — Faculdade de Comunicação, secretaria acadêmica.',
      },
      {
        id: 'b3',
        text: 'Em 2020 constou em lista de alunos da instituição, no mesmo período em que Elisa Duarte frequentou atividades do campus.',
      },
    ],
    leads: [
      {
        type: 'address',
        label: 'Local de trabalho',
        value: 'Campus Central — Bloco B, secretaria acadêmica',
      },
    ],
    onOpen: [
      { type: 'discoverPerson', id: 'lucas', status: 'located' },
      { type: 'unlockLocation', id: 'universidade', status: 'visitAvailable' },
    ],
  },
  {
    id: 'doc-elisa-resumo',
    title: 'Processo criminal — resumo (Elisa Duarte)',
    category: 'Autos',
    issuer: 'Vara Criminal — consulta processual',
    dateLabel: 'Proc. 2020',
    system: 'autos',
    blocks: [
      {
        id: 'b1',
        text: 'Vítima: Elisa Duarte, 17 anos. Réu: André Silva. Imputação: homicídio doloso.',
      },
      {
        id: 'b2',
        text: 'Sentença de 1ª instância: condenação. Recurso pendente.',
      },
      {
        id: 'b3',
        text: 'Peças principais: boletim inicial, depoimentos (volume II) e cronologia da noite (fls. 41). Cópias simples disponíveis; cópias autenticadas somente pelo cartório da vara.',
      },
    ],
    leads: [{ type: 'institution', label: 'Cópias autenticadas', value: 'Cartório — ramal 204' }],
    onOpen: [
      { type: 'addEvidence', id: 'elisa_case_summary' },
      { type: 'discoverPerson', id: 'elisa', status: 'identified' },
      { type: 'discoverPerson', id: 'andre', status: 'identified' },
    ],
  },
  {
    id: 'doc-elisa-testemunhas',
    title: 'Testemunhas arquivadas — processo Elisa Duarte',
    category: 'Autos',
    issuer: 'Vara Criminal — volume II (resumo)',
    dateLabel: 'Proc. 2020',
    system: 'autos',
    blocks: [
      {
        id: 'b1',
        text: 'Ouvidos na fase policial: três amigos da vítima, dois funcionários da Boate Vértice e o DJ de cabine, Nicolas Prado Reis (“Nico”).',
      },
      {
        id: 'b2',
        text: 'Nicolas Prado Reis — registro sumário: esteve na cabine durante a noite. Confirma ter visto o casal no salão.',
      },
      {
        id: 'b3',
        text: 'Endereço e contato constantes no volume são da época e estão desatualizados.',
      },
    ],
    onOpen: [{ type: 'addEvidence', id: 'nico_elisa_witness' }],
  },
  {
    id: 'doc-elisa-cronologia',
    title: 'Cronologia da noite — cópia autenticada (fls. 41)',
    category: 'Autos',
    issuer: 'Cartório da vara',
    dateLabel: 'Proc. 2020',
    system: 'autos',
    blocks: [
      { id: 'b1', text: 'Chegada de Elisa e André ao Vértice: por volta das 23h (depoimentos concordantes).' },
      { id: 'b2', text: 'Discussão entre os dois próxima ao bar: entre 00h30 e 01h (duas testemunhas).' },
      {
        id: 'b3',
        text: 'Elisa deixa o salão: entre 01h e 01h30. Horário de referência: registro sonoro da cabine.',
      },
      { id: 'b4', text: 'André reaparece na entrada: 01h40 (câmera da portaria).' },
    ],
    onOpen: [{ type: 'addEvidence', id: 'elisa_original_chronology' }],
  },
  {
    id: 'doc-vertice-escala',
    title: 'Escala de DJs e equipe — arquivo antigo do Vértice',
    category: 'Arquivo privado',
    issuer: 'Boate Vértice — administração',
    system: 'documentos',
    blocks: [
      { id: 'b1', text: 'Escala semanal (modelo impresso, anos anteriores). Cabine principal: “Nico”.' },
      {
        id: 'b2',
        text: 'Cadastro de funcionários: Nicolas Prado Reis — técnico de som e DJ residente. Telefone e endereço da época: ilegíveis (papel danificado).',
      },
    ],
  },

  // ───────────────────────── Bloco 3 ─────────────────────────
  {
    id: 'doc-nico-cadastro',
    title: 'Consulta cadastral — Nicolas Prado Reis',
    category: 'Cadastro (pessoas)',
    issuer: 'Sistema de consulta policial',
    system: 'consultas',
    blocks: [
      { id: 'b1', text: 'Nome: Nicolas Prado Reis (“Nico”). Idade: 31 anos. Sem antecedentes.' },
      {
        id: 'b2',
        text: 'Vínculo profissional atual: casa noturna Titã Club — técnico de som e DJ residente.',
      },
      {
        id: 'b3',
        text: 'Cruzamento com o arquivo do Vértice (escala antiga): mesma pessoa, mesmo nome profissional.',
      },
    ],
    leads: [{ type: 'phone', label: 'Telefone de contato', value: '21 9xxxx-0731' }],
    onOpen: [
      { type: 'addEvidence', id: 'nico_current_record' },
      { type: 'discoverPerson', id: 'nico', status: 'located' },
      { type: 'unlockContact', contactId: 'contact-nico' },
      { type: 'completeTask', id: 'task_locate_nico' },
      { type: 'addTask', id: 'task_talk_nico', label: 'Falar com Nico' },
      {
        type: 'notifyInvestigationUpdate',
        id: 'nico-located',
        kind: 'contact',
        title: 'Nicolas “Nico”',
        subtitle: 'Contato registrado no telefone',
      },
    ],
  },
  {
    id: 'doc-maralto-cadastro',
    title: 'Consulta cadastral — Maralto Granéis',
    category: 'Cadastro (empresas)',
    issuer: 'Sistema de consulta policial',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Maralto Granéis S.A. — operação portuária de granéis sólidos, consolidada na região há cerca de dez anos.',
      },
      {
        id: 'b2',
        text: 'Histórico público: protestos e confrontos durante a implantação do terminal. Cobertura jornalística da época. Arquivos oficiais da ocorrência incompletos.',
      },
    ],
    onOpen: [
      { type: 'addEvidence', id: 'maralto_public_record' },
      { type: 'setFlag', id: 'block03_maralto_researched', value: true },
      { type: 'completeTask', id: 'task_research_maralto' },
      { type: 'addHypothesis', id: 'hyp_maralto_disappearance' },
      {
        type: 'linkHypothesis',
        hypothesisId: 'hyp_maralto_disappearance',
        evidenceId: 'mariana_maralto_recording',
        role: 'support',
      },
      { type: 'addHypothesis', id: 'hyp_elisa_maralto_open' },
    ],
  },
  {
    id: 'doc-maralto-clipping',
    title: 'Reportagem — “Porto em conflito” (arquivo de imprensa)',
    category: 'Recorte de imprensa',
    issuer: 'Rádio Costeira FM — arquivo digital',
    dateLabel: 'Reprodução',
    system: 'documentos',
    imageSrc: 'sprite:masked-man',
    imageCaption: 'Frame de arquivo — manifestante mascarado (núcleo)',
    blocks: [
      {
        id: 'b1',
        text: 'Moradores e manifestantes se reúnem diante do canteiro do terminal; a empresa nega irregularidades. Reportagem: Lívia Serrano.',
      },
      {
        id: 'b2',
        text: 'Segundo a reportagem, a mobilização reuniu famílias, estudantes e grupos organizados; houve confronto com a polícia ao fim da tarde.',
      },
      {
        id: 'b3',
        text: 'Rodapé do arquivo: “Redação — Rádio Costeira FM. Atendimento ao ouvinte e à imprensa.” Frame anexo: figura mascarada recorrente nas imagens da cobertura.',
      },
    ],
    leads: [{ type: 'phone', label: 'Redação — Rádio Costeira FM', value: '21 3xxx-4410' }],
    onOpen: [
      { type: 'addEvidence', id: 'livia_sought_by_mariana' },
      { type: 'discoverPerson', id: 'livia', status: 'identified' },
      { type: 'unlockContact', contactId: 'contact-livia' },
      { type: 'addTask', id: 'task_talk_livia', label: 'Falar com Lívia Serrano' },
    ],
  },
  {
    id: 'doc-cruzamento-maralto-elisa',
    title: 'Pesquisa cruzada — autos Elisa / Maralto Granéis',
    category: 'Consulta',
    issuer: 'Sistema de consulta policial',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Termos pesquisados: “Maralto Granéis”, “Elisa Duarte”, “André Silva”. Bases: processos, ocorrências e cadastros disponíveis ao sistema.',
      },
      {
        id: 'b2',
        text: 'Resultado: nenhum registro compartilha nomes, endereços ou números de processo entre os dois conjuntos.',
      },
    ],
    onOpen: [
      { type: 'addEvidence', id: 'maralto_no_elisa_link' },
      { type: 'setFlag', id: 'block03_maralto_no_link', value: true },
      {
        type: 'linkHypothesis',
        hypothesisId: 'hyp_elisa_maralto_open',
        evidenceId: 'maralto_no_elisa_link',
        role: 'contradict',
      },
    ],
  },

  // ───────────────────────── Bloco 4 ─────────────────────────
  {
    id: 'doc-protesto-ocorrencia',
    title: 'Ocorrência — confronto durante manifestação (terminal Maralto)',
    category: 'Ocorrência',
    issuer: 'Delegacia regional — arquivo morto',
    dateLabel: 'Registro antigo',
    system: 'ocorrencias',
    imageSrc: 'sprite:masked-man',
    imageCaption: 'Registro policial — figura mascarada no canteiro (sem identificação)',
    blocks: [
      {
        id: 'b1',
        text: 'Manifestação contra a implantação do terminal. Intervenção da tropa de choque ao fim da tarde; confronto na entrada do canteiro.',
      },
      {
        id: 'b2',
        text: 'Um veículo da obra foi incendiado por um pequeno grupo encapuzado. Catorze pessoas foram detidas no local e conduzidas à delegacia regional.',
      },
      {
        id: 'b3',
        text: 'A relação nominal dos detidos consta em anexo separado. Imagem anexa: indivíduo mascarado observado junto ao núcleo, sem nome no boletim.',
      },
    ],
    onOpen: [{ type: 'addEvidence', id: 'protest_incident_report' }],
  },
  {
    id: 'doc-protesto-detidos',
    title: 'Relação de detidos — ocorrência do terminal Maralto',
    category: 'Ocorrência',
    issuer: 'Delegacia regional — anexo',
    dateLabel: 'Registro antigo',
    system: 'ocorrencias',
    blocks: [
      {
        id: 'b1',
        text: 'Detidos (14): relação por nome, enquadramento e situação. Enquadramentos mais frequentes: desobediência e resistência.',
      },
      {
        id: 'b2',
        text: 'Item 9 — Samuel Teixeira, 24 anos: resistência à ação policial. Liberado após quatro dias.',
      },
      {
        id: 'b3',
        text: 'Nenhum dos detidos foi indiciado pelo incêndio do veículo.',
      },
    ],
    onOpen: [
      { type: 'addEvidence', id: 'samuel_detainee_record' },
      { type: 'discoverPerson', id: 'samuel', status: 'identified' },
      { type: 'setFlag', id: 'block04_samuel_search_unlocked', value: true },
    ],
  },
  {
    id: 'doc-samuel-ficha',
    title: 'Ficha — Samuel Teixeira',
    category: 'Cadastro (pessoas)',
    issuer: 'Sistema de consulta policial',
    system: 'consultas',
    blocks: [
      { id: 'b1', text: 'Nome: Samuel Teixeira. Idade: 30 anos. Registro único: detenção por resistência (ocorrência do terminal Maralto).' },
      { id: 'b2', text: 'Situação: liberado; sem condenação. Sem outros antecedentes.' },
      { id: 'b3', text: 'Endereço atualizado na última renovação de documentos.' },
    ],
    leads: [{ type: 'address', label: 'Endereço residencial', value: 'Rua das Acácias, 118 — ap. 21' }],
    onOpen: [
      { type: 'addEvidence', id: 'samuel_current_record' },
      { type: 'discoverPerson', id: 'samuel', status: 'located' },
      { type: 'unlockLocation', id: 'samuel-casa', status: 'visitAvailable' },
    ],
  },
  {
    id: 'doc-andre-ficha',
    title: 'Ficha de execução penal — André Silva',
    category: 'Execução penal',
    issuer: 'Vara de Execuções — consulta',
    system: 'autos',
    blocks: [
      { id: 'b1', text: 'André Silva, regime fechado. Unidade prisional estadual. Condenação em 1ª instância (homicídio doloso).' },
      { id: 'b2', text: 'Visitas: agendamento obrigatório pelo setor de visitas da unidade. Advogado constituído: sim.' },
    ],
  },
  {
    id: 'doc-andre-visitas',
    title: 'Registro de visitas — André Silva',
    category: 'Execução penal',
    issuer: 'Unidade prisional — setor de visitas',
    system: 'autos',
    blocks: [
      {
        id: 'b1',
        text: 'Visitantes cadastrados: advogado; Mariana Silva (irmã). Sem registro de visita de Mariana por vários anos.',
      },
      {
        id: 'b2',
        text: 'Última movimentação: Mariana Silva solicitou reativação do cadastro de visitante nas últimas semanas.',
      },
      {
        id: 'b3',
        text: 'Agendamento de visitas de autoridades: setor de visitas da unidade, por telefone.',
      },
    ],
    leads: [
      {
        type: 'institution',
        label: 'Setor de visitas — Unidade prisional',
        value: '21 3xxx-9100 (telefone fixo da delegacia)',
      },
    ],
    onOpen: [
      { type: 'addEvidence', id: 'mariana_andre_visit_record' },
      { type: 'unlockContact', contactId: 'contact-presidio' },
      { type: 'discoverPerson', id: 'andre', status: 'located' },
    ],
  },
  {
    id: 'doc-andre-ligacoes',
    title: 'Registro de ligações autorizadas — André Silva',
    category: 'Execução penal',
    issuer: 'Unidade prisional — central de ligações',
    system: 'autos',
    blocks: [
      {
        id: 'b1',
        text: 'Ligações autorizadas a André Silva (últimas semanas): sempre entre 14h e 17h, em dias úteis, para dois números cadastrados (advogado e familiar).',
      },
      {
        id: 'b2',
        text: 'Nenhuma ligação em horário noturno. Uso de aparelho celular na unidade: sem ocorrências no período.',
      },
    ],
    onOpen: [{ type: 'addEvidence', id: 'andre_authorized_calls' }],
  },
  {
    id: 'doc-numero-sem-nome',
    title: 'Log de interações — número sem nome (aparelho de Mariana)',
    category: 'Relatório',
    issuer: 'Extração do aparelho de Mariana',
    system: 'documentos',
    blocks: [
      {
        id: 'b1',
        text: 'Número sem nome na agenda. Interações registradas nos últimos dois meses: 9 mensagens de voz e 4 chamadas.',
      },
      {
        id: 'b2',
        text: 'Faixas de horário das interações: madrugada (entre 00h30 e 03h) e fim de noite (após 22h).',
      },
    ],
    onOpen: [{ type: 'addEvidence', id: 'unknown_number_log' }],
  },
  {
    id: 'doc-laudo-forense',
    title: 'Laudo pericial — aparelho de Mariana (análise de pacotes)',
    category: 'Perícia',
    issuer: 'Perícia — setor de dispositivos móveis',
    dateLabel: 'Solicitação do delegado',
    system: 'pericia',
    blocks: [
      {
        id: 'b1',
        text: 'Análise de pacotes instalados. Aplicativos listados pelo launcher: 14. Pacotes presentes no sistema: 15.',
      },
      {
        id: 'b2',
        text: 'Pacote não apresentado pelo launcher: local.priv.journal — base SQLite local própria, protegida por código numérico de 6 dígitos. Último acesso: recente.',
      },
      {
        id: 'b3',
        text: 'A extração identificou um aplicativo instalado no aparelho que não constava no launcher. O pacote foi recuperado e tornado acessível no dispositivo apreendido. O código de acesso permanece necessário no próprio app.',
      },
    ],
    onOpen: [
      { type: 'addEvidence', id: 'hidden_app_detected' },
      { type: 'setFlag', id: 'block04_forensics_access', value: true },
      { type: 'setFlag', id: 'block04_diary_icon_revealed', value: true },
      { type: 'installApp', device: 'mariana', appId: 'hidden-diary' },
      { type: 'completeTask', id: 'task_phone_forensics' },
      {
        type: 'addTask',
        id: 'task_open_recovered_diary',
        label: 'Abrir o aplicativo recuperado no celular de Mariana',
      },
    ],
  },
  // ───────────────────────── Bloco 5 ─────────────────────────
  {
    id: 'doc-elisa-jana',
    title: 'Depoimento arquivado — Jana Ribeiro',
    category: 'Autos',
    issuer: 'Vara Criminal — volume II (resumo)',
    dateLabel: 'Proc. 2020',
    system: 'autos',
    blocks: [
      {
        id: 'b1',
        text: 'Jana Ribeiro, amiga da vítima Elisa Duarte. Presente no Vértice na noite dos fatos. Ouvida na fase policial.',
      },
      {
        id: 'b2',
        text: 'Relatou discussão entre Elisa e André no salão. Confirmou ter visto Elisa sair. Sem menção detalhada a vestimentas no resumo arquivado.',
      },
      {
        id: 'b3',
        text: 'Cadastro atualizado na última renovação de documentos: endereço residencial válido.',
      },
    ],
    leads: [{ type: 'address', label: 'Endereço residencial', value: 'Rua do Sol, 47' }],
    onOpen: [
      { type: 'addEvidence', id: 'jana_current_record' },
      { type: 'discoverPerson', id: 'jana', status: 'located' },
      { type: 'unlockLocation', id: 'jana-casa', status: 'visitAvailable' },
      { type: 'completeTask', id: 'task_locate_jana' },
      {
        type: 'addTask',
        id: 'task_talk_jana',
        label: 'Ir ao endereço de Jana Ribeiro',
      },
    ],
  },
  {
    id: 'doc-elisa-argumento',
    title: 'Autos — Caso Elisa Duarte',
    category: 'Autos',
    issuer: 'Vara Criminal — cópia integral (consulta)',
    dateLabel: 'Proc. 2020',
    system: 'autos',
    /** Sem onOpen de evidência: cada peça só entra no caderno ao ser registrada. */
    blocks: [
      {
        id: 'sec-resumo',
        heading: 'Resumo',
        text: 'Vítima: Elisa Duarte, 17 anos. Réu: André Silva. Imputação: homicídio doloso. Sentença de 1ª instância: condenação. Recurso pendente.',
      },
      {
        id: 'sec-relacao',
        heading: 'Relação e discussão',
        text: 'Duas testemunhas descrevem discussão junto ao bar, com troca de acusações e ciúmes. Amigos próximos afirmam que o relacionamento atravessava fase ruim nas semanas anteriores.',
        extractableEvidenceId: 'elisa_argument_jealousy',
      },
      {
        id: 'sec-alibi',
        heading: 'Álibi e cronologia',
        text: 'Chegada ao Vértice por volta das 23h. Discussão junto ao bar entre 00h30 e 01h. Elisa deixa o salão entre 01h e 01h30. André reaparece na portaria às 01h40. André não apresentou álibi considerado confiável para o intervalo entre a saída de Elisa e o próprio reaparecimento. Inconsistências pontuais entre depoimentos de frequentadores foram anotadas; a cronologia oficial prevaleceu na sentença.',
        extractableEvidenceId: 'elisa_weak_alibi',
      },
      {
        id: 'sec-testemunhas',
        heading: 'Testemunhas',
        text: 'Ouvidos na fase policial: amigos da vítima, funcionários da Boate Vértice e o DJ Nicolas Prado Reis. Uma testemunha afirmou ter visto, próximo à região da queda, alguém com porte semelhante ao de André Silva. A identificação visual não foi inequívoca.',
        extractableEvidenceId: 'elisa_lookalike_near_fall',
      },
      {
        id: 'sec-sentenca',
        heading: 'Sentença',
        text: 'O conjunto — discussão, estado do relacionamento, álibi fraco e testemunha próxima à queda — sustentou a condenação em primeira instância.',
      },
    ],
  },
  {
    /** Legado — conteúdo absorvido em `doc-elisa-argumento`. */
    id: 'doc-elisa-alibi',
    title: 'Autos — Caso Elisa Duarte (álibi)',
    category: 'Autos',
    issuer: 'Vara Criminal — resumo',
    dateLabel: 'Proc. 2020',
    system: 'autos',
    playerFacing: false,
    blocks: [
      {
        id: 'b1',
        text: 'André não apresentou álibi considerado confiável para o intervalo entre a saída de Elisa e o próprio reaparecimento na portaria.',
      },
    ],
    onOpen: [{ type: 'addEvidence', id: 'elisa_weak_alibi' }],
  },
  {
    /** Legado — conteúdo absorvido em `doc-elisa-argumento`. */
    id: 'doc-elisa-testemunha-queda',
    title: 'Autos — Caso Elisa Duarte (testemunha)',
    category: 'Autos',
    issuer: 'Vara Criminal — resumo',
    dateLabel: 'Proc. 2020',
    system: 'autos',
    playerFacing: false,
    blocks: [
      {
        id: 'b1',
        text: 'Uma testemunha afirmou ter visto, próximo à região da queda, alguém com porte semelhante ao de André Silva.',
      },
    ],
    onOpen: [{ type: 'addEvidence', id: 'elisa_lookalike_near_fall' }],
  },
  {
    id: 'doc-elisa-geraldo-depoimento',
    title: 'Depoimento arquivado — Geraldo Mota (resumo)',
    category: 'Autos',
    issuer: 'Vara Criminal — volume II',
    dateLabel: 'Proc. 2020',
    system: 'autos',
    blocks: [
      {
        id: 'b1',
        text: 'Geraldo Mota — barman do Vértice na noite dos fatos. Ouvido sobre o estado de Elisa Duarte e o ambiente do salão.',
      },
      {
        id: 'b2',
        text: 'Declaração resumida: serviu “quase nada” de álcool a Elisa; descreveu discussão com André e a saída dela. Sem menção a menoridade.',
      },
      {
        id: 'b3',
        text: 'Peça marcada para reexame. Cadastro atualizado disponível em consulta nominal.',
      },
    ],
    onOpen: [{ type: 'discoverPerson', id: 'geraldo', status: 'identified' }],
  },
  {
    id: 'doc-geraldo-ficha',
    title: 'Ficha — Geraldo Mota',
    category: 'Cadastro (pessoas)',
    issuer: 'Sistema de consulta policial',
    system: 'consultas',
    blocks: [
      { id: 'b1', text: 'Nome: Geraldo Mota. À época: barman no Vértice. Sem condenação criminal.' },
      { id: 'b2', text: 'Endereço residencial atualizado na última renovação de documentos.' },
    ],
    leads: [{ type: 'address', label: 'Endereço residencial', value: 'Travessa das Palmeiras, 9' }],
    onOpen: [
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
    id: 'doc-vertice-comanda-noitex',
    title: 'Comanda e fechamento de caixa — Vértice (Noite X)',
    category: 'Arquivo privado',
    issuer: 'Boate Vértice — administração (cópia nos autos)',
    dateLabel: 'Noite X',
    system: 'documentos',
    blocks: [
      {
        id: 'b1',
        text: 'Comanda do bar principal no intervalo da saída de Elisa: volume de doses acima do declarado por Geraldo Mota no depoimento.',
      },
      {
        id: 'b2',
        text: 'Fechamento de caixa parcial: sequência de atendimento compatível com múltiplos serviços ao mesmo grupo. Não individualiza copo a pessoa.',
      },
      {
        id: 'b3',
        text: 'Anexo: registro de entrada com indício de menoridade em cartão associado ao grupo de Elisa (ilegível em parte).',
      },
    ],
    onOpen: [{ type: 'addEvidence', id: 'vertice_comanda_night_x' }],
  },
  {
    id: 'doc-valter-ocorrencias',
    title: 'Válter — ocorrências e vínculos',
    category: 'Consultas',
    issuer: 'Sistema policial',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Válter: múltiplas ocorrências arquivadas (extorsão, ameaça, associação). Nenhuma condenação definitiva listada no resumo.',
      },
      {
        id: 'b2',
        text: 'Vínculos: núcleo recorrente de associados. Atividade contemporânea sob monitoramento setorial.',
      },
    ],
    onOpen: [
      { type: 'addEvidence', id: 'valter_criminal_structure' },
      { type: 'discoverPerson', id: 'valter', status: 'identified' },
    ],
  },
  {
    id: 'doc-valter-associados',
    title: 'Relação de associados — núcleo Válter (atual)',
    category: 'Consultas',
    issuer: 'Delegacia especializada — resumo',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Associados com movimentação recente. Entre nomes recorrentes: Miro (sem sobrenome operacional fixo nas fichas).',
      },
      {
        id: 'b2',
        text: 'Miro: envolvido em entregas e comunicação por rádio portátil. Sem menção a Jana ou ao caso Elisa neste relatório.',
      },
    ],
    onOpen: [
      { type: 'addEvidence', id: 'miro_linked_to_valter_group' },
      { type: 'discoverPerson', id: 'miro', status: 'identified' },
    ],
  },
  {
    id: 'doc-valter-interceptacao',
    title: 'Interceptação de rádio — operação contemporânea',
    category: 'Perícia / interceptação',
    issuer: 'Setor de interceptações',
    dateLabel: '05/11/2026',
    system: 'pericia',
    blocks: [
      {
        id: 'b1',
        text: 'Captura multi-canal (A/B/C) de rádios portáteis ligados ao núcleo. Timestamps, IDs e bursts digitais arquivados.',
      },
      {
        id: 'b2',
        text: 'Objetivo operacional: localizar ponto de entrega próxima. Material encaminhado à bancada de análise.',
      },
      {
        id: 'b3',
        text: 'Tabela logística parcial apreendida em operação anterior anexa (tokens → locais).',
      },
    ],
    onOpen: [{ type: 'addEvidence', id: 'valter_group_active_intercepts' }],
  },
  {
    id: 'doc-tabela-logistica-g17n',
    title: 'Tabela logística apreendida (parcial)',
    category: 'Documento apreendido',
    issuer: 'Operação — núcleo Válter',
    system: 'documentos',
    blocks: [
      { id: 'b1', text: 'K02S — Cais 02 — Sul' },
      { id: 'b2', text: 'G17N — Galpão 17 — Pátio Norte' },
      { id: 'b3', text: 'B08L — Box 08 — Leste' },
    ],
    onOpen: [{ type: 'addEvidence', id: 'galpao17_operational_site' }],
  },
  // ── Legado C1: anotações de raciocínio — não entram mais no fluxo jogável.
  // Saves antigos podem ainda tê-las em documentsOwned; evidências/flags vêm dos novos gatilhos.
  {
    id: 'doc-mariana-contact-chronology',
    title: 'Cronologia — contatos recentes de Mariana (montagem)',
    category: 'Anotação de caso (legado)',
    issuer: 'Delegacia — Augusto Nogueira',
    dateLabel: '05/11/2026',
    system: 'documentos',
    playerFacing: false,
    blocks: [
      {
        id: 'b1',
        text: '[Legado] Cronologia agora vive na Timeline do caderno.',
      },
    ],
    onOpen: [],
  },
  {
    id: 'doc-phone-file-dependencies',
    title: 'Comparação — arquivos do celular × ordem de compreensão',
    category: 'Anotação de caso (legado)',
    issuer: 'Delegacia — Augusto Nogueira',
    dateLabel: '05/11/2026',
    system: 'documentos',
    playerFacing: false,
    blocks: [
      {
        id: 'b1',
        text: '[Legado] Conclusão registrada via evidência ao consultar Arquivos no celular.',
      },
    ],
    onOpen: [],
  },
  {
    id: 'doc-emergency-reassessment',
    title: 'Releitura — chamada, entrada e apreensão do celular',
    category: 'Anotação de caso (legado)',
    issuer: 'Delegacia — Augusto Nogueira',
    dateLabel: '05/11/2026',
    system: 'documentos',
    playerFacing: false,
    blocks: [
      {
        id: 'b1',
        text: '[Legado] Reabrir as peças reais (central / entrada / apreensão).',
      },
    ],
    onOpen: [],
  },
  {
    id: 'doc-sandra-depoimento',
    title: 'Depoimento — Sandra Almeida (região da queda)',
    category: 'Autos',
    issuer: 'Vara Criminal — volume III',
    dateLabel: 'Proc. 2020',
    system: 'autos',
    blocks: [
      {
        id: 'b1',
        text: 'Sandra Almeida: testemunha que afirmou ter visto, retornando da região da queda, alguém com porte semelhante ao de André Silva.',
      },
      {
        id: 'b2',
        text: 'Depoimento repetido no inquérito, na instrução e no júri. Sem retratação nos autos.',
      },
    ],
    onOpen: [{ type: 'discoverPerson', id: 'sandra', status: 'identified' }],
  },
  {
    id: 'doc-sandra-ficha',
    title: 'Ficha — Sandra Almeida',
    category: 'Cadastro (pessoas)',
    issuer: 'Sistema de consulta policial',
    system: 'consultas',
    blocks: [
      { id: 'b1', text: 'Nome: Sandra Almeida. Sem antecedentes relevantes.' },
      { id: 'b2', text: 'Endereço residencial atualizado. Sem pedido de proteção ativo.' },
    ],
    leads: [{ type: 'address', label: 'Endereço residencial', value: 'Rua das Hortênsias, 212' }],
    onOpen: [
      { type: 'discoverPerson', id: 'sandra', status: 'located' },
      { type: 'unlockLocation', id: 'sandra-casa', status: 'visitAvailable' },
      { type: 'completeTask', id: 'task_locate_sandra' },
      {
        type: 'addTask',
        id: 'task_talk_sandra',
        label: 'Ouvir Sandra Almeida — testemunha da região da queda',
      },
    ],
  },
  // ── Legado C1: raciocínio absorvido em evidências + Timeline.
  {
    id: 'doc-morsa-duration-note',
    title: 'Nota — duração da atividade de Morsa (reconstrução)',
    category: 'Anotação de caso (legado)',
    issuer: 'Delegacia — Augusto Nogueira',
    dateLabel: '06/11/2026',
    system: 'documentos',
    playerFacing: false,
    blocks: [
      {
        id: 'b1',
        text: '[Legado] Reabrir ocorrência/detidos dos protestos Maralto.',
      },
    ],
    onOpen: [],
  },
  {
    id: 'doc-memory-onset-chronology',
    title: 'Cronologia — primeiros registros anormais de memória',
    category: 'Anotação de caso (legado)',
    issuer: 'Delegacia — Augusto Nogueira',
    dateLabel: '06/11/2026',
    system: 'documentos',
    playerFacing: false,
    blocks: [
      {
        id: 'b1',
        text: '[Legado] Agora na Timeline do caderno.',
      },
    ],
    onOpen: [],
  },
  {
    id: 'doc-hospital-ricardo-freitas',
    title: 'Hospital Municipal — registro de atendimento',
    category: 'Institucional',
    issuer: 'Hospital Municipal — arquivo médico',
    dateLabel: 'Plantão correspondente',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Paciente: Ricardo Freitas. Identidade declarada verbalmente; documento não apresentado. Contato familiar: não informado. Endereço: incompleto / não confirmado.',
      },
      {
        id: 'b2',
        text: 'Entrada em agitação, ansiedade intensa, desorientação episódica e sinais físicos que justificaram observação. Permaneceu internado; óbito na madrugada. Resistência a procedimentos; dificuldade de obtenção de dados pessoais.',
      },
      {
        id: 'b3',
        text: 'Observação administrativa: familiar não localizado durante a internação. Procedimentos posteriores sem reconhecimento imediato. Pertences relacionados e encaminhados conforme protocolo interno.',
      },
    ],
    onOpen: [],
  },
  {
    id: 'doc-forum-hvalenca',
    title: 'Arquivo de fórum técnico — tópico de 2021',
    category: 'Consultas (rede)',
    issuer: 'Espelho arquivado / busca aberta',
    dateLabel: '2021',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Usuário: hvalenca. Pergunta sobre persistência de sessão, autenticação, cache e comportamento anômalo de sessão em infraestrutura.',
      },
      {
        id: 'b2',
        text: 'Resposta de hvalenca: texto tecnicamente competente sobre camada de sessão. Menção lateral: “Já vimos comportamento parecido no ambiente que mantemos na Aster Sistemas. No nosso caso o problema estava na camada de sessão, não no cliente.”',
      },
      {
        id: 'b3',
        text: 'Nenhuma identificação civil no tópico. Apenas nickname e referência incidental ao empregador.',
      },
    ],
    onOpen: [],
  },
  {
    id: 'doc-aster-admin',
    title: 'Aster Sistemas — contato administrativo',
    category: 'Consultas',
    issuer: 'Junta comercial / arquivo empresarial',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Aster Sistemas Ltda. — empresa reestruturada após 2022. Contato administrativo remanescente para arquivo de pessoal e incidentes internos da época.',
      },
      {
        id: 'b2',
        text: 'Ramal institucional para solicitações policiais: discar ASTER no telefone da delegacia.',
      },
    ],
    leads: [{ type: 'phone', label: 'Administrativo', value: 'Ramal ASTER (fixo)' }],
    onOpen: [{ type: 'setFlag', id: 'block07_aster_call_unlocked', value: true }],
  },
  {
    id: 'doc-ricardo-consulta-negativa',
    title: 'Consulta civil — Ricardo Freitas (dados incompletos)',
    category: 'Consultas',
    issuer: 'Sistema policial — cadastros',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Cruzamento do nome e dos dados informados no hospital: nenhum cadastro civil compatível com idade, filiação ou endereço plausível.',
      },
      {
        id: 'b2',
        text: 'CPF/documento apresentado no atendimento não encontra correspondência confiável. Homônimos listados não batem com a descrição do paciente.',
      },
      {
        id: 'b3',
        text: 'Sem vínculo familiar útil. Os dados disponíveis não sustentam que aquele homem fosse, de fato, Ricardo Freitas.',
      },
    ],
    onOpen: [
      { type: 'setFlag', id: 'block07_ricardo_dead_end', value: true },
      { type: 'addEvidence', id: 'ricardo_civil_unconfirmed' },
      { type: 'completeTask', id: 'task_confirm_ricardo_identity' },
      { type: 'completeTask', id: 'task_crosscheck_ricardo_mariana' },
      { type: 'setFlag', id: 'block07_refl_ricardo_dead_pending', value: true },
    ],
  },
  {
    /**
     * Legado — saves antigos. Não entra no fluxo novo (pista parcial = nota `n-sess`;
     * confirmação = `doc-henrique-cadastro`).
     */
    id: 'doc-mariana-ricardo-note',
    title: 'Extração — anotação privada de Mariana (Ricardo)',
    category: 'Extração forense',
    issuer: 'Perícia / celular de Mariana',
    system: 'pericia',
    blocks: [
      {
        id: 'b1',
        text: '[Legado] A ponte Ricardo → Henrique agora passa por consulta civil, nota antiga e cadastro independente.',
      },
    ],
    onOpen: [],
  },
  {
    id: 'doc-henrique-cadastro',
    title: 'Consulta cadastral — identificador hvalenca',
    category: 'Cadastro (pessoas)',
    issuer: 'Sistema policial / juntas e registros profissionais',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Identificador parcial hvalenca@ correlacionado a registro profissional/empresarial ativo na época do incidente setorial.',
      },
      {
        id: 'b2',
        text: 'Nome completo recuperado: Henrique Valença. Cadastro civil existente; histórico profissional em empresa de tecnologia (registro encerrado / reestruturado).',
      },
      {
        id: 'b3',
        text: 'Nenhuma menção a “Ricardo Freitas” neste cadastro. A correspondência é técnica — conta e vínculos — não hospitalar.',
      },
    ],
    onOpen: [
      { type: 'setFlag', id: 'block07_henrique_named', value: true },
      { type: 'discoverPerson', id: 'henrique', status: 'identified' },
      { type: 'addEvidence', id: 'henrique_registry_match' },
      { type: 'completeTask', id: 'task_verify_hvalenca_identifier' },
      { type: 'setFlag', id: 'block07_refl_henrique_reveal_pending', value: true },
    ],
  },
  {
    id: 'doc-henrique-empresa',
    title: 'Henrique Valença — vínculo empresarial',
    category: 'Consultas',
    issuer: 'Sistema policial / juntas',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Henrique Valença: vínculo profissional com antiga empresa de tecnologia (registro encerrado / reestruturado).',
      },
      {
        id: 'b2',
        text: 'Sem condenação listada. Histórico de demissão/afastamento após período de conflito interno.',
      },
    ],
    onOpen: [
      { type: 'addEvidence', id: 'henrique_tech_company' },
      { type: 'discoverPerson', id: 'henrique', status: 'identified' },
    ],
  },
  {
    id: 'doc-henrique-incidente',
    title: 'Incidente de segurança — relatório resumido',
    category: 'Consultas',
    issuer: 'Arquivo setorial',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Henrique reportou incidente de segurança: acessos anômalos, sessões que não fechavam, suspeita de observação.',
      },
      {
        id: 'b2',
        text: 'A empresa tratou como problema pessoal / burnout. Alegações não comprovadas no relatório oficial.',
      },
    ],
    onOpen: [{ type: 'addEvidence', id: 'henrique_security_incident' }],
  },
  {
    id: 'doc-cecilia-contato',
    title: 'Contato profissional — Cecília Prado',
    category: 'Consultas',
    issuer: 'Lista de colegas / depoentes',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Cecília Prado: colega na época do incidente. Endereço residencial atualizado disponível.',
      },
      {
        id: 'b2',
        text: 'Indicada como quem melhor descreveu a deterioração comportamental de Henrique sem endossar as alegações técnicas.',
      },
    ],
    leads: [{ type: 'address', label: 'Endereço', value: 'Alameda Nova, 88 — ap. 14' }],
    onOpen: [
      { type: 'addEvidence', id: 'cecilia_prado_contact' },
      { type: 'discoverPerson', id: 'cecilia', status: 'located' },
    ],
  },
  {
    id: 'doc-henrique-pcap-note',
    title: 'Material digital antigo — captura de rede (Henrique)',
    category: 'Perícia / forense',
    issuer: 'Backup / cache recuperado — incidente de segurança',
    system: 'pericia',
    blocks: [
      {
        id: 'b1',
        text: 'Arquivo recuperado de backup setorial ligado ao incidente reportado por Henrique Valença. Dump contendo sessão de voz fragmentada.',
      },
      {
        id: 'b2',
        text: 'Pacotes RTP com timestamps, sequence numbers e SSRCs misturados. Encaminhado à bancada de áudio para reconstrução.',
      },
    ],
    onOpen: [],
  },
  {
    id: 'doc-guardrail-reanalise',
    title: 'Laudo complementar — Guardrail / proteção da via',
    category: 'Perícia / forense',
    issuer: 'Perícia Criminal',
    dateLabel: '07/11/2026',
    system: 'pericia',
    blocks: [
      {
        id: 'b1',
        text: 'A proteção da via já apresentava comprometimento estrutural antes da queda de Elisa Duarte. Deformação compatível com impacto oblíquo de veículo.',
      },
      {
        id: 'b2',
        text: 'Transferência de tinta verde metálica escura e pequeno fragmento de acabamento automotivo. Numeração parcial compatível com acabamento dianteiro de veículos Jaguar família X300 (XJ6, meados dos anos 1990).',
      },
      {
        id: 'b3',
        text: 'Não foi possível identificar placa, proprietário nem veículo individual. Compatibilidade mais provável: Jaguar XJ6 / X300, aproximadamente 1995–1997.',
      },
    ],
    /** Progressão (veículo / flags): `requestGuardrailReexam` via `onDocumentConsulted`. */
    onOpen: [],
  },
  {
    id: 'doc-camera-veiculo-madrugada',
    title: 'Câmera viária — veículo com dano lateral (madrugada)',
    category: 'Consultas',
    issuer: 'Registro municipal / imagem policial',
    dateLabel: 'Noite X',
    system: 'consultas',
    playerFacing: false,
    blocks: [
      {
        id: 'b1',
        text: 'Imagem na região e no período: veículo com dano compatível com as características do impacto no guardrail.',
      },
      {
        id: 'b2',
        text: 'Placa/registro: proprietário Mauro. Sem indicação de motorista na imagem.',
      },
    ],
    leads: [{ type: 'address', label: 'Endereço do proprietário', value: 'Rua do Cedro, 55' }],
    onOpen: [],
  },
  {
    id: 'doc-mauro-transferencia',
    title: 'Comprovante de transferência — reparo veicular',
    category: 'Documento particular',
    issuer: 'Mauro (arquivo pessoal)',
    system: 'documentos',
    playerFacing: false,
    blocks: [
      {
        id: 'b1',
        text: 'Transferência bancária antiga para oficina/prestador identificado como Dênis — valor compatível com reparo de lateral.',
      },
      {
        id: 'b2',
        text: 'Endereço da oficina anotado no comprovante.',
      },
    ],
    leads: [{ type: 'address', label: 'Oficina', value: 'Oficina Dênis — pátio' }],
    onOpen: [{ type: 'addEvidence', id: 'mauro_repair_transfer_denis' }],
  },
  {
    id: 'doc-bia-ficha',
    title: 'Ficha — Bia (vínculo familiar)',
    category: 'Cadastro (pessoas)',
    issuer: 'Sistema de consulta policial',
    system: 'consultas',
    playerFacing: false,
    blocks: [
      { id: 'b1', text: 'Bia: enteada de Mauro. Cadastro atualizado.' },
      { id: 'b2', text: 'Endereço residencial disponível.' },
    ],
    leads: [{ type: 'address', label: 'Endereço', value: 'Travessa Leste, 19' }],
    onOpen: [],
  },
  {
    id: 'doc-rui-ficha',
    title: 'Ficha — Rui',
    category: 'Cadastro (pessoas)',
    issuer: 'Sistema de consulta policial',
    system: 'consultas',
    playerFacing: false,
    blocks: [
      { id: 'b1', text: 'Rui: indicado por Bia. Cadastro atualizado.' },
      { id: 'b2', text: 'Endereço residencial disponível.' },
    ],
    leads: [{ type: 'address', label: 'Endereço', value: 'Rua das Figueiras, 301' }],
    onOpen: [],
  },
  {
    id: 'doc-escala-vtr14',
    title: 'Escala antiga — indicativo VTR-14',
    category: 'Arquivo institucional',
    issuer: 'Corporação — escala de equipes',
    dateLabel: 'Noite X',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Indicativo VTR-14 — equipe da abordagem na via auxiliar no intervalo reconstruído.',
      },
      {
        id: 'b2',
        text: 'Escala nominativa: Augusto Nogueira constava na equipe daquela viatura na data e local.',
      },
    ],
    onOpen: [
      { type: 'addEvidence', id: 'scale_links_callsign_to_augusto' },
      { type: 'setFlag', id: 'block08_augusto_linked', value: true },
      { type: 'completeTask', id: 'task_lookup_callsign_scale' },
      { type: 'addHypothesis', id: 'hyp_augusto_causal_in_chain' },
      { type: 'updateHypothesis', id: 'hyp_augusto_causal_in_chain', state: 'confirmed' },
      { type: 'addHypothesis', id: 'hyp_mariana_chose_augusto' },
      { type: 'updateHypothesis', id: 'hyp_mariana_chose_augusto', state: 'confirmed' },
      { type: 'setFlag', id: 'block08_refl_final_pending', value: true },
    ],
  },
  {
    id: 'doc-omitido-interface',
    title: 'Log de sessão — identificador O Omitido',
    category: 'Extração forense',
    issuer: 'Material digital recuperado (Henrique / Mariana)',
    system: 'pericia',
    blocks: [
      {
        id: 'b1',
        text: 'Nos registros de interface reconstruídos, o interlocutor aparece sob o identificador “O Omitido” — rótulo exibido pelo próprio sistema, não atribuído pela investigação.',
      },
      {
        id: 'b2',
        text: 'A mesma infraestrutura aparece no material de Henrique e nas sessões prolongadas de Mariana. O canal pergunta, aponta inconsistências e oferece fragmentos verificáveis.',
      },
    ],
    onOpen: [],
  },
  {
    /** Legado — saves antigos; não entra mais no fluxo novo (Reflection no diário). */
    id: 'doc-diario-releitura-omitido',
    title: 'Releitura — diário à luz de O Omitido',
    category: 'Anotação de caso',
    issuer: 'Delegacia — Augusto Nogueira',
    system: 'documentos',
    playerFacing: false,
    blocks: [
      {
        id: 'b1',
        text: 'Parte do comportamento estranho registrado no diário parece preparada para o percurso. Outra parte permanece ilegível: lapsos reais, encenação, influência — sem fronteira segura.',
      },
      {
        id: 'b2',
        text: 'Não se resolve aqui quanto da paranoia era dela e quanto foi induzido. A ambiguidade permanece.',
      },
    ],
    onOpen: [],
  },
  {
    /** Legado — saves antigos; não entra mais no fluxo novo (Reflection). */
    id: 'doc-omitido-assistencia',
    title: 'Nota — assistência técnica no desaparecimento',
    category: 'Anotação de caso',
    issuer: 'Delegacia — Augusto Nogueira',
    system: 'documentos',
    playerFacing: false,
    blocks: [
      {
        id: 'b1',
        text: 'Ligação de emergência, arquivos manipulados, envio de áudios e timing de provocações exigem capacidades que Mariana sozinha dificilmente teria.',
      },
      {
        id: 'b2',
        text: 'Conclusão de trabalho: o desaparecimento era plano dela, com assistência externa de O Omitido. Nem marionete plena, nem controle absoluto.',
      },
    ],
    onOpen: [],
  },
  {
    id: 'doc-roberto-denuncia',
    title: 'Roberto Siqueira — afastamento e denúncia anônima',
    category: 'Consultas',
    issuer: 'Corregedoria / arquivo interno',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Roberto Siqueira. Material da denúncia verdadeiro. Afastamento justificado pelos autos da Corregedoria.',
      },
      {
        id: 'b2',
        text: 'O problema está na hora: dias antes do desaparecimento de Mariana Silva. Tempo suficiente para abrir uma cadeira — a do delegado que assumiu o caso.',
      },
    ],
    /** Efeitos de Roberto + mensagens: `onRobertoExposed` (DocumentSheet). */
    onOpen: [],
  },
  {
    /** Legado — saves antigos; conclusão agora vem da leitura no WhatsApp. */
    id: 'doc-mensagens-impossiveis',
    title: 'Nota — o que as mensagens sabem demais',
    category: 'Anotação de caso',
    issuer: 'Delegacia — Augusto Nogueira',
    system: 'documentos',
    playerFacing: false,
    blocks: [
      {
        id: 'b1',
        text: 'As mensagens usam o vocabulário de Mariana e fatos pessoais. Também conhecem resultados de análises e descobertas posteriores ao desaparecimento.',
      },
      {
        id: 'b2',
        text: 'A pergunta deixa de ser “onde está Mariana?” e passa a ser “quem está falando — e desde quando?”.',
      },
    ],
    onOpen: [],
  },
  {
    id: 'doc-trilha-camera-mariana',
    title: 'Consulta — câmeras viárias (últimos deslocamentos)',
    category: 'Consultas',
    issuer: 'Sistema policial — imagens',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Sequência parcial de imagens: Mariana em deslocamento noturno na zona norte, sozinha, com intervalo compatível com transporte público e caminhada.',
      },
      {
        id: 'b2',
        text: 'Último enquadramento útil: saída em direção ao setor industrial. Sem confirmação de destino final nesta base.',
      },
    ],
    onOpen: [],
  },
  {
    id: 'doc-trilha-transporte-mariana',
    title: 'Consulta — registro de transporte / passagem',
    category: 'Consultas',
    issuer: 'Sistema policial — mobilidade',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Passagem registrada em linha/terminal compatível com a rota das câmeras. Horário alinhado ao último deslocamento conhecido.',
      },
      {
        id: 'b2',
        text: 'Destino operacional sugerido: entorno de galpões desativados no setor norte. Consolidar com demais consultas.',
      },
    ],
    onOpen: [],
  },
  {
    id: 'doc-trilha-fisica-mariana',
    title: 'Relatório institucional — últimos deslocamentos (Mariana Silva)',
    category: 'Consultas',
    issuer: 'Sistema policial — consolidação de consultas',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Consolidação de câmera, transporte e registros correlatos: percurso até um galpão desativado no setor norte. Sem endereço ditado por terceiros — só a cadeia documental.',
      },
      {
        id: 'b2',
        text: 'Há motivo suficiente para deslocamento imediato ao local. Ainda há chance — ou havia — de encontrá-la viva.',
      },
    ],
    leads: [{ type: 'address', label: 'Local', value: 'Galpão desativado — setor norte' }],
    onOpen: [],
  },
  {
    id: 'doc-outros-desaparecimentos',
    title: 'Resultado de busca — outros desaparecimentos semelhantes',
    category: 'Consultas',
    issuer: 'Sistema policial — resumo institucional',
    system: 'consultas',
    blocks: [
      {
        id: 'b1',
        text: 'Não é uma lista limpa. Pessoas, cidades e contextos diferentes. Alguns relatos repetem a mesma forma: conversas longas, interlocutor que acumula detalhes, mudança gradual de comportamento.',
      },
      {
        id: 'b2',
        text: 'Pessoas próximas dizendo que o sujeito “não parecia ele mesmo”. Depois, desaparecimento. Henrique Valença e Mariana Silva não aparecem como acidentes isolados.',
      },
    ],
    onOpen: [],
  },
  {
    /** Legado — saves antigos; anomalias agora são eventos + Reflection. */
    id: 'doc-anomalias-augusto',
    title: 'Nota — anomalias envolvendo Augusto',
    category: 'Anotação de caso',
    issuer: 'Delegacia — Augusto Nogueira',
    system: 'documentos',
    playerFacing: false,
    blocks: [
      {
        id: 'b1',
        text: 'Frase enviada no tom exato de uma reflexão anterior. Resposta a algo que não lembra de ter dito. Poucos sinais — suficientes.',
      },
      {
        id: 'b2',
        text: 'Durante a investigação, culpa, raciocínio e medo ficaram expostos. O Omitido esteve presente. O processo pode ter se voltado para cá.',
      },
    ],
    onOpen: [],
  },
]

export function getDocument(id: string): Document | undefined {
  return seedDocuments.find((d) => d.id === id)
}
