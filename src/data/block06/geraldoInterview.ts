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
    {
      speaker: 'Geraldo',
      text: 'Depende de quem está cobrando.',
    },
    { speaker: 'Augusto', text: 'Augusto Nogueira. Polícia Civil.' },
    {
      speaker: 'Geraldo',
      text: 'Ah, ótimo. Aí melhora bastante.',
    },
    { speaker: 'Augusto', text: 'Quero falar sobre Elisa Duarte.' },
    {
      speaker: 'Geraldo',
      text: '...Elisa.',
    },
    {
      speaker: 'Geraldo',
      text: 'Achei que esse nome não ia entrar mais por essa porta.',
    },
    { speaker: 'Augusto', text: 'Você lembra dela.' },
    {
      speaker: 'Geraldo',
      text: 'Lembro. Não porque eu queira.\nMenina nova morre depois de passar a noite no teu bar, você não esquece. Pode trocar placa, trocar funcionário, trocar metade das garrafas da prateleira. Aquela noite fica.',
    },
    { speaker: 'Augusto', text: 'Você depôs na época.' },
    {
      speaker: 'Geraldo',
      text: 'Depus. Polícia, fórum, advogado querendo me fazer repetir a mesma resposta de seis jeitos diferentes.\nDepois o André foi condenado e todo mundo seguiu a vida. Ou fingiu que seguiu.',
    },
  ],

  drinks: [
    { speaker: 'Augusto', text: 'No seu depoimento, Elisa quase não tinha bebido.' },
    {
      speaker: 'Geraldo',
      text: 'Foi o que eu falei.',
    },
    { speaker: 'Augusto', text: 'A comanda daquele grupo conta outra história.' },
    {
      speaker: 'Geraldo',
      text: 'Comanda conta copo. Não conta boca.',
    },
    { speaker: 'Augusto', text: 'Mas você estava atrás do balcão.' },
    {
      speaker: 'Geraldo',
      text: 'Eu e mais dois, com a casa cheia e gente pedindo três coisas ao mesmo tempo. Bar não é laboratório, delegado.',
    },
    { speaker: 'Augusto', text: 'Mesmo assim, você sabia quem era ela.' },
    {
      speaker: 'Geraldo',
      text: 'Sabia quem era depois que tudo aconteceu. Na hora era uma guria com amigos, rindo, pedindo bebida, indo e voltando da pista.',
    },
    { speaker: 'Augusto', text: 'E ela bebeu mais do que você contou.' },
    {
      speaker: 'Geraldo',
      text: 'Bebeu.',
    },
  ],

  pressure: [
    { speaker: 'Augusto', text: 'Você sabia que ela era menor.' },
    {
      speaker: 'Geraldo',
      text: 'Eu suspeitava.',
    },
    { speaker: 'Augusto', text: 'Isso é uma diferença conveniente.' },
    {
      speaker: 'Geraldo',
      text: 'É uma diferença de quem estava tentando não perder o emprego.\nHoje eu posso falar bonito porque o bar é meu. Naquela época eu era o cara que fechava caixa e torcia pra não faltar dinheiro no fim da noite.',
    },
    { speaker: 'Augusto', text: 'Então você serviu mesmo desconfiando.' },
    {
      speaker: 'Geraldo',
      text: 'Servi. E não foi pouco.',
    },
    { speaker: 'Augusto', text: 'Por que não disse isso seis anos atrás?' },
    {
      speaker: 'Geraldo',
      text: 'Porque eu fui covarde.',
    },
    {
      speaker: 'Geraldo',
      text: 'Quer uma resposta mais bonita? Não tenho.\nEu sabia que, se admitisse que tinha servido uma menor até ela ficar bêbada, iam jogar aquilo inteiro nas minhas costas. Então eu diminuí.',
    },
  ],

  admit: [
    { speaker: 'Augusto', text: 'Quanto ela bebeu?' },
    {
      speaker: 'Geraldo',
      text: 'Não sei te dar número. E se eu desse, estaria inventando.',
    },
    {
      speaker: 'Geraldo',
      text: 'Mas quando a Elisa saiu dali, não estava só “alegre”. Eu sabia disso naquela noite. Sabia quando depus também.',
    },
    { speaker: 'Augusto', text: 'E mesmo assim deixou isso de fora.' },
    {
      speaker: 'Geraldo',
      text: 'Deixei.',
    },
    { speaker: 'Augusto', text: 'Isso podia ter mudado a investigação.' },
    {
      speaker: 'Geraldo',
      text: 'Eu sei.',
    },
    {
      speaker: 'Geraldo',
      text: 'Essa é a parte que fica voltando, sabe? Na época eu só pensava no emprego. Depois ela morreu e virou impossível não pensar se cada coisa que a gente escondeu ajudou a empurrar a história pra um lado.',
    },
    { speaker: 'Augusto', text: 'Você acha que ajudou a condenar André?' },
    {
      speaker: 'Geraldo',
      text: 'Eu não sei.',
    },
    {
      speaker: 'Geraldo',
      text: 'Mas sei que eu ajudei a deixar a Elisa mais sóbria no papel do que ela estava de verdade. Isso foi meu. Não foi do André, não foi da polícia, não foi de advogado nenhum.',
    },
    {
      speaker: 'Geraldo',
      text: 'Foi meu.',
    },
  ],
}
