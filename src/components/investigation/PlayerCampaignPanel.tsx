import { useState } from 'react'
import { CampaignProgressPanel } from './CampaignProgressPanel'
import { useUiState } from '../../app/uiStore'

/**
 * Botão de árvore — mesmo mapa de progresso do DEV STORY, sem carregar checkpoints.
 */
export function PlayerCampaignPanel() {
  const [open, setOpen] = useState(false)
  const { shell } = useUiState()

  if (shell !== 'playing' && shell !== 'paused') return null

  if (!open) {
    return (
      <button
        type="button"
        className="inv-campaign-toggle"
        data-testid="campaign-panel-open"
        title="Progresso da investigação"
        aria-label="Abrir progresso da investigação"
        onClick={() => setOpen(true)}
      >
        🌳
      </button>
    )
  }

  return <CampaignProgressPanel mode="player" onClose={() => setOpen(false)} />
}