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
    { speaker: 'Augusto', text: 'Quando foi a última vez que vocês viram Mariana pessoalmente?' },
    { speaker: 'Júlia', text: 'Ontem. No fim da tarde.', portrait: 'julia' },
    { speaker: 'Camila', text: 'Eu vi ela saindo do plantão.', portrait: 'camila' },
  ],
  behavior: [
    { speaker: 'Augusto', text: 'Ela comentou que ia encontrar alguém?' },
    { speaker: 'Camila', text: 'Comigo não.', portrait: 'camila' },
    { speaker: 'Júlia', text: 'Ela não tava contando muita coisa ultimamente.', portrait: 'julia' },
  ],
  memory_issues: [
    {
      speaker: 'Augusto',
      text: 'Nas mensagens ela pergunta várias vezes sobre coisas que supostamente tinha feito. Isso vinha acontecendo há quanto tempo?',
    },
    { speaker: 'Júlia', text: 'Algumas semanas. Talvez mais.', portrait: 'julia' },
    { speaker: 'Augusto', text: 'E você achou normal?' },
    { speaker: 'Júlia', text: 'Claro que não achei normal.\n\nMas ela sabia que tava acontecendo.\n\nPor isso começou a anotar tudo.', portrait: 'julia' },
    { speaker: 'Augusto', text: 'Você chegou a sugerir que ela procurasse um médico?' },
    { speaker: 'Júlia', text: 'Umas dez vezes.\n\nEla dizia que era cansaço.', portrait: 'julia' },
    { speaker: 'Camila', text: 'Não era desse jeito o tempo todo.', portrait: 'camila' },
    { speaker: 'Augusto', text: 'Como assim?' },
    {
      speaker: 'Camila',
      text: 'Falando assim parece que ela vinha trabalhar sem saber onde tava.\n\nNão era isso.\n\nEla trabalhava normal.\n\nÀs vezes esquecia umas coisas muito específicas.',
      portrait: 'camila',
    },
    { speaker: 'Júlia', text: 'Específicas nada. Ela foi na minha casa e no dia seguinte não lembrava.', portrait: 'julia' },
    { speaker: 'Camila', text: 'Mas lembrava de prontuário, medicação, paciente, tudo.', portrait: 'camila' },
    { speaker: 'Júlia', text: 'Eu sei.', portrait: 'julia' },
  ],
  camila_alone: [
    { speaker: 'Augusto', text: 'Você acha que Júlia está exagerando?' },
    { speaker: 'Camila', text: 'Acho que Júlia tava assustada.', portrait: 'camila' },
    { speaker: 'Augusto', text: 'Não foi o que perguntei.' },
    { speaker: 'Camila', text: 'Eu não acho que Mariana tava perdendo a cabeça.\n\nAcho que ela tava escondendo alguma coisa.', portrait: 'camila' },
    { speaker: 'Augusto', text: 'De vocês?' },
    { speaker: 'Camila', text: 'Talvez dela mesma.', portrait: 'camila' },
    { speaker: 'Augusto', text: 'O que isso quer dizer?' },
    {
      speaker: 'Camila',
      text: 'Não sei.\n\nSó parecia que às vezes ela queria que a gente confirmasse uma coisa que ela já sabia.',
      portrait: 'camila',
    },
  ],
}
