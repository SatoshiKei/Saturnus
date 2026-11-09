export type MiroThirdTopicId = 'alibi' | 'fall' | 'rail' | 'deny'

export const MIRO_THIRD_TOPIC_IDS: MiroThirdTopicId[] = ['alibi', 'fall', 'rail', 'deny']

export const miroThirdLabels: Record<MiroThirdTopicId, string> = {
  alibi: 'André em outro lugar',
  fall: 'Como ela caiu',
  rail: 'A proteção',
  deny: 'Contato',
}

export const miroThirdFlags: Record<MiroThirdTopicId, string> = {
  alibi: 'block08_miro3_alibi',
  fall: 'block08_miro3_fall',
  rail: 'block08_miro3_rail',
  deny: 'block08_miro3_deny',
}

export type MiroThirdBeat = { speaker?: string; text: string }

export const miroThirdBeats: Record<MiroThirdTopicId, MiroThirdBeat[]> = {
  alibi: [
    { speaker: 'Miro', text: 'Agora você voltou com cara de quem acredita menos no André.' },
    { speaker: 'Augusto', text: 'Você observa demais.' },
    { speaker: 'Miro', text: 'Aqui dentro é grátis.' },
    { speaker: 'Augusto', text: 'André estava em outro lugar durante parte daquele intervalo.' },
    {
      speaker: 'Augusto',
      text: 'Agora você é o único homem que eu consigo colocar perto da região da queda.',
    },
    { speaker: 'Miro', text: 'Eu já te disse o que fiz.' },
    { speaker: 'Augusto', text: 'Não tudo.' },
  ],
  fall: [
    { speaker: 'Miro', text: 'De novo isso?' },
    { speaker: 'Augusto', text: 'Quando Elisa percebeu que estava sendo seguida, o que aconteceu?' },
    { speaker: 'Miro', text: 'Ela acelerou.' },
    { speaker: 'Augusto', text: 'Correu?' },
    { speaker: 'Miro', text: 'Não.\n\nFoi se afastando. Olhava para trás.' },
    { speaker: 'Augusto', text: 'Você continuou.' },
    { speaker: 'Miro', text: 'Por alguns metros.' },
    { speaker: 'Augusto', text: 'E ela foi até a proteção.' },
    { speaker: 'Miro', text: 'Foi.' },
  ],
  rail: [
    { speaker: 'Augusto', text: 'Você chegou perto?' },
    { speaker: 'Miro', text: 'Não perto o bastante para tocar.' },
    { speaker: 'Augusto', text: 'Então como ela caiu?' },
    { speaker: 'Miro', text: 'A grade cedeu.' },
    { speaker: 'Augusto', text: 'Sozinha.' },
    { speaker: 'Miro', text: 'Ela encostou.\n\nAquilo mexeu.\n\nDepois foi.' },
    {
      speaker: 'Augusto',
      text: 'E você quer que eu aceite que uma proteção de via simplesmente abriu.',
    },
    {
      speaker: 'Miro',
      text: 'Eu quero que você faça o que devia ter sido feito seis anos atrás e olhe para a porra da grade.',
    },
  ],
  deny: [
    { speaker: 'Augusto', text: 'Você nunca falou disso.' },
    {
      speaker: 'Miro',
      text: 'Porque ninguém queria saber como ela caiu.\n\nQueriam saber quem empurrou.',
    },
    { speaker: 'Augusto', text: 'Você garante que não houve contato?' },
    {
      speaker: 'Miro',
      text: 'Garanto o que eu vi e o que eu fiz.\n\nEu não empurrei Elisa.\n\nSe aquilo já estava quebrado, descobre quem quebrou.',
    },
  ],
}
