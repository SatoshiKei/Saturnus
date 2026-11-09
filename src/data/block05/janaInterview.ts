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
    { speaker: 'Jana', text: 'Sim.' },
    { speaker: 'Augusto', text: 'Delegado Augusto Nogueira. É sobre Elisa Duarte.' },
    { speaker: 'Jana', text: 'Claro que é.' },
    { speaker: 'Augusto', text: 'Posso entrar?' },
    { speaker: 'Jana', text: 'Prefiro que não.' },
    { speaker: 'Augusto', text: 'Tudo bem.' },
    { speaker: 'Jana', text: 'Eu já falei sobre aquela noite. Mais de uma vez.' },
    {
      speaker: 'Augusto',
      text: 'Eu sei.\n\nEstou atrás de um detalhe que quase não aparece nos autos.',
    },
  ],
  jacket: [
    { speaker: 'Jana', text: 'Qual?' },
    { speaker: 'Augusto', text: 'A jaqueta que Elisa usava quando saiu do Vértice.' },
    { speaker: 'Jana', text: 'Era minha.' },
    { speaker: 'Augusto', text: 'Ela pegou emprestada?' },
    { speaker: 'Jana', text: 'Pegou.' },
    { speaker: 'Augusto', text: 'Por quê?' },
    { speaker: 'Jana', text: 'Estava frio.\n\nEla pediu. Eu dei.' },
    { speaker: 'Augusto', text: 'Só isso?' },
    { speaker: 'Jana', text: 'O que mais você quer que uma jaqueta signifique?' },
  ],
  andre: [
    {
      speaker: 'Augusto',
      text: 'Nada, se for só uma jaqueta.\n\nO problema é que alguém se lembrou dela seis anos depois e Mariana passou semanas perguntando sobre a mesma peça.',
    },
    {
      speaker: 'Jana',
      text: 'Mariana era irmã do André.\n\nEla procurava qualquer coisa que pudesse mudar o que aconteceu.',
    },
  ],
  close: [
    { speaker: 'Augusto', text: 'E você?' },
    { speaker: 'Jana', text: 'Eu queria esquecer.' },
    { speaker: 'Augusto', text: 'Isso eu já percebi.' },
    { speaker: 'Jana', text: 'Então percebe também que não é a mesma coisa que esconder um crime.' },
  ],
}
