export type SandraTopicId = 'memory' | 'miro' | 'photo' | 'stand'

export const SANDRA_TOPIC_IDS: SandraTopicId[] = ['memory', 'miro', 'photo', 'stand']

export const sandraTopicLabels: Record<SandraTopicId, string> = {
  memory: 'O que ela viu',
  miro: 'A possibilidade de outro homem',
  photo: 'Reconhecimento',
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
    { speaker: 'Augusto', text: 'Sandra Almeida? Polícia Civil. Preciso voltar ao que a senhora viu na Noite X, perto da região da queda.' },
    { speaker: 'Sandra', text: 'Eu já falei isso no inquérito, no processo, no júri.\nEu vi o André.' },
    { speaker: 'Augusto', text: 'Ainda está certa?' },
    { speaker: 'Sandra', text: 'Estou.\nNão é uma lembrança solta.\nEu repeti isso por anos.' },
  ],
  miro: [
    { speaker: 'Augusto', text: 'Há outro homem que admite ter seguido Elisa e descido até aquela região. Miro. Ligado a Jana.' },
    { speaker: 'Sandra', text: 'Isso… cria uma possibilidade.\nEu entendo o que o senhor está dizendo.' },
    { speaker: 'Augusto', text: 'Então pode não ter sido André.' },
    { speaker: 'Sandra', text: 'Pode.\nNa lógica.\nNa minha memória, a pessoa parecia o André.' },
  ],
  photo: [
    { speaker: 'Augusto', text: 'Se eu mostrar uma foto de Miro…' },
    { speaker: 'Sandra', text: 'Não.\nNão vou apontar alguém agora para agradar a investigação.\nÀquela hora era escuro.\nEu vi o que vi.' },
    { speaker: 'Augusto', text: 'Não pede certeza absoluta. Pede honestidade.' },
    { speaker: 'Sandra', text: 'Honestidade: a silhueta e o jeito me pareceram o André.\nNão vou trocar isso por um nome novo.' },
  ],
  stand: [
    { speaker: 'Augusto', text: 'Mesmo sabendo que Miro estava lá.' },
    { speaker: 'Sandra', text: 'Mesmo assim.\nEu não digo que Miro é inocente.\nDigo que o homem que eu vi parecia André.\nPonto.' },
  ],
}
