export type SamuelTopicId = 'morsa' | 'protests' | 'silence' | 'mariana' | 'timing'

export const SAMUEL_TOPIC_IDS: SamuelTopicId[] = [
  'morsa',
  'protests',
  'silence',
  'mariana',
  'timing',
]

export const samuelTopicLabels: Record<SamuelTopicId, string> = {
  morsa: 'Quem era Morsa',
  protests: 'O núcleo dos protestos',
  silence: 'Por que ninguém fala',
  mariana: 'Visita de Mariana',
  timing: 'O que ela queria saber',
}

export const samuelTopicFlags: Record<SamuelTopicId, string> = {
  morsa: 'block04_samuel_morsa',
  protests: 'block04_samuel_protests',
  silence: 'block04_samuel_silence',
  mariana: 'block04_samuel_mariana',
  timing: 'block04_samuel_timing',
}

export type SamuelBeat = { speaker?: string; text: string; portrait?: 'samuel' }

export const samuelBeats: Record<SamuelTopicId, SamuelBeat[]> = {
  morsa: [
    { speaker: 'Augusto', text: 'Morsa. Esse apelido lhe diz alguma coisa?' },
    {
      speaker: 'Samuel',
      text: 'Diz.\nFazia anos que eu não ouvia ninguém falar esse nome em voz alta.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Quem era?' },
    {
      speaker: 'Samuel',
      text: 'Aí você já está pedindo outra coisa.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Estou pedindo um nome.' },
    {
      speaker: 'Samuel',
      text: 'Eu sei. E eu não vou te dar.\nNão é charme, não é teatrinho. Tem gente que conseguiu tocar a vida depois daquela época. Eu não vou abrir a porta de casa e começar a entregar nome pra polícia seis anos depois.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Mesmo sabendo que isso pode ter relação com o desaparecimento da Mariana?' },
    {
      speaker: 'Samuel',
      text: 'É justamente por isso que eu ainda estou sentado aqui falando com você.',
      portrait: 'samuel',
    },
  ],

  protests: [
    { speaker: 'Augusto', text: 'Você participou dos protestos contra a Maralto?' },
    {
      speaker: 'Samuel',
      text: 'Participei. Eu era estudante, fazia bico onde aparecia e tinha tempo demais pra achar que dava pra consertar o mundo numa terça-feira à tarde.\nIa pra assembleia, manifestação, ajudava com cartaz, som, essas coisas.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Mas não fazia parte do núcleo mascarado.' },
    {
      speaker: 'Samuel',
      text: 'Não.\nEu conhecia gente dali, como metade de quem circulava naquele meio conhecia. Mas eu não era um deles.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Seu nome aparece numa ocorrência poucos dias depois.' },
    {
      speaker: 'Samuel',
      text: 'Aparece porque vieram me buscar em casa. Eu fui burro, discuti, resisti e passei um tempo detido por causa disso.\nNa época eu achava que estava sendo muito coerente. Hoje acho que eu só tinha vinte e poucos anos e raiva sobrando.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'O que aconteceu naquela noite dos protestos?' },
    {
      speaker: 'Samuel',
      text: 'A mesma coisa que acontece quando muita gente chega carregando motivo diferente pra mesma rua. Uns queriam fazer barulho, outros queriam quebrar alguma coisa, outros só estavam com medo de apanhar primeiro.\nDepois todo mundo contou a versão que conseguia viver com ela.',
      portrait: 'samuel',
    },
  ],

  silence: [
    { speaker: 'Augusto', text: 'Por que ainda existe tanto silêncio em volta disso?' },
    {
      speaker: 'Samuel',
      text: 'Porque não ficou bonito pra ninguém.\nTeve gente ferida, teve gente presa, teve gente que perdeu emprego. Depois cada um foi fazendo o que dava. Mudou de bairro, terminou faculdade, teve filho, abriu bar, virou outra pessoa.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'E falar hoje colocaria isso em risco.' },
    {
      speaker: 'Samuel',
      text: 'Pra alguns, sim.\nE tem outra coisa que policial costuma esquecer: às vezes você não cala porque é culpado. Cala porque já viu o que acontece quando resolve confiar na pessoa errada.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Está falando de você?' },
    {
      speaker: 'Samuel',
      text: 'Estou falando de muita gente.',
      portrait: 'samuel',
    },
    {
      speaker: 'Samuel',
      text: 'Eu já fiz uma escolha naquela época achando que estava protegendo alguém. Não tenho vontade nenhuma de descobrir, de novo, que protegi do jeito errado.',
      portrait: 'samuel',
    },
  ],

  mariana: [
    { speaker: 'Augusto', text: 'Mariana Silva veio falar com você?' },
    {
      speaker: 'Samuel',
      text: 'Veio. Faz algumas semanas.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Ela perguntou por Morsa?' },
    {
      speaker: 'Samuel',
      text: 'Perguntou.\nQuando soltou o apelido, eu quase fechei a porta na cara dela. Fazia tempo que ninguém de fora chegava aqui sabendo esse nome.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'E você fechou?' },
    {
      speaker: 'Samuel',
      text: 'Não. Esse foi o problema.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Por quê?' },
    {
      speaker: 'Samuel',
      text: 'Porque ela não veio com aquele jeito de quem quer arrancar confissão. Parecia mais cansada do que curiosa.\nEu deixei ela falar. Depois mandei embora sem responder metade do que ela queria.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Ela mencionou o irmão?' },
    {
      speaker: 'Samuel',
      text: 'Mencionou.\nE aí eu entendi por que aquilo estava doendo tanto nela.',
      portrait: 'samuel',
    },
  ],

  timing: [
    { speaker: 'Augusto', text: 'O que exatamente ela queria saber?' },
    {
      speaker: 'Samuel',
      text: 'Não ficou só no nome.\nEla queria saber quando Morsa aparecia, quando sumia, por onde costumava entrar e sair. Voltava nos mesmos pedaços da noite como se estivesse tentando montar um mapa sem desenhar no papel.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Ela estava reconstruindo horários.' },
    {
      speaker: 'Samuel',
      text: 'Foi o que eu pensei depois.\nNa hora eu achei que ela estivesse procurando uma forma de provar alguma coisa sobre o irmão.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'E isso incomodou você.' },
    {
      speaker: 'Samuel',
      text: 'Incomodou.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Por causa de André?' },
    {
      speaker: 'Samuel',
      text: 'Por causa de tudo que aconteceu naquela época.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Você acha que ele foi condenado injustamente?' },
    {
      speaker: 'Samuel',
      text: 'Eu acho que tem pergunta que chega seis anos atrasada e ainda consegue estragar a noite de alguém.',
      portrait: 'samuel',
    },
    {
      speaker: 'Samuel',
      text: 'Essa é uma delas.',
      portrait: 'samuel',
    },
  ],
}
