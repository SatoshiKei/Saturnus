import { useState } from 'react'
import {
  buildCanonicalCheckpointState,
  getCanonicalCheckpointDef,
} from '../../game/story/canonicalStoryManifest'
import {
  loadDevCheckpointState,
  resetGame,
} from '../../game/state/investigationStore'
import { enterGameplay, useUiState } from '../../app/uiStore'
import { useGameHub } from '../../app/GameHubContext'
import { CampaignProgressPanel } from './CampaignProgressPanel'
import type { DevCheckpointDef } from '../../game/story/devCheckpointCatalog'
/**
 * DEV STORY — cada checkpoint é reconstruído do estado inicial pelo manifesto canônico.
 */
export function DevStoryPanel() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<DevCheckpointDef | null>(null)
  const { shell } = useUiState()
  const { closeHub, closeLocationScene } = useGameHub()

  const applyCheckpoint = (cp: DevCheckpointDef) => {
    loadDevCheckpointState(buildCanonicalCheckpointState(cp.id))
    closeHub()
    closeLocationScene()
    setPending(null)
    setOpen(false)
    if (shell !== 'playing') enterGameplay()
  }

  if (!open) {
    return (
      <button
        type="button"
        className="inv-dev-toggle"
        data-testid="dev-panel-open"
        title="Abrir ferramentas de desenvolvimento"
        onClick={() => setOpen(true)}
      >
        DEV
      </button>
    )
  }

  const pendingNote = pending ? getCanonicalCheckpointDef(pending.id)?.note : undefined

  return (
    <>
      <CampaignProgressPanel
        mode="dev"
        onClose={() => setOpen(false)}
        onPickCheckpoint={setPending}
        onResetSave={() => resetGame()}
      />

      {pending ? (
        <div className="inv-dev__modal" role="dialog" aria-modal="true" data-testid="dev-checkpoint-confirm">
          <div className="inv-dev__modal-card">
            <p className="inv-dev__modal-kicker">Carregar checkpoint DEV</p>
            <p className="inv-dev__modal-title">
              Bloco {pending.block} — {pending.label}
            </p>
            <p className="inv-dev__modal-copy">
              O estado atual será substituído pelo estado canônico deste ponto, reconstruído do início da
              campanha (caminho principal, sem descobertas opcionais).
            </p>
            {pendingNote ? <p className="inv-dev__modal-copy">{pendingNote}</p> : null}
            <div className="inv-dev__modal-actions">
              <button type="button" onClick={() => setPending(null)}>
                Cancelar
              </button>
              <button
                type="button"
                data-testid="dev-checkpoint-confirm-load"
                onClick={() => applyCheckpoint(pending)}
              >
                Carregar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}