export type JanaFollowupTopicId = 'resist' | 'belongings' | 'fear' | 'valter'

export const JANA_FOLLOWUP_TOPIC_IDS: JanaFollowupTopicId[] = ['resist', 'belongings', 'fear', 'valter']

export const janaFollowupLabels: Record<JanaFollowupTopicId, string> = {
  resist: 'A jaqueta de novo',
  belongings: 'A bolsa',
  fear: 'O medo',
  valter: 'Válter',
}

export const janaFollowupFlags: Record<JanaFollowupTopicId, string> = {
  resist: 'block06_jana2_resist',
  belongings: 'block06_jana2_belongings',
  fear: 'block06_jana2_fear',
  valter: 'block06_jana2_valter',
}

export type JanaFollowupBeat = { speaker?: string; text: string }

export const janaFollowupBeats: Record<JanaFollowupTopicId, JanaFollowupBeat[]> = {
  resist: [
    { speaker: 'Jana', text: 'Você de novo.' },
    { speaker: 'Augusto', text: 'Eu avisei que talvez voltasse.' },
    { speaker: 'Jana', text: 'Não, você não avisou.' },
    { speaker: 'Augusto', text: 'Então devia ter avisado.' },
    { speaker: 'Jana', text: 'O que foi agora?' },
    { speaker: 'Augusto', text: 'A jaqueta não foi só para o frio.' },
    {
      speaker: 'Augusto',
      text: 'Geraldo mentiu sobre o quanto Elisa tinha bebido.\n\nMariana insistiu na jaqueta.\n\nNico lembra dela porque já tinha visto você usando.\n\nE você ficou desconfortável antes mesmo de eu terminar a pergunta.',
    },
    { speaker: 'Jana', text: 'Isso não prova nada.' },
    { speaker: 'Augusto', text: 'Eu sei.\n\nPor isso estou perguntando.' },
  ],
  belongings: [
    { speaker: 'Augusto', text: 'Só a jaqueta?' },
    { speaker: 'Jana', text: 'O quê?' },
    { speaker: 'Augusto', text: 'Foi só isso que você entregou para Elisa?' },
    { speaker: 'Jana', text: 'Não.' },
    { speaker: 'Augusto', text: 'O que mais?' },
    { speaker: 'Jana', text: 'Minha bolsa.' },
  ],
  fear: [
    { speaker: 'Augusto', text: 'Por quê?' },
    { speaker: 'Jana', text: 'Porque eu estava com medo.' },
    { speaker: 'Augusto', text: 'De quem?' },
    { speaker: 'Jana', text: 'De gente que eu não queria encontrar naquela noite.' },
    {
      speaker: 'Augusto',
      text: 'E achou que, se Elisa estivesse com suas coisas, olhariam para ela.',
    },
    { speaker: 'Jana', text: 'Não fala assim.' },
    { speaker: 'Augusto', text: 'Como eu deveria falar?' },
    { speaker: 'Jana', text: 'Eu não mandei ninguém seguir a Elisa.' },
    { speaker: 'Augusto', text: 'Mas queria tirar a atenção de você.' },
    {
      speaker: 'Jana',
      text: 'Eu queria ir embora sem alguém me reconhecer de longe.\n\nEla ia sair.\n\nEu não pensei...\n\nEu só dei as coisas.',
    },
  ],
  valter: [
    { speaker: 'Augusto', text: 'Quem estava atrás de você?' },
    { speaker: 'Jana', text: 'Gente do Válter.' },
    { speaker: 'Augusto', text: 'Sobrenome.' },
    {
      speaker: 'Jana',
      text: 'Não sei se era sobrenome, apelido, o que fosse.\n\nEra Válter.\n\nQuem precisava saber sabia.',
    },
    { speaker: 'Augusto', text: 'E ninguém contou isso no processo?' },
    { speaker: 'Jana', text: 'Eu não contei.' },
    { speaker: 'Augusto', text: 'Por quê?' },
    {
      speaker: 'Jana',
      text: 'Porque a Elisa estava morta.\n\nAndré já estava preso.\n\nE eu tinha acabado de perceber que talvez eu tivesse colocado minhas coisas nela para salvar a minha própria pele.\n\nVocê acha que eu queria explicar isso para um delegado?',
    },
  ],
}
