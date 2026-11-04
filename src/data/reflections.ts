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
]

export function reflectionForScene(sceneId: SceneId): ReflectionDef | undefined {
  return reflections.find((r) => r.sceneId === sceneId)
}

export function reflectionById(id: string): ReflectionDef | undefined {
  return reflections.find((r) => r.id === id)
}
