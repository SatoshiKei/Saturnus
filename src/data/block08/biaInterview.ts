export type BiaTopicId = 'car' | 'rui' | 'hide' | 'know'

export const BIA_TOPIC_IDS: BiaTopicId[] = ['car', 'rui', 'hide', 'know']

export const biaTopicLabels: Record<BiaTopicId, string> = {
  car: 'O dano',
  rui: 'Quem dirigia',
  hide: 'Por que esconder',
  know: 'Elisa',
}

export const biaTopicFlags: Record<BiaTopicId, string> = {
  car: 'block08_bia_car',
  rui: 'block08_bia_rui',
  hide: 'block08_bia_hide',
  know: 'block08_bia_know',
}

export type BiaBeat = { speaker?: string; text: string }

export const biaBeats: Record<BiaTopicId, BiaBeat[]> = {
  car: [
    { speaker: 'Augusto', text: 'Bia? Tenho o carro do Mauro, a data, a oficina e as fotos do dano no guardrail.' },
    { speaker: 'Bia', text: '…' },
    { speaker: 'Augusto', text: 'Não estava sozinha.' },
    { speaker: 'Bia', text: 'Não.' },
  ],
  rui: [
    { speaker: 'Augusto', text: 'Quem dirigia?' },
    { speaker: 'Bia', text: 'O Rui.\nEle tinha bebido.\nPerdeu o controle e bateu na proteção.' },
  ],
  hide: [
    { speaker: 'Augusto', text: 'Por que mentir para o Mauro?' },
    { speaker: 'Bia', text: 'O carro era dele.\nO Rui alcoolizado.\nA gente tinha medo.\nConsertamos e seguimos.' },
  ],
  know: [
    { speaker: 'Augusto', text: 'Vocês sabiam da Elisa?' },
    { speaker: 'Bia', text: 'Não.\nSó soubemos depois, pelas notícias.\nNão ligamos o acidente àquilo.\nJuro.' },
  ],
}
