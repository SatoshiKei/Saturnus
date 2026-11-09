export type NicoFollowupTopicId = 'jacket' | 'exit' | 'jana' | 'mariana_repeat'

export const NICO_FOLLOWUP_TOPIC_IDS: NicoFollowupTopicId[] = [
  'jacket',
  'exit',
  'jana',
  'mariana_repeat',
]

export const nicoFollowupLabels: Record<NicoFollowupTopicId, string> = {
  jacket: 'A jaqueta',
  exit: 'A saída',
  jana: 'Jana',
  mariana_repeat: 'O que Mariana repetia',
}

export const nicoFollowupFlags: Record<NicoFollowupTopicId, string> = {
  jacket: 'block05_nico2_jacket',
  exit: 'block05_nico2_exit',
  jana: 'block05_nico2_jana',
  mariana_repeat: 'block05_nico2_mariana',
}

export type NicoFollowupBeat = { speaker?: string; text: string; portrait?: 'nico' }

export const nicoFollowupBeats: Record<NicoFollowupTopicId, NicoFollowupBeat[]> = {
  jacket: [
    { speaker: 'Augusto', text: 'Quero voltar numa coisa que você falou da saída da Elisa.' },
    { speaker: 'Nico', text: 'Eu sabia que você ia voltar.', portrait: 'nico' },
    { speaker: 'Augusto', text: 'A roupa.' },
    { speaker: 'Nico', text: 'A jaqueta?', portrait: 'nico' },
    { speaker: 'Augusto', text: 'Você lembra dela especificamente.' },
    {
      speaker: 'Nico',
      text: 'Lembro porque era clara. A pista estava escura, aquela coisa saltava no meio de todo mundo.',
      portrait: 'nico',
    },
  ],
  exit: [
    { speaker: 'Augusto', text: 'Era dela?' },
    {
      speaker: 'Nico',
      text: 'Na época eu achei que sim. Depois fiquei com isso na cabeça.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Por quê?' },
    { speaker: 'Nico', text: 'Porque eu já tinha visto a Jana usando.', portrait: 'nico' },
    { speaker: 'Augusto', text: 'Tem certeza de que era a mesma?' },
    {
      speaker: 'Nico',
      text: 'Certeza, certeza? Não.\n\nFaz seis anos, delegado.\n\nMas se você me perguntar o que eu lembro quando penso naquela noite, eu lembro daquela jaqueta.',
      portrait: 'nico',
    },
  ],
  jana: [
    { speaker: 'Augusto', text: 'Jana o quê?' },
    {
      speaker: 'Nico',
      text: 'Aí você já quer demais de mim.\n\nSó lembro de Jana. Deve estar no processo.',
      portrait: 'nico',
    },
  ],
  mariana_repeat: [
    { speaker: 'Augusto', text: 'Mariana perguntou sobre isso?' },
    { speaker: 'Nico', text: 'Perguntou.', portrait: 'nico' },
    { speaker: 'Augusto', text: 'Uma vez?' },
    {
      speaker: 'Nico',
      text: 'Não.\n\nE isso que foi estranho.\n\nEla voltava no mesmo detalhe de outro jeito. “Era clara?”, “você já tinha visto antes?”, “quem estava com ela?”.\n\nParecia que estava testando a própria pergunta.',
      portrait: 'nico',
    },
  ],
}
