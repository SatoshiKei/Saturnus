import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { assetPath } from '../../../lib/assetPath'
import { useGalleryPlayback } from '../../../app/GalleryPlaybackContext'
import { getInvestigationState, setFlag } from '../../../game/state/investigationStore'
import { afterReflectionComplete } from '../../../game/story/reflectionAftermath'
import { reflectionForScene, type ReflectionDef } from '../../../data/reflections'
import { sceneIntros, type SceneId } from '../../../data/sceneIntros'
import { onSfxUnlocked, playSfx, unlockSfxAudio } from '../../../lib/sfx'
import { VnBgmProvider, useVnBgmDuck } from './VnBgmContext'
import { useAdvTypewriter } from './useAdvTypewriter'
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

const REFL_ADVANCE_DEBOUNCE_MS = import.meta.env.MODE === 'test' ? 0 : 140

function ReflectionViewBody({
  blocks,
  background,
  onDone,
}: {
  blocks: string[]
  background?: string
  onDone: () => void
}) {
  const vnBgm = useVnBgmDuck()
  const rootRef = useRef<HTMLDivElement>(null)
  const [blockIndex, setBlockIndex] = useState(0)
  const atEnd = blocks.length > 0 && blockIndex >= blocks.length - 1
  const [endPrimed, setEndPrimed] = useState(false)
  const [fading, setFading] = useState(false)
  const [sfxPrimed, setSfxPrimed] = useState(false)
  const wheelLock = useRef(0)
  const advanceLock = useRef(0)
  const doneRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const reducedMotion =
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)
  const typewriterEnabled = import.meta.env.MODE !== 'test'
  const speechBlipsOn = typewriterEnabled

  const activeText = blocks[blockIndex] ?? ''
  const typewriter = useAdvTypewriter(activeText, {
    enabled: typewriterEnabled && Boolean(activeText),
    charMs: reducedMotion ? 12 : 28,
    typingSfx: speechBlipsOn && sfxPrimed,
    speechBlipGain: 0.82,
  })

  const primeSpeechAudio = useCallback(() => {
    if (!speechBlipsOn) return
    unlockSfxAudio()
  }, [speechBlipsOn])

  useEffect(() => {
    if (!speechBlipsOn) return
    return onSfxUnlocked(() => setSfxPrimed(true))
  }, [speechBlipsOn])

  useEffect(() => {
    if (!speechBlipsOn || sfxPrimed) return
    const onPrime = () => primeSpeechAudio()
    window.addEventListener('pointerdown', onPrime, { capture: true })
    window.addEventListener('keydown', onPrime, { capture: true })
    return () => {
      window.removeEventListener('pointerdown', onPrime, { capture: true })
      window.removeEventListener('keydown', onPrime, { capture: true })
    }
  }, [primeSpeechAudio, sfxPrimed, speechBlipsOn])

  useEffect(() => {
    if (!typewriterEnabled) return
    vnBgm.setDuck(typewriter.isTyping)
    return () => vnBgm.setDuck(false)
  }, [typewriter.isTyping, typewriterEnabled, vnBgm])

  useEffect(() => {
    setBlockIndex(0)
    setEndPrimed(false)
    doneRef.current = false
  }, [blocks])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [blockIndex, blocks, typewriter.displayedText])

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
    setFading(true)
    playSfx('fade')
  }, [onDone])

  const advance = useCallback(() => {
    if (doneRef.current || fading) return
    if (blocks.length === 0) {
      finish()
      return
    }

    primeSpeechAudio()

    const now = Date.now()
    if (now - advanceLock.current < REFL_ADVANCE_DEBOUNCE_MS) return
    advanceLock.current = now

    if (typewriter.consumeAdvance()) return

    if (blockIndex < blocks.length - 1) {
      playSfx('ui')
      setBlockIndex((n) => n + 1)
      setEndPrimed(false)
      return
    }
    if (!endPrimed) {
      setEndPrimed(true)
      return
    }
    finish()
  }, [blockIndex, blocks.length, endPrimed, fading, finish, primeSpeechAudio, typewriter])

  const wheelDeltaY = useCallback((e: WheelEvent) => {
    if (e.deltaMode === 1) return e.deltaY * 16
    if (e.deltaMode === 2) return e.deltaY * window.innerHeight
    return e.deltaY
  }, [])

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (doneRef.current || fading) return
      const now = Date.now()
      if (now - wheelLock.current < 100) return

      const dy = wheelDeltaY(e)
      if (dy <= 0) return

      const el = scrollRef.current
      if (el) {
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 12
        if (!atBottom) return
      }

      e.preventDefault()
      wheelLock.current = now
      advance()
    },
    [advance, fading, wheelDeltaY],
  )

  useLayoutEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const root = rootRef.current
      if (!root?.contains(e.target as Node)) return
      handleWheel(e)
    }
    document.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => document.removeEventListener('wheel', onWheel, { capture: true })
  }, [handleWheel])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (doneRef.current || fading) return
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        e.stopPropagation()
        advance()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        finish()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [advance, fading, finish])

  const footHint =
    blocks.length === 0
      ? 'Encerrar reflexão'
      : atEnd
        ? endPrimed
          ? 'Encerrar reflexão'
          : 'Confirmar leitura'
        : 'Clique ou Espaço para continuar'

  return (
    <div
      ref={rootRef}
      className={`vn-nvl tr-refl${fading ? ' tr-refl--out' : ''}`}
      data-testid="reflection-view"
      data-end-primed={endPrimed || undefined}
      data-inert={fading || undefined}
      data-text-ready={typewriter.ready || undefined}
      style={{
        ...(background ? { backgroundImage: `url(${assetPath(background)})` } : undefined),
        pointerEvents: fading ? 'none' : undefined,
      }}
      onClick={() => {
        if (fading) return
        primeSpeechAudio()
        advance()
      }}
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
      <div className="vn-nvl__column tr-refl__column">
        <div ref={scrollRef} className="vn-nvl__page tr-refl__scroll" data-vn-history-scroll>
          {blocks.slice(0, blockIndex).map((b, i) => (
            <div key={`done-${i}`} className="vn-nvl__block tr-refl__block">
              {i === 0 ? <p className="vn-nvl__speaker">AUGUSTO</p> : null}
              <p className="vn-nvl__text">{b}</p>
            </div>
          ))}
          {blocks.length > 0 && blockIndex < blocks.length ? (
            <div key={`active-${blockIndex}`} className="vn-nvl__block tr-refl__block">
              {blockIndex === 0 ? <p className="vn-nvl__speaker">AUGUSTO</p> : null}
              <p className="vn-nvl__text">{typewriter.displayedText}</p>
            </div>
          ) : null}
        </div>
        <div className="vn-nvl__foot">
          <span className="vn-nvl__next-hint">{footHint}</span>
          <span className="vn-adv__next vn-nvl__chevron" aria-hidden />
        </div>
      </div>
    </div>
  )
}

export function ReflectionView({
  blocks,
  background,
  reflectionId,
  sceneId,
  onDone,
}: {
  blocks: string[]
  background?: string
  reflectionId?: string
  sceneId?: SceneId
  onDone: () => void
}) {
  const body = <ReflectionViewBody blocks={blocks} background={background} onDone={onDone} />
  if (!reflectionId) return body
  return (
    <VnBgmProvider reflectionId={reflectionId} sceneId={sceneId}>
      {body}
    </VnBgmProvider>
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
  const gallery = useGalleryPlayback()
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
    const seenKey = def ? `${def.id}_seen` : ''
    const showRefl =
      def &&
      (!def.whenFlag || s.flags[def.whenFlag]) &&
      (gallery || !s.flags[seenKey])
    if (showRefl) {
      setBlack(true)
      const delay = prefersReducedMotion() ? 0 : 320
      timers.current.push(
        window.setTimeout(() => {
          setPhase('reflection')
          timers.current.push(
            window.setTimeout(() => setBlack(false), prefersReducedMotion() ? 0 : 120),
          )
        }, delay),
      )
      return
    }
    startOutro()
  }, [gallery, reflection, sceneId, startOutro])

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
            reflectionId={reflectionDef.id}
            sceneId={reflectionDef.sceneId}
            onDone={() => {
              if (!gallery) {
                setFlag(`${reflectionDef.id}_seen`, true)
                afterReflectionComplete(reflectionDef.id)
              }
              setPhase('outro')
              startOutro()
            }}
          />
        </div>
      ) : null}
      <div className={`tr-fade${black ? ' tr-fade--on' : ''}`} data-testid="vn-fade" aria-hidden />
    </div>
  )
}
