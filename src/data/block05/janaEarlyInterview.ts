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
    {
      speaker: 'Jana',
      text: 'Sim.\nSe for vender plano de internet, não precisa fingir que conhece meu nome.',
    },
    {
      speaker: 'Augusto',
      text: 'Delegado Augusto Nogueira. Estou procurando Mariana Silva.',
    },
    {
      speaker: 'Jana',
      text: 'Ela apareceu aqui umas semanas atrás.\nDo nada. Com cara de quem dormiu mal três noites seguidas.',
    },
    { speaker: 'Augusto', text: 'Vocês se conheciam?' },
    {
      speaker: 'Jana',
      text: 'Não.\nNão éramos próximas.\nA gente mora no mesmo bairro e às vezes no mesmo tipo de festa. Não é amizade.',
    },
  ],
  questions: [
    { speaker: 'Augusto', text: 'O que ela queria?' },
    {
      speaker: 'Jana',
      text: 'Fazia perguntas sobre uma história antiga.\nTipo, muito antiga.\nEu cortei na hora.\nMinha cabeça não aluga espaço pra isso de graça.',
    },
    { speaker: 'Augusto', text: 'Qual história?' },
    {
      speaker: 'Jana',
      text: 'Não importa. Já passou.\nSe ela sumiu, eu sinto pena.\nMas eu não vou abrir porta que eu fechei com cal.',
    },
  ],
  close: [
    {
      speaker: 'Jana',
      text: 'Se for só isso, eu preciso trabalhar.\nSegunda paga boleto. Festa não.',
    },
    { speaker: 'Augusto', text: 'Por enquanto é só isso.' },
  ],
}