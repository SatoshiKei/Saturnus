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
    {
      speaker: 'Augusto',
      text: 'Vamos começar pelo presente. Galpão 17, cobrança, empréstimo por fora, gente apanhando quando não paga. Você quer me dizer que estava ali por acaso?',
    },
    {
      speaker: 'Miro',
      text: 'Quero dizer que vocês chegaram com seis viaturas e já decidiram o nome de tudo antes de perguntar qualquer coisa.',
    },
    {
      speaker: 'Augusto',
      text: 'Tem planilha de cobrança, telefone apreendido, rádio, gente apontando vocês como quem fazia a pressão. Não estou começando do zero.',
    },
    {
      speaker: 'Miro',
      text: 'Então também sabe que eu não sou dono de nada.',
    },
    {
      speaker: 'Augusto',
      text: 'Eu sei que você trabalha com Válter há anos.',
    },
    {
      speaker: 'Miro',
      text: 'Trabalho com muita gente.',
    },
    {
      speaker: 'Augusto',
      text: 'Não. Com Válter você fica.',
    },
    {
      speaker: 'Miro',
      text: 'Você quer que eu diga o quê? Que conheço o homem? Conheço. Que já fiz serviço pra ele? Já fiz. Isso não transforma qualquer coisa que ele toca numa quadrilha.',
    },
    {
      speaker: 'Augusto',
      text: 'Extorsão, agiotagem e cobrança violenta já ajudam bastante.',
    },
    {
      speaker: 'Miro',
      text: 'Você fala como se já tivesse sentença.',
    },
    {
      speaker: 'Augusto',
      text: 'Não tenho sentença. Tenho você sentado aqui e um monte de coisa apreendida lá dentro.',
    },
    {
      speaker: 'Miro',
      text: 'Então pergunta do galpão.',
    },
    {
      speaker: 'Augusto',
      text: 'Estou perguntando do Válter.',
    },
    {
      speaker: 'Miro',
      text: 'E eu estou te dizendo que esse nome não vai sair de mim do jeito que você quer.',
    },
  ],

  jana: [
    {
      speaker: 'Augusto',
      text: 'Tudo bem. Vamos por outro caminho. Jana Ribeiro.',
    },
    {
      speaker: 'Miro',
      text: 'O que tem ela?',
    },
    {
      speaker: 'Augusto',
      text: 'Você conhece.',
    },
    {
      speaker: 'Miro',
      text: 'Conheço.',
    },
    {
      speaker: 'Augusto',
      text: 'Ela disse que, seis anos atrás, estava com medo de gente ligada ao Válter.',
    },
    {
      speaker: 'Miro',
      text: 'Ela fala muita coisa quando está com medo.',
    },
    {
      speaker: 'Augusto',
      text: 'E você estava atrás dela naquela noite.',
    },
    {
      speaker: 'Miro',
      text: 'Quem te disse isso?',
    },
    {
      speaker: 'Augusto',
      text: 'Ela.',
    },
    {
      speaker: 'Miro',
      text: 'Demorou bastante pra resolver lembrar.',
    },
    {
      speaker: 'Augusto',
      text: 'Você estava levando recado do Válter?',
    },
    {
      speaker: 'Miro',
      text: 'Não põe palavra na minha boca.',
    },
    {
      speaker: 'Augusto',
      text: 'Você é leal. Eu já entendi. O problema é que lealdade não diminui pena.',
    },
    {
      speaker: 'Miro',
      text: 'E delação não apaga ficha.',
    },
    {
      speaker: 'Augusto',
      text: 'Não. Mas cooperação conta. Principalmente quando ajuda a esclarecer coisa que ficou enterrada por anos.',
    },
    {
      speaker: 'Miro',
      text: 'Aí chegou onde você queria.',
    },
    {
      speaker: 'Augusto',
      text: 'Cheguei onde você pode escolher parar de carregar tudo sozinho.',
    },
    {
      speaker: 'Miro',
      text: 'Você vende bem.',
    },
    {
      speaker: 'Augusto',
      text: 'Não estou vendendo absolvição. Estou te dizendo que, se você colaborar de verdade, isso vai ser registrado e encaminhado. O resto depende do Ministério Público e do processo.',
    },
    {
      speaker: 'Miro',
      text: 'E você quer o quê em troca?',
    },
    {
      speaker: 'Augusto',
      text: 'A verdade sobre aquela noite. Começa pela Jana.',
    },
  ],

  night: [
    {
      speaker: 'Miro',
      text: 'Eu precisava falar com ela. Só isso.',
    },
    {
      speaker: 'Augusto',
      text: 'E quando ela saiu do Vértice?',
    },
    {
      speaker: 'Miro',
      text: 'Eu vi uma jaqueta clara e a bolsa dela saindo pela lateral.',
    },
    {
      speaker: 'Augusto',
      text: 'Você seguiu.',
    },
    {
      speaker: 'Miro',
      text: 'Segui.',
    },
    {
      speaker: 'Augusto',
      text: 'Achando que era Jana.',
    },
    {
      speaker: 'Miro',
      text: 'Era a roupa dela. De costas, naquela luz, parecia ela.',
    },
    {
      speaker: 'Augusto',
      text: 'Mas não era.',
    },
    {
      speaker: 'Miro',
      text: 'Não.',
    },
    {
      speaker: 'Augusto',
      text: 'Era Elisa Duarte.',
    },
    {
      speaker: 'Miro',
      text: 'Era.',
    },
    {
      speaker: 'Augusto',
      text: 'Quando percebeu?',
    },
    {
      speaker: 'Miro',
      text: 'Mais abaixo. Quando ela virou de lado.',
    },
    {
      speaker: 'Augusto',
      text: 'E mesmo assim continuou seguindo.',
    },
    {
      speaker: 'Miro',
      text: 'Por um tempo.',
    },
    {
      speaker: 'Augusto',
      text: 'Por quê?',
    },
    {
      speaker: 'Miro',
      text: 'Porque eu tinha acabado de seguir a pessoa errada por vários minutos. Eu queria saber até onde tinha feito merda.',
    },
    {
      speaker: 'Augusto',
      text: 'Você sabia que Elisa era amiga da Jana?',
    },
    {
      speaker: 'Miro',
      text: 'Sabia de vista. Não conhecia a garota.',
    },
    {
      speaker: 'Augusto',
      text: 'Você chegou perto da região onde ela caiu.',
    },
    {
      speaker: 'Miro',
      text: 'Cheguei perto.',
    },
    {
      speaker: 'Augusto',
      text: 'Isso ficou fora do processo.',
    },
    {
      speaker: 'Miro',
      text: 'Muita coisa ficou.',
    },
    {
      speaker: 'Augusto',
      text: 'Agora você tem interesse em corrigir.',
    },
    {
      speaker: 'Miro',
      text: 'Agora eu tenho interesse em não carregar crime dos outros junto com os meus.',
    },
  ],

  deny: [
    {
      speaker: 'Augusto',
      text: 'Então vamos tirar uma coisa do caminho. Você encostou na Elisa?',
    },
    {
      speaker: 'Miro',
      text: 'Não.',
    },
    {
      speaker: 'Augusto',
      text: 'Falou com ela?',
    },
    {
      speaker: 'Miro',
      text: 'Não.',
    },
    {
      speaker: 'Augusto',
      text: 'Ela percebeu você?',
    },
    {
      speaker: 'Miro',
      text: 'Olhou pra trás uma vez. Pode ter ouvido passo. Pode ter me visto. Não sei.',
    },
    {
      speaker: 'Augusto',
      text: 'E você parou de seguir.',
    },
    {
      speaker: 'Miro',
      text: 'Parei.',
    },
    {
      speaker: 'Augusto',
      text: 'Mas voltou praquela região depois.',
    },
    {
      speaker: 'Miro',
      text: 'Voltei pelo mesmo caminho.',
    },
    {
      speaker: 'Augusto',
      text: 'Depois da queda.',
    },
    {
      speaker: 'Miro',
      text: 'Depois.',
    },
    {
      speaker: 'Augusto',
      text: 'Você viu ela no chão.',
    },
    {
      speaker: 'Miro',
      text: 'Vi.',
    },
    {
      speaker: 'Augusto',
      text: 'Chamou socorro?',
    },
    {
      speaker: 'Miro',
      text: 'Não.',
    },
    {
      speaker: 'Augusto',
      text: 'Por quê?',
    },
    {
      speaker: 'Miro',
      text: 'Porque eu entrei em pânico e pensei primeiro na Jana.',
    },
    {
      speaker: 'Augusto',
      text: 'Na Jana ou no Válter?',
    },
    {
      speaker: 'Miro',
      text: 'Na Jana.',
    },
    {
      speaker: 'Augusto',
      text: 'O que você fez?',
    },
    {
      speaker: 'Miro',
      text: 'Peguei a bolsa.',
    },
    {
      speaker: 'Augusto',
      text: 'Da cena.',
    },
    {
      speaker: 'Miro',
      text: 'Da cena.',
    },
    {
      speaker: 'Augusto',
      text: 'Pra apagar a ligação dela com aquilo.',
    },
    {
      speaker: 'Miro',
      text: 'Sim.',
    },
    {
      speaker: 'Augusto',
      text: 'Isso é adulteração de cena e ocultação de evidência.',
    },
    {
      speaker: 'Miro',
      text: 'Eu sei o que é agora.',
    },
    {
      speaker: 'Augusto',
      text: 'Tem uma testemunha que viu um homem voltando dali e disse que era André.',
    },
    {
      speaker: 'Miro',
      text: 'Pode ter me visto.',
    },
    {
      speaker: 'Augusto',
      text: 'Você admite que podia ser você.',
    },
    {
      speaker: 'Miro',
      text: 'Admito.',
    },
    {
      speaker: 'Augusto',
      text: 'E ainda quer que eu aceite que não empurrou Elisa.',
    },
    {
      speaker: 'Miro',
      text: 'Eu estou te dando tudo que me ferra e que você consegue conferir. Se eu quisesse montar história bonita, não começava admitindo que segui a garota errada e roubei a bolsa depois que ela caiu.',
    },
    {
      speaker: 'Augusto',
      text: 'Isso não responde.',
    },
    {
      speaker: 'Miro',
      text: 'Responde do jeito que importa. Eu estava lá. Eu menti. Eu mexi na cena. Mas não matei a Elisa.',
    },
    {
      speaker: 'Augusto',
      text: 'E por que eu deveria comprar essa parte?',
    },
    {
      speaker: 'Miro',
      text: 'Porque essa é justamente a parte que você não precisa comprar.',
    },
    {
      speaker: 'Miro',
      text: 'Confere o resto. Se eu estiver mentindo no que dá pra provar, você rasga qualquer possibilidade de acordo. Se eu estiver falando a verdade, aí você decide se continua tentando me dar uma morte que não é minha.',
    },
    {
      speaker: 'Augusto',
      text: 'E Válter?',
    },
    {
      speaker: 'Miro',
      text: 'Continua fora.',
    },
    {
      speaker: 'Augusto',
      text: 'Por enquanto.',
    },
    {
      speaker: 'Miro',
      text: 'Por enquanto.',
    },
  ],
}
