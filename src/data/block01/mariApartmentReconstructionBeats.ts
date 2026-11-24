/**
 * Cena B1 — reconstrução da entrada no apartamento (03/11, ~08:21).
 * Mari na base; sequência visual = relato que entrou pelo rádio — não memória dela.
 * @see docs/story/SCENE_MARI_APARTAMENTO_ENTRADA_0803.md
 */

export type ApartmentReconstructionBeatKind = 'present' | 'narration' | 'radio' | 'field'

export type ApartmentReconstructionBeat = {
  id: string
  kind: ApartmentReconstructionBeatKind
  speaker?: string
  text: string
  portraitId?: 'augusto' | 'mari'
  /** `door` (corredor/porta) ou `interior` (após entrada). */
  bg?: 'door' | 'interior'
}

export const MARI_APT_PRESENT_OPEN: ApartmentReconstructionBeat[] = [
  {
    id: 'apt-present-1',
    kind: 'present',
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'O senhor só vai encontrar horário, ocorrência e termo de apreensão no papel. Naquela manhã cedo, o senhor ainda não tinha assumido a cadeira.',
  },
  {
    id: 'apt-present-2',
    kind: 'present',
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'Eu fiquei na base pegando o rádio picado, enquanto o Delegado Siqueira puxava o comando da ocorrência.',
  },
  {
    id: 'apt-present-3',
    kind: 'present',
    speaker: 'Augusto',
    portraitId: 'augusto',
    text: 'E o que chegou pra você pelo rádio?',
  },
  {
    id: 'apt-present-4',
    kind: 'present',
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'A viatura no corredor, o vizinho ali, o apartamento vazio e um toque que não parava de insistir. Foi assim que o quadro se montou pra mim. Eu não estava lá, só ouvia o que ia passando no ar.',
  },
]

export const MARI_APT_RECONSTRUCTION: ApartmentReconstructionBeat[] = [
  {
    id: 'apt-rec-1',
    kind: 'narration',
    text: 'A manhã parada no corredor do prédio guarda o cansaço de quem chegou cedo demais para um silêncio que não responde. Diego está ali fora, quieto, olhando a porta fechada como quem espera que o tempo faça o trabalho de bater mais uma vez.',
    bg: 'door',
  },
  {
    id: 'apt-rec-2',
    kind: 'narration',
    text: 'A campainha chama uma vez, devolve o eco vazio, chama de novo. Não há resposta, nem movimento por trás da madeira.',
    bg: 'door',
  },
  {
    id: 'apt-rec-3',
    kind: 'field',
    speaker: 'PM 1',
    text: 'Ninguém atende. Vou bater de novo antes de pedir autorização.',
    bg: 'door',
  },
  {
    id: 'apt-rec-4',
    kind: 'field',
    speaker: 'PM 2',
    text: 'Bate firme. Se ela passou mal lá dentro, cada minuto conta.',
    bg: 'door',
  },
  {
    id: 'apt-rec-5',
    kind: 'narration',
    text: 'As batidas secas ecoam contra a porta e se apagam num silêncio que parece esperar por um milagre. Só então, bem abafado, um som começa a vazar lá de dentro, fraco e teimoso, como se viesse de um cômodo esquecido lá no fundo.',
    bg: 'door',
  },
  {
    id: 'apt-rec-6',
    kind: 'radio',
    speaker: 'PM 1',
    text: 'Base, sem resposta na porta. Vizinho no corredor confirmou que não abriu ninguém.',
  },
  {
    id: 'apt-rec-7',
    kind: 'narration',
    text: 'O rádio chiando abre um espaço suspenso no corredor: o estático curto da linha, o respiro contido de quem aguarda ordem e aquele som lá de dentro insistindo atrás da porta.',
    bg: 'door',
  },
  {
    id: 'apt-rec-8',
    kind: 'radio',
    speaker: 'Delegado Siqueira',
    text: 'Entrada autorizada. Registra o horário exato e mantém o canal aberto comigo.',
  },
  {
    id: 'apt-rec-9',
    kind: 'radio',
    speaker: 'Mari',
    text: 'Copiado. Horário marcado, termo pronto aqui na base.',
  },
  {
    id: 'apt-rec-10',
    kind: 'narration',
    text: 'A chave vira, a trava cede e a porta se abre devagar. Assim que a fresta cede, o som ganha fôlego e deixa de ser só um murmúrio contido pela madeira.',
    bg: 'door',
  },
  {
    id: 'apt-rec-11',
    kind: 'narration',
    text: 'A sala está vazia, com a luz acesa queimando sem pressa, num vazio limpo demais para uma ausência repentina. O toque segue puxando a atenção pelos cômodos, marcando o compasso enquanto os policiais avançam.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-12',
    kind: 'radio',
    speaker: 'PM 1',
    text: 'Entrando no imóvel. Sala vazia, luz acesa. Vamos acompanhar o som.',
  },
  {
    id: 'apt-rec-13',
    kind: 'field',
    speaker: 'PM 2',
    text: 'Por aqui. Tá vindo do fundo do corredor.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-14',
    kind: 'narration',
    text: 'Pelo corredor interno, o som vai se adensando, misturando-se ao passo contido no piso, insistente até o fim do trajeto como um fio esticado no escuro.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-15',
    kind: 'field',
    speaker: 'PM 1',
    text: 'Mariana? Polícia, estamos entrando no quarto.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-16',
    kind: 'narration',
    text: 'O quarto está vazio, sem ninguém para responder ao próprio eco. Os policiais abrem espaço entre os cantos, olhando sob a cama, atrás da porta, em cada sombra onde alguém pudesse ter caído.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-17',
    kind: 'field',
    speaker: 'PM 2',
    text: 'Nada aqui. Olha o banheiro também, pode ter escorregado.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-18',
    kind: 'field',
    speaker: 'PM 1',
    text: 'Vazio também. Espera... o som tá bem aqui.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-19',
    kind: 'narration',
    text: 'Bem no centro do chão, a tela acesa corta a penumbra com uma claridade fria enquanto o aparelho toca sozinho no quarto deserto.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-20',
    kind: 'radio',
    speaker: 'PM 1',
    text: 'Tem um aparelho aqui no chão, ligado e tocando. Ninguém no apartamento.',
  },
  {
    id: 'apt-rec-21',
    kind: 'field',
    speaker: 'PM 2',
    text: 'Sem sinal dela em lugar nenhum. Só o telefone no chão.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-22',
    kind: 'narration',
    text: 'O som ainda se estende por mais alguns segundos sobre o quarto vazio antes da fotografia, do lacre e do recuo gradual até sobrar apenas o silêncio do cômodo.',
    bg: 'interior',
  },
]

export const MARI_APT_PRESENT_CLOSE: ApartmentReconstructionBeat[] = [
  {
    id: 'apt-close-1',
    kind: 'present',
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'No papel ficou registro às oito e vinte e seis, aparelho apreendido.',
  },
  {
    id: 'apt-close-2',
    kind: 'present',
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'Só que pelo rádio, por um segundo, pareceu que tinham achado alguém. E não tinha ninguém.',
  },
  {
    id: 'apt-close-3',
    kind: 'present',
    speaker: 'Augusto',
    portraitId: 'augusto',
    text: 'Só o telefone tocando sozinho no quarto vazio.',
  },
  {
    id: 'apt-close-4',
    kind: 'present',
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'É. Foi exatamente essa a impressão que ficou.',
  },
]

export const MARI_APARTMENT_RECONSTRUCTION_ALL: ApartmentReconstructionBeat[] = [
  ...MARI_APT_PRESENT_OPEN,
  ...MARI_APT_RECONSTRUCTION,
  ...MARI_APT_PRESENT_CLOSE,
]

/** Melodie só após a narração do som vazando (apt-rec-5). */
export const MARI_APT_MELODIE_START_BEAT_ID = 'apt-rec-5'

export function melodieVolumeForApartmentBeat(beatId: string): number {
  switch (beatId) {
    case 'apt-rec-5':
      return 0.11
    case 'apt-rec-6':
    case 'apt-rec-7':
      return 0.14
    case 'apt-rec-8':
    case 'apt-rec-9':
      return 0.16
    case 'apt-rec-10':
      return 0.22
    case 'apt-rec-11':
    case 'apt-rec-12':
    case 'apt-rec-13':
      return 0.28
    case 'apt-rec-14':
    case 'apt-rec-15':
      return 0.4
    case 'apt-rec-16':
    case 'apt-rec-17':
    case 'apt-rec-18':
      return 0.52
    case 'apt-rec-19':
    case 'apt-rec-20':
    case 'apt-rec-21':
      return 0.76
    case 'apt-rec-22':
      return 0.35
    default:
      return 0
  }
}