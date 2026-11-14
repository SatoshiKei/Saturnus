/** Roteiro hospital — Bloco 1 (tópicos jogáveis). */

export type HospitalBeat = {
  speaker?: string
  text: string
  portrait?: 'julia' | 'camila' | 'augusto'
}

export const HOSPITAL_TOPIC_IDS = [
  'last_seen',
  'behavior',
  'memory_issues',
  'camila_alone',
] as const

export type HospitalTopicId = (typeof HOSPITAL_TOPIC_IDS)[number]

export const hospitalTopicLabels: Record<HospitalTopicId, string> = {
  last_seen: 'Última vez que viram Mariana',
  behavior: 'Comportamento recente',
  memory_issues: 'Falhas de memória',
  camila_alone: 'Conversar com Camila a sós',
}

export const hospitalTopicFlags: Record<HospitalTopicId, string> = {
  last_seen: 'block01_topic_last_seen',
  behavior: 'block01_topic_behavior',
  memory_issues: 'block01_topic_memory',
  camila_alone: 'block01_camila_private',
}

export const hospitalBeats: Record<HospitalTopicId, HospitalBeat[]> = {
  last_seen: [
    // Aparição ambiental de Renata (sem pista) — jogador ouve o nome antes de Enceladus.
    {
      speaker: 'Camila',
      text: 'Renata, o kit do posto B já foi conferido?',
      portrait: 'camila',
    },
    {
      speaker: 'Júlia',
      // [TEXTO PENDENTE] — banalidade de plantão.
      text: 'Renata leva agora.',
      portrait: 'julia',
    },
    { speaker: 'Augusto', text: 'Quero começar pelo básico. Quando vocês viram Mariana pela última vez?' },
    { speaker: 'Júlia', text: 'Ontem. Eu falei com ela no fim da tarde.', portrait: 'julia' },
    { speaker: 'Camila', text: 'Eu vi quando ela terminou o plantão. Ela saiu normalmente.', portrait: 'camila' },
  ],
  behavior: [
    { speaker: 'Augusto', text: 'Ela comentou onde ia ou se ia encontrar alguém?' },
    { speaker: 'Camila', text: 'Comigo, não.', portrait: 'camila' },
    {
      speaker: 'Júlia',
      text: 'Ela andava contando menos coisa. Eu perguntava, ela respondia pela metade ou mudava de assunto.',
      portrait: 'julia',
    },
  ],
  memory_issues: [
    {
      speaker: 'Augusto',
      text: 'No telefone dela tem mais de uma conversa em que Mariana pergunta por alguma coisa que já tinha feito. Isso vinha acontecendo há quanto tempo?',
    },
    {
      speaker: 'Júlia',
      text: 'Algumas semanas. Talvez mais. Eu percebi quando ela começou a me perguntar de conversa que a gente tinha tido no dia anterior.',
      portrait: 'julia',
    },
    { speaker: 'Augusto', text: 'Você falou com ela sobre isso?' },
    {
      speaker: 'Júlia',
      text: 'Várias vezes. Falei pra procurar um médico, tirar uns dias, qualquer coisa. Ela sempre dizia que estava cansada e que ia passar.',
      portrait: 'julia',
    },
    {
      speaker: 'Camila',
      text: 'Só não pensa que ela estava desorientada o tempo inteiro, porque não estava.',
      portrait: 'camila',
    },
    { speaker: 'Augusto', text: 'O que você quer dizer?' },
    {
      speaker: 'Camila',
      text: 'No trabalho ela funcionava. Sabia paciente, medicação, passagem de turno. Não era alguém chegando aqui sem saber que dia era.',
      portrait: 'camila',
    },
    {
      speaker: 'Júlia',
      text: 'Mas esquecia coisa grande também. Não era só onde deixou a chave.',
      portrait: 'julia',
    },
    {
      speaker: 'Camila',
      text: 'Eu sei. Só estou dizendo que era irregular. Às vezes parecia que faltava uma coisa muito específica e todo o resto estava no lugar.',
      portrait: 'camila',
    },
    { speaker: 'Augusto', text: 'Isso aconteceu durante atendimento?' },
    { speaker: 'Camila', text: 'Nunca vi. E eu teria falado se tivesse visto.', portrait: 'camila' },
  ],
  camila_alone: [
    {
      speaker: 'Augusto',
      text: 'Quando Júlia falou das falhas, você fez questão de separar isso do trabalho. Por quê?',
    },
    {
      speaker: 'Camila',
      text: 'Porque do jeito que a gente conta depois parece pior do que era. Mariana não vinha pra cá perdida.',
      portrait: 'camila',
    },
    { speaker: 'Augusto', text: 'Mas você também achava que tinha alguma coisa errada.' },
    { speaker: 'Camila', text: 'Claro.', portrait: 'camila' },
    { speaker: 'Augusto', text: 'O quê?' },
    { speaker: 'Camila', text: 'Eu não sei. E prefiro não inventar.', portrait: 'camila' },
    { speaker: 'Augusto', text: 'Tenta me dizer o que você viu, então.' },
    {
      speaker: 'Camila',
      text: 'Às vezes ela perguntava uma coisa e ficava prestando mais atenção na nossa resposta do que na informação em si.',
      portrait: 'camila',
    },
    { speaker: 'Augusto', text: 'Como se não soubesse?' },
    {
      speaker: 'Camila',
      text: 'Não. Esse é o estranho. Às vezes parecia que ela sabia e queria conferir se a gente lembrava igual.',
      portrait: 'camila',
    },
    { speaker: 'Augusto', text: 'Ela fez isso com você?' },
    { speaker: 'Camila', text: 'Mais de uma vez.', portrait: 'camila' },
    { speaker: 'Augusto', text: 'Sobre o quê?' },
    {
      speaker: 'Camila',
      text: 'Coisa banal. Horário, quem estava no plantão, uma conversa. Nada que parecesse importante até agora.',
      portrait: 'camila',
    },
  ],
}
