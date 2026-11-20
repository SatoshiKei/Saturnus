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
    text: 'Três dias nesta mesa. A placa ainda tem o nome do Siqueira por baixo do adesivo.',
  },
  {
    narration: true,
    portraitId: 'augusto',
    text: 'Ele saiu. Eu entrei. Designação interina. E o primeiro dossiê na minha frente já é desaparecimento.',
  },
  {
    narration: true,
    portraitId: 'augusto',
    text: 'Mariana Silva. Enfermeira. Não chegou ao plantão. Ligação de emergência. Celular apreendido.',
  },
  {
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'Delegado? Posso?',
  },
  {
    speaker: 'Augusto',
    portraitId: 'augusto',
    text: 'Pode.',
  },
  {
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'Sou a Mari. Fiquei com a sala quando o Siqueira saiu. Agora fico com o senhor.',
  },
  {
    speaker: 'Augusto',
    portraitId: 'augusto',
    text: 'Augusto Nogueira.',
  },
  {
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'Eu sei. A chefia avisou ontem. Deixei a pasta na sua mesa — ocorrência, resumo da ligação, o celular já está no lacre.',
  },
  {
    speaker: 'Augusto',
    portraitId: 'augusto',
    text: 'Sumiço com pedido de ajuda na madrugada. Querem resultado rápido.',
  },
  {
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'Querem. Eu fico por perto. Se precisar de ramal, arquivo ou café que não seja o da máquina, é só chamar.',
  },
  {
    speaker: 'Augusto',
    portraitId: 'augusto',
    text: 'Café da máquina serve. O resto a gente vê.',
  },
  {
    speaker: 'Mari',
    portraitId: 'mari',
    text: 'Começa pela pasta. Eu volto daqui a pouco.',
  },
]
