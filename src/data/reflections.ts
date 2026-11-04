import { getInvestigationState } from '../game/state/investigationStore'
import type { SceneId } from './sceneIntros'
import { sceneBackgrounds } from './sceneIntros'

/**
 * Modo Reflexão: pensamento interno de Augusto (NVL, sem sprites). É aqui que ficam as sínteses —
 * os depoimentos só dizem o que a pessoa diria. 2–5 blocos por reflexão, mostrados em sequência.
 */
export interface ReflectionDef {
  id: string
  /** Cena de visita que a dispara ao terminar. */
  sceneId?: SceneId
  /** A reflexão só ocorre se esta flag já estiver ativa quando a cena termina. */
  whenFlag?: string
  /** Fundo (o mesmo da cena, escurecido pelo componente). */
  background: string
  blocks: string[]
}

export const reflections: ReflectionDef[] = [
  {
    id: 'refl-lucas',
    sceneId: 'lucas',
    whenFlag: 'block02_lucas_interview_done',
    background: sceneBackgrounds.lucas,
    blocks: [
      'Elisa Duarte. O nome não estava em nenhuma linha do desaparecimento de Mariana.',
      'Lucas respondeu como quem já tinha feito aquela conta sozinho, mais de uma vez, e nunca gostou do resultado.',
      'Se Mariana perguntou por horário e por testemunha, ela estava montando alguma coisa. Os autos do caso Elisa precisam estar em algum sistema.',
    ],
  },
  {
    id: 'refl-livia',
    sceneId: 'livia',
    whenFlag: 'block03_livia_interview_done',
    background: sceneBackgrounds.livia,
    blocks: [
      'Fragmentos fora de ordem. Material bruto, de quem guarda por hábito.',
      'Se a gravação foi invertida no arquivo, a transmissão ainda está lá. Só precisa ser reconstruída.',
    ],
  },
  {
    id: 'refl-nico',
    sceneId: 'nico',
    whenFlag: 'block03_nico_interview_done',
    background: sceneBackgrounds.nico,
    blocks: [
      'Nico não escondeu nada. Só estava cansado de ser chamado de volta a uma noite de seis anos atrás.',
      'Duas gravações da mesma noite: a da mesa e a do gravador. Cada uma com o seu relógio.',
      'Se os relógios não concordam entre si, a cronologia do processo também pode não concordar com a noite.',
    ],
  },
  {
    id: 'refl-samuel',
    sceneId: 'samuel',
    whenFlag: 'block04_samuel_interview_done',
    background: sceneBackgrounds.samuel,
    blocks: [
      'Samuel esteve lá e voltou para casa. O que ele carrega não é culpa; é o que viu os outros fazerem.',
      'Ele não vai entregar ninguém, e eu não tenho o que oferecer em troca.',
      'Mariana também pediu horários a ele. De novo: não o rosto, a sequência.',
    ],
  },
  {
    id: 'refl-andre',
    sceneId: 'andre',
    whenFlag: 'block04_andre_interview_done',
    background: sceneBackgrounds.andre,
    blocks: [
      'André respondeu pouco e devolveu quase tudo em pergunta. Um homem que aprendeu que cada resposta vira prova.',
      'Ele tem motivo para usar a irmã. Também tem motivo para querer que ela pare.',
      'Antes de decidir qualquer coisa sobre o número sem nome, preciso comparar os horários das ligações com os registros da unidade.',
    ],
  },
  {
    id: 'refl-hex-call',
    background: sceneBackgrounds.hospital,
    blocks: [
      'Ninguém falou. Só o áudio, do começo ao fim, como se alguém quisesse que eu ouvisse sem responder.',
      'Lá fora, outros telefones tocam. A delegacia nunca fica em silêncio completo, e mesmo assim este silêncio chegou até a minha mesa.',
      'Seis ligações, todas sem identificação. A central guardou as gravações. Vou levar tudo para a bancada.',
    ],
  },
  {
    id: 'refl-nico2',
    sceneId: 'nico',
    whenFlag: 'block05_nico_followup_done',
    background: sceneBackgrounds.nico,
    blocks: [
      'Nico não inventou um mistério. Só lembrou de uma peça que não parecia de Elisa.',
      'Ele acha que era de Jana. Memória, não laudo.',
      'Se Mariana insistia nisso, os autos devem ter o nome completo.',
    ],
  },
  {
    id: 'refl-jana',
    sceneId: 'jana',
    whenFlag: 'block05_jana_interview_done',
    background: sceneBackgrounds.jana,
    blocks: [
      'A jaqueta era dela. Empréstimo na saída. Versão simples.',
      'Ela quer encerrar o assunto. O desconforto não vira prova.',
      'Preciso voltar ao que condenou André — não ao que me incomoda nela.',
    ],
  },
  {
    id: 'refl-b05-andre',
    background: sceneBackgrounds.andre,
    blocks: [
      'Nico apontou uma inconsistência real. A jaqueta é outro detalhe estranho. Jana omitiu o óbvio até ser perguntada.',
      'Nada disso dissolve o conjunto que condenou André: discussão, ciúmes, álibi fraco, alguém parecido perto da queda.',
      'Talvez Mariana tenha achado falhas reais e as tratado como conspiração porque precisava acreditar no irmão. Hipótese. Só isso.',
    ],
  },
  {
    id: 'refl-b05-maralto',
    background: sceneBackgrounds.livia,
    blocks: [
      'Lívia, a rádio, os protestos, o núcleo mascarado, Morsa, Samuel. Material suspeito. Pessoas que não falam. Crimes reais.',
      'Nada disso explica por que Mariana desapareceu.',
      'Duas possibilidades: Elisa era o alvo e Maralto veio para desorientar — ou o contrário. As duas linhas seguem sem ligação demonstrável.',
    ],
  },
  {
    id: 'refl-b05-coincidence',
    background: sceneBackgrounds.hospital,
    blocks: [
      'Pode ser coincidência. Estou reconstruindo a mesma investigação que Mariana fez — naturalmente chego às mesmas pessoas e aos mesmos arquivos.',
      'Mas a comparação incomoda: alguns materiais quase não servem fora da ordem em que os encontrei. Timestamps e seleção não parecem acidentais.',
      'Se for só eco da mesma trilha, a chamada inicial não muda nada. Se não for… a chamada merece uma releitura.',
    ],
  },
  {
    id: 'refl-b05-path',
    background: sceneBackgrounds.hospital,
    blocks: [
      'A chamada colocou a polícia no apartamento. O celular foi apreendido. Os arquivos só fazem sentido depois de certas pessoas. Mariana já tinha percorrido quase o mesmo caminho.',
      'Isso não parece acidente de investigação. Parece um percurso deixado para alguém reconstruir.',
      'Não sei se ela construiu sozinha. Não sei se o desconhecido ajudou. Não sei se o medo do diário é real e o planejamento também. Os dois sinais estão aí.',
      'Seguir só o rastro dela não basta. Vou reconstruir o caso Elisa do zero.',
    ],
  },
]

export function reflectionForScene(sceneId: SceneId): ReflectionDef | undefined {
  const s = getInvestigationState()
  const matches = reflections.filter((r) => r.sceneId === sceneId)
  return matches.find(
    (r) => (!r.whenFlag || s.flags[r.whenFlag]) && !s.flags[`${r.id}_seen`],
  )
}

export function reflectionById(id: string): ReflectionDef | undefined {
  return reflections.find((r) => r.id === id)
}
