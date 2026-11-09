export type BiaTopicId = 'car' | 'rui' | 'hide' | 'know'

export const BIA_TOPIC_IDS: BiaTopicId[] = ['car', 'rui', 'hide', 'know']

export const biaTopicLabels: Record<BiaTopicId, string> = {
  car: 'O comprovante',
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
    { speaker: 'Bia', text: 'Meu padrasto te mandou?' },
    { speaker: 'Augusto', text: 'Não.\n\nEle me deu um comprovante.' },
    { speaker: 'Augusto', text: 'E a oficina guardou as fotos.' },
    { speaker: 'Bia', text: 'Meu Deus.' },
  ],
  rui: [
    { speaker: 'Augusto', text: 'Você não dirigia.' },
    { speaker: 'Augusto', text: 'Quem dirigia, Bia?' },
    { speaker: 'Bia', text: 'Rui.' },
    { speaker: 'Augusto', text: 'Ele tinha bebido?' },
    { speaker: 'Bia', text: 'Tinha.' },
    { speaker: 'Augusto', text: 'Quanto?' },
    { speaker: 'Bia', text: 'O suficiente.' },
    { speaker: 'Augusto', text: 'Bateu numa proteção de via.' },
    {
      speaker: 'Bia',
      text: 'Foi rápido.\n\nA gente bateu, parou, olhou o carro.\n\nParecia só...\n\numa merda que ia custar dinheiro.',
    },
    { speaker: 'Augusto', text: 'E vocês foram embora.' },
    { speaker: 'Bia', text: 'Fomos.' },
  ],
  hide: [
    { speaker: 'Augusto', text: 'Por que disse ao Mauro que tinha sido você?' },
    {
      speaker: 'Bia',
      text: 'Porque o carro era dele.\n\nPorque Rui estava bêbado.\n\nPorque eu tinha certeza de que, se meu padrasto descobrisse, acabava tudo.\n\nNaquela hora aquilo era o pior problema do mundo.',
    },
  ],
  know: [
    { speaker: 'Augusto', text: 'Depois Elisa morreu.' },
    {
      speaker: 'Bia',
      text: 'Eu vi na notícia.\n\nMas não...\n\neu nunca liguei uma coisa à outra.',
    },
    { speaker: 'Augusto', text: 'Nem quando disseram onde ela caiu?' },
    {
      speaker: 'Bia',
      text: 'Não sabia exatamente onde tinha sido.\n\nE eu não queria saber.\n\nTalvez essa seja a parte pior.',
    },
  ],
}
