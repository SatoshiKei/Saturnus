import { useEffect, useState } from 'react'
import { setFlag } from '../../game/state/investigationStore'
import '../../styles/visual-novel.css'

const SHOW_MS = 220
const HOLD_MS = 1300
const FADE_MS = 480

/** Abertura do Bloco 1 — data/hora breve, depois a sala. */
export function Block01Opening({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'black' | 'title' | 'out'>('black')

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('title'), SHOW_MS)
    const t2 = window.setTimeout(() => setPhase('out'), SHOW_MS + HOLD_MS)
    const t3 = window.setTimeout(() => {
      setFlag('block01_opening_seen', true)
      onDone()
    }, SHOW_MS + HOLD_MS + FADE_MS)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [onDone])

  return (
    <div
      className={`block01-opening${phase === 'out' ? ' block01-opening--out' : ''}`}
      data-testid="block01-opening"
    >
      {phase !== 'black' ? (
        <p className="block01-opening__date">3 de novembro de 2026 — 08:42</p>
      ) : null}
    </div>
  )
}
