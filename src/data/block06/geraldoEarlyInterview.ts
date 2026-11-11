export type GeraldoEarlyTopicId = 'mariana' | 'night' | 'close'

export const GERALDO_EARLY_TOPIC_IDS: GeraldoEarlyTopicId[] = ['mariana', 'night', 'close']

export const geraldoEarlyTopicLabels: Record<GeraldoEarlyTopicId, string> = {
  mariana: 'Mariana',
  night: 'Noite antiga',
  close: 'Encerrar',
}

export const geraldoEarlyTopicFlags: Record<GeraldoEarlyTopicId, string> = {
  mariana: 'geraldo_early_mariana',
  night: 'geraldo_early_night',
  close: 'geraldo_early_close',
}

export type GeraldoEarlyBeat = { speaker?: string; text: string }

export const geraldoEarlyBeats: Record<GeraldoEarlyTopicId, GeraldoEarlyBeat[]> = {
  mariana: [
    { speaker: 'Augusto', text: 'Geraldo?' },
    { speaker: 'Geraldo', text: 'Quem pergunta?' },
    { speaker: 'Augusto', text: 'Augusto Nogueira. Polícia Civil. Mariana Silva esteve aqui?' },
    { speaker: 'Geraldo', text: 'Esteve. Semanas atrás.' },
  ],
  night: [
    { speaker: 'Augusto', text: 'O que ela queria?' },
    {
      speaker: 'Geraldo',
      text: 'Falar de uma noite antiga.\n\nEu não quis entrar no assunto.',
    },
    { speaker: 'Augusto', text: 'Por quê?' },
    { speaker: 'Geraldo', text: 'Porque já passou. E eu não tenho nada a ver com o desaparecimento dela.' },
  ],
  close: [
    { speaker: 'Geraldo', text: 'Se não for pedir nada, eu volto pro balcão.' },
    { speaker: 'Augusto', text: 'Por enquanto é só isso.' },
  ],
}
