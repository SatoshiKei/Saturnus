export type MiroFollowupTopicId = 'gap' | 'descent' | 'bag' | 'deny'

export const MIRO_FOLLOWUP_TOPIC_IDS: MiroFollowupTopicId[] = ['gap', 'descent', 'bag', 'deny']

export const miroFollowupLabels: Record<MiroFollowupTopicId, string> = {
  gap: 'O intervalo que falta',
  descent: 'A região da queda',
  bag: 'A bolsa de Jana',
  deny: 'O que ele ainda nega',
}

export const miroFollowupFlags: Record<MiroFollowupTopicId, string> = {
  gap: 'block07_miro2_gap',
  descent: 'block07_miro2_descent',
  bag: 'block07_miro2_bag',
  deny: 'block07_miro2_deny',
}

export type MiroFollowupBeat = { speaker?: string; text: string }

export const miroFollowupBeats: Record<MiroFollowupTopicId, MiroFollowupBeat[]> = {
  gap: [
    { speaker: 'Augusto', text: 'Você disse que seguiu Elisa, viu o erro e parou. Os horários dos autos deixam um intervalo depois disso.' },
    { speaker: 'Miro', text: 'Eu não carrego cronômetro daquela noite.' },
    { speaker: 'Augusto', text: 'A sua versão ainda tem um buraco. Alguém foi visto voltando da região da queda.' },
    { speaker: 'Miro', text: '…' },
  ],
  descent: [
    { speaker: 'Augusto', text: 'Você desceu até lá.' },
    { speaker: 'Miro', text: 'Desci.\nDepois.\nQuando já estava quieto demais.' },
    { speaker: 'Augusto', text: 'Elisa?' },
    { speaker: 'Miro', text: 'Já tinha caído.\nEu não empurrei.\nEu não toquei nela antes.' },
  ],
  bag: [
    { speaker: 'Augusto', text: 'Por que descer?' },
    { speaker: 'Miro', text: 'A bolsa da Jana.\nEstava lá.\nPodia ligar ela ao que aconteceu.\nEu não ia deixar aquilo no chão.' },
    { speaker: 'Augusto', text: 'Você recuperou a bolsa.' },
    { speaker: 'Miro', text: 'Recuperei.\nIsso é o que eu digo.\nNão inventei empurrão pra te agradar.' },
  ],
  deny: [
    { speaker: 'Augusto', text: 'Você matou Elisa.' },
    { speaker: 'Miro', text: 'Não.\nSegui. Errei. Desci. Peguei a bolsa.\nNão matei.' },
    { speaker: 'Augusto', text: 'Um homem foi visto voltando. Pode ter sido você.' },
    { speaker: 'Miro', text: 'Pode.\nNão sou André.\nE não sou assassino na sua história.\nPronto.' },
  ],
}
