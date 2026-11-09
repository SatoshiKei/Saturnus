export type AndreFollowupTopicId = 'morsa' | 'why' | 'mariana' | 'silence'

export const ANDRE_FOLLOWUP_TOPIC_IDS: AndreFollowupTopicId[] = ['morsa', 'why', 'mariana', 'silence']

export const andreFollowupLabels: Record<AndreFollowupTopicId, string> = {
  morsa: 'As câmeras',
  why: 'Por que esconder',
  mariana: 'Mariana',
  silence: 'O álibi',
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
    { speaker: 'André', text: 'De novo.' },
    {
      speaker: 'Augusto',
      text: 'Dessa vez eu trouxe uma coisa que você não pode me devolver em forma de pergunta.',
    },
    { speaker: 'André', text: 'Todo policial acha isso até abrir a boca.' },
    {
      speaker: 'Augusto',
      text: 'Três câmeras.\n\nMesma rota.\n\nMesma mochila.\n\nMesmo rádio.\n\nVocê entra mascarado e sai sem a máscara.',
    },
    { speaker: 'Augusto', text: 'Morsa era você.' },
    { speaker: 'André', text: 'Era.' },
  ],
  why: [
    { speaker: 'Augusto', text: 'Por que esconder isso quando estava sendo acusado de homicídio?' },
    { speaker: 'André', text: 'Porque Morsa não era só um apelido meu.' },
    { speaker: 'Augusto', text: 'Explica.' },
    {
      speaker: 'André',
      text: 'Tinha gente naquele núcleo que nunca foi identificada.\n\nGente que depois teve filho, emprego, vida.\n\nTinha coisa que a gente fez naquela época que não acabava com uma multa.',
    },
    { speaker: 'Augusto', text: 'Então preferiu esconder um álibi.' },
    { speaker: 'André', text: 'Naquele momento eu não sabia que precisava dele.' },
    { speaker: 'Augusto', text: 'Você estava sendo investigado pela morte da Elisa.' },
    {
      speaker: 'André',
      text: 'E eu sabia que não tinha matado ela.\n\nParece uma diferença pequena agora, mas não era na minha cabeça.\n\nEu achei que iam descobrir a verdade da morte dela sem eu precisar abrir todo o resto.',
    },
    { speaker: 'Augusto', text: 'Não descobriram.' },
    { speaker: 'André', text: 'Eu percebi.' },
    { speaker: 'Augusto', text: 'Tarde.' },
    { speaker: 'André', text: 'Se veio aqui para me contar isso, economiza.' },
  ],
  mariana: [
    { speaker: 'Augusto', text: 'Mariana descobriu.' },
    {
      speaker: 'Augusto',
      text: 'Ela chegou nos protestos. Morsa. Tempo de atividade. Câmeras.',
    },
    { speaker: 'André', text: 'Eu sei que chegou perto.' },
    { speaker: 'Augusto', text: 'Quanto você contou para ela?' },
    { speaker: 'André', text: 'Nada.' },
    { speaker: 'Augusto', text: 'Tentou fazê-la parar.' },
    { speaker: 'André', text: 'Tentei.' },
    { speaker: 'Augusto', text: 'Para proteger o núcleo?' },
    {
      speaker: 'André',
      text: 'No começo.\n\nDepois para proteger ela de mim.',
    },
    { speaker: 'Augusto', text: 'De você?' },
    {
      speaker: 'André',
      text: 'Da ideia de que, se encontrasse a prova certa, seis anos iam desaparecer.\n\nNão desaparecem.\n\nMesmo que amanhã alguém abra essa porta e diga que eu posso ir embora, a Elisa continua morta.\n\nMinha irmã continua tendo passado metade da vida dela tentando consertar isso.',
    },
  ],
  silence: [
    { speaker: 'Augusto', text: 'E você deixou que ela acreditasse que não havia álibi.' },
    { speaker: 'André', text: 'Eu deixei todo mundo acreditar.' },
    { speaker: 'Augusto', text: 'Inclusive o júri.' },
    { speaker: 'André', text: 'Sim.' },
    {
      speaker: 'Augusto',
      text: 'Você estava nos protestos durante parte do intervalo usado contra você.',
    },
    { speaker: 'André', text: 'Estava.' },
    { speaker: 'Augusto', text: 'Isso muda o caso.' },
    { speaker: 'André', text: 'Muda o papel.\n\nNão me diz quem matou Elisa.' },
    { speaker: 'Augusto', text: 'Ainda não.' },
    {
      speaker: 'André',
      text: 'Então não venha aqui me devolver seis anos aos pedaços.\n\nDescobre primeiro o que aconteceu com ela.\n\nDepois a gente conversa sobre o que isso muda para mim.',
    },
  ],
}
