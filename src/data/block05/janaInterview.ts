export type JanaTopicId = 'night' | 'jacket' | 'andre' | 'close'

export const JANA_TOPIC_IDS: JanaTopicId[] = ['night', 'jacket', 'andre', 'close']

export const janaTopicLabels: Record<JanaTopicId, string> = {
  night: 'A noite',
  jacket: 'A jaqueta',
  andre: 'Mariana e André',
  close: 'Esquecer',
}

export const janaTopicFlags: Record<JanaTopicId, string> = {
  night: 'block05_jana_night',
  jacket: 'block05_jana_jacket',
  andre: 'block05_jana_andre',
  close: 'block05_jana_close',
}

export type JanaBeat = { speaker?: string; text: string }

export const janaBeats: Record<JanaTopicId, JanaBeat[]> = {
  night: [
    { speaker: 'Augusto', text: 'Jana Ribeiro?' },
    {
      speaker: 'Jana',
      text: 'Sou eu.\nVocê é o terceiro ou quarto delegado do mês? Brincadeira. Mais ou menos.',
    },
    {
      speaker: 'Augusto',
      text: 'Delegado Augusto Nogueira. É sobre Elisa Duarte.',
    },
    {
      speaker: 'Jana',
      text: 'Claro que é.\nNinguém bate na minha porta à tarde pra perguntar do tempo.',
    },
    { speaker: 'Augusto', text: 'Posso entrar?' },
    {
      speaker: 'Jana',
      text: 'Prefiro que não.\nAqui dentro virou depósito de roupa e conta atrasada.\nA gente conversa na porta, tá?',
    },
    { speaker: 'Augusto', text: 'Tudo bem.' },
    {
      speaker: 'Jana',
      text: 'Eu já falei daquela noite. Mais de uma vez.\nEm juízo, fora do juízo, com amiga chorando na linha.\nCara, isso faz quinze anos.',
    },
    {
      speaker: 'Augusto',
      text: 'Eu sei.\nEstou atrás de um detalhe que quase não aparece nos autos.',
    },
    { speaker: 'Augusto', text: 'Na noite, você já estava indo embora?' },
    {
      speaker: 'Jana',
      text: 'Tinha me despedido. Quer dizer, eu estava indo.\nAí começou aquela do Avicii.',
    },
    { speaker: 'Augusto', text: 'Levels?' },
    {
      speaker: 'Jana',
      text: 'Essa.\nEu era completamente idiota por aquela música.\nVoltei pra pista. Cinco minutos, dez, sei lá.\nNão foi decisão filosófica. Só gostava do refrão pra caralho.',
    },
    {
      speaker: 'Augusto',
      text: 'E a Elisa?',
    },
    {
      speaker: 'Jana',
      text: 'Ficou comigo na música.\nAchou graça porque eu tinha feito corpo mole de ir embora.\nNa hora não pensei que isso ia virar peça de nada.',
    },
  ],
  jacket: [
    {
      speaker: 'Jana',
      text: 'Qual detalhe agora?\nVocê fala como se a noite tivesse legenda.',
    },
    { speaker: 'Augusto', text: 'A jaqueta que Elisa usava quando saiu do Vértice.' },
    {
      speaker: 'Jana',
      text: 'Era minha.\nClara, porque eu tinha perdido a noção do dress code lá em 2009.',
    },
    { speaker: 'Augusto', text: 'Ela pegou emprestada?' },
    { speaker: 'Jana', text: 'Pegou.\nTipo, pegou mesmo. Sem drama.' },
    { speaker: 'Augusto', text: 'Por quê?' },
    {
      speaker: 'Jana',
      text: 'Estava frio na saída. Aquela corrente de ar que parece piada de arquiteto.\nEla pediu. Eu dei.\nGente faz isso na fila do banheiro, Augusto.',
    },
    { speaker: 'Augusto', text: 'Só isso?' },
    {
      speaker: 'Jana',
      text: 'Só isso na minha cabeça na hora.\nO que mais você quer que uma jaqueta signifique? Romance de época?',
    },
  ],
  andre: [
    {
      speaker: 'Augusto',
      text: 'Nada, se for só uma jaqueta.\n\nO problema é que alguém se lembrou dela seis anos depois e Mariana passou semanas perguntando sobre a mesma peça.',
    },
    {
      speaker: 'Jana',
      text: 'Mariana era irmã do André.\nClaro que ia fuçar qualquer coisa que movesse um milímetro.\nEla não queria roupa. Ela queria um furo na história pronta.',
    },
  ],
  close: [
    { speaker: 'Augusto', text: 'E você?' },
    {
      speaker: 'Jana',
      text: 'Eu queria esquecer.\nNão era só Elisa. Era a noite inteira. Era eu com vinte e poucos anos fazendo merda banal achando que a vida era só sexta e sábado.',
    },
    { speaker: 'Augusto', text: 'Isso eu já percebi.' },
    {
      speaker: 'Jana',
      text: 'Então percebe também que não é a mesma coisa que esconder crime.\nEu não apaguei memória de propósito. Só não quero viver nela de novo.',
    },
  ],
}