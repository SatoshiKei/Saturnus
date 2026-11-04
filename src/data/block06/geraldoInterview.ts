export type GeraldoTopicId = 'night' | 'drinks' | 'pressure' | 'admit'

export const GERALDO_TOPIC_IDS: GeraldoTopicId[] = ['night', 'drinks', 'pressure', 'admit']

export const geraldoTopicLabels: Record<GeraldoTopicId, string> = {
  night: 'A noite no Vértice',
  drinks: 'O que Elisa bebeu',
  pressure: 'A comanda e o fechamento',
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
    { speaker: 'Augusto', text: 'Geraldo Mota? Polícia Civil. Preciso revisar o que você disse sobre a noite em que Elisa Duarte morreu.' },
    { speaker: 'Geraldo', text: 'Isso já acabou.\nFaz seis anos.\nEu depus. André foi condenado.' },
    { speaker: 'Augusto', text: 'Horário. Movimento. O que ela bebeu. Como parecia.' },
    { speaker: 'Geraldo', text: 'Eu estava no bar.\nO salão cheio.\nEla e o namorado discutiram.\nEla saiu.\nPonto.' },
  ],
  drinks: [
    { speaker: 'Augusto', text: 'No depoimento você disse que quase não serviu nada para ela.' },
    { speaker: 'Geraldo', text: 'Foi o que eu lembrei.\nUma, talvez duas.\nNão fiquei contando copo.' },
    { speaker: 'Augusto', text: 'Você sabia a idade dela?' },
    { speaker: 'Geraldo', text: '…\nEu não perguntava documento pra todo mundo.' },
  ],
  pressure: [
    { speaker: 'Augusto', text: 'Temos a comanda daquela noite e o fechamento de caixa do bar. O volume no horário dela não casa com “quase nada”.' },
    { speaker: 'Geraldo', text: 'Comanda não prova o que cada pessoa bebeu.' },
    { speaker: 'Augusto', text: 'Prova que a sua versão “quase não servi” não se sustenta. E o cartão de menor no cadastro de entrada ainda existe nos autos do Vértice.' },
    { speaker: 'Geraldo', text: '…' },
  ],
  admit: [
    { speaker: 'Geraldo', text: 'Eu minimiizei.\nServi mais do que declarei.\nE eu… suspeitava que ela era menor.' },
    { speaker: 'Augusto', text: 'Por quê?' },
    { speaker: 'Geraldo', text: 'Porque admitir isso na época me queimava.\nAdministrativo. Trabalho. Talvez pior.\nEu protegi a mim mesmo.\nNão conspirei com ninguém.' },
    { speaker: 'Augusto', text: 'Quanto exatamente?' },
    { speaker: 'Geraldo', text: 'Não sei o número clínico.\nSei que não foi “quase nada”.\nEla estava mais alcoolizada do que eu deixei no papel.' },
  ],
}
