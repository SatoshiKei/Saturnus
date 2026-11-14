export type AndreTopicId = 'mariana' | 'elisa' | 'maralto' | 'trust'

export const ANDRE_TOPIC_IDS: AndreTopicId[] = ['mariana', 'elisa', 'maralto', 'trust']

export const andreTopicLabels: Record<AndreTopicId, string> = {
  mariana: 'Mariana',
  elisa: 'A mudança de Mariana',
  maralto: 'Maralto',
  trust: 'Por que Mariana voltou',
}

export const andreTopicFlags: Record<AndreTopicId, string> = {
  mariana: 'block04_andre_mariana',
  elisa: 'block04_andre_elisa',
  maralto: 'block04_andre_maralto',
  trust: 'block04_andre_trust',
}

export type AndreBeat = { speaker?: string; text: string; portrait?: 'andre' }

export const andreBeats: Record<AndreTopicId, AndreBeat[]> = {
  mariana: [
    { speaker: 'Augusto', text: 'Obrigado por me receber.' },
    { speaker: 'André', text: 'Não fui eu que marquei a visita.', portrait: 'andre' },
    { speaker: 'Augusto', text: 'Mariana esteve aqui recentemente.' },
    { speaker: 'André', text: 'Duas vezes.', portrait: 'andre' },
    { speaker: 'Augusto', text: 'Depois de quanto tempo sem vir?' },
    { speaker: 'André', text: 'Anos.', portrait: 'andre' },
    { speaker: 'Augusto', text: 'Como foram essas visitas?' },
    { speaker: 'André', text: 'Estranhas.', portrait: 'andre' },
    {
      speaker: 'André',
      text:
        'Na primeira eu achei que tinha acontecido alguma coisa com a família. Depois ela começou a falar da Elisa.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'O que ela queria saber?' },
    {
      speaker: 'André',
      text:
        'Coisas que já estavam no processo. Onde eu estava, com quem eu tinha falado, o que eu lembrava daquela noite.\n\nCoisas que ela nunca quis ouvir de mim antes.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'E na segunda?' },
    {
      speaker: 'André',
      text:
        'Voltou com mais perguntas.\n\nJá não parecia querer saber o que aconteceu. Parecia querer encontrar onde alguém tinha errado.',
      portrait: 'andre',
    },
  ],
  elisa: [
    { speaker: 'Augusto', text: 'Ela disse que acreditava na sua inocência?' },
    {
      speaker: 'André',
      text: 'Não desse jeito.\n\nDisse que talvez tivesse acreditado em coisas erradas por tempo demais.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Isso surpreendeu o senhor.' },
    {
      speaker: 'André',
      text:
        'Minha irmã passou seis anos acreditando que eu matei uma garota.\n\nAí aparece aqui dizendo que quer revisar tudo.\n\nO que o senhor acha?',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'O senhor pediu que ela continuasse?' },
    { speaker: 'André', text: 'Pedi para ela parar.', portrait: 'andre' },
    { speaker: 'Augusto', text: 'Por quê?' },
    {
      speaker: 'André',
      text:
        'Porque eu conheço esse processo.\n\nCada vez que alguém resolve abrir aquilo de novo, aparece uma nova versão da minha vida escrita por alguém que não estava lá.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Mesmo que ela pudesse encontrar alguma coisa a seu favor?' },
    {
      speaker: 'André',
      text:
        'Mariana não estava bem.\n\nEla esquecia coisa. Voltava no mesmo assunto. Às vezes perguntava uma coisa que eu tinha respondido na visita anterior.\n\nEu não queria que ela passasse meses vivendo dentro disso.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Ela ouviu?' },
    { speaker: 'André', text: 'Não.', portrait: 'andre' },
  ],
  maralto: [
    { speaker: 'Augusto', text: 'Ela falou sobre a Maralto Granéis?' },
    { speaker: 'André', text: 'Não comigo.', portrait: 'andre' },
    { speaker: 'Augusto', text: 'Sobre os protestos de seis anos atrás?' },
    { speaker: 'André', text: 'Ela veio falar da Elisa.', portrait: 'andre' },
    { speaker: 'Augusto', text: 'O nome Morsa significa alguma coisa para o senhor?' },
    { speaker: 'André', text: 'Não.', portrait: 'andre' },
    { speaker: 'Augusto', text: 'Mariana nunca mencionou esse nome?' },
    { speaker: 'André', text: 'Não.', portrait: 'andre' },
    { speaker: 'Augusto', text: 'Nem Maralto?' },
    { speaker: 'André', text: 'Não.', portrait: 'andre' },
    {
      speaker: 'Augusto',
      text: 'Curioso. Ela estava pesquisando os dois assuntos praticamente ao mesmo tempo.',
    },
    {
      speaker: 'André',
      text: 'Então pergunta para quem falou com ela sobre isso.\n\nEu não falei.',
      portrait: 'andre',
    },
  ],
  trust: [
    { speaker: 'Augusto', text: 'Por que acha que ela voltou depois de tantos anos?' },
    { speaker: 'André', text: 'Não sei.\n\nEssa é a parte que me incomoda.', portrait: 'andre' },
    { speaker: 'Augusto', text: 'Por quê?' },
    {
      speaker: 'André',
      text:
        'Porque não aconteceu nada entre nós.\n\nNenhuma conversa. Nenhuma reconciliação.\n\nEla simplesmente apareceu.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'E começou a questionar a condenação.' },
    { speaker: 'André', text: 'Sim.', portrait: 'andre' },
    { speaker: 'Augusto', text: 'Pode ter encontrado alguma coisa.' },
    { speaker: 'André', text: 'Pode.', portrait: 'andre' },
    { speaker: 'Augusto', text: 'Ou alguém pode ter convencido ela.' },
    { speaker: 'André', text: 'Então descubra quem.', portrait: 'andre' },
    { speaker: 'André', text: 'Acabou?', portrait: 'andre' },
    { speaker: 'Augusto', text: 'Por enquanto.' },
    {
      speaker: 'André',
      text:
        'Então faz uma coisa antes de voltar aqui.\n\nDescobre por que a Mariana começou tudo isso.\n\nPorque eu também quero saber.',
      portrait: 'andre',
    },
  ],
}