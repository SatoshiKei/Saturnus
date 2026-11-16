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
    {
      speaker: 'Nico',
      text: 'Você de novo.\nIsso nunca é bom sinal.\nMas fala. O que ficou roendo?',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'A roupa.' },
    {
      speaker: 'Nico',
      text: 'A jaqueta?\nClara. Quase ofensivamente clara.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Você lembra dela especificamente.' },
    {
      speaker: 'Nico',
      text: 'Lembro porque a pista estava escura e aquela coisa parecia um farol de gente.\nNo Vértice quase todo mundo usa preto. Ela entrou como se tivesse errado o dress code de propósito.',
      portrait: 'nico',
    },
  ],
  exit: [
    { speaker: 'Augusto', text: 'Era dela?' },
    {
      speaker: 'Nico',
      text: 'Na época eu achei que sim.\nNa memória ficou como se fosse.\nDepois a cabeça começou a puxar outra imagem por cima.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Por quê?' },
    {
      speaker: 'Nico',
      text: 'Porque eu já tinha visto a Jana usando uma parecida.\nNão igual, parecida. Boate confunde tudo: luz, bebida, pressa.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Tem certeza de que era a mesma?' },
    {
      speaker: 'Nico',
      text: 'Certeza de cartório? Não.\nFaz seis anos, delegado.\n\nMas se você me obrigar a pintar aquela saída, eu ainda vejo aquela jaqueta clara. Só não juro em quem estava dentro.',
      portrait: 'nico',
    },
  ],
  jana: [
    { speaker: 'Augusto', text: 'Jana o quê?' },
    {
      speaker: 'Nico',
      text: 'Aí você já quer demais da minha memória.\nSó lembro que Jana entrou nessa.\nO resto deve estar no processo.\nNa minha cabeça vira mancha quando tenta ficar preciso.',
      portrait: 'nico',
    },
  ],
  mariana_repeat: [
    { speaker: 'Augusto', text: 'Mariana perguntou sobre isso?' },
    {
      speaker: 'Nico',
      text: 'Perguntou.\nE voltou.\nVárias vezes.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Uma vez?' },
    {
      speaker: 'Nico',
      text: 'Não.\nE isso foi estranho.\n\nEla mexia no mesmo detalhe de outro jeito. “Era clara?”, “você já tinha visto antes?”, “quem estava com ela?”.\n\nParecia que estava testando a própria pergunta até ela encaixar na cabeça.',
      portrait: 'nico',
    },
  ],
}