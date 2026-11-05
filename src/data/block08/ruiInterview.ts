export type RuiTopicId = 'crash' | 'drink' | 'stop' | 'after'

export const RUI_TOPIC_IDS: RuiTopicId[] = ['crash', 'drink', 'stop', 'after']

export const ruiTopicLabels: Record<RuiTopicId, string> = {
  crash: 'O impacto',
  drink: 'Álcool',
  stop: 'Antes do guardrail',
  after: 'O que veio depois',
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
    { speaker: 'Augusto', text: 'Rui. A Bia já falou. Você dirigia o carro do Mauro.' },
    { speaker: 'Rui', text: 'Dirigia.\nBati na proteção.\nPerdi o controle.' },
  ],
  drink: [
    { speaker: 'Augusto', text: 'Tinha bebido.' },
    { speaker: 'Rui', text: 'Tinha.\nFui irresponsável.\nMenti.\nNão sabia que aquilo ia… matar alguém.' },
  ],
  stop: [
    { speaker: 'Augusto', text: 'Tem mais alguma coisa daquela noite que você achou irrelevante?' },
    { speaker: 'Rui', text: 'Antes de bater…\numa viatura me parou.\nO policial viu que eu tinha bebido.\nMesmo assim me deixou seguir.' },
    { speaker: 'Augusto', text: 'Nome?' },
    { speaker: 'Rui', text: 'Não lembro.\nSó a abordagem. Na via auxiliar.' },
  ],
  after: [
    { speaker: 'Augusto', text: 'Vocês consertaram e calaram.' },
    { speaker: 'Rui', text: 'Sim.\nSe eu soubesse…\nMas na hora era só medo da habilitação e do padrasto da Bia.' },
  ],
}
