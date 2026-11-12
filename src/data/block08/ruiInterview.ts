export type RuiTopicId = 'crash' | 'drink' | 'stop' | 'after'

export const RUI_TOPIC_IDS: RuiTopicId[] = ['crash', 'drink', 'stop', 'after']

export const ruiTopicLabels: Record<RuiTopicId, string> = {
  crash: 'A batida',
  drink: 'Álcool',
  stop: 'A viatura',
  after: 'Depois',
}

export const ruiTopicFlags: Record<RuiTopicId, string> = {
  crash: 'block08_rui_crash',
  drink: 'block08_rui_drink',
  stop: 'block08_rui_stop',
  after: 'block08_rui_after',
}

export type RuiBeat = { speaker?: string; text: string }

export const ruiBeats: Record<RuiTopicId, RuiBeat[]> = {
  crash: [
    { speaker: 'Rui', text: 'Bia falou.' },
    { speaker: 'Augusto', text: 'Falou.' },
    { speaker: 'Rui', text: 'Então não vou inventar outra versão.' },
    { speaker: 'Augusto', text: 'Você dirigia.' },
    { speaker: 'Rui', text: 'Sim.' },
    { speaker: 'Augusto', text: 'Tinha bebido.' },
    { speaker: 'Rui', text: 'Sim.' },
    { speaker: 'Augusto', text: 'Bateu na proteção.' },
    {
      speaker: 'Rui',
      text: 'Perdi o carro por um segundo.\n\nPegou de lado.\n\nEu achei que tinha sido só o carro.',
    },
    { speaker: 'Augusto', text: 'E foi embora.' },
    { speaker: 'Rui', text: 'Fui.' },
  ],
  drink: [
    { speaker: 'Augusto', text: 'Alguma coisa aconteceu antes da batida?' },
    { speaker: 'Rui', text: 'Por que perguntou isso?' },
    {
      speaker: 'Augusto',
      text: 'Porque normalmente a parte que alguém acha irrelevante seis anos atrás é a parte que eu preciso agora.',
    },
    { speaker: 'Rui', text: 'Uma viatura me parou.' },
    { speaker: 'Augusto', text: 'Onde?' },
    { speaker: 'Rui', text: 'Na via auxiliar.' },
    { speaker: 'Augusto', text: 'Antes da batida?' },
    { speaker: 'Rui', text: 'Pouco antes.' },
  ],
  stop: [
    { speaker: 'Augusto', text: 'O policial percebeu que você tinha bebido?' },
    { speaker: 'Rui', text: 'Percebeu.' },
    { speaker: 'Augusto', text: 'Fez bafômetro?' },
    { speaker: 'Rui', text: 'Não.' },
    { speaker: 'Augusto', text: 'Apreendeu a chave?' },
    { speaker: 'Rui', text: 'Não.' },
    { speaker: 'Augusto', text: 'Por que te deixaram seguir?' },
    {
      speaker: 'Rui',
      text: 'Eu estava atrasado.\n\nFiquei parado uns minutos numa passagem de nível…\n\num trem de carga enorme atravessando.\n\nQuando a cancela abriu, acelerei demais pra recuperar o tempo.',
    },
    {
      speaker: 'Rui',
      text: 'Pouco depois me pararam.\n\nEu estava claramente bêbado.\n\nComecei a discutir… a negociar…\n\ndizia que tinha bebido pouco, que estava perto, que ia devagar.',
    },
    {
      speaker: 'Rui',
      text: 'Aí o rádio deles começou a falar alto.\n\nAlgo de um carro pegando fogo no acostamento…\n\ne que talvez tivesse alguém lá dentro.',
    },
    {
      speaker: 'Rui',
      text: 'Mudou na hora.\n\nMandaram eu seguir.\n\nA viatura saiu no sentido contrário ao meu — eu olhei no retrovisor porque achei que iam voltar atrás.',
    },
    { speaker: 'Augusto', text: 'E você continuou.' },
    {
      speaker: 'Rui',
      text: 'Continuei.\n\nPoucos minutos depois… a proteção.',
    },
  ],
  after: [
    { speaker: 'Augusto', text: 'Lembra quem era?' },
    {
      speaker: 'Rui',
      text: 'Não.\n\nNão lembro nome.\n\nNem número da viatura.\n\nEra polícia. Para mim bastava isso.',
    },
    { speaker: 'Augusto', text: 'Depois você bateu.' },
    { speaker: 'Rui', text: 'Depois eu bati.' },
    { speaker: 'Rui', text: 'Delegado...\n\neu não sabia que aquilo ia matar alguém.' },
    { speaker: 'Augusto', text: 'Eu sei.' },
  ],
}
