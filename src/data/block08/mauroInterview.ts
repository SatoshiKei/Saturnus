export type MauroTopicId = 'car' | 'bia' | 'repair' | 'elisa'

export const MAURO_TOPIC_IDS: MauroTopicId[] = ['car', 'bia', 'repair', 'elisa']

export const mauroTopicLabels: Record<MauroTopicId, string> = {
  car: 'O carro naquela época',
  bia: 'O que Bia disse',
  repair: 'O conserto',
  elisa: 'Sobre Elisa',
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
    { speaker: 'Augusto', text: 'Mauro? Polícia Civil. Sobre um veículo registrado em seu nome, seis anos atrás — dano na lateral dianteira.' },
    { speaker: 'Mauro', text: 'Lembro de um problema com o carro naquela época.\nNada de polícia. Foi… doméstico.' },
  ],
  bia: [
    { speaker: 'Augusto', text: 'Quem dirigia?' },
    { speaker: 'Mauro', text: 'A Bia — minha enteada — disse que tinha raspado.\nEla providenciou o conserto.' },
  ],
  repair: [
    { speaker: 'Augusto', text: 'Onde?' },
    { speaker: 'Mauro', text: 'Não lembro o nome de cabeça.\nMas tenho um comprovante antigo de transferência.\nPosso te passar.' },
  ],
  elisa: [
    { speaker: 'Augusto', text: 'O senhor sabe quem é Elisa Duarte?' },
    { speaker: 'Mauro', text: 'Não.\nNão sei do que o senhor está falando.' },
  ],
}
