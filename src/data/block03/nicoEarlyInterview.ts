/** Nico antes de Elisa — contexto insuficiente; sem gravações / sem nomear Elisa. */
export type NicoEarlyTopicId = 'mariana' | 'old_night'

export const NICO_EARLY_TOPIC_IDS: NicoEarlyTopicId[] = ['mariana', 'old_night']

export const nicoEarlyTopicLabels: Record<NicoEarlyTopicId, string> = {
  mariana: 'Visita de Mariana',
  old_night: 'Uma noite antiga',
}

export const nicoEarlyTopicFlags: Record<NicoEarlyTopicId, string> = {
  mariana: 'nico_early_mariana',
  old_night: 'nico_early_old_night',
}

export type NicoEarlyBeat = { speaker?: string; text: string; portrait?: 'nico' }

export const nicoEarlyBeats: Record<NicoEarlyTopicId, NicoEarlyBeat[]> = {
  mariana: [
    { speaker: 'Augusto', text: 'Mariana Silva procurou você há pouco tempo.' },
    { speaker: 'Nico', text: 'Procurou.', portrait: 'nico' },
    { speaker: 'Augusto', text: 'Sobre o quê?' },
    {
      speaker: 'Nico',
      text: 'Horários. Sequência de uma noite antiga.\nEla queria encaixar pedaço com pedaço.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Qual noite?' },
    {
      speaker: 'Nico',
      text: 'Se o senhor não sabe, eu não vou ser o primeiro a reabrir isso pra polícia.',
      portrait: 'nico',
    },
  ],
  old_night: [
    { speaker: 'Augusto', text: 'Você se recusa a dizer o que ela investigava?' },
    {
      speaker: 'Nico',
      text: 'Eu me recuso a explicar uma história inteira pra quem ainda não sabe o nome dela.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Dela quem?' },
    {
      speaker: 'Nico',
      text: 'Quando o senhor souber, a gente conversa de verdade.\nPor agora: ela esteve aqui, fez perguntas, e eu não entreguei nada que não fosse necessário.',
      portrait: 'nico',
    },
  ],
}
