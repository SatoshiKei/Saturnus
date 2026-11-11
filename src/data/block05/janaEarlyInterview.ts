export type JanaEarlyTopicId = 'mariana' | 'questions' | 'close'

export const JANA_EARLY_TOPIC_IDS: JanaEarlyTopicId[] = ['mariana', 'questions', 'close']

export const janaEarlyTopicLabels: Record<JanaEarlyTopicId, string> = {
  mariana: 'Mariana',
  questions: 'Perguntas antigas',
  close: 'Encerrar',
}

export const janaEarlyTopicFlags: Record<JanaEarlyTopicId, string> = {
  mariana: 'jana_early_mariana',
  questions: 'jana_early_questions',
  close: 'jana_early_close',
}

export type JanaEarlyBeat = { speaker?: string; text: string }

export const janaEarlyBeats: Record<JanaEarlyTopicId, JanaEarlyBeat[]> = {
  mariana: [
    { speaker: 'Augusto', text: 'Jana Ribeiro?' },
    { speaker: 'Jana', text: 'Sim.' },
    { speaker: 'Augusto', text: 'Delegado Augusto Nogueira. Estou procurando Mariana Silva.' },
    { speaker: 'Jana', text: 'Ela apareceu aqui umas semanas atrás.' },
    { speaker: 'Augusto', text: 'Vocês se conheciam?' },
    { speaker: 'Jana', text: 'Não. Não éramos próximas.' },
  ],
  questions: [
    { speaker: 'Augusto', text: 'O que ela queria?' },
    {
      speaker: 'Jana',
      text: 'Fazia perguntas sobre uma história antiga.\n\nEu não quis entrar nisso.',
    },
    { speaker: 'Augusto', text: 'Qual história?' },
    { speaker: 'Jana', text: 'Não importa. Já passou.' },
  ],
  close: [
    { speaker: 'Jana', text: 'Se for só isso, eu preciso trabalhar.' },
    { speaker: 'Augusto', text: 'Por enquanto é só isso.' },
  ],
}
