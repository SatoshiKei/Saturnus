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
    kind: 'field',
    speaker: 'PM 1',
    text: 'Ouviu isso? Tem som lá dentro.',
    bg: 'door',
  },
  {
    id: 'apt-rec-7',
    kind: 'field',
    speaker: 'PM 2',
    text: 'É música. Baixa, mas tá tocando.',
    bg: 'door',
  },
  {
    id: 'apt-rec-8',
    kind: 'narration',
    text: 'O som abafado atravessa a madeira com uma persistência estranha para uma manhã que começou em silêncio absoluto. Cada nota parece chegar filtrada pela distância, como se viesse de uma sala onde alguém deixou o aparelho ligado sem querer, ou onde alguém não consegue mais desligar.',
    bg: 'door',
  },
  {
    id: 'apt-rec-9',
    kind: 'field',
    speaker: 'PM 1',
    text: 'Mariana! Polícia, abre a porta!',
    bg: 'door',
  },
  {
    id: 'apt-rec-10',
    kind: 'field',
    speaker: 'PM 2',
    text: 'Nada. Se o som tá rolando e ninguém atende...',
    bg: 'door',
  },
  {
    id: 'apt-rec-11',
    kind: 'field',
    speaker: 'PM 1',
    text: 'Pode ser desmaio, queda, qualquer coisa. A gente não pode ficar do lado de fora ouvindo tocar e esperando dar meia hora.',
    bg: 'door',
  },
  {
    id: 'apt-rec-12',
    kind: 'field',
    speaker: 'PM 2',
    text: 'Faz sentido. Fala com a base e pede o aval logo.',
    bg: 'door',
  },
  {
    id: 'apt-rec-13',
    kind: 'radio',
    speaker: 'PM 1',
    text: 'Base, sem resposta na porta. Vizinho no corredor confirmou que ninguém abriu. Tem um som tocando lá dentro, ninguém responde. Pedindo autorização pra entrada.',
  },
  {
    id: 'apt-rec-14',
    kind: 'narration',
    text: 'O rádio chiando abre um espaço suspenso no corredor: o estático curto da linha, o respiro contido de quem aguarda ordem e aquele som lá de dentro insistindo atrás da porta.',
    bg: 'door',
  },
  {
    id: 'apt-rec-15',
    kind: 'radio',
    speaker: 'Delegado Siqueira',
    text: 'Entrada autorizada. Registra o horário exato e mantém o canal aberto comigo.',
  },
  {
    id: 'apt-rec-16',
    kind: 'radio',
    speaker: 'Mari',
    text: 'Copiado. Horário marcado, termo pronto aqui na base.',
  },
  {
    id: 'apt-rec-17',
    kind: 'field',
    speaker: 'PM 2',
    text: 'Beleza, temos o sinal verde. Vamos abrir com calma, sem arrombar à toa se tiver chave ou destrava.',
    bg: 'door',
  },
  {
    id: 'apt-rec-18',
    kind: 'field',
    speaker: 'PM 1',
    text: 'Certo. Atenção assim que virar a maçaneta.',
    bg: 'door',
  },
  {
    id: 'apt-rec-19',
    kind: 'narration',
    text: 'A chave vira, a trava cede e a porta se abre devagar. Assim que a fresta cede, o som ganha fôlego e deixa de ser só um murmúrio contido pela madeira.',
    bg: 'door',
  },
  {
    id: 'apt-rec-20',
    kind: 'narration',
    text: 'A sala está vazia, com a luz acesa queimando sem pressa, num vazio limpo demais para uma ausência repentina. O toque segue puxando a atenção pelos cômodos, marcando o compasso enquanto os policiais avançam.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-21',
    kind: 'radio',
    speaker: 'PM 1',
    text: 'Entrando no imóvel. Sala vazia, luz acesa. Vamos acompanhar o som.',
  },
  {
    id: 'apt-rec-22',
    kind: 'field',
    speaker: 'PM 2',
    text: 'Por aqui. Tá vindo do fundo do corredor.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-23',
    kind: 'narration',
    text: 'Pelo corredor interno, o som vai se adensando, misturando-se ao passo contido no piso, insistente até o fim do trajeto como um fio esticado no escuro.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-24',
    kind: 'field',
    speaker: 'PM 1',
    text: 'Mariana? Polícia, estamos entrando no quarto.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-25',
    kind: 'narration',
    text: 'O quarto está vazio, sem ninguém para responder ao próprio eco. Os policiais abrem espaço entre os cantos, olhando sob a cama, atrás da porta, em cada sombra onde alguém pudesse ter caído.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-26',
    kind: 'field',
    speaker: 'PM 2',
    text: 'Nada aqui. Olha o banheiro também, pode ter escorregado.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-27',
    kind: 'field',
    speaker: 'PM 1',
    text: 'Vazio também. Espera... o som tá bem aqui.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-28',
    kind: 'field',
    speaker: 'PM 2',
    text: 'Olha nos cantos, atrás da cortina, dentro do guarda-roupa. Se ela tiver caída em algum canto...',
    bg: 'interior',
  },
  {
    id: 'apt-rec-29',
    kind: 'field',
    speaker: 'PM 1',
    text: 'Já olhei por aqui. Não tem ninguém nesse cômodo, cara. A cama tá arrumada, o chão tá limpo...',
    bg: 'interior',
  },
  {
    id: 'apt-rec-30',
    kind: 'field',
    speaker: 'PM 2',
    text: 'E esse som não para. Parece que tá saindo do meio do piso.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-31',
    kind: 'narration',
    text: 'Bem no centro do chão, a tela acesa corta a penumbra com uma claridade fria enquanto o aparelho toca sozinho no quarto deserto.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-32',
    kind: 'field',
    speaker: 'PM 1',
    text: 'Achei. É o celular. Tá jogado bem aqui no meio do quarto, com a tela acesa.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-33',
    kind: 'field',
    speaker: 'PM 2',
    text: 'Ninguém perto? Nenhuma marca, nada?',
    bg: 'interior',
  },
  {
    id: 'apt-rec-34',
    kind: 'field',
    speaker: 'PM 1',
    text: 'Nada. Só o aparelho tocando sozinho no meio do chão.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-35',
    kind: 'radio',
    speaker: 'PM 1',
    text: 'Tem um aparelho aqui no chão, ligado e tocando. Ninguém no apartamento.',
  },
  {
    id: 'apt-rec-36',
    kind: 'field',
    speaker: 'PM 2',
    text: 'Sem sinal dela em lugar nenhum. Só o telefone no chão.',
    bg: 'interior',
  },
  {
    id: 'apt-rec-37',
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
  const n = Number.parseInt(beatId.replace('apt-rec-', ''), 10)
  if (Number.isNaN(n) || n < 5) return 0
  if (n === 5) return 0.11
  if (n <= 12) return 0.12 + (n - 6) * 0.008
  if (n <= 16) return 0.17 + (n - 13) * 0.015
  if (n <= 19) return 0.24 + (n - 17) * 0.03
  if (n <= 23) return 0.3 + (n - 20) * 0.025
  if (n <= 30) return 0.38 + (n - 24) * 0.022
  if (n <= 34) return 0.54 + (n - 31) * 0.075
  if (n <= 36) return 0.8
  if (n === 37) return 0.34
  return 0
}