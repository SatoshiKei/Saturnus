import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { assetPath } from '../../../lib/assetPath'
import { getInvestigationState, setFlag } from '../../../game/state/investigationStore'
import { reflectionForScene, type ReflectionDef } from '../../../data/reflections'
import { sceneIntros, type SceneId } from '../../../data/sceneIntros'
import { playSfx } from '../../../lib/sfx'
import '../../../styles/scene-transitions.css'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/* ───────────────────────── Abertura: cabeçalho digitado ───────────────────────── */

const CHAR_MS = 16
const LINE_PAUSE_MS = 160

export function TerminalIntro({
  lines,
  onDone,
  ambience,
}: {
  lines: string[]
  onDone: () => void
  ambience?: 'scene-in' | 'ambience-hush'
}) {
  const reduced = prefersReducedMotion()
  const [typed, setTyped] = useState<string[]>(() => (reduced ? lines : []))
  const doneRef = useRef(false)

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }, [onDone])

  useEffect(() => {
    if (ambience) playSfx(ambience)
  }, [ambience])

  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(finish, 700)
      return () => window.clearTimeout(t)
    }
    let cancelled = false
    let timer = 0
    const run = (li: number, ci: number) => {
      if (cancelled) return
      if (li >= lines.length) {
        timer = window.setTimeout(finish, 420)
        return
      }
      const line = lines[li]
      if (ci > line.length) {
        timer = window.setTimeout(() => run(li + 1, 0), LINE_PAUSE_MS)
        return
      }
      setTyped((prev) => {
        const next = prev.slice(0, li)
        next[li] = line.slice(0, ci)
        return next
      })
      if (ci > 0 && ci % 3 === 0) playSfx('keyboard')
      timer = window.setTimeout(() => run(li, ci + 1), CHAR_MS)
    }
    run(0, 0)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [lines, reduced, finish])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        finish()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [finish])

  return (
    <div className="tr-intro" data-testid="vn-intro" onClick={finish} role="presentation">
      <div className="tr-intro__lines" aria-label={lines.join(', ')}>
        {typed.map((l, i) => (
          <p key={i} className={`tr-intro__line tr-intro__line--${i === 0 ? 'date' : i === 1 ? 'time' : 'place'}`}>
            {l}
            {i === typed.length - 1 ? <span className="tr-intro__caret" aria-hidden /> : null}
          </p>
        ))}
      </div>
      <button
        type="button"
        className="tr-skip"
        data-testid="vn-intro-skip"
        onClick={(e) => {
          e.stopPropagation()
          finish()
        }}
      >
        Pular
      </button>
    </div>
  )
}

/* ───────────────────────── Modo Reflexão (NVL interno de Augusto) ───────────────────────── */

export function ReflectionView({
  blocks,
  background,
  onDone,
}: {
  blocks: string[]
  background?: string
  onDone: () => void
}) {
  const [shown, setShown] = useState(1)
  const atEnd = shown >= blocks.length
  const scrollRef = useRef<HTMLDivElement>(null)

  const advance = useCallback(() => {
    if (shown < blocks.length) {
      playSfx('ui')
      setShown((n) => n + 1)
    }
  }, [shown, blocks.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopPropagation()
        if (atEnd) onDone()
        else advance()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onDone()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [advance, atEnd, onDone])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [shown])

  return (
    <div
      className="tr-refl"
      data-testid="reflection-view"
      style={background ? { backgroundImage: `url(${assetPath(background)})` } : undefined}
      onClick={() => (atEnd ? undefined : advance())}
      role="presentation"
    >
      <div className="tr-refl__veil" aria-hidden />
      <button
        type="button"
        className="tr-skip"
        data-testid="reflection-skip"
        onClick={(e) => {
          e.stopPropagation()
          onDone()
        }}
      >
        Pular
      </button>
      <div className="tr-refl__column" ref={scrollRef}>
        <p className="tr-refl__who">AUGUSTO</p>
        {blocks.slice(0, shown).map((b, i) => (
          <p key={i} className="tr-refl__block">
            {b}
          </p>
        ))}
        <div className="tr-refl__foot">
          {atEnd ? (
            <button
              type="button"
              className="tr-refl__done"
              data-testid="reflection-done"
              onClick={(e) => {
                e.stopPropagation()
                onDone()
              }}
            >
              Continuar
            </button>
          ) : (
            <span className="tr-refl__hint">Clique ou Espaço para continuar</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Sequência completa: viagem → intro → cena → reflexão → fade ───────────────────────── */

type Phase = 'intro' | 'scene' | 'reflection' | 'outro'

const FADE_MS = 900
const HOLD_MS = 450

/**
 * Sistema reutilizável de transição investigação ↔ VN.
 *   fade in → cabeçalho digitado → ambiência → cena → (reflexão opcional) → fade → retorno à mesa.
 * `onReturn` é chamado com a tela em preto; quem o chama é responsável pelo fade de volta.
 */
export function SceneRunner({
  sceneId,
  onReturn,
  renderScene,
  reflection,
}: {
  sceneId: SceneId
  onReturn: () => void
  renderScene: (close: () => void) => ReactNode
  /** Substitui a reflexão padrão da cena (ex.: cena das seis ligações). */
  reflection?: ReflectionDef | null
}) {
  const intro = sceneIntros[sceneId]
  const [phase, setPhase] = useState<Phase>('intro')
  const [black, setBlack] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  const startOutro = useCallback(() => {
    setPhase('outro')
    setBlack(true)
    playSfx('scene-out')
    timers.current.push(window.setTimeout(onReturn, FADE_MS + HOLD_MS))
  }, [onReturn])

  const closeScene = useCallback(() => {
    const def = reflection === undefined ? reflectionForScene(sceneId) : reflection
    const s = getInvestigationState()
    if (def && (!def.whenFlag || s.flags[def.whenFlag]) && !s.flags[`${def.id}_seen`]) {
      setPhase('reflection')
      return
    }
    startOutro()
  }, [reflection, sceneId, startOutro])

  const reflectionDef = reflection === undefined ? reflectionForScene(sceneId) : reflection

  return (
    <div className="tr-runner" data-testid="scene-runner" data-phase={phase}>
      {phase !== 'intro' ? renderScene(closeScene) : null}
      {phase === 'intro' ? (
        <TerminalIntro lines={intro.lines} ambience={intro.ambience} onDone={() => setPhase('scene')} />
      ) : null}
      {phase === 'reflection' && reflectionDef ? (
        <ReflectionView
          blocks={reflectionDef.blocks}
          background={reflectionDef.background}
          onDone={() => {
            setFlag(`${reflectionDef.id}_seen`, true)
            startOutro()
          }}
        />
      ) : null}
      <div className={`tr-fade${black ? ' tr-fade--on' : ''}`} data-testid="vn-fade" aria-hidden />
    </div>
  )
}
