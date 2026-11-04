export type MiroTopicId = 'now' | 'jana' | 'night' | 'deny'

export const MIRO_TOPIC_IDS: MiroTopicId[] = ['now', 'jana', 'night', 'deny']

export const miroTopicLabels: Record<MiroTopicId, string> = {
  now: 'A prisão de agora',
  jana: 'Jana',
  night: 'A Noite X',
  deny: 'O que ele nega',
}

export const miroTopicFlags: Record<MiroTopicId, string> = {
  now: 'block06_miro_now',
  jana: 'block06_miro_jana',
  night: 'block06_miro_night',
  deny: 'block06_miro_deny',
}

export type MiroBeat = { speaker?: string; text: string }

export const miroBeats: Record<MiroTopicId, MiroBeat[]> = {
  now: [
    { speaker: 'Augusto', text: 'Miro. Você está preso por crimes atuais. Não pela morte de Elisa Duarte.' },
    { speaker: 'Miro', text: 'Então por que estamos falando de seis anos atrás?' },
    { speaker: 'Augusto', text: 'Porque informação útil pode ser considerada pelas autoridades competentes. Eu não controlo o Ministério Público. Não prometo resultado que não mando.' },
    { speaker: 'Miro', text: 'Pragmático.\nOk.\nFala o que quer.' },
  ],
  jana: [
    { speaker: 'Augusto', text: 'Você conhecia Jana Ribeiro.' },
    { speaker: 'Miro', text: 'Conhecia.\nNão era amizade de festa.' },
    { speaker: 'Augusto', text: 'Na Noite X você a procurava.' },
    { speaker: 'Miro', text: 'Procurava.\nTinha gente do círculo querendo falar com ela.\nEu só fui buscar.' },
  ],
  night: [
    { speaker: 'Augusto', text: 'O que você viu?' },
    { speaker: 'Miro', text: 'Vi alguém com as coisas dela.\nJaqueta. Bolsa.\nAchei que era a Jana.\nSegui.' },
    { speaker: 'Augusto', text: 'E?' },
    { speaker: 'Miro', text: 'Percebi depois que era outra.\nElisa.\nPor causa dos pertences.\nErro de identificação.\nSó isso.' },
  ],
  deny: [
    { speaker: 'Augusto', text: 'Você a tocou? Empurrou?' },
    { speaker: 'Miro', text: 'Não.\nNão matei.\nNão toquei.\nSegui e parei quando vi o erro.' },
    { speaker: 'Augusto', text: 'Até onde?' },
    { speaker: 'Miro', text: 'Longe o bastante para perceber.\nNão vou inventar mapa pra você.\nIsso é o que eu digo agora.' },
  ],
}
