import { useState } from 'react'
import {
  CANONICAL_PUZZLES,
  devCompletePuzzle,
  puzzleHasRevealStage,
  type CanonicalPuzzleId,
  type PuzzleCompletionReport,
} from './canonicalPuzzleCompletion'

function summarize(r: PuzzleCompletionReport): string {
  if (r.blocked) return `${r.puzzleId} bloqueado — ${r.blocked}`
  const parts = [`${r.puzzleId}: ${r.applied.join(' → ') || 'nada novo'}`]
  for (const s of r.skipped) parts.push(`pulou ${s.stage} (${s.reason})`)
  if (r.devBypass) parts.push(`devBypass ${r.devBypass.reason}`)
  return parts.join(' · ')
}

/**
 * DEV QA: conclui o puzzle pela via canônica (handlers reais).
 * Puzzles com etapa `reveal` oferecem: só técnico, técnico + tocar cena, técnico + marcar cena vista.
 */
export function DevPuzzleToolbar({
  puzzleId,
  onApplied,
  onPlayReveal,
}: {
  puzzleId: CanonicalPuzzleId
  /** Remonta a bancada para refletir o estado persistido novo. */
  onApplied?: () => void
  /** Solicita a cena de revelação no workspace especializado. */
  onPlayReveal?: () => void
}) {
  const [msg, setMsg] = useState<string | null>(null)
  if (!import.meta.env.DEV) return null
  const def = CANONICAL_PUZZLES[puzzleId]
  const hasReveal = puzzleHasRevealStage(puzzleId)

  const run = (includeReveal: boolean, playReveal = false) => {
    const r = devCompletePuzzle(puzzleId, { includeReveal })
    setMsg(summarize(r))
    if (r.applied.length) onApplied?.()
    if (playReveal && !r.blocked) onPlayReveal?.()
  }

  return (
    <div className="fw-dev-complete" data-testid="dev-puzzle-toolbar" title={def.title}>
      <button
        type="button"
        className="fw-btn fw-btn--dev"
        data-testid="dev-complete-puzzle"
        onClick={() => run(false)}
      >
        {hasReveal ? 'DEV · SKIP CUTSCENE' : 'DEV · COMPLETE PUZZLE'}
      </button>
      {hasReveal ? (
        <>
          <button
            type="button"
            className="fw-btn fw-btn--dev"
            data-testid="dev-complete-play-reveal"
            onClick={() => run(false, true)}
          >
            DEV · COMPLETE + PLAY REVEAL
          </button>
          <button
            type="button"
            className="fw-btn fw-btn--dev"
            data-testid="dev-complete-mark-reveal"
            onClick={() => run(true)}
          >
            DEV · COMPLETE + MARK REVEAL SEEN
          </button>
        </>
      ) : null}
      {msg ? (
        <span className="fw-dev-complete__msg" data-testid="dev-complete-status" role="status" title={msg}>
          {msg}
        </span>
      ) : null}
    </div>
  )
}
