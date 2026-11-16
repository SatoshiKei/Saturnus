export type NicoTopicId = 'elisa' | 'vertice_night' | 'mariana' | 'questions' | 'recordings'

export const NICO_TOPIC_IDS: NicoTopicId[] = [
  'elisa',
  'vertice_night',
  'mariana',
  'questions',
  'recordings',
]

export const nicoTopicLabels: Record<NicoTopicId, string> = {
  elisa: 'Elisa Duarte',
  vertice_night: 'A Noite X no Vértice',
  mariana: 'Visita de Mariana',
  questions: 'O que ela queria saber',
  recordings: 'Registros sonoros',
}

export const nicoTopicFlags: Record<NicoTopicId, string> = {
  elisa: 'block03_nico_elisa',
  vertice_night: 'block03_nico_vertice_night',
  mariana: 'block03_nico_mariana',
  questions: 'block03_nico_questions',
  recordings: 'block03_nico_recordings',
}

export type NicoBeat = { speaker?: string; text: string; portrait?: 'nico' }

export const nicoBeats: Record<NicoTopicId, NicoBeat[]> = {
  elisa: [
    {
      speaker: 'Augusto',
      text: 'Recuperei um trecho bem antigo da balada. Pessoal do Vértice ouviu e disseram que a voz no microfone era sua.',
    },
    {
      speaker: 'Nico',
      text: 'Caralho.\nEu falava assim?\nDá vontade de pedir desculpa pra quem dividia cabine comigo.\n\nMas sim, delegado. Antes de você perguntar o nome: eu sei de quem a gente vai falar. Só achei que depois de seis anos ia ser outro assunto.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Você conhecia Elisa Duarte?' },
    {
      speaker: 'Nico',
      text: 'Conhecer é generoso.\nEla aparecia.\nNão era VIP, não era da roda da porta, não vinha com crush pedindo música.\nSó vinha, ficava, voltava.\nTem gente que a pista adota sem ninguém combinar antes.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Como assim?' },
    {
      speaker: 'Nico',
      text: 'Nas primeiras vezes ela ia com gente.\nDepois começou a parecer sozinha. Ou ficar sozinha num lugar em que ninguém fica parado.\nEla ficava na lateral, meio de lado, como quem acompanha a sala inteira em vez do grave.',
      portrait: 'nico',
    },
  ],
  vertice_night: [
    { speaker: 'Augusto', text: 'Você estava trabalhando na noite em que ela morreu?' },
    {
      speaker: 'Nico',
      text: 'Estava na cabine. Como sempre.\nA pista já tinha esvaziado um pouco, mas ainda tinha aquela hora em que o som parece maior que a multidão.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Viu quando ela saiu?' },
    {
      speaker: 'Nico',
      text: 'Augusto…\nEu já falei isso pra delegado, pra advogado, pra escrivão com café frio na mesa.\nTá no processo.\nE eu não sou filmagem, sou mesa.',
      portrait: 'nico',
    },
    {
      speaker: 'Nico',
      text: 'Eu estava de fone, olhando o mix e a pista aos pedaços.\nGente entrando bêbada, gente saindo antes da última música, casal brigando no corredor.\nNão sou guarda-costas de ninguém.',
      portrait: 'nico',
    },
  ],
  mariana: [
    { speaker: 'Augusto', text: 'Mariana Silva procurou você há pouco tempo.' },
    {
      speaker: 'Nico',
      text: 'Procurou.\nDo nada, anos depois, alguém batendo na porta do Titã querendo mexer na noite de 2009.\nEu olhei e pensei: quem ainda se importa?',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Você a reconheceu?' },
    {
      speaker: 'Nico',
      text: 'Não de cara.\nEla não entrou pedindo música nem autógrafo de DJ.\nDepois ela falou do irmão e aí caiu a ficha.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Vocês conversaram?' },
    {
      speaker: 'Nico',
      text: 'O mínimo.\nNão tenho nada contra ela.\nSó não curti voltar pra cabine da memória.\nNa minha cabeça eu já tinha fechado aquela porta.',
      portrait: 'nico',
    },
  ],
  questions: [
    { speaker: 'Augusto', text: 'O que ela queria saber?' },
    {
      speaker: 'Nico',
      text: 'Horário.\nSequência.\nQuem entrou, quem saiu, em que ordem.\nEla queria encaixar o movimento da casa como se a pista fosse relógio.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Quem matou Elisa?' },
    {
      speaker: 'Nico',
      text: 'Isso ela quase não perguntou.\nFicou obcecada com quando cada coisa acontecia.\nMinuto por minuto, como se o crime fosse um corte mal feito no mix.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Ela disse por quê?' },
    {
      speaker: 'Nico',
      text: 'Não.\nE eu também não perguntei.\nNa boate a gente aprende a não abrir porta que não é nossa.',
      portrait: 'nico',
    },
  ],
  recordings: [
    { speaker: 'Augusto', text: 'Existem registros daquela noite?' },
    {
      speaker: 'Nico',
      text: 'Tem.\nA casa gravava o feed da mesa sozinha.\nSet, controle, arquivo do DJ.\nNão é câmera. É o som direto da cabine, antes de ir pra pista.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Você ainda guarda isso?' },
    {
      speaker: 'Nico',
      text: 'Tenho cópia daquela noite.\nNão é oficial, não foi pro processo.\nMas é o feed da mesa, do jeito que saiu da minha mão.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Preciso ouvir.' },
    {
      speaker: 'Nico',
      text: 'Leva.\nSó me faz um favor: não me chama de volta pra essa história.\nJá deu o que tinha que dar.',
      portrait: 'nico',
    },
  ],
}