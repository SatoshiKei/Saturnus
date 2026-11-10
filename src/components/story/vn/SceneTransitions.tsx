import { useCallback, useEffect, useRef, useState, type ReactNode, type WheelEvent } from 'react'
import { assetPath } from '../../../lib/assetPath'
import { getInvestigationState, setFlag } from '../../../game/state/investigationStore'
import { afterReflectionComplete } from '../../../game/story/reflectionAftermath'
import { reflectionForScene, type ReflectionDef } from '../../../data/reflections'
import { sceneIntros, type SceneId } from '../../../data/sceneIntros'
import { playSfx } from '../../../lib/sfx'
import '../../../styles/scene-transitions.css'
import '../../../styles/visual-novel.css'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/* ───────────────────────── Abertura: cabeçalho digitado ───────────────────────── */

const INTRO_HOLD_MS = 1400
const INTRO_FADE_MS = 500

export function TerminalIntro({
  lines,
  onDone,
  onReveal,
  ambience,
}: {
  lines: string[]
  onDone: () => void
  /** Monta a cena sob o fade preto (transição intro → VN). */
  onReveal?: () => void
  ambience?: 'scene-in' | 'ambience-hush'
}) {
  const reduced = prefersReducedMotion()
  const [fading, setFading] = useState(false)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)
  const onRevealRef = useRef(onReveal)
  onDoneRef.current = onDone
  onRevealRef.current = onReveal

  const finish = useCallback((skipped = false) => {
    if (doneRef.current) return
    doneRef.current = true
    setFading(true)
    playSfx(skipped ? 'ui' : 'fade')
    window.setTimeout(() => onDoneRef.current(), reduced ? 160 : INTRO_FADE_MS)
  }, [reduced])

  useEffect(() => {
    if (ambience) playSfx(ambience)
  }, [ambience])

  useEffect(() => {
    doneRef.current = false
    setFading(false)
    onRevealRef.current?.()
    if (reduced) {
      const t = window.setTimeout(() => finish(false), 400)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => finish(false), INTRO_HOLD_MS)
    return () => window.clearTimeout(t)
  }, [lines.join('\n'), finish, reduced])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        finish(true)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [finish])

  return (
    <div
      className={`tr-intro${fading ? ' tr-intro--out' : ''}`}
      data-testid="vn-intro"
      role="presentation"
    >
      <div className="tr-intro__lines" aria-label={lines.join(', ')}>
        {lines.map((l, i) => (
          <p key={i} className={`tr-intro__line tr-intro__line--${i === 0 ? 'date' : i === 1 ? 'time' : 'place'}`}>
            {l}
          </p>
        ))}
      </div>
      <button
        type="button"
        className="tr-skip"
        data-testid="vn-intro-skip"
        onClick={() => finish(true)}
      >
        Pular
      </button>
    </div>
  )
}

/* ───────────────────────── Modo Reflexão (mesmo padrão NVL das cenas VN) ───────────────────────── */

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
  const [endPrimed, setEndPrimed] = useState(false)
  const [fading, setFading] = useState(false)
  const wheelLock = useRef(0)
  const doneRef = useRef(false)

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setFading(true)
    playSfx('fade')
    window.setTimeout(() => onDone(), prefersReducedMotion() ? 120 : 520)
  }, [onDone])

  const advance = useCallback(() => {
    if (doneRef.current) return
    if (shown < blocks.length) {
      playSfx('ui')
      setShown((n) => n + 1)
      setEndPrimed(false)
      return
    }
    if (!endPrimed) {
      setEndPrimed(true)
      return
    }
    finish()
  }, [shown, blocks.length, endPrimed, finish])

  const rewind = useCallback(() => {
    if (doneRef.current) return
    if (shown > 1) setShown((n) => Math.max(1, n - 1))
  }, [shown])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopPropagation()
        advance()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        e.stopPropagation()
        rewind()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        finish()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [advance, atEnd, finish, rewind])

  const onWheel = (e: WheelEvent) => {
    const now = Date.now()
    if (now - wheelLock.current < 120) return
    wheelLock.current = now
    e.preventDefault()
    if (e.deltaY > 0) {
      advance()
    } else if (e.deltaY < 0) {
      rewind()
    }
  }

  return (
    <div
      className={`vn-nvl tr-refl${fading ? ' tr-refl--out' : ''}`}
      data-testid="reflection-view"
      data-end-primed={endPrimed || undefined}
      style={background ? { backgroundImage: `url(${assetPath(background)})` } : undefined}
      onClick={() => {
        advance()
      }}
      onWheel={onWheel}
      role="presentation"
    >
      <div className="vn-nvl__veil" aria-hidden />
      <button
        type="button"
        className="tr-skip"
        data-testid="reflection-skip"
        onClick={(e) => {
          e.stopPropagation()
          finish()
        }}
      >
        Pular
      </button>
      <div className="vn-nvl__column">
        <div className="vn-nvl__page">
          {blocks.slice(0, shown).map((b, i) => (
            <div key={i} className="vn-nvl__block tr-refl__block">
              {i === 0 ? <p className="vn-nvl__speaker">AUGUSTO</p> : null}
              <p className="vn-nvl__text">{b}</p>
            </div>
          ))}
        </div>
        <div className="vn-nvl__foot">
          <span className="vn-nvl__next-hint">
            {atEnd ? (endPrimed ? 'Encerrar reflexão' : 'Confirmar leitura') : 'Clique ou Espaço para continuar'}
          </span>
          <span className="vn-adv__next vn-nvl__chevron" aria-hidden />
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
  /** Cena montada sob a intro durante o fade de saída. */
  const [sceneReady, setSceneReady] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  const startOutro = useCallback(() => {
    setBlack(true)
    playSfx('scene-out')
    // Mantém a reflexão sob o fade preto; só troca a fase depois do escurecer.
    timers.current.push(
      window.setTimeout(() => {
        setPhase('outro')
        onReturn()
      }, FADE_MS + HOLD_MS),
    )
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

  const revealScene = useCallback(() => setSceneReady(true), [])
  const beginScene = useCallback(() => setPhase('scene'), [])

  const reflectionDef = reflection === undefined ? reflectionForScene(sceneId) : reflection

  const showInterview = phase === 'scene' || (phase === 'intro' && sceneReady)

  return (
    <div className="tr-runner" data-testid="scene-runner" data-phase={phase}>
      {/* Durante a reflexão a entrevista sai de cena — senão o ADV fica por cima do NVL. */}
      {showInterview ? renderScene(closeScene) : null}
      {phase === 'intro' ? (
        <TerminalIntro
          lines={intro.lines}
          ambience={intro.ambience}
          onReveal={revealScene}
          onDone={beginScene}
        />
      ) : null}
      {phase === 'reflection' && reflectionDef ? (
        <div className="tr-refl-layer" data-testid="reflection-layer">
          <ReflectionView
            blocks={reflectionDef.blocks}
            background={reflectionDef.background}
            onDone={() => {
              setFlag(`${reflectionDef.id}_seen`, true)
              afterReflectionComplete(reflectionDef.id)
              startOutro()
            }}
          />
        </div>
      ) : null}
      <div className={`tr-fade${black ? ' tr-fade--on' : ''}`} data-testid="vn-fade" aria-hidden />
    </div>
  )
}
