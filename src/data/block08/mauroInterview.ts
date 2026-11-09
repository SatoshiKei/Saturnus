export type MauroTopicId = 'car' | 'bia' | 'repair' | 'elisa'

export const MAURO_TOPIC_IDS: MauroTopicId[] = ['car', 'bia', 'repair', 'elisa']

export const mauroTopicLabels: Record<MauroTopicId, string> = {
  car: 'O carro',
  bia: 'Bia',
  repair: 'O conserto',
  elisa: 'O que o carro fez',
}

export const mauroTopicFlags: Record<MauroTopicId, string> = {
  car: 'block08_mauro_car',
  bia: 'block08_mauro_bia',
  repair: 'block08_mauro_repair',
  elisa: 'block08_mauro_elisa',
}

export type MauroBeat = { speaker?: string; text: string }

export const mauroBeats: Record<MauroTopicId, MauroBeat[]> = {
  car: [
    { speaker: 'Augusto', text: 'O carro era seu seis anos atrás?' },
    { speaker: 'Mauro', text: 'Era.\n\nPor quê?' },
    { speaker: 'Augusto', text: 'Houve reparo na lateral dianteira naquela semana.' },
    { speaker: 'Mauro', text: 'Ah.\n\nIsso.' },
    { speaker: 'Augusto', text: 'Lembra.' },
    { speaker: 'Mauro', text: 'Lembro da dor de cabeça.\n\nNão lembro do dano olhando para ele.' },
  ],
  bia: [
    { speaker: 'Augusto', text: 'Quem estava com o carro?' },
    { speaker: 'Mauro', text: 'Minha enteada. Bia.' },
    { speaker: 'Augusto', text: 'Ela disse o quê?' },
    {
      speaker: 'Mauro',
      text: 'Que tinha raspado em alguma coisa.\n\nEra nova, ficou apavorada achando que eu ia matar ela por causa do carro.',
    },
    { speaker: 'Augusto', text: 'E o senhor acreditou.' },
    { speaker: 'Mauro', text: 'Era um carro amassado.\n\nNão abri investigação familiar.' },
  ],
  repair: [
    { speaker: 'Augusto', text: 'Onde consertou?' },
    {
      speaker: 'Mauro',
      text: 'Ela resolveu.\n\nEu paguei uma parte depois.\n\nTalvez eu ainda tenha a transferência.',
    },
    { speaker: 'Augusto', text: 'Preciso dela.' },
  ],
  elisa: [
    { speaker: 'Mauro', text: 'Delegado...\n\no que esse carro fez?' },
    { speaker: 'Augusto', text: 'É isso que eu estou tentando descobrir.' },
  ],
}
