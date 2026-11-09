export type GeraldoTopicId = 'night' | 'drinks' | 'pressure' | 'admit'

export const GERALDO_TOPIC_IDS: GeraldoTopicId[] = ['night', 'drinks', 'pressure', 'admit']

export const geraldoTopicLabels: Record<GeraldoTopicId, string> = {
  night: 'A noite',
  drinks: 'O que Elisa bebeu',
  pressure: 'A comanda',
  admit: 'O que ficou de fora',
}

export const geraldoTopicFlags: Record<GeraldoTopicId, string> = {
  night: 'block06_geraldo_night',
  drinks: 'block06_geraldo_drinks',
  pressure: 'block06_geraldo_pressure',
  admit: 'block06_geraldo_admit',
}

export type GeraldoBeat = { speaker?: string; text: string }

export const geraldoBeats: Record<GeraldoTopicId, GeraldoBeat[]> = {
  night: [
    { speaker: 'Augusto', text: 'Geraldo Mota?' },
    { speaker: 'Geraldo', text: 'Quem pergunta?' },
    { speaker: 'Augusto', text: 'Augusto Nogueira. Polícia Civil.' },
    { speaker: 'Geraldo', text: 'Porra.\n\nÉ sobre o quê?' },
    { speaker: 'Augusto', text: 'Elisa Duarte.' },
    { speaker: 'Geraldo', text: 'Não.\n\nIsso já foi.' },
    { speaker: 'Augusto', text: 'Para você.' },
    {
      speaker: 'Geraldo',
      text: 'Eu depus. Fui no fórum. Respondi advogado. Respondi polícia. O André foi condenado.\n\nEu não tenho mais nada pra acrescentar.',
    },
  ],
  drinks: [
    { speaker: 'Augusto', text: 'Talvez tenha que corrigir.' },
    { speaker: 'Geraldo', text: 'Corrigir o quê?' },
    { speaker: 'Augusto', text: 'Você disse que quase não serviu bebida para Elisa naquela noite.' },
    { speaker: 'Geraldo', text: 'Foi o que eu lembrava.' },
    { speaker: 'Augusto', text: 'A comanda do bar não concorda.' },
    { speaker: 'Geraldo', text: 'A comanda não diz quem bebeu cada copo.' },
    {
      speaker: 'Augusto',
      text: 'Não.\n\nMas diz que naquele intervalo saiu muito mais coisa do que o seu depoimento faz parecer.',
    },
    { speaker: 'Geraldo', text: 'A casa estava cheia.' },
  ],
  pressure: [
    { speaker: 'Augusto', text: 'E o cadastro de entrada do grupo tinha indicação de menor.' },
    { speaker: 'Geraldo', text: 'Você veio aqui por causa disso?' },
    {
      speaker: 'Augusto',
      text: 'Vim porque eu quero saber o que aconteceu naquela noite, e seis anos atrás você tinha uma boa razão para fazer Elisa parecer mais sóbria do que estava.',
    },
    { speaker: 'Geraldo', text: 'Eu não queria perder o emprego.' },
    { speaker: 'Augusto', text: 'Então sabia.' },
    { speaker: 'Geraldo', text: 'Eu desconfiava.' },
    { speaker: 'Augusto', text: 'E serviu mesmo assim.' },
    { speaker: 'Geraldo', text: 'Servi.\n\nMais do que falei.' },
  ],
  admit: [
    { speaker: 'Augusto', text: 'Quanto?' },
    {
      speaker: 'Geraldo',
      text: 'Eu não sei.\n\nNão fiquei marcando o copo dela no papel.\n\nSó sei que quando ela saiu não tinha tomado “quase nada”.\n\nIsso eu posso te dizer agora.',
    },
    { speaker: 'Augusto', text: 'Por que mentiu?' },
    {
      speaker: 'Geraldo',
      text: 'Porque eu tinha vinte e poucos anos, precisava daquele trabalho e achei que a pergunta era “você fez alguma coisa errada?”, não “isso vai importar daqui a seis anos?”.\n\nEntão eu me protegi.',
    },
    { speaker: 'Augusto', text: 'Protegeu você.' },
    {
      speaker: 'Geraldo',
      text: 'É.\n\nEu.\n\nNão o André. Não sei porra nenhuma sobre quem matou a menina.',
    },
  ],
}
