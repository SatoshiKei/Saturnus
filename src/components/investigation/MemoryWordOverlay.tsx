import { useEffect } from 'react'
import { MEMORY_WORD } from '../../data/block09/memoryPuzzle'
import { dismissMemoryWordOverlay } from '../../game/story/block09Handlers'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { setFullscreenScene } from '../../app/uiStore'

/** Apresentação final da palavra — só após Puzzle 12. */
export function MemoryWordOverlay() {
  const inv = useInvestigation()
  const visible =
    Boolean(inv.flags.block09_memory_word_shown) && !inv.flags.block09_memory_word_dismissed

  useEffect(() => {
    if (!visible) return
    setFullscreenScene(true)
    return () => setFullscreenScene(false)
  }, [visible])

  if (!visible) return null

  return (
    <div className="tr-refl-layer" data-testid="memory-word-overlay" role="dialog" aria-modal="true">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '1.5rem',
          background: 'radial-gradient(ellipse at center, #0c1218 0%, #050708 70%)',
          color: '#c9d6d4',
          letterSpacing: '0.35em',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.55, letterSpacing: '0.2em' }}>SATURNUS</p>
        <p
          data-testid="memory-word-hero"
          style={{ margin: 0, fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 600 }}
        >
          {MEMORY_WORD}
        </p>
        <button
          type="button"
          className="pc-inline"
          data-testid="memory-word-continue"
          onClick={() => dismissMemoryWordOverlay()}
          style={{ letterSpacing: '0.08em' }}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
