export type NicoFollowupTopicId = 'jacket' | 'exit' | 'jana' | 'mariana_repeat'

export const NICO_FOLLOWUP_TOPIC_IDS: NicoFollowupTopicId[] = [
  'jacket',
  'exit',
  'jana',
  'mariana_repeat',
]

export const nicoFollowupLabels: Record<NicoFollowupTopicId, string> = {
  jacket: 'A saída de Elisa',
  exit: 'Detalhes da noite',
  jana: 'Quem era Jana',
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
    { speaker: 'Augusto', text: 'Quero voltar à saída de Elisa. Não ao processo — ao que você viu.' },
    {
      speaker: 'Nico',
      text: 'De novo?\nCara… eu já contei isso umas dez vezes.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Conte a undécima. Algo específico da roupa.' },
    {
      speaker: 'Nico',
      text: 'A jaqueta.\nNão parecia dela.\nEu já tinha visto aquela peça em outra pessoa.',
      portrait: 'nico',
    },
  ],
  exit: [
    { speaker: 'Augusto', text: 'Você tem certeza de que ela saiu com aquela jaqueta?' },
    {
      speaker: 'Nico',
      text: 'Certeza de cabine.\nOlho no mixer, olho na pista.\nA peça chamava atenção — era clara demais praquela noite.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'E o resto do visual?' },
    {
      speaker: 'Nico',
      text: 'O resto era Elisa.\nSó a jaqueta… não batia.',
      portrait: 'nico',
    },
  ],
  jana: [
    { speaker: 'Augusto', text: 'De quem você acha que era?' },
    {
      speaker: 'Nico',
      text: 'Jana.\nAmiga dela.\nEu já tinha visto Jana com aquela peça umas duas vezes.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Você tem certeza?' },
    {
      speaker: 'Nico',
      text: 'Não é laudo.\nÉ o que a memória me devolve quando você força o assunto.',
      portrait: 'nico',
    },
  ],
  mariana_repeat: [
    { speaker: 'Augusto', text: 'Mariana perguntou a mesma coisa?' },
    {
      speaker: 'Nico',
      text: 'Perguntou.\nMais de uma vez.\nParecia que a jaqueta importava mais do que o nome de quem empurrou.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Você lembra o sobrenome da Jana?' },
    {
      speaker: 'Nico',
      text: 'Não.\nSó Jana.\nDeve estar nos autos, se alguém ainda se importa com isso.',
      portrait: 'nico',
    },
  ],
}
