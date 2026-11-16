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
    {
      speaker: 'André',
      text: 'Não agradece, não. Eu não marquei visita com polícia nenhuma.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Estou aqui por causa da Mariana.' },
    {
      speaker: 'André',
      text: 'Eu imaginei. Se fosse por mim vocês já tinham aparecido seis anos atrás com resposta pronta.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Ela esteve aqui recentemente?' },
    {
      speaker: 'André',
      text: 'Duas vezes.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Depois de quanto tempo sem vir?' },
    {
      speaker: 'André',
      text: 'Anos. Bastante tempo pra eu entender que ela não queria olhar pra minha cara.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'E aí ela aparece duas vezes.' },
    {
      speaker: 'André',
      text: 'Do nada.\nNa primeira eu achei que tinha acontecido alguma coisa com a família. Minha mãe, algum problema de saúde, sei lá. Aí ela sentou ali e começou a falar da Elisa.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'O que ela queria saber?' },
    {
      speaker: 'André',
      text: 'Onde eu estava naquela noite. Quem tinha falado comigo. Que horas eu fui embora. Coisa que já perguntaram até eu perder a conta.\nA diferença é que a Mariana nunca tinha querido ouvir a minha versão.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'E na segunda visita?' },
    {
      speaker: 'André',
      text: 'Voltou pior. Não pior comigo. Pior da cabeça, mais presa nisso.\nTrazia pergunta em cima de pergunta, voltava em coisa que eu já tinha respondido. Parecia que estava procurando a rachadura de alguma coisa.',
      portrait: 'andre',
    },
  ],

  elisa: [
    { speaker: 'Augusto', text: 'Ela disse que tinha mudado de ideia sobre você?' },
    {
      speaker: 'André',
      text: 'Ela não falou “eu estava errada”, se é isso que você quer saber.\nDisse que talvez tivesse engolido coisa demais sem perguntar. Pra Mariana já foi muito.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Como você recebeu isso?' },
    {
      speaker: 'André',
      text: 'Como você acha?\nMinha própria irmã passou anos achando que eu era um monstro. Aí volta aqui falando baixo, cheia de papel na mão, como se tivesse medo de olhar direito pra mim.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Você queria que ela continuasse investigando?' },
    {
      speaker: 'André',
      text: 'Não. Eu mandei parar.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Mesmo podendo encontrar alguma coisa que te ajudasse?' },
    {
      speaker: 'André',
      text: 'Ajudar o quê? Minha vida já passou por polícia, promotor, advogado, juiz. Cada um pegou um pedaço e escreveu o André que servia pra eles.\nEu não precisava da minha irmã entrando nesse moedor também.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Você estava preocupado com ela.' },
    {
      speaker: 'André',
      text: 'Ela não estava bem.\nEsquecia coisa, repetia pergunta, ligava num dia e no outro parecia que a conversa nunca tinha existido. E quanto mais mexia nisso, pior ficava.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Ela te ouviu?' },
    {
      speaker: 'André',
      text: 'Você conheceu a Mariana. Quando ela enfia uma coisa na cabeça, pode cair o prédio em volta.',
      portrait: 'andre',
    },
  ],

  maralto: [
    { speaker: 'Augusto', text: 'Ela falou com você sobre a Maralto Granéis?' },
    {
      speaker: 'André',
      text: 'Não.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Sobre os protestos daquela época?' },
    {
      speaker: 'André',
      text: 'Ela veio aqui falar da Elisa.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'E Morsa? Esse nome te diz alguma coisa?' },
    {
      speaker: 'André',
      text: 'Não.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Você respondeu rápido.' },
    {
      speaker: 'André',
      text: 'Quer que eu faça suspense pra ficar mais bonito no seu relatório?',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Mariana pesquisava Maralto e Morsa na mesma época em que vinha te visitar.' },
    {
      speaker: 'André',
      text: 'Então ela pesquisava um monte de coisa sem me contar. Não é novidade. A gente não estava exatamente trocando confidência de irmão.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Nunca mencionou nenhum dos dois?' },
    {
      speaker: 'André',
      text: 'Pra mim, não.\nSe você quer saber de Maralto, vai atrás de quem estava metido com Maralto. Não tenta encaixar tudo na minha cela porque fica mais fácil.',
      portrait: 'andre',
    },
  ],

  trust: [
    { speaker: 'Augusto', text: 'Por que você acha que Mariana voltou depois de tantos anos?' },
    {
      speaker: 'André',
      text: 'Essa é a pergunta que eu faria se estivesse no seu lugar.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Estou fazendo.' },
    {
      speaker: 'André',
      text: 'Então eu não sei.\nNão teve conversa nossa antes. Não teve pedido de desculpa. Não teve família fazendo ponte. Ela só apareceu aqui um dia querendo reabrir uma história que tinha enterrado junto comigo.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Você acha que alguém colocou isso na cabeça dela?' },
    {
      speaker: 'André',
      text: 'Eu acho que gente como você adora essa pergunta porque sempre precisa ter alguém puxando a corda.\nÀs vezes a pessoa só cansa de aceitar a história que deram pra ela.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Mas você mesmo disse que ela não estava bem.' },
    {
      speaker: 'André',
      text: 'Uma coisa não apaga a outra.\nEla podia estar perdida e ainda assim ter percebido que tinha coisa errada. Mariana nunca foi burra.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Você pediu que ela parasse porque estava preocupado ou porque não queria que ela encontrasse alguma coisa?' },
    {
      speaker: 'André',
      text: 'Olha o delegado aparecendo agora.\nVocê já decidiu que se eu protejo minha irmã é porque estou escondendo cadáver no armário?',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Eu fiz uma pergunta.' },
    {
      speaker: 'André',
      text: 'E eu te dei uma resposta. Eu não queria a Mariana afundando nisso.\nEla já tinha perdido seis anos por causa dessa história. Eu não ia ficar batendo palma enquanto ela perdia mais.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Tem mais alguma coisa que eu deveria saber?' },
    {
      speaker: 'André',
      text: 'Tem. Descobre por que ela começou.\nNão por que ela veio me ver. Isso é fácil. Descobre o que fez ela olhar pra tudo de novo depois de tanto tempo.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Você quer saber também.' },
    {
      speaker: 'André',
      text: 'É minha irmã.\nClaro que eu quero saber.',
      portrait: 'andre',
    },
  ],
}
