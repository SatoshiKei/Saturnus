export type MiroTopicId = 'now' | 'jana' | 'night' | 'deny'

export const MIRO_TOPIC_IDS: MiroTopicId[] = ['now', 'jana', 'night', 'deny']

export const miroTopicLabels: Record<MiroTopicId, string> = {
  now: 'A prisão de agora',
  jana: 'Jana',
  night: 'A jaqueta e o caminho',
  deny: 'A região da queda',
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
    { speaker: 'Miro', text: 'Você demorou.' },
    { speaker: 'Augusto', text: 'Eu estava trabalhando.' },
    { speaker: 'Miro', text: 'Em mim.' },
    {
      speaker: 'Augusto',
      text: 'Em muita gente.\n\nAntes de começar: você está preso pelo que aconteceu agora.\n\nNão pela Elisa Duarte.',
    },
    { speaker: 'Miro', text: 'Ótimo. Então posso ir embora quando terminarmos esse assunto velho?' },
    { speaker: 'Augusto', text: 'Não.' },
    { speaker: 'Miro', text: 'Pelo menos é sincero.' },
  ],
  jana: [
    { speaker: 'Augusto', text: 'Jana Ribeiro.' },
    { speaker: 'Miro', text: 'O que tem ela?' },
    { speaker: 'Augusto', text: 'Você conhecia.' },
    { speaker: 'Miro', text: 'Conhecia gente que conhecia.' },
    { speaker: 'Augusto', text: 'Não começa.' },
    { speaker: 'Miro', text: 'Você fez uma pergunta. Eu respondi.' },
    { speaker: 'Augusto', text: 'Na noite em que Elisa morreu você estava procurando Jana.' },
    { speaker: 'Miro', text: 'Quem te disse isso?' },
    { speaker: 'Augusto', text: 'Ela.' },
    { speaker: 'Miro', text: 'Então depois de seis anos resolveu conversar.' },
    { speaker: 'Augusto', text: 'Resolveu.\n\nVocê estava atrás dela?' },
    { speaker: 'Miro', text: 'Eu ia levar uma mensagem.' },
    { speaker: 'Augusto', text: 'De Válter.' },
    { speaker: 'Miro', text: 'Não coloque nome na minha boca.' },
  ],
  night: [
    { speaker: 'Augusto', text: 'Você viu alguém saindo do Vértice com a jaqueta e a bolsa de Jana.' },
    { speaker: 'Miro', text: 'Vi.' },
    { speaker: 'Augusto', text: 'E seguiu.' },
    { speaker: 'Miro', text: 'Segui.' },
    { speaker: 'Augusto', text: 'Pensando que era Jana.' },
    { speaker: 'Miro', text: 'De costas, naquela luz, com as coisas dela? Sim.' },
    { speaker: 'Augusto', text: 'Quando percebeu que era Elisa?' },
    { speaker: 'Miro', text: 'Depois.' },
    { speaker: 'Augusto', text: 'Depois quanto?' },
    { speaker: 'Miro', text: 'Não sei.\n\nEu não estava olhando relógio.' },
    { speaker: 'Augusto', text: 'Onde?' },
    { speaker: 'Miro', text: 'Fora da casa. Mais abaixo.' },
    { speaker: 'Augusto', text: 'Perto da região da queda?' },
    { speaker: 'Miro', text: 'Eu disse mais abaixo.' },
    { speaker: 'Augusto', text: 'Você está escolhendo palavra.' },
    {
      speaker: 'Miro',
      text: 'Claro que estou escolhendo palavra.\n\nOlha onde eu estou.',
    },
  ],
  deny: [
    { speaker: 'Augusto', text: 'Você a tocou?' },
    { speaker: 'Miro', text: 'Não.' },
    { speaker: 'Augusto', text: 'Falou com ela?' },
    { speaker: 'Miro', text: 'Não.' },
    { speaker: 'Augusto', text: 'Ela percebeu você?' },
    { speaker: 'Miro', text: 'Talvez.' },
    { speaker: 'Augusto', text: '“Talvez.”' },
    {
      speaker: 'Miro',
      text: 'Ela olhou para trás uma vez.\n\nEu já tinha visto que não era Jana.\n\nParei.',
    },
    { speaker: 'Augusto', text: 'E voltou?' },
    { speaker: 'Miro', text: 'Eventualmente.' },
    { speaker: 'Augusto', text: 'Isso não responde.' },
    { speaker: 'Miro', text: 'Então faz uma pergunta melhor.' },
    { speaker: 'Augusto', text: 'Você desceu até onde Elisa caiu?' },
    { speaker: 'Miro', text: 'Depois.' },
    { speaker: 'Augusto', text: 'Depois do quê?' },
    { speaker: 'Miro', text: 'Depois que ela já tinha caído.' },
    { speaker: 'Augusto', text: 'Você viu o corpo?' },
    { speaker: 'Miro', text: 'Vi o bastante.' },
    { speaker: 'Augusto', text: 'E fez o quê?' },
    { speaker: 'Miro', text: 'Peguei a bolsa.' },
    { speaker: 'Augusto', text: 'Da Jana.' },
    { speaker: 'Miro', text: 'É.' },
    { speaker: 'Augusto', text: 'Tirou uma coisa da cena.' },
    { speaker: 'Miro', text: 'Tirei uma coisa que ligava a Jana àquilo.' },
    { speaker: 'Augusto', text: 'Você não chamou ninguém.' },
    { speaker: 'Miro', text: 'Não.' },
    { speaker: 'Augusto', text: 'Não tentou ajudar.' },
    { speaker: 'Miro', text: 'Não.' },
    { speaker: 'Augusto', text: 'E quer que eu acredite que não encostou na Elisa.' },
    {
      speaker: 'Miro',
      text: 'Eu não preciso que você goste da minha versão.\n\nEu segui a pessoa errada.\n\nDesci depois.\n\nPeguei a bolsa.\n\nTudo isso já é ruim o suficiente.\n\nNão vou colocar um empurrão no meio só porque deixa a sua história mais arrumada.',
    },
    {
      speaker: 'Augusto',
      text: 'Tem uma testemunha que viu um homem voltando daquela região e disse que era André.',
    },
    {
      speaker: 'Miro',
      text: 'Então talvez ela tenha visto alguém voltando.\n\nA parte do André é problema dela.',
    },
    { speaker: 'Augusto', text: 'Pode ter visto você.' },
    { speaker: 'Miro', text: 'Pode.' },
    { speaker: 'Augusto', text: 'Finalmente.' },
    {
      speaker: 'Miro',
      text: 'Não comemora.\n\n“Pode ter visto” não significa “eu matei”.',
    },
  ],
}
