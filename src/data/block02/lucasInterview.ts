export type LucasTopicId =
  | 'intro'
  | 'elisa'
  | 'relationship'
  | 'andre'
  | 'mariana_visit'

export const LUCAS_TOPIC_IDS: LucasTopicId[] = [
  'intro',
  'elisa',
  'relationship',
  'andre',
  'mariana_visit',
]

export const lucasTopicLabels: Record<LucasTopicId, string> = {
  intro: 'Como Mariana o procurou',
  elisa: 'Elisa Duarte',
  relationship: 'Relação com Elisa e André',
  andre: 'André Silva e a condenação',
  mariana_visit: 'O que Mariana perguntou',
}

export const lucasTopicFlags: Record<LucasTopicId, string> = {
  intro: 'block02_lucas_intro',
  elisa: 'block02_lucas_elisa',
  relationship: 'block02_lucas_relationship',
  andre: 'block02_lucas_andre',
  mariana_visit: 'block02_lucas_mariana_visit',
}

export type LucasBeat = { speaker?: string; text: string; portrait?: 'lucas' }

export const lucasBeats: Record<LucasTopicId, LucasBeat[]> = {
  // Abertura
  intro: [
    { speaker: 'Augusto', text: 'Lucas Moreira?' },
    { speaker: 'Lucas', text: 'Sim.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Augusto Nogueira, Polícia Civil. Preciso falar sobre Mariana Silva.' },
    { speaker: 'Lucas', text: 'Eu sabia que alguém ia aparecer por causa dela.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Por quê?' },
    { speaker: 'Lucas', text: 'Porque ela apareceu aqui primeiro.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Quando?' },
    { speaker: 'Lucas', text: 'Alguns meses atrás.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Vocês se conheciam?' },
    {
      speaker: 'Lucas',
      text: 'Não.\nEla chegou sabendo meu nome e carregando cópia de coisa que eu tinha dito seis anos atrás.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Ela está desaparecida.' },
    { speaker: 'Lucas', text: '...', portrait: 'lucas' },
    { speaker: 'Lucas', text: 'Desde quando?', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Estamos procurando por ela desde ontem.' },
    { speaker: 'Lucas', text: 'Merda.', portrait: 'lucas' },
  ],
  // Elisa
  elisa: [
    { speaker: 'Augusto', text: 'O que Mariana queria de você?' },
    { speaker: 'Lucas', text: 'Falar da Elisa.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Elisa Duarte.' },
    { speaker: 'Lucas', text: 'Então você já sabe.', portrait: 'lucas' },
    {
      speaker: 'Augusto',
      text: 'Sei o nome. Quero saber por que Mariana veio atrás de você.',
    },
    { speaker: 'Lucas', text: 'Porque eu depus contra o irmão dela.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Foi assim que ela colocou?' },
    {
      speaker: 'Lucas',
      text: 'Não.\nEla foi mais cuidadosa.\nFoi isso que me irritou.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'O que ela fez?' },
    {
      speaker: 'Lucas',
      text: 'Abriu meu depoimento e começou a separar cada frase.\nO que eu tinha visto.\nO que a Elisa tinha me contado.\nO que eu tinha concluído depois.',
      portrait: 'lucas',
    },
  ],
  // Relação com Elisa
  relationship: [
    { speaker: 'Augusto', text: 'Você conhecia Elisa bem?' },
    { speaker: 'Lucas', text: 'Estava começando a conhecer.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Como?' },
    {
      speaker: 'Lucas',
      text: 'Ela queria estudar aqui.\nUma amiga apresentou a gente e eu mostrei o campus, falei de inscrição, bolsa, essas coisas.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Vocês tinham alguma coisa?' },
    { speaker: 'Lucas', text: 'Não.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'André achava que tinham?' },
    { speaker: 'Lucas', text: 'André não precisava achar muita coisa pra não gostar de mim.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Você viu os dois discutirem?' },
    {
      speaker: 'Lucas',
      text: 'Vi ele cobrar por que ela estava aqui, quem estava com ela, que horas voltava.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Viu André ameaçar Elisa?' },
    { speaker: 'Lucas', text: 'Não.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Viu ele agredir Elisa?' },
    { speaker: 'Lucas', text: 'Não.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Ela disse que tinha medo dele?' },
    { speaker: 'Lucas', text: 'Não com essas palavras.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Foi isso que Mariana perguntou?' },
    { speaker: 'Lucas', text: 'Foi exatamente isso.', portrait: 'lucas' },
  ],
  // Atrito + O que Elisa dizia
  andre: [
    { speaker: 'Lucas', text: 'E é aí que começa a brincadeira, né?', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Que brincadeira?' },
    {
      speaker: 'Lucas',
      text: 'Eu digo que o André controlava a vida dela.\nAí alguém pergunta se eu vi ele bater nela. Não vi.\nPergunta se a Elisa usou a palavra “medo”. Não usou.\nDaqui a pouco parece que eu inventei tudo.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Eu não disse isso.' },
    { speaker: 'Lucas', text: 'A Mariana também não dizia.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Mas você sentiu que era isso que ela estava fazendo.' },
    {
      speaker: 'Lucas',
      text: 'Eu senti que ela precisava que cada coisa que eu lembrava fosse menor do que parecia no processo.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'E era?' },
    { speaker: 'Lucas', text: 'Algumas eram.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Elisa falou em terminar com André?' },
    {
      speaker: 'Lucas',
      text: 'Falou que estava cansada.\nQue não queria continuar vivendo do mesmo jeito.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Cansada de quê?' },
    {
      speaker: 'Lucas',
      text: 'De discussão.\nDe dívida.\nDe aposta.\nDe ter que explicar onde estava o tempo inteiro.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Ela disse que ia terminar?' },
    { speaker: 'Lucas', text: 'Disse que estava pensando.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Isso foi antes da morte.' },
    { speaker: 'Lucas', text: 'Foi.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Você contou isso no depoimento.' },
    { speaker: 'Lucas', text: 'Contei.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'E acredita até hoje que André matou Elisa.' },
    { speaker: 'Lucas', text: 'Acredito.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Mesmo reconhecendo que parte do que você disse era interpretação.' },
    { speaker: 'Lucas', text: 'Uma coisa não apaga a outra.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Não. Não apaga.' },
  ],
  // O que Mariana realmente queria
  mariana_visit: [
    { speaker: 'Augusto', text: 'Depois de discutir seu depoimento, o que Mariana perguntou?' },
    { speaker: 'Lucas', text: 'Horário.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Que horário?' },
    {
      speaker: 'Lucas',
      text: 'Quando eu via Elisa aqui.\nQuando tinha visto André.\nSe tinha foto daquele período.\nSe alguém podia confirmar certas coisas.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Ela estava voltando à oportunidade, não só ao motivo.' },
    { speaker: 'Lucas', text: 'Se você quiser chamar assim.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Ela explicou o que tinha encontrado?' },
    { speaker: 'Lucas', text: 'Não.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Você ajudou?' },
    { speaker: 'Lucas', text: 'Até certo ponto.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'O que aconteceu?' },
    { speaker: 'Lucas', text: 'Eu perdi a paciência.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Por quê?' },
    {
      speaker: 'Lucas',
      text: 'Porque a Elisa morreu aos dezessete anos e, seis anos depois, apareceu uma mulher que eu nunca tinha visto transformando cada conversa que eu tive com ela numa peça de defesa do André.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'E o que você disse para Mariana?' },
    { speaker: 'Lucas', text: 'Que parasse.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Só isso?' },
    { speaker: 'Lucas', text: 'Eu disse que ela estava usando a Elisa pra salvar o irmão.', portrait: 'lucas' },
    { speaker: 'Lucas', text: 'Agora você aparece dizendo que ela sumiu.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Isso muda alguma coisa no que você lembra?' },
    { speaker: 'Lucas', text: 'Não.', portrait: 'lucas' },
    { speaker: 'Lucas', text: 'Só muda a última coisa que eu lembro de ter dito pra ela.', portrait: 'lucas' },
  ],
}
