import { useMemo, useState } from 'react'
import {
  campaignProgressPercent,
  DEV_BLOCK_SECTIONS,
  resolveBlockStatus,
  resolveCheckpointStatus,
  type DevCheckpointDef,
} from '../../game/story/devCheckpointCatalog'
import { validateCanonicalManifest } from '../../game/story/canonicalStoryManifest'
import { subscribeInvestigation, getInvestigationState } from '../../game/state/investigationStore'
import { useSyncExternalStore } from 'react'

function useInvestigationFlags() {
  return useSyncExternalStore(
    subscribeInvestigation,
    () => getInvestigationState().flags,
    () => getInvestigationState().flags,
  )
}

export type CampaignProgressMode = 'dev' | 'player'

/**
 * Timeline canônica da campanha — modo DEV (clicável) ou jogador (só leitura, spoilers borrados).
 */
export function CampaignProgressPanel({
  mode,
  onClose,
  onPickCheckpoint,
  onResetSave,
}: {
  mode: CampaignProgressMode
  onClose: () => void
  onPickCheckpoint?: (cp: DevCheckpointDef) => void
  onResetSave?: () => void
}) {
  const flags = useInvestigationFlags()
  const progress = useMemo(() => campaignProgressPercent(flags), [flags])
  const validation = useMemo(() => {
    const v = validateCanonicalManifest()
    if (!v.ok && mode === 'dev') console.warn('[DEV STORY] manifesto canônico com problemas', v)
    return v
  }, [mode])

  const currentBlock = progress.currentBlock
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  const isExpanded = (block: number) => {
    if (expanded[block] !== undefined) return expanded[block]
    return block === currentBlock
  }

  const toggleBlock = (block: number) => {
    setExpanded((prev) => ({ ...prev, [block]: !isExpanded(block) }))
  }

  const playerMode = mode === 'player'
  const title = playerMode ? 'Progresso da investigação' : 'DEV STORY'
  const progressLabel = playerMode ? 'Avanço no caso' : 'Progresso da campanha'

  return (
    <aside
      className={`inv-dev${playerMode ? ' inv-dev--player' : ''}`}
      data-testid={playerMode ? 'player-campaign-panel' : 'dev-story-panel'}
      data-open="true"
    >
      <header className="inv-dev__head">
        <strong>{title}</strong>
        <button
          type="button"
          data-testid={playerMode ? 'campaign-panel-close' : 'dev-panel-close'}
          aria-label="Fechar"
          onClick={onClose}
        >
          ×
        </button>
      </header>

      <div className="inv-dev__progress">
        <p className="inv-dev__progress-label">{progressLabel}</p>
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
        {mode === 'dev' && validation && !validation.ok ? (
          <p className="inv-dev__current-block" data-testid="dev-manifest-issues" style={{ color: '#e0a84a' }}>
            Manifesto: {validation.issues.length + validation.orderMismatch.length} problema(s) — ver console
          </p>
        ) : null}
      </div>

      <div className="inv-dev__scroll">
        {DEV_BLOCK_SECTIONS.map((section) => {
          const status = resolveBlockStatus(section.block, flags, currentBlock)
          const openBlock = isExpanded(section.block)
          const hideBlockTitle = playerMode && section.block === 9 && status === 'future'
          return (
            <section key={section.block} className="inv-dev__block" data-status={status}>
              <button
                type="button"
                className="inv-dev__block-head"
                onClick={() => toggleBlock(section.block)}
                aria-expanded={openBlock}
                aria-label={
                  hideBlockTitle
                    ? `Bloco 09 — título ainda não revelado`
                    : `Bloco ${String(section.block).padStart(2, '0')} — ${section.title}`
                }
              >
                <span className="inv-dev__chev">{openBlock ? '▾' : '▸'}</span>
                <span className="inv-dev__block-num">{String(section.block).padStart(2, '0')}</span>
                {hideBlockTitle ? (
                  <span className="inv-dev__block-title-wrap">
                    <span className="inv-dev__block-title inv-dev__block-title--spoiler" aria-hidden>
                      {section.title}
                    </span>
                    <span className="inv-dev__block-title inv-dev__block-title--masked">···</span>
                  </span>
                ) : (
                  <span className="inv-dev__block-title">{section.title}</span>
                )}
                <span className="inv-dev__block-mark" aria-hidden>
                  {status === 'done' ? '✓' : status === 'current' ? '●' : ''}
                </span>
              </button>
              {openBlock ? (
                <ol className="inv-dev__timeline">
                  {section.checkpoints.map((cp, i) => {
                    const cpStatus = resolveCheckpointStatus(cp, progress.currentIndex)
                    const last = i === section.checkpoints.length - 1
                    const hideLabel = playerMode && cpStatus === 'future'
                    return (
                      <li key={cp.id} className="inv-dev__node" data-status={cpStatus}>
                        {!last ? <span className="inv-dev__rail" aria-hidden /> : null}
                        {mode === 'dev' ? (
                          <button
                            type="button"
                            className="inv-dev__cp"
                            data-testid={`dev-${cp.id}`}
                            onClick={() => onPickCheckpoint?.(cp)}
                          >
                            <span className="inv-dev__dot" aria-hidden />
                            <span className="inv-dev__cp-label">{cp.label}</span>
                          </button>
                        ) : (
                          <div className="inv-dev__cp inv-dev__cp--static" aria-label={hideLabel ? 'Marco ainda não alcançado' : cp.label}>
                            <span className="inv-dev__dot" aria-hidden />
                            {hideLabel ? (
                              <>
                                <span className="inv-dev__cp-label inv-dev__cp-label--spoiler" aria-hidden>
                                  {cp.label}
                                </span>
                                <span className="inv-dev__cp-label inv-dev__cp-label--masked">···</span>
                              </>
                            ) : (
                              <span className="inv-dev__cp-label">{cp.label}</span>
                            )}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ol>
              ) : null}
            </section>
          )
        })}
      </div>

      {mode === 'dev' && onResetSave ? (
        <footer className="inv-dev__foot">
          <button type="button" data-testid="dev-reset" onClick={onResetSave}>
            Reset save
          </button>
        </footer>
      ) : null}
    </aside>
  )
}