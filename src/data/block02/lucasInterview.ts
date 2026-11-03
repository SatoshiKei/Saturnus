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
  intro: [
    { speaker: 'Lucas', text: 'Ela fez alguma coisa?', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Por que está perguntando isso?' },
    { speaker: 'Lucas', text: 'Porque ela apareceu do nada atrás de mim uns meses atrás.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Vocês não se conheciam?' },
    { speaker: 'Lucas', text: 'Nunca tinha visto ela na vida.', portrait: 'lucas' },
  ],
  elisa: [
    { speaker: 'Augusto', text: 'Sobre o que ela queria falar?' },
    { speaker: 'Lucas', text: 'Elisa.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Elisa quem?' },
    { speaker: 'Lucas', text: 'Elisa Duarte.\nA menina que morreu.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'O que Mariana queria saber sobre ela?' },
    {
      speaker: 'Lucas',
      text: 'Primeiro ela falou que era meia-irmã do André.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'André?' },
    { speaker: 'Lucas', text: 'André Silva.\nO cara que matou ela.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Mariana disse que ele era inocente?' },
    { speaker: 'Lucas', text: 'Disse.\nNão acreditei.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Por quê?' },
    { speaker: 'Lucas', text: 'Porque eu conhecia a Elisa.\nE porque eu lembro dele.', portrait: 'lucas' },
  ],
  relationship: [
    { speaker: 'Augusto', text: 'Como você conhecia Elisa?' },
    {
      speaker: 'Lucas',
      text: 'Ela queria estudar lá.\nTava fazendo inscrição, vendo bolsa, essas coisas.\nUma amiga apresentou a gente.\nEu mostrei o campus pra ela algumas vezes.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Eram próximos?' },
    { speaker: 'Lucas', text: 'Tava começando a ficar amigo dela.\nNada além disso.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'André achava o mesmo?' },
    { speaker: 'Lucas', text: 'Não.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Ele tinha ciúmes de você?' },
    {
      speaker: 'Lucas',
      text: 'De mim.\nDa faculdade.\nDe qualquer coisa que fizesse ela perceber que existia vida fora daquela cidade.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Você viu ele ser violento com Elisa?' },
    { speaker: 'Lucas', text: 'Não.\nMas vi ele fazer cena.\nPerguntar quem eu era.\nFicar puto porque ela tava passando tempo lá.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Elisa queria terminar?' },
    { speaker: 'Lucas', text: 'Ela falou que tava pensando.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Por causa de você?' },
    { speaker: 'Lucas', text: 'Não.\nPor causa dele.', portrait: 'lucas' },
    {
      speaker: 'Lucas',
      text: 'André estava afundado em apostas.\nElisa estava cansada.\nA universidade tornava possível uma vida diferente.\nAndré tinha ciúmes.\nElisa cogitava terminar.',
      portrait: 'lucas',
    },
  ],
  andre: [
    { speaker: 'Augusto', text: 'Você acha que André matou Elisa?' },
    { speaker: 'Lucas', text: 'Acho.', portrait: 'lucas' },
  ],
  mariana_visit: [
    { speaker: 'Augusto', text: 'Ela perguntou tudo isso?' },
    { speaker: 'Lucas', text: 'Mais.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'O quê?' },
    {
      speaker: 'Lucas',
      text: 'Horário.\nOnde a gente se encontrava.\nSe eu tinha foto.\nSe alguém tinha visto o André comigo.\nCoisa de processo.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Ela explicou por quê?' },
    { speaker: 'Lucas', text: 'Queria provar que o irmão não matou a Elisa.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'E você?' },
    { speaker: 'Lucas', text: 'Falei pra ela parar.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Por quê?' },
    {
      speaker: 'Lucas',
      text: 'Porque seis anos depois apareceu uma pessoa que eu nunca conheci querendo que eu lembrasse exatamente de conversa, horário, expressão...\nEu não sei.\nEu só sei que a Elisa morreu e ele foi condenado.',
      portrait: 'lucas',
    },
  ],
}
