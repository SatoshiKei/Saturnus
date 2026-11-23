import { useCallback, useEffect, useRef, useState } from 'react'
import type { MariPuzzleHint } from '../../data/companion/mariPuzzleHints'
import {
  nextMariPuzzleHintTier,
  type MariForensicProgress,
  type MariRingsProgress,
} from '../../data/companion/mariPuzzleProgressHints'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { setFlag } from '../../game/state/investigationStore'
import { portraitSrcForStory } from '../../lib/characterSprites'
import '../../styles/mari-workbench-hints.css'

interface MariWorkbenchHintsProps {
  puzzleId: string
  /** Legado: interações na UI (não dispara tier sozinho). */
  activityCount?: number
  puzzleCompleted?: boolean
  forensicProgress?: MariForensicProgress
  ringsProgress?: MariRingsProgress
}

/**
 * Dicas da Mari durante sessão forense — compacto, sem bloquear a UI.
 */
export function MariWorkbenchHints({
  puzzleId,
  activityCount: _activityCount = 0,
  puzzleCompleted,
  forensicProgress,
  ringsProgress,
}: MariWorkbenchHintsProps) {
  const inv = useInvestigation()
  const [active, setActive] = useState<MariPuzzleHint | null>(null)
  const openedAt = useRef(Date.now())
  const lastActivityAt = useRef(Date.now())
  const lastDismissAt = useRef(0)
  const [idleSec, setIdleSec] = useState(0)
  const [openSec, setOpenSec] = useState(0)
  const [sinceDismissSec, setSinceDismissSec] = useState(999)

  useEffect(() => {
    openedAt.current = Date.now()
    lastActivityAt.current = Date.now()
    lastDismissAt.current = 0
    setActive(null)
  }, [puzzleId])

  useEffect(() => {
    lastActivityAt.current = Date.now()
  }, [_activityCount, forensicProgress, ringsProgress])

  useEffect(() => {
    const t = window.setInterval(() => {
      const now = Date.now()
      setOpenSec((now - openedAt.current) / 1000)
      setIdleSec((now - lastActivityAt.current) / 1000)
      setSinceDismissSec(
        lastDismissAt.current > 0 ? (now - lastDismissAt.current) / 1000 : 999,
      )
    }, 500)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    if (puzzleCompleted) return
    if (active) return
    const next = nextMariPuzzleHintTier(puzzleId, inv.flags, {
      sessionOpenSec: openSec,
      idleSec,
      secSinceLastDismiss: sinceDismissSec,
      forensic: forensicProgress,
      rings: ringsProgress,
    })
    if (next) setActive(next)
  }, [
    puzzleId,
    inv.flags,
    openSec,
    idleSec,
    sinceDismissSec,
    active,
    puzzleCompleted,
    forensicProgress,
    ringsProgress,
  ])

  const dismiss = useCallback(() => {
    if (!active) return
    setFlag(active.seenFlag, true)
    lastDismissAt.current = Date.now()
    setSinceDismissSec(0)
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