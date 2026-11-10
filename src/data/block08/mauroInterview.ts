export type MauroTopicId = 'jaguar' | 'permission' | 'damage' | 'bia'

export const MAURO_TOPIC_IDS: MauroTopicId[] = ['jaguar', 'permission', 'damage', 'bia']

export const mauroTopicLabels: Record<MauroTopicId, string> = {
  jaguar: 'O Jaguar',
  permission: 'Autorização',
  damage: 'O dano',
  bia: 'Bia agora',
}

export const mauroTopicFlags: Record<MauroTopicId, string> = {
  jaguar: 'block08_mauro_jaguar',
  permission: 'block08_mauro_permission',
  damage: 'block08_mauro_damage',
  bia: 'block08_mauro_bia',
}

export type MauroBeat = { speaker?: string; text: string }

export const mauroBeats: Record<MauroTopicId, MauroBeat[]> = {
  jaguar: [
    { speaker: 'Augusto', text: 'O senhor tinha um Jaguar XJ6 verde em 2020?' },
    { speaker: 'Mauro', text: 'Tinha não. Tenho.\n\nPor quê?' },
    { speaker: 'Augusto', text: 'Ano 96. Interior bege.' },
    { speaker: 'Mauro', text: 'É o meu.' },
    { speaker: 'Augusto', text: 'Quem costumava dirigir?' },
    { speaker: 'Mauro', text: 'Eu.' },
    { speaker: 'Augusto', text: 'Sua enteada?' },
    { speaker: 'Mauro', text: 'A Bia?' },
  ],
  permission: [
    { speaker: 'Augusto', text: 'Sim.' },
    { speaker: 'Mauro', text: 'Não naquele carro.\n\nEu não deixava.' },
    { speaker: 'Augusto', text: 'Nunca?' },
    {
      speaker: 'Mauro',
      text: 'Ela podia usar outro carro de casa. O Jaguar não.\n\nAquilo não era carro pra adolescente sair batendo por aí.',
    },
  ],
  damage: [
    { speaker: 'Augusto', text: 'Ele apareceu danificado naquela época?' },
    { speaker: 'Mauro', text: 'Apareceu.\n\nEu quase matei a Bia.' },
    { speaker: 'Augusto', text: 'O que ela disse?' },
    {
      speaker: 'Mauro',
      text: 'Que tinha mexido no carro sem me avisar e raspado enquanto manobrava.\n\nFicou desesperada, disse que ia resolver.',
    },
    { speaker: 'Augusto', text: 'O senhor acreditou?' },
    {
      speaker: 'Mauro',
      text: 'Eu queria acreditar.\n\nEla pagou o conserto e ficou meses sem encostar em chave nenhuma minha.',
    },
  ],
  bia: [
    { speaker: 'Augusto', text: 'Onde encontro a Bia?' },
    {
      speaker: 'Mauro',
      text: 'Ainda mora perto.\n\nTravessa Leste.\n\nMas eu não vou adivinhar o que você vai perguntar pra ela.',
    },
  ],
}
