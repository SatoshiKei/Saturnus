export type SandraTopicId = 'memory' | 'miro' | 'photo' | 'stand'

export const SANDRA_TOPIC_IDS: SandraTopicId[] = ['memory', 'miro', 'photo', 'stand']

export const sandraTopicLabels: Record<SandraTopicId, string> = {
  memory: 'O homem que ela viu',
  miro: 'Miro',
  photo: 'O reconhecimento',
  stand: 'Seis anos depois',
}

export const sandraTopicFlags: Record<SandraTopicId, string> = {
  memory: 'block07_sandra_memory',
  miro: 'block07_sandra_miro',
  photo: 'block07_sandra_photo',
  stand: 'block07_sandra_stand',
}

export type SandraBeat = { speaker?: string; text: string }

export const sandraBeats: Record<SandraTopicId, SandraBeat[]> = {
  memory: [
    { speaker: 'Sandra', text: 'Eu sei quem o senhor é.' },
    { speaker: 'Augusto', text: 'Facilita.' },
    {
      speaker: 'Sandra',
      text: 'Não facilita nada.\n\nQuando a polícia aparece seis anos depois, nunca é coisa boa.',
    },
    {
      speaker: 'Augusto',
      text: 'Preciso falar do homem que a senhora viu voltando da região onde Elisa caiu.',
    },
    { speaker: 'Sandra', text: 'André.' },
    { speaker: 'Augusto', text: 'A senhora responde rápido.' },
    {
      speaker: 'Sandra',
      text: 'Porque já respondi isso tantas vezes que não preciso procurar a palavra.',
    },
  ],
  miro: [
    { speaker: 'Augusto', text: 'E se eu disser que outro homem admite ter estado lá?' },
    { speaker: 'Sandra', text: 'Quem?' },
    { speaker: 'Augusto', text: 'Miro.' },
    { speaker: 'Sandra', text: 'Não conheço.' },
    {
      speaker: 'Augusto',
      text: 'Ele seguiu Elisa naquela noite. Desceu até a região da queda depois.',
    },
    { speaker: 'Augusto', text: 'Isso muda alguma coisa?' },
    { speaker: 'Sandra', text: 'Muda que agora o senhor tem outro homem.' },
    { speaker: 'Augusto', text: 'E a sua identificação?' },
    { speaker: 'Sandra', text: 'Continua sendo a minha identificação.' },
  ],
  photo: [
    { speaker: 'Augusto', text: 'A senhora viu o rosto?' },
    { speaker: 'Sandra', text: 'Não como estou vendo o seu.' },
    { speaker: 'Augusto', text: 'Estava escuro.' },
    { speaker: 'Sandra', text: 'Estava.' },
    { speaker: 'Augusto', text: 'Distância?' },
    { speaker: 'Sandra', text: 'Tinha.' },
    { speaker: 'Augusto', text: 'Então pode ter sido Miro.' },
    { speaker: 'Sandra', text: 'Pode.' },
  ],
  stand: [
    { speaker: 'Augusto', text: 'Mas?' },
    {
      speaker: 'Sandra',
      text: 'Mas eu saí daquele lugar achando que tinha visto André.\n\nRepeti isso na delegacia.\n\nDepois no processo.\n\nDepois no júri.\n\nSe o senhor quer que eu diga hoje “ah, então devia ser esse outro homem”, eu não vou dizer.',
    },
    { speaker: 'Augusto', text: 'Não quero que troque uma certeza por outra.' },
    {
      speaker: 'Sandra',
      text: 'Então pronto.\n\nEu posso estar errada.\n\nSó não vou fingir que lembro diferente porque apareceu um nome novo.',
    },
  ],
}
