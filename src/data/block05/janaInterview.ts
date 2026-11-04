export type JanaTopicId = 'night' | 'jacket' | 'andre' | 'close'

export const JANA_TOPIC_IDS: JanaTopicId[] = ['night', 'jacket', 'andre', 'close']

export const janaTopicLabels: Record<JanaTopicId, string> = {
  night: 'A noite no Vértice',
  jacket: 'A jaqueta',
  andre: 'André e o processo',
  close: 'Por que encerrar',
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
    { speaker: 'Augusto', text: 'Jana Ribeiro? Sou Augusto Nogueira, Polícia Civil. Preciso de alguns minutos sobre a noite em que Elisa Duarte morreu.' },
    { speaker: 'Jana', text: 'Eu já falei isso.\nFaz seis anos.\nO caso acabou.' },
    { speaker: 'Augusto', text: 'Para a Justiça, talvez. Para mim, ainda não.' },
    { speaker: 'Jana', text: 'Eu estava lá.\nEu vi a discussão.\nEu vi ela sair.\nNão sei o que mais você quer.' },
  ],
  jacket: [
    { speaker: 'Augusto', text: 'Sobre a jaqueta que Elisa usava ao sair.' },
    { speaker: 'Jana', text: '…' },
    { speaker: 'Augusto', text: 'Era sua?' },
    { speaker: 'Jana', text: 'Era.\nEla pegou emprestada naquela noite.\nEstava frio na saída.\nSó isso.' },
    { speaker: 'Augusto', text: 'Por que isso não aparece com clareza nos autos?' },
    { speaker: 'Jana', text: 'Porque ninguém perguntou direito.\nE porque não muda nada.\nUma jaqueta não empurra ninguém.' },
  ],
  andre: [
    { speaker: 'Augusto', text: 'Você acha que André matou Elisa?' },
    { speaker: 'Jana', text: 'O júri achou.\nAs provas apontavam pra ele.\nEu não estou aqui para reabrir processo.' },
    { speaker: 'Augusto', text: 'A irmã dele desapareceu. Ela estava revisando aquela noite.' },
    { speaker: 'Jana', text: 'Então ela também está presa no passado.\nNão sou a pessoa certa pra isso.' },
  ],
  close: [
    { speaker: 'Augusto', text: 'Se lembrar de mais alguma coisa sobre a saída dela…' },
    { speaker: 'Jana', text: 'Não vou lembrar.\nNão quero.\nA peça era minha, ela pediu, eu emprestei.\nFim.' },
    { speaker: 'Augusto', text: 'Você parece desconfortável.' },
    { speaker: 'Jana', text: 'Desconfortável é você bater na porta seis anos depois por causa de uma jaqueta.\nPor favor… deixe isso quieto.' },
  ],
}
