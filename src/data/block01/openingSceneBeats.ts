/** Abertura Bloco 1 — Augusto + Mari. Sem meta de UI. */

export type OpeningBeat = {
  speaker?: string
  text: string
  /** Retrato ativo (`CHARACTER_SPRITE_URLS`). Sem portrait = pensamento / narração. */
  portraitId?: 'augusto' | 'mari'
  narration?: boolean
}

export const OPENING_SCENE_BEATS: OpeningBeat[] = [
  {
    narration: true,
    portraitId: 'augusto',
    text: 'Três dias nessa mesa. A placa ainda guarda o nome do Delegado Siqueira por baixo do adesivo.',
  },
  {
    narration: true,
    portraitId: 'augusto',
    text: 'Ele rodou, eu assumi, interino, no tapa, e o primeiro caso que cai no meu colo já é desaparecimento.',
  },
  {
    narration: true,
    portraitId: 'augusto',
    text: 'Mariana Silva. Enfermeira. Não apareceu pro plantão. Ligação de emergência na madrugada, celular apreendido.',
  },
  {
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'Delegado? Posso encostar?',
  },
  {
    speaker: 'Augusto',
    portraitId: 'augusto',
    text: 'Entra.',
  },
  {
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'Sou a Mari. Sobrou pra mim segurar as pontas quando o Delegado Siqueira saiu. Agora sobra com o senhor.',
  },
  {
    speaker: 'Augusto',
    portraitId: 'augusto',
    text: 'Augusto Nogueira.',
  },
  {
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'Já me avisaram ontem. Separei tudo na pasta: BO, resumo da chamada, e o celular já tá lacrado.',
  },
  {
    speaker: 'Augusto',
    portraitId: 'augusto',
    text: 'Chamada de emergência de madrugada e enfermeira sumida... Vão cobrar resposta ontem.',
  },
  {
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'Como sempre. Se precisar puxar ramal, desenterrar arquivo velho ou fugir do café aguado da máquina, só dar um toque.',
  },
  {
    speaker: 'Augusto',
    portraitId: 'augusto',
    text: 'O da máquina dá pro gasto. O resto a gente desenrola.',
  },
  {
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'Dá uma olhada na pasta primeiro. Já volto.',
  },
]