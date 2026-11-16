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
    { speaker: 'Augusto', text: 'Lucas Moreira?' },
    {
      speaker: 'Lucas',
      text: 'Sou eu. Entra.\nSe você veio de carro, pede pro porteiro liberar na saída. Esse prédio consegue transformar uma visita de dez minutos num processo de imigração.',
      portrait: 'lucas',
    },
    {
      speaker: 'Augusto',
      text: 'Augusto Nogueira, Polícia Civil. Preciso falar sobre Mariana Silva.',
    },
    {
      speaker: 'Lucas',
      text: 'Ah.\nTá. Eu imaginei que alguém acabaria aparecendo por causa dela. Só não achei que seria tão cedo.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Você conhecia a Mariana?' },
    {
      speaker: 'Lucas',
      text: 'Não antes de ela bater aqui em casa. Foi há alguns meses.\nEla chegou com uma cópia de um depoimento meu de seis anos atrás, cheio de marca-texto. Meu nome, minhas frases, tudo. Não é exatamente o tipo de visita que você esquece.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Ela está desaparecida.' },
    {
      speaker: 'Lucas',
      text: 'Pera. Desaparecida como?',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Estamos procurando por ela desde ontem.' },
    {
      speaker: 'Lucas',
      text: 'Caralho.\nTá. Senta. Se ela veio parar aqui antes de sumir, eu quero saber o que aconteceu também.',
      portrait: 'lucas',
    },
  ],

  elisa: [
    { speaker: 'Augusto', text: 'Esse depoimento era sobre o quê?' },
    {
      speaker: 'Lucas',
      text: 'Sobre a Elisa.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Quem é Elisa?' },
    {
      speaker: 'Lucas',
      text: 'Você não sabe?',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Não.' },
    {
      speaker: 'Lucas',
      text: 'Elisa Duarte.\nMataram ela numa festa no Vértice. Ela tinha dezessete anos. Eu tinha dezoito.\nFaz tempo que ninguém entra aqui sem saber esse nome.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Você depôs no caso?' },
    {
      speaker: 'Lucas',
      text: 'Depus. Contra o André Silva. Ele era namorado dela e é irmão da Mariana.\nFoi condenado pela morte da Elisa.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'E Mariana veio questionar o seu depoimento.' },
    {
      speaker: 'Lucas',
      text: 'No começo ela não falou desse jeito. Disse que queria entender umas coisas da época, perguntou se eu lembrava da Elisa, de quem andava com ela.\nDepois abriu meu depoimento na mesa. Aí ficou bem claro por que ela tinha vindo.',
      portrait: 'lucas',
    },
  ],

  relationship: [
    { speaker: 'Augusto', text: 'Você era próximo da Elisa?' },
    {
      speaker: 'Lucas',
      text: 'Estava ficando.\nUma amiga apresentou a gente porque a Elisa queria conhecer a faculdade. Eu estava no começo da engenharia e, naquela idade, achava que sabia explicar o campus inteiro. Mostrei laboratório, falei de vestibular, essas coisas.\nDepois a gente continuou se falando.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Você gostava dela?' },
    {
      speaker: 'Lucas',
      text: 'Gostava.\nMais do que eu deixava muito evidente, provavelmente. Mas ela tinha namorado. Nunca aconteceu nada entre a gente.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'André sabia de você?' },
    {
      speaker: 'Lucas',
      text: 'Sabia. E me odiava antes mesmo de ter motivo.\nUma vez apareceu no campus e começou a cobrar a Elisa na minha frente. Queria saber por que ela estava ali, com quem tinha falado, que horas ia embora. Aquele negócio de transformar qualquer saída numa prestação de contas.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Foi isso que você contou à polícia?' },
    {
      speaker: 'Lucas',
      text: 'Isso e o que ela me contava.\nO André tinha problema sério com aposta. Perdia dinheiro e depois fazia ela carregar o peso junto. Quando brigavam, ele virava a conversa até parecer que a culpa era dela.\nPra mim ele era abusivo. Eu falei exatamente isso no depoimento.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Você chegou a ver ele agredir a Elisa?' },
    {
      speaker: 'Lucas',
      text: 'Bater nela? Não.\nMas, meu, eu conhecia o tipo. Você não precisa ver um cara dar um soco pra perceber quando uma menina está cansada de pedir licença pra viver a própria vida.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Ela queria terminar?' },
    {
      speaker: 'Lucas',
      text: 'Queria sair daquela relação. Falava nisso comigo.\nNão era uma hipótese que eu montei depois que ela morreu. Ela estava de saco cheio dele.',
      portrait: 'lucas',
    },
  ],

  andre: [
    { speaker: 'Augusto', text: 'E pra você foi André quem matou Elisa.' },
    {
      speaker: 'Lucas',
      text: 'Foi.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Sem dúvida?' },
    {
      speaker: 'Lucas',
      text: 'Augusto, ele foi investigado, julgado e condenado. Eu não tirei o nome do André de uma cartola.\nNa época eu contei o que sabia sobre os dois e aquilo fazia sentido com o resto do caso. Ainda faz.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Então o que incomodou nas perguntas da Mariana?' },
    {
      speaker: 'Lucas',
      text: 'Ela pegava uma coisa que eu dizia e desmontava até sobrar quase nada.\nEu falava que o André controlava a Elisa. Ela perguntava se eu tinha visto ele bater nela. Eu falava que não. Aí vinha outra pergunta, como se esse “não” apagasse todo o resto.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Ela disse que você estava mentindo?' },
    {
      speaker: 'Lucas',
      text: 'Não. E talvez por isso tenha me irritado tanto.\nEla era educada. Ficava ali com aquela calma, voltando na mesma frase até eu começar a parecer um idiota por ter certeza de alguma coisa.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Você acha que ela queria inocentar o irmão.' },
    {
      speaker: 'Lucas',
      text: 'Claro que queria.\nE, olha, eu até entendo. Se fosse meu irmão, talvez eu fizesse alguma loucura também. Só que o André já tinha tido julgamento, defesa, recurso, tudo. A Elisa não podia se defender de mais nada.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Mariana tentou mudar sua versão sobre André?' },
    {
      speaker: 'Lucas',
      text: 'Tentou mudar o peso dela.\nPra Mariana, uma coisa era eu ter visto o André controlando a Elisa. Outra era a Elisa ter me contado o que acontecia quando eles estavam sozinhos. Ela queria separar isso.\nPra mim continuava sendo a mesma história sobre o mesmo cara.',
      portrait: 'lucas',
    },
  ],

  mariana_visit: [
    { speaker: 'Augusto', text: 'Ela perguntou só sobre o depoimento?' },
    {
      speaker: 'Lucas',
      text: 'Não. Depois começou a puxar horário.\nQueria saber quando eu costumava ver a Elisa na faculdade e se eu lembrava de quando o André aparecia. Pediu foto antiga também.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Você tinha alguma coisa guardada?' },
    {
      speaker: 'Lucas',
      text: 'Foto, principalmente. Passei uma noite inteira descendo Google Fotos até 2020 e mandei o que achei.\nAí ela voltou com mais pergunta em cima das mesmas coisas.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Que tipo de pergunta?' },
    {
      speaker: 'Lucas',
      text: 'Coisa do tipo “você sabe que ele estava lá ou lembra dele estar lá?”.\nParece pouca diferença quando eu falo agora. Na hora dava vontade de mandar ela embora.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Mandou?' },
    {
      speaker: 'Lucas',
      text: 'Na última vez, mandei.\nEu falei que ela estava usando a Elisa pra tentar salvar o André. Falei pior do que isso, na verdade. Eu estava puto.',
      portrait: 'lucas',
    },
    { speaker: 'Augusto', text: 'Foi a última vez que vocês se falaram?' },
    {
      speaker: 'Lucas',
      text: 'Foi.\nEla ficou quieta um tempo, guardou os papéis e foi embora. Eu nem acompanhei até a porta.',
      portrait: 'lucas',
    },
    {
      speaker: 'Lucas',
      text: 'E agora você senta na minha sala e me diz que ela desapareceu.\nEntão, sim, essa última conversa está batendo um pouco diferente hoje.',
      portrait: 'lucas',
    },
  ],
}
