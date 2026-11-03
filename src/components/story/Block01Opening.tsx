import { useEffect, useState } from 'react'
import { setFlag } from '../../game/state/investigationStore'
import '../../styles/visual-novel.css'

/** Abertura do Bloco 1 — data/hora, depois a sala. */
export function Block01Opening({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'black' | 'title' | 'done'>('black')

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('title'), 900)
    const t2 = window.setTimeout(() => {
      setFlag('block01_opening_seen', true)
      setPhase('done')
      onDone()
    }, 4200)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [onDone])

  if (phase === 'done') return null

  return (
    <div className="block01-opening" data-testid="block01-opening">
      {phase === 'title' ? (
        <p className="block01-opening__date">3 de novembro de 2026 — 08:42</p>
      ) : null}
    </div>
  )
}
