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
        text: 'Esse áudio da central tá mastigado, hein? Antes de tentar ouvir tudo de uma vez, caça onde o sinal apita ou aperta no espectro e vê o que sobra de voz embaixo.',
      },
      {
        id: 'p01-h2',
        seenFlag: 'mari_p01_h2_seen',
        tier: 2,
        text: 'Só achar o centro já puxa alguma coisa, mas ainda tá brigando com a sujeira. Vai regulando profundidade e largura sem espremer a faixa toda, senão vira fumaça.',
      },
      {
        id: 'p01-h3',
        seenFlag: 'mari_p01_h3_seen',
        tier: 3,
        text: 'Se o fim tá engolido pelo chiado, pega um trechinho morto — sem voz — pra tirar o perfil antes de passar redução espectral. E dá o play em cima do trecho depois, que o ouvido não adivinha sozinho.',
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
        text: 'Ele engasga antes da hora, mas isso tem mais cara de embalagem amassada que de fita cortada. Dá uma olhada na estrutura das páginas antes de dar o fim por perdido.',
      },
      {
        id: 'p02-h2',
        seenFlag: 'mari_p02_h2_seen',
        tier: 2,
        text: 'Onde trava costuma ter página fora de lugar ou remendo mal feito. Se remontar a estrutura ali, o que ficou pra trás volta pros trilhos.',
      },
      {
        id: 'p02-h3',
        seenFlag: 'mari_p02_h3_seen',
        tier: 3,
        text: 'Não fica só no começo onde parecia ter acabado. Depois de reconstruir, joga a agulha mais pra frente e vê o que sobrou no final.',
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
        text: 'Gravação de pista assim é um samba do crioulo doido: batida, microfone, virada... Ouve primeiro onde o som muda de cara antes de sair comparando qualquer coisa.',
      },
      {
        id: 'p03-h2',
        seenFlag: 'mari_p03_h2_seen',
        tier: 2,
        text: 'Fogem das bordas onde o DJ entra gritando ou embolando a mixagem. Pega um pedaço limpo antes da virada e outro limpo depois pra comparar cada ponta.',
      },
      {
        id: 'p03-h3',
        seenFlag: 'mari_p03_h3_seen',
        tier: 3,
        text: 'Olhar só um lado não fecha a conta da transição. Confirma os dois trechos limpos na ordem em que rolam pra amarrar quem veio antes e quem veio depois.',
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
        text: 'Duas gravações da mesma noite e cada relógio cantando uma hora diferente? Clássico de bagunça de fuso ou relógio atrasado. Puxa os dois áudios na mesma régua pra ver onde eles se encostam.',
      },
      {
        id: 'p04-h2',
        seenFlag: 'mari_p04_h2_seen',
        tier: 2,
        text: 'Vai ajustando o alinhamento até o pico bater direitinho, sem deixar um esticar mais que o outro. Quando ficar certinho, salva o estado antes de mexer na referência de tempo.',
      },
      {
        id: 'p04-h3',
        seenFlag: 'mari_p04_h3_seen',
        tier: 3,
        text: 'Só alinhar o som não converte a hora do registro pro relógio de fora. Aplica o deslocamento de referência no tempo depois de salvar o alinhamento, senão a conta fica capenga.',
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
        text: 'Gravador em loop com dez pedaços fora de ordem é tipo embaralhar página de revista e pedir pra ler direito. Dá uma olhada no log do buffer e ouve uns trechos pra pescar onde começa o fio.',
      },
      {
        id: 'p05-h2',
        seenFlag: 'mari_p05_h2_seen',
        tier: 2,
        text: 'A ordem em que os arquivos foram cuspidos raramente é a ordem em que aconteceram de verdade. Vai subindo e descendo os trechos até a frase e o clima emendarem sem tranco.',
      },
      {
        id: 'p05-h3',
        seenFlag: 'mari_p05_h3_seen',
        tier: 3,
        text: 'Se o começo tá meio capenga, confere onde o gravador recomeça o ciclo em vez de ir na cega pelo número do arquivo. Monta a sequência inteira e manda conferir a continuidade.',
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
        text: 'Seis áudios anônimos soltos assim não parecem acidente de percurso, né? Ouve por cima, mas o segredo aqui não tá só no que o ouvido pesca — joga no espectrograma pra ver o desenho do som.',
      },
      {
        id: 'p06-h2',
        seenFlag: 'mari_p06_h2_seen',
        tier: 2,
        text: 'Cada arquivo tem uma textura própria, mas os símbolos aparecem mais nítidos na faixa média-alta do espectro. Repara nos traços curtos e nos desenhos em formato de V que se repetem.',
      },
      {
        id: 'p06-h3',
        seenFlag: 'mari_p06_h3_seen',
        tier: 3,
        text: 'Não adianta olhar só um ou dois e chutar o resto. Passa pelo espectrograma dos seis na ordem em que chegaram pra juntar todas as peças da leitura.',
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
        text: 'Essa captura de rádio tá barulhenta nas pontas, mas tem um fiozinho fraco no meio que merece atenção. Abre o espectro no cascata e vê onde aparece atividade entre os sinais mais altos.',
      },
      {
        id: 'p07-h2',
        seenFlag: 'mari_p07_h2_seen',
        tier: 2,
        text: 'Se fechar a largura demais, come pedaço do sinal; se abrir muito, vaza barulho dos canais vizinhos. Centraliza no canal do meio, ajusta a banda com calma e extrai pra ouvir limpo.',
      },
      {
        id: 'p07-h3',
        seenFlag: 'mari_p07_h3_seen',
        tier: 3,
        text: 'Só extrair o canal não fecha o serviço sozinho. Ouve o que saiu no canal oculto até o fim e depois cruza o que você pescou com a tabela de logística.',
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
        text: 'Empilha e compara as regiões que ele achou pra ver qual delas destoa do resto. Monta o padrão comum usando só os ciclos normais — se meter o diferente no meio, estraga a base.',
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
        text: 'Pacote de rede misturado assim é tipo duas pessoas falando no mesmo rádio ao mesmo tempo. Dá uma olhada nos pacotes, separa os fluxos por origem e monta um fluxo de cada vez.',
      },
      {
        id: 'p09-h2',
        seenFlag: 'mari_p09_h2_seen',
        tier: 2,
        text: 'O primeiro fluxo já dá o tom do método, mas o segundo vem todo picotado se ficar na ordem crua da captura. Tenta ordenar pelo número de sequência antes de reconstruir o áudio de novo.',
      },
      {
        id: 'p09-h3',
        seenFlag: 'mari_p09_h3_seen',
        tier: 3,
        text: 'Não deixa um dos lados pela metade achando que só um basta. Só quando os dois fluxos estiverem reconstruídos e limpos é que a conversa inteira faz sentido.',
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
        text: 'Cada gravação desse protesto parece ter sido filmada num relógio diferente e num humor pior ainda. Vai amarrando as pistas de som e imagem no mapa do trecho antes de sair tirando conclusão.',
      },
      {
        id: 'p10-h2',
        seenFlag: 'mari_p10_h2_seen',
        tier: 2,
        text: 'Se o registro parece pular ou cortar no meio da rua, confere onde há buraco ou trecho fora de índice. Às vezes o que falta tá escondido justamente no espaço entre uma câmera e outra.',
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
        text: 'Rádio chiando e despacho correndo solto é o prato cheio pra ninguém lembrar de nada depois. Cruza o horário da passagem com o log e as janelas de rádio pra ver quem tava em campo.',
      },
      {
        id: 'p11-h2',
        seenFlag: 'mari_p11_h2_seen',
        tier: 2,
        text: 'Vai eliminando quem não encaixa na janela certa até sobrar a viatura que realmente bate na conta. Quando o horário fecha, o resto costuma aparecer sem precisar forçar a barra.',
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
        text: 'Esse áudio tem cheiro de colcha de retalhos — parece coisa remendada de pedaço que já existia. Dá uma olhada de onde cada parte foi puxada antes de achar que é fala nova.',
      },
      {
        id: 'p12-h2',
        seenFlag: 'mari_p12_h2_seen',
        tier: 2,
        text: 'Vai costurando o que tá solto com calma, sem pular etapa. Quando o quebra-cabeça desse som encaixar, a palavra que ele tá guardando salta na cara.',
      },
    ],
  },
]

const packByPuzzleId = new Map(MARI_PUZZLE_HINTS.map((p) => [p.puzzleId, p]))

export function mariHintsForPuzzle(puzzleId: string): MariPuzzleHint[] {
  return packByPuzzleId.get(puzzleId)?.hints ?? []
}

export function nextMariPuzzleHintTier(
  puzzleId: string,
  flags: Record<string, boolean>,
  activityCount: number,
  idleSec: number,
  sessionOpenSec: number,
): MariPuzzleHint | null {
  const hints = mariHintsForPuzzle(puzzleId)
  if (!hints.length) return null

  const byTier = (tier: 1 | 2 | 3) => hints.find((h) => h.tier === tier)

  const h1 = byTier(1)
  const h2 = byTier(2)
  const h3 = byTier(3)

  if (h1 && !flags[h1.seenFlag] && sessionOpenSec >= 0.8) return h1
  if (h1 && !flags[h1.seenFlag]) return null

  if (h2 && !flags[h2.seenFlag] && (activityCount >= 1 || sessionOpenSec >= 35)) return h2
  if (h2 && !flags[h2.seenFlag]) return null

  if (
    h3 &&
    !flags[h3.seenFlag] &&
    (idleSec >= 50 || activityCount >= 4 || sessionOpenSec >= 100)
  ) {
    return h3
  }
  return null
}