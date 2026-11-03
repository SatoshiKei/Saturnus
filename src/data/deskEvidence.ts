import type { SceneObjectDef } from '../types/scene'

/**
 * Evidências físicas que aparecem sobre a mesa somente quando o jogador as possui.
 * Poucas por vez — objetos antigos devem ser removidos desta lista conforme o caso avança
 * (use `hideWhenFlag` para arquivar). Clicar abre o sistema indicado em `object.hubTarget`.
 */
export interface DeskEvidenceItem {
  evidenceId: string
  /** some quando a flag estiver ativa (item arquivado na pasta) */
  hideWhenFlag?: string
  object: SceneObjectDef
}

export const deskEvidenceItems: DeskEvidenceItem[] = [
  {
    evidenceId: 'bo_inicial',
    object: {
      id: 'desk-sheet-bo',
      kind: 'image',
      asset: '/assets/scene/hub/desk-sheet-bo.png',
      x: 760,
      y: 650,
      width: 150,
      height: 172,
      zIndex: 26,
      interactive: true,
      cursor: 'pointer',
      hubTarget: 'case-files',
      hit: [0.08, 0.06, 0.84, 0.86],
      label: 'Boletim de ocorrência',
      ariaLabel: 'Boletim de ocorrência sobre a mesa',
      focusZoom: 1.5,
    },
  },
]
