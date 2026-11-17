export type LiviaTopicId = 'mariana' | 'material'

export const LIVIA_TOPIC_IDS: LiviaTopicId[] = ['mariana', 'material']

export const liviaTopicLabels: Record<LiviaTopicId, string> = {
  mariana: 'Mariana',
  material: 'O arquivo da rádio',
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
      text: 'Mariana Silva entrou em contato com você há alguns meses?',
    },
    {
      speaker: 'Lívia',
      text: 'Entrou. Achei que fosse pauta no começo. Ela fez duas perguntas sobre uma cobertura antiga da Costeira e depois ficou quase uma hora comigo.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'Cobertura de quê?',
    },
    {
      speaker: 'Lívia',
      text: 'Dos protestos contra a Maralto Granéis. Isso já faz uns seis anos.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'Maralto Granéis?',
    },
    {
      speaker: 'Lívia',
      text: 'Uma empresa grande daqui. Terminal, logística, dinheiro suficiente para aparecer bastante na cidade e preferir não aparecer no jornal pelo motivo errado.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'E o motivo errado eram os protestos.',
    },
    {
      speaker: 'Lívia',
      text: 'Na época, sim. Teve manifestação, confronto, denúncia de segurança particular passando do limite... ficou feio por algumas semanas e depois a cidade fez o que cidade faz muito bem: arrumou outro assunto.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'O que Mariana queria saber?',
    },
    {
      speaker: 'Lívia',
      text: 'Essa foi a parte curiosa. Ela não estava muito interessada no que a gente publicou. Isso ela podia achar sozinha.',
      portrait: 'livia',
    },
    {
      speaker: 'Lívia',
      text: 'Queria saber o que tinha ficado de fora.',
      portrait: 'livia',
    },
  ],

  material: [
    {
      speaker: 'Augusto',
      text: 'Ficou muita coisa de fora?',
    },
    {
      speaker: 'Lívia',
      text: 'Sempre fica. Reportagem não é ata de cartório. Você grava uma tarde inteira para usar dois minutos e meio, quando tem sorte.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'E você ainda guarda isso?',
    },
    {
      speaker: 'Lívia',
      text: 'Guardo coisa demais. É um defeito profissional que já sobreviveu a três computadores e duas promessas de organizar meus arquivos.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'Foi esse material que Mariana pediu?',
    },
    {
      speaker: 'Lívia',
      text: 'Foi. Eu ofereci a matéria fechada primeiro. Ela nem fez desfeita, só perguntou se eu tinha as gravações originais.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'Disse o que esperava encontrar nelas?',
    },
    {
      speaker: 'Lívia',
      text: 'Não exatamente. Ouviu bastante coisa aqui mesmo, voltou em alguns trechos, fez anotação. Tinha uma pergunta na cabeça, isso dava para perceber. Só não dividiu comigo qual era.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'Você ainda tem a mesma cópia?',
    },
    {
      speaker: 'Lívia',
      text: 'Tenho. Mas já vou estragar sua expectativa: é arquivo bruto de rádio. Tem vento, gente falando por cima, entrada cortada e gravação que começa no meio de frase.',
      portrait: 'livia',
    },
    {
      speaker: 'Augusto',
      text: 'Serve.',
    },
    {
      speaker: 'Lívia',
      text: 'Foi o que a Mariana achou também.',
      portrait: 'livia',
    },
  ],
}