export type AndreFollowupTopicId = 'morsa' | 'why' | 'mariana' | 'silence'

export const ANDRE_FOLLOWUP_TOPIC_IDS: AndreFollowupTopicId[] = ['morsa', 'why', 'mariana', 'silence']

export const andreFollowupLabels: Record<AndreFollowupTopicId, string> = {
  morsa: 'A reconstrução',
  why: 'Por que mentiu',
  mariana: 'Mariana e aquele período',
  silence: 'O que isso muda',
}

export const andreFollowupFlags: Record<AndreFollowupTopicId, string> = {
  morsa: 'block08_andre2_morsa',
  why: 'block08_andre2_why',
  mariana: 'block08_andre2_mariana',
  silence: 'block08_andre2_silence',
}

export type AndreFollowupBeat = { speaker?: string; text: string; portrait?: string }

export const andreFollowupBeats: Record<AndreFollowupTopicId, AndreFollowupBeat[]> = {
  morsa: [
    { speaker: 'Augusto', text: 'A timeline corrigida fecha. Você sai da área de serviço sem a máscara. Mesmo rádio. Mesma mochila.', portrait: 'augusto' },
    { speaker: 'André', text: '…', portrait: 'andre' },
    { speaker: 'Augusto', text: 'Morsa era você.', portrait: 'augusto' },
    { speaker: 'André', text: 'Era.\nEu era.', portrait: 'andre' },
  ],
  why: [
    { speaker: 'Augusto', text: 'Por que esconder no processo da Elisa?', portrait: 'augusto' },
    { speaker: 'André', text: 'Admitir Morsa era admitir o núcleo.\nCrimes nos protestos.\nNomes de outras pessoas.', portrait: 'andre' },
    { speaker: 'André', text: 'Escolhi calar.\nE isso destruiu a minha própria defesa.', portrait: 'andre' },
  ],
  mariana: [
    { speaker: 'Augusto', text: 'Mariana insistia nesse período.', portrait: 'augusto' },
    { speaker: 'André', text: 'Recentemente, sim.\nEu não sabia como ela tinha chegado tão perto.', portrait: 'andre' },
    { speaker: 'André', text: 'Tentei fazê-la parar.\nNão por Maralto.\nPor mim.', portrait: 'andre' },
  ],
  silence: [
    { speaker: 'Augusto', text: 'Você estava nos protestos no intervalo que o processo usou contra você.', portrait: 'augusto' },
    { speaker: 'André', text: 'Estava.\nE mesmo assim fui condenado.', portrait: 'andre' },
    { speaker: 'Augusto', text: 'Isso ainda não explica a morte dela. Mas muda tudo.', portrait: 'augusto' },
  ],
}
