/** Dicas diegéticas da Mari durante puzzles forenses (2–3 por sessão). */

export type MariPuzzleHint = {
  id: string
  seenFlag: string
  tier: 1 | 2 | 3
  text: string
}

export type MariPuzzleHintPack = {
  puzzleId: string
  hints: MariPuzzleHint[]
}

export const MARI_PUZZLE_HINTS: MariPuzzleHintPack[] = [
  {
    puzzleId: 'puzzle-01-cassini',
    hints: [
      {
        id: 'p01-h1',
        seenFlag: 'mari_p01_h1_seen',
        tier: 1,
        text: 'Esse áudio da central parece mastigado. Antes de desistir, abre o espectro e vê onde o sinal mais apita, costuma ser o lugar de começar o recorte.',
      },
      {
        id: 'p01-h2',
        seenFlag: 'mari_p01_h2_seen',
        tier: 2,
        text: 'Achou a frequência, mas a voz ainda engasga? Aprofunda o notch devagar e dá play de novo em cima do trecho, aqui o ouvido cobra o que o gráfico prometeu.',
      },
      {
        id: 'p01-h3',
        seenFlag: 'mari_p01_h3_seen',
        tier: 3,
        text: 'Se só falta o final, o truque não é mais notch: marca um pedacinho sem fala, captura o perfil de ruído e só então passa a redução espectral, e ouve de novo, senão não conta.',
      },
    ],
  },
  {
    puzzleId: 'puzzle-02-iapetus',
    hints: [
      {
        id: 'p02-h1',
        seenFlag: 'mari_p02_h1_seen',
        tier: 1,
        text: 'Esse corte tá limpo demais pra parecer o fim da gravação. Eu olharia o arquivo antes de tentar limpar o áudio.',
      },
      {
        id: 'p02-h2',
        seenFlag: 'mari_p02_h2_seen',
        tier: 2,
        text: 'Tem uma página quebrando a sequência. Se o container perdeu a ordem, remontar vem antes de qualquer outra análise.',
      },
      {
        id: 'p02-h3',
        seenFlag: 'mari_p02_h3_seen',
        tier: 3,
        text: 'Agora não para onde o áudio parava antes. Joga o playhead pra depois do corte e escuta o que voltou.',
      },
    ],
  },
  {
    puzzleId: 'puzzle-03-anels',
    hints: [
      {
        id: 'p03-h1',
        seenFlag: 'mari_p03_h1_seen',
        tier: 1,
        text: 'Tem uma voz de homem enterrada aí no meio da pista. Antes de tentar entender o que ele fala, acha onde ela aparece.',
      },
      {
        id: 'p03-h2',
        seenFlag: 'mari_p03_h2_seen',
        tier: 2,
        text: 'Pra limpar isso, pega um trecho em que tenha praticamente só a música. Perfil contaminado pela própria voz vai piorar justamente o que você quer recuperar.',
      },
      {
        id: 'p03-h3',
        seenFlag: 'mari_p03_h3_seen',
        tier: 3,
        text: 'A voz já começou a sair. Agora passa o play em cima desse trecho, a bancada só registra fala recuperada enquanto você realmente escuta.',
      },
    ],
  },
  {
    puzzleId: 'puzzle-04-janus-epimetheus',
    hints: [
      {
        id: 'p04-h1',
        seenFlag: 'mari_p04_h1_seen',
        tier: 1,
        text: 'Duas gravações da mesma noite e cada relógio cantando uma hora diferente? Puxa os dois áudios na mesma régua pra ver onde eles se encostam.',
      },
      {
        id: 'p04-h2',
        seenFlag: 'mari_p04_h2_seen',
        tier: 2,
        text: 'Vai ajustando o alinhamento até o pico bater direitinho. Quando ficar certinho, salva o estado antes de mexer na referência de tempo.',
      },
      {
        id: 'p04-h3',
        seenFlag: 'mari_p04_h3_seen',
        tier: 3,
        text: 'Só alinhar o som não converte a hora do registro pro relógio de fora. Aplica o deslocamento de referência no tempo depois de salvar o alinhamento.',
      },
    ],
  },
  {
    puzzleId: 'puzzle-05-saturnalia',
    hints: [
      {
        id: 'p05-h1',
        seenFlag: 'mari_p05_h1_seen',
        tier: 1,
        text: 'Dez slots e um log de buffer. Antes de ficar tentando adivinhar a história pelo número do arquivo, vê como esse gravador estava escrevendo.',
      },
      {
        id: 'p05-h2',
        seenFlag: 'mari_p05_h2_seen',
        tier: 2,
        text: 'Buffer circular cheio não começa necessariamente no slot zero. O próximo lugar de escrita também te diz onde está o conteúdo mais antigo que ainda sobrou.',
      },
      {
        id: 'p05-h3',
        seenFlag: 'mari_p05_h3_seen',
        tier: 3,
        text: 'Se acha que fechou, monta tudo e roda a continuidade. O ouvido ajuda a montar, a sequência inteira é que confirma.',
      },
    ],
  },
  {
    puzzleId: 'puzzle-06-hexagon',
    hints: [
      {
        id: 'p06-h1',
        seenFlag: 'mari_p06_h1_seen',
        tier: 1,
        text: 'Esses seis arquivos não parecem dizer muita coisa no ouvido. Abre um deles no espectrograma.',
      },
      {
        id: 'p06-h2',
        seenFlag: 'mari_p06_h2_seen',
        tier: 2,
        text: 'Compara o desenho, não a frequência exata. Tem formas simples se repetindo de arquivo pra arquivo.',
      },
      {
        id: 'p06-h3',
        seenFlag: 'mari_p06_h3_seen',
        tier: 3,
        text: 'Guarda uma leitura pra cada arquivo e não perde a ordem original. Se trocar duas posições agora, qualquer coisa que você montar depois nasce errada.',
      },
    ],
  },
  {
    puzzleId: 'puzzle-07-shepherd-moons',
    hints: [
      {
        id: 'p07-h1',
        seenFlag: 'mari_p07_h1_seen',
        tier: 1,
        text: 'Tem duas faixas gritando e alguma coisa bem mais fraca presa no meio. Waterfall primeiro.',
      },
      {
        id: 'p07-h2',
        seenFlag: 'mari_p07_h2_seen',
        tier: 2,
        text: 'Isola o que tá no meio sem trazer as duas laterais junto. Se a largura pegar demais, você só reconstrói o barulho que já ouvia.',
      },
      {
        id: 'p07-h3',
        seenFlag: 'mari_p07_h3_seen',
        tier: 3,
        text: 'Se saiu código ou horário daí, anota. Não tenta arrancar endereço de um áudio que nunca teve endereço.',
      },
    ],
  },
  {
    puzzleId: 'puzzle-08-enceladus',
    hints: [
      {
        id: 'p08-h1',
        seenFlag: 'mari_p08_h1_seen',
        tier: 1,
        text: 'Parece repetição de máquina de hospital no looping infinito, né? Marca um ciclo inteiro na linha do tempo e manda procurar regiões parecidas pra ver quem foge do padrão.',
      },
      {
        id: 'p08-h2',
        seenFlag: 'mari_p08_h2_seen',
        tier: 2,
        text: 'Empilha e compara as regiões que ele achou pra ver qual delas destoa do resto. Monta o padrão comum usando só os ciclos normais, se meter o diferente no meio, estraga a base.',
      },
      {
        id: 'p08-h3',
        seenFlag: 'mari_p08_h3_seen',
        tier: 3,
        text: 'Agora é tirar a média do que se repete de cima do ciclo esquisito pra ver o que sobra. Quando o residual destacar a voz, dá o play em cima e ouve o que tava escondido.',
      },
    ],
  },
  {
    puzzleId: 'puzzle-09-cassini-huygens',
    hints: [
      {
        id: 'p09-h1',
        seenFlag: 'mari_p09_h1_seen',
        tier: 1,
        text: 'Tem mais de um fluxo nessa captura. Separa um SSRC primeiro e prova que consegue reconstruí-lo antes de mexer no outro.',
      },
      {
        id: 'p09-h2',
        seenFlag: 'mari_p09_h2_seen',
        tier: 2,
        text: 'Esse segundo não parece corrompido, parece fora de ordem. Antes de culpar o codec, olha a sequência dos pacotes.',
      },
      {
        id: 'p09-h3',
        seenFlag: 'mari_p09_h3_seen',
        tier: 3,
        text: 'Ordenar a tabela não conserta o áudio que você já gerou. Reconstrói o stream de novo usando essa ordem.',
      },
    ],
  },
  {
    puzzleId: 'puzzle-10-rings',
    hints: [
      {
        id: 'p10-h1',
        seenFlag: 'mari_p10_h1_seen',
        tier: 1,
        text: 'Tem fonte demais aqui. Começa procurando um evento que apareça em duas gravações diferentes. Som ambiente costuma ser melhor âncora que rosto.',
      },
      {
        id: 'p10-h2',
        seenFlag: 'mari_p10_h2_seen',
        tier: 2,
        text: 'Se essas duas fontes dividem o mesmo momento, procura uma segunda marca no vídeo. Um padrão de luz ou quadro pode colocar outra câmera na mesma sequência.',
      },
      {
        id: 'p10-h3',
        seenFlag: 'mari_p10_h3_seen',
        tier: 3,
        text: 'Se a rota chega numa câmera e o catálogo pula justamente aquele trecho, não assume que nunca foi gravado. Confere a estrutura e depois o armazenamento bruto.',
      },
    ],
  },
  {
    puzzleId: 'puzzle-11-saturn-rotation',
    hints: [
      {
        id: 'p11-h1',
        seenFlag: 'mari_p11_h1_seen',
        tier: 1,
        text: 'Rui não lembra prefixo nem placa. O trem, pelo menos, não depende da memória dele. Começa pela passagem e pela janela em que ela ficou fechada.',
      },
      {
        id: 'p11-h2',
        seenFlag: 'mari_p11_h2_seen',
        tier: 2,
        text: 'Ele disse que a abordagem acabou quando entrou uma urgência no rádio. Procura no CAD o que aconteceu logo depois daquela janela, não espera que o despacho te dê a viatura pronta.',
      },
      {
        id: 'p11-h3',
        seenFlag: 'mari_p11_h3_seen',
        tier: 3,
        text: 'Se ainda sobrou mais de uma equipe, usa duas coisas independentes: o fundo do rádio pode colocar uma viatura perto do trem, e o AVL diz pra onde ela realmente foi.',
      },
    ],
  },
  {
    puzzleId: 'puzzle-12-memory',
    hints: [
      {
        id: 'p12-h1',
        seenFlag: 'mari_p12_h1_seen',
        tier: 1,
        text: 'A voz parece contínua, mas o ambiente não. Escolhe um pedaço curto e trata como se fosse uma evidência separada.',
      },
      {
        id: 'p12-h2',
        seenFlag: 'mari_p12_h2_seen',
        tier: 2,
        text: 'Um hit forte num trecho curto vale mais que tentar comparar a mensagem inteira. Confirma a proveniência antes de passar pro próximo.',
      },
      {
        id: 'p12-h3',
        seenFlag: 'mari_p12_h3_seen',
        tier: 3,
        text: 'Não limita a busca ao material que chegou pronto ao caso. A bancada também gerou arquivos durante a investigação.',
      },
    ],
  },
]

const packByPuzzleId = new Map(MARI_PUZZLE_HINTS.map((p) => [p.puzzleId, p]))

export function mariHintsForPuzzle(puzzleId: string): MariPuzzleHint[] {
  return packByPuzzleId.get(puzzleId)?.hints ?? []
}