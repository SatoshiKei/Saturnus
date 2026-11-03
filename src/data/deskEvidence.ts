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

/** Bloco 1: pasta do caso na mesa é o objeto `evidence-box` em sceneComposition. */
export const deskEvidenceItems: DeskEvidenceItem[] = []
