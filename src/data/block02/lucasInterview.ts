export type LucasTopicId =
  | 'intro'
  | 'elisa'
  | 'relationship'
  | 'andre'
  | 'mariana_visit'

export const LUCAS_TOPIC_IDS: LucasTopicId[] = [
  'intro',
  'elisa',
  'relationship',
  'andre',
  'mariana_visit',
]

export const lucasTopicLabels: Record<LucasTopicId, string> = {
  intro: 'Como Mariana o procurou',
  elisa: 'Elisa Duarte',
  relationship: 'Relação com Elisa e André',
  andre: 'André Silva e a condenação',
  mariana_visit: 'O que Mariana perguntou',
}

export const lucasTopicFlags: Record<LucasTopicId, string> = {
  intro: 'block02_lucas_intro',
  elisa: 'block02_lucas_elisa',
  relationship: 'block02_lucas_relationship',
  andre: 'block02_lucas_andre',
  mariana_visit: 'block02_lucas_mariana_visit',
}

export type LucasBeat = { speaker?: string; text: string; portrait?: 'lucas' }

export const lucasBeats: Record<LucasTopicId, LucasBeat[]> = {
  intro: [
    { speaker: 'Augusto', text: 'Obrigado por me receber, Lucas. Sei que é um horário ruim.' },
    { speaker: 'Lucas', text: 'Tudo bem. Eu já imaginava que alguém ia aparecer.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Por quê?' },
    { speaker: 'Lucas', text: 'Ela veio aqui há uns meses. A Mariana.\nEu não a conhecia.\nNunca tinha visto aquela mulher na vida.', portrait: 'lucas' },
    { speaker: 'Lucas', text: 'Aconteceu alguma coisa com ela?', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Ela está desaparecida. É isso que estou tentando entender.' },
    { speaker: 'Lucas', text: '…Sinto muito. De verdade.', portrait: 'lucas' },
  ],
  elisa: [
    { speaker: 'Augusto', text: 'Sobre o que ela queria falar?' },
    { speaker: 'Lucas', text: 'Da Elisa.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Elisa quem?' },
    { speaker: 'Lucas', text: 'Elisa Duarte.\nA menina que morreu.\nSeis anos e eu ainda não sei dizer esse nome sem pensar duas vezes.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'O que Mariana queria saber sobre ela?' },
    { speaker: 'Lucas', text: 'Primeiro disse que era meia-irmã do André.\nAndré Silva.', portrait: 'lucas' },
    { speaker: 'Lucas', text: 'O homem que foi condenado.\nEla estava convencida de que ele não tinha feito aquilo.\nEu não acreditei.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Por quê?' },
    { speaker: 'Lucas', text: 'Eu conhecia a Elisa.\nE me lembro dele.\nAs coisas que vi.', portrait: 'lucas' },
  ],
  relationship: [
    { speaker: 'Augusto', text: 'Como você a conhecia?' },
    {
      speaker: 'Lucas',
      text: 'Ela queria estudar aqui.\nEstava vendo inscrição, bolsa, essas coisas.\nUma amiga em comum nos apresentou.\nEu levei ela pra conhecer o campus algumas vezes.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Eram próximos?' },
    { speaker: 'Lucas', text: 'Estávamos começando a ser amigos.\nNada além disso.\nAcho que ela precisava de alguém com quem falar de outra coisa.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'E André? Ele sabia?' },
    { speaker: 'Lucas', text: 'Sabia. E não gostava.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'Ciúmes de você?' },
    {
      speaker: 'Lucas',
      text: 'De mim.\nDa faculdade.\nDe qualquer coisa que a fizesse perceber que existia vida fora daquela cidade.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Você o viu ser violento?' },
    {
      speaker: 'Lucas',
      text: 'Não.\nViolento, não.\nMas vi ele fazer cena.\nPerguntar quem eu era, por que ela passava tanto tempo lá.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Ela pensava em terminar?' },
    { speaker: 'Lucas', text: 'Disse que estava pensando.\nNão por minha causa. Por causa dele.', portrait: 'lucas' },
    {
      speaker: 'Lucas',
      text: 'Ele andava afundado em aposta.\nElisa estava cansada.\nA universidade era a chance de uma vida diferente, e ele sentia isso.',
      portrait: 'lucas',
    },
  ],
  andre: [
    { speaker: 'Augusto', text: 'Você acha que foi ele?' },
    { speaker: 'Lucas', text: 'Acho.', portrait: 'lucas' },
    { speaker: 'Lucas', text: 'Eu queria achar outra coisa.\nSeria mais fácil dormir.', portrait: 'lucas' },
  ],
  mariana_visit: [
    { speaker: 'Augusto', text: 'Ela perguntou só isso?' },
    { speaker: 'Lucas', text: 'Perguntou mais.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'O quê?' },
    {
      speaker: 'Lucas',
      text: 'Horário.\nOnde a gente se encontrava.\nSe eu tinha alguma foto.\nSe alguém tinha visto o André comigo.\nCoisa de processo.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Explicou por quê?' },
    { speaker: 'Lucas', text: 'Queria provar que o irmão não tinha matado a Elisa.', portrait: 'lucas' },
    { speaker: 'Augusto', text: 'E o que você respondeu?' },
    { speaker: 'Lucas', text: 'Pedi pra ela parar.', portrait: 'lucas' },
    {
      speaker: 'Lucas',
      text: 'Seis anos depois, uma pessoa que eu nunca vi quer que eu lembre de conversa, de horário, de expressão de rosto.\nEu não consigo.\nSó sei que a Elisa morreu e que ele foi condenado.',
      portrait: 'lucas',
    },
  ],
}
