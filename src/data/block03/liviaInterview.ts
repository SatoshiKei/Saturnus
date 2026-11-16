export type LiviaTopicId = 'mariana' | 'material'

export const LIVIA_TOPIC_IDS: LiviaTopicId[] = ['mariana', 'material']

export const liviaTopicLabels: Record<LiviaTopicId, string> = {
  mariana: 'Mariana e a Maralto',
  material: 'Material bruto',
}

export const liviaTopicFlags: Record<LiviaTopicId, string> = {
  mariana: 'block03_livia_mariana',
  material: 'block03_livia_material',
}

export type LiviaBeat = { speaker?: string; text: string; portrait?: 'livia' }

export const liviaBeats: Record<LiviaTopicId, LiviaBeat[]> = {
  mariana: [
    {
      speaker: 'Augusto',
      text: 'Mariana Silva esteve aqui procurando material sobre a Maralto?',
    },
    {
      speaker: 'Lívia',
      text: 'Esteve. E não chegou pedindo uma matéria pronta, o que já fez ela subir um pouco no meu conceito.\nQueria saber o que eu ainda guardava dos protestos, principalmente coisa que nunca entrou na cobertura final.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'Você costuma guardar esse tipo de material por seis anos?',
    },
    {
      speaker: 'Lívia',
      text: 'Sou jornalista há tempo suficiente para ter duas certezas: arquivo ocupa espaço demais e sempre faz falta na semana seguinte ao descarte.\nEntão, sim. Guardo mais do que deveria.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'Ela explicou por que estava voltando à Maralto agora?',
    },
    {
      speaker: 'Lívia',
      text: 'Explicou pouco. Mariana não tinha jeito de fonte querendo aparecer nem de curiosa atrás de história velha.\nEla vinha com perguntas específicas e escutava a resposta inteira. Isso é mais raro do que parece.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'E o que você entendeu que ela procurava?',
    },
    {
      speaker: 'Lívia',
      text: 'Alguma coisa que tivesse passado entre as frestas da cobertura da época.\nNão me perguntou o que a Maralto dizia sobre os protestos. Queria saber o que tinha sido registrado antes de alguém escolher o que virava notícia.',
      portrait: 'livia',
    },
  ],

  material: [
    {
      speaker: 'Augusto',
      text: 'Você ainda tem o material que mostrou a ela?',
    },
    {
      speaker: 'Lívia',
      text: 'Tenho uma cópia do bruto. Áudio de rua, entrada ao vivo, pedaço de entrevista, coisa gravada enquanto a equipe ainda estava tentando entender o que estava acontecendo.\nNão é bonito, mas arquivo útil raramente é.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'Foi isso que Mariana levou?',
    },
    {
      speaker: 'Lívia',
      text: 'Foi o que ela fez questão de pedir.\nEu ofereci a matéria fechada porque era mais fácil de consultar. Ela agradeceu e disse que preferia ouvir o que ainda não tinha sido organizado por ninguém.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'Ela encontrou alguma coisa?',
    },
    {
      speaker: 'Lívia',
      text: 'Se encontrou, não me contou.\nFicou bastante tempo ouvindo, voltou em alguns trechos e anotou umas coisas. Quando terminou, parecia mais interessada do que quando chegou. Não necessariamente mais satisfeita.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'Posso levar uma cópia?',
    },
    {
      speaker: 'Lívia',
      text: 'Pode. Só não me peça para fingir que isso é material limpo. Tem hora em que você vai ouvir mais vento do que gente.\nMas foi exatamente esse arquivo que a Mariana quis, então eu começaria por ele.',
      portrait: 'livia',
    },
  ],
}
