import { useMemo, useState } from 'react'
import {
  DEV_BLOCK_SECTIONS,
  resolveBlockStatus,
  resolveCheckpointStatus,
  type DevCheckpointDef,
} from '../../game/story/devCheckpointCatalog'
import {
  buildCanonicalCheckpointState,
  canonicalCampaignProgress,
  getCanonicalCheckpointDef,
  validateCanonicalManifest,
} from '../../game/story/canonicalStoryManifest'
import {
  getInvestigationState,
  loadDevCheckpointState,
  resetGame,
  subscribeInvestigation,
} from '../../game/state/investigationStore'
import { enterGameplay, useUiState } from '../../app/uiStore'
import { useGameHub } from '../../app/GameHubContext'
import { useSyncExternalStore } from 'react'

function useInvestigationFlags() {
  return useSyncExternalStore(
    subscribeInvestigation,
    () => getInvestigationState().flags,
    () => getInvestigationState().flags,
  )
}

/**
 * DEV STORY — cada checkpoint é reconstruído do estado inicial pelo manifesto canônico
 * (replay das interações obrigatórias). Voltar/avançar nunca reaproveita o estado atual.
 */
export function DevStoryPanel() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<DevCheckpointDef | null>(null)
  const flags = useInvestigationFlags()
  const { shell } = useUiState()
  const { closeHub, closeLocationScene } = useGameHub()

  const progress = useMemo(() => (open ? canonicalCampaignProgress(flags) : null), [open, flags])
  const validation = useMemo(() => {
    if (!open) return null
    const v = validateCanonicalManifest()
    if (!v.ok) console.warn('[DEV STORY] manifesto canônico com problemas', v)
    return v
  }, [open])
  const currentBlock =
    DEV_BLOCK_SECTIONS.flatMap((s) => s.checkpoints).find((c) => c.id === progress?.currentCheckpointId)?.block ?? 1
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  const isExpanded = (block: number) => {
    if (expanded[block] !== undefined) return expanded[block]
    return block === currentBlock
  }

  const toggleBlock = (block: number) => {
    setExpanded((prev) => ({ ...prev, [block]: !isExpanded(block) }))
  }

  const applyCheckpoint = (cp: DevCheckpointDef) => {
    loadDevCheckpointState(buildCanonicalCheckpointState(cp.id))
    closeHub()
    closeLocationScene()
    setPending(null)
    setOpen(false)
    if (shell !== 'playing') enterGameplay()
  }

  if (!open || !progress) {
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
      <aside className="inv-dev" data-testid="dev-story-panel" data-open="true">
        <header className="inv-dev__head">
          <strong>DEV STORY</strong>
          <button type="button" data-testid="dev-panel-close" aria-label="Fechar" onClick={() => setOpen(false)}>
            ×
          </button>
        </header>

        <div className="inv-dev__progress">
          <p className="inv-dev__progress-label">Progresso da campanha</p>
          <div className="inv-dev__progress-row">
            <div className="inv-dev__bar" aria-hidden>
              <span style={{ width: `${progress.percent}%` }} />
            </div>
            <span className="inv-dev__pct">{progress.percent}%</span>
          </div>
          <p className="inv-dev__current-block">
            Bloco atual
            <strong>
              BLOCO {String(currentBlock).padStart(2, '0')} —{' '}
              {DEV_BLOCK_SECTIONS.find((s) => s.block === currentBlock)?.title}
            </strong>
          </p>
          {validation && !validation.ok ? (
            <p className="inv-dev__current-block" data-testid="dev-manifest-issues" style={{ color: '#e0a84a' }}>
              Manifesto: {validation.issues.length + validation.orderMismatch.length} problema(s) — ver console
            </p>
          ) : null}
        </div>

        <div className="inv-dev__scroll">
          {DEV_BLOCK_SECTIONS.map((section) => {
            const status = resolveBlockStatus(section.block, flags, currentBlock)
            const openBlock = isExpanded(section.block)
            return (
              <section key={section.block} className="inv-dev__block" data-status={status}>
                <button
                  type="button"
                  className="inv-dev__block-head"
                  onClick={() => toggleBlock(section.block)}
                  aria-expanded={openBlock}
                >
                  <span className="inv-dev__chev">{openBlock ? '▾' : '▸'}</span>
                  <span className="inv-dev__block-num">{String(section.block).padStart(2, '0')}</span>
                  <span className="inv-dev__block-title">{section.title}</span>
                  <span className="inv-dev__block-mark" aria-hidden>
                    {status === 'done' ? '✓' : status === 'current' ? '●' : ''}
                  </span>
                </button>
                {openBlock ? (
                  <ol className="inv-dev__timeline">
                    {section.checkpoints.map((cp, i) => {
                      const cpStatus = resolveCheckpointStatus(cp, progress.currentIndex)
                      const last = i === section.checkpoints.length - 1
                      return (
                        <li key={cp.id} className="inv-dev__node" data-status={cpStatus}>
                          {!last ? <span className="inv-dev__rail" aria-hidden /> : null}
                          <button
                            type="button"
                            className="inv-dev__cp"
                            data-testid={`dev-${cp.id}`}
                            onClick={() => setPending(cp)}
                          >
                            <span className="inv-dev__dot" aria-hidden />
                            <span className="inv-dev__cp-label">{cp.label}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                ) : null}
              </section>
            )
          })}
        </div>

        <footer className="inv-dev__foot">
          <button type="button" data-testid="dev-reset" onClick={() => resetGame()}>
            Reset save
          </button>
        </footer>
      </aside>

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
