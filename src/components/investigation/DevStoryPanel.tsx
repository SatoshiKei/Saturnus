import { useMemo, useState } from 'react'
import {
  campaignProgressPercent,
  DEV_BLOCK_SECTIONS,
  getCumulativeActions,
  resolveBlockStatus,
  resolveCheckpointStatus,
  type DevCheckpointDef,
} from '../../game/story/devCheckpointCatalog'
import {
  getInvestigationState,
  loadDevCheckpoint,
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

export function DevStoryPanel() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<DevCheckpointDef | null>(null)
  const flags = useInvestigationFlags()
  const { shell } = useUiState()
  const { closeHub, closeLocationScene } = useGameHub()

  const progress = useMemo(() => campaignProgressPercent(flags), [flags])
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  const isExpanded = (block: number) => {
    if (expanded[block] !== undefined) return expanded[block]
    return block === progress.currentBlock
  }

  const toggleBlock = (block: number) => {
    setExpanded((prev) => ({ ...prev, [block]: !isExpanded(block) }))
  }

  const applyCheckpoint = (cp: DevCheckpointDef) => {
    loadDevCheckpoint(getCumulativeActions(cp.id))
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
              BLOCO {String(progress.currentBlock).padStart(2, '0')} —{' '}
              {DEV_BLOCK_SECTIONS.find((s) => s.block === progress.currentBlock)?.title}
            </strong>
          </p>
        </div>

        <div className="inv-dev__scroll">
          {DEV_BLOCK_SECTIONS.map((section) => {
            const status = resolveBlockStatus(section.block, flags, progress.currentBlock)
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
              O estado atual será substituído por um snapshot de desenvolvimento.
            </p>
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
