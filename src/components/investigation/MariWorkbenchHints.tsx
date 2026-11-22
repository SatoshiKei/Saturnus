import { useCallback, useEffect, useRef, useState } from 'react'
import { nextMariPuzzleHintTier, type MariPuzzleHint } from '../../data/companion/mariPuzzleHints'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { setFlag } from '../../game/state/investigationStore'
import { portraitSrcForStory } from '../../lib/characterSprites'
import '../../styles/mari-workbench-hints.css'

interface MariWorkbenchHintsProps {
  puzzleId: string
  /** Incrementa quando o jogador mexe na bancada (play, inspector, etc.). */
  activityCount: number
  puzzleCompleted?: boolean
}

/**
 * Dicas da Mari durante sessão forense — compacto, sem bloquear a UI.
 */
export function MariWorkbenchHints({ puzzleId, activityCount, puzzleCompleted }: MariWorkbenchHintsProps) {
  const inv = useInvestigation()
  const [active, setActive] = useState<MariPuzzleHint | null>(null)
  const openedAt = useRef(Date.now())
  const lastActivityAt = useRef(Date.now())
  const [idleSec, setIdleSec] = useState(0)
  const [openSec, setOpenSec] = useState(0)

  useEffect(() => {
    openedAt.current = Date.now()
    lastActivityAt.current = Date.now()
    setActive(null)
  }, [puzzleId])

  useEffect(() => {
    lastActivityAt.current = Date.now()
  }, [activityCount])

  useEffect(() => {
    const t = window.setInterval(() => {
      const now = Date.now()
      setOpenSec((now - openedAt.current) / 1000)
      setIdleSec((now - lastActivityAt.current) / 1000)
    }, 2000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    if (puzzleCompleted) return
    if (active) return
    const next = nextMariPuzzleHintTier(
      puzzleId,
      inv.flags,
      activityCount,
      idleSec,
      openSec,
    )
    if (next) setActive(next)
  }, [puzzleId, inv.flags, activityCount, idleSec, openSec, active, puzzleCompleted])

  const dismiss = useCallback(() => {
    if (!active) return
    setFlag(active.seenFlag, true)
    setActive(null)
  }, [active])

  if (!active || puzzleCompleted) return null

  return (
    <aside
      className="mari-fw-hint"
      data-testid="mari-workbench-hint"
      data-hint={active.id}
      aria-live="polite"
    >
      <img className="mari-fw-hint__portrait" src={portraitSrcForStory('mari')} alt="" />
      <div className="mari-fw-hint__body">
        <span className="mari-fw-hint__who">Mari</span>
        <p className="mari-fw-hint__text">{active.text}</p>
        <button type="button" className="mari-fw-hint__ok" onClick={dismiss}>
          Entendi
        </button>
      </div>
    </aside>
  )
}