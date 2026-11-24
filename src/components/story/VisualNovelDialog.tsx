import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { onSfxUnlocked, unlockSfxAudio } from '../../lib/sfx'
import { useVnSceneHistory } from '../../lib/vnSceneHistory'
import { ADVDialogue } from './vn/ADVDialogue'
import { useVnBgmDuck } from './vn/VnBgmContext'
import { useAdvTypewriter } from './vn/useAdvTypewriter'
import { BacklogView } from './vn/NVLView'
import { ChoiceOverlay } from './vn/ChoiceOverlay'
import { VNCharacterLayer } from './vn/VNCharacterLayer'
import { VNControls } from './vn/VNControls'
import '../../styles/visual-novel.css'

export interface VnChoice {
  id: string
  label: string
}

export type VnLine = { speaker?: string; text: string; portraitSrc?: string }

const ADVANCE_DEBOUNCE_MS = import.meta.env.MODE === 'test' ? 0 : 140

interface VisualNovelDialogProps {
  speaker?: string
  text: string
  portraitSrc?: string
  /** Id do sprite (`CHARACTER_SPRITE_URLS`) — enquadramento VN por personagem. */
  portraitId?: string
  /**
   * Força lado do sprite. Sem isto: NPC à esquerda; Augusto/narracão sem retrato
   * (exceto se `forcePortrait`).
   */
  portraitSide?: 'left' | 'right' | 'none'
  /** Mostra `portraitSrc` mesmo com speaker Augusto / narração. */
  forcePortrait?: boolean
  /** @deprecated Histórico vem do buffer da cena (`VnSceneHistoryProvider`). */
  logLines?: VnLine[]
  choices?: VnChoice[]
  /** Texto curto acima das opções (não dentro da caixa ADV). */
  choiceHint?: string
  /** Tópicos de investigação vs respostas. */
  choiceVariant?: 'topics' | 'default'
  onChoice?: (id: string) => void
  onContinue?: () => void
  onRewind?: () => void
  continueLabel?: string
  /** Última fala da cena: primeiro input confirma leitura, segundo encerra. */
  terminalBeat?: boolean
  /** Narração interna (sem rótulo de personagem). */
  narration?: boolean
  extra?: ReactNode
}

export function VisualNovelDialog({
  speaker,
  text,
  portraitSrc,
  portraitId,
  portraitSide: portraitSideProp,
  forcePortrait,
  choices,
  choiceHint,
  choiceVariant = 'default',
  onChoice,
  onContinue,
  onRewind,
  continueLabel,
  terminalBeat,
  narration,
  extra,
}: VisualNovelDialogProps) {
  const vnBgm = useVnBgmDuck()
  const sceneHistory = useVnSceneHistory()
  const vnRootRef = useRef<HTMLDivElement>(null)
  const localLinesRef = useRef<VnLine[]>([])
  const localSeenRef = useRef(new Set<string>())
  const [localLines, setLocalLines] = useState<VnLine[]>([])
  const [endPrimed, setEndPrimed] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [sfxPrimed, setSfxPrimed] = useState(false)
  const wheelLock = useRef(0)
  const advanceLock = useRef(0)

  const hasChoices = Boolean(choices?.length)
  const canAdvance = Boolean(onContinue) && !hasChoices

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)

  const typewriterEnabled = import.meta.env.MODE !== 'test' && !hasChoices
  const speechBlipsOn = typewriterEnabled

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

  const typewriter = useAdvTypewriter(text, {
    enabled: typewriterEnabled,
    charMs: prefersReducedMotion ? 12 : 28,
    typingSfx: speechBlipsOn && sfxPrimed,
    speechBlipGain: narration || !speaker ? 0.82 : 0.95,
  })
  const canRewind = Boolean(onRewind) && !hasChoices && !historyOpen

  useEffect(() => {
    if (!typewriterEnabled) return
    vnBgm.setDuck(typewriter.isTyping && !hasChoices)
    return () => vnBgm.setDuck(false)
  }, [hasChoices, typewriter.isTyping, typewriterEnabled, vnBgm])

  const fallbackPush = useCallback((line: VnLine) => {
    if (!line.text && !line.speaker) return
    const key = `${line.speaker ?? ''}\u0000${line.text}`
    if (localSeenRef.current.has(key)) return
    localSeenRef.current.add(key)
    const next = [...localLinesRef.current, line]
    localLinesRef.current = next
    setLocalLines(next)
  }, [])

  useEffect(() => {
    if (hasChoices) return
    if (!text.trim() && !speaker) return
    const line: VnLine = { speaker, text, portraitSrc }
    if (sceneHistory) sceneHistory.pushLine(line)
    else fallbackPush(line)
  }, [fallbackPush, hasChoices, portraitSrc, sceneHistory, speaker, text])

  const history = sceneHistory?.lines.length
    ? sceneHistory.lines
    : localLines.length
      ? localLines
      : [{ speaker, text, portraitSrc }]

  useEffect(() => {
    setEndPrimed(false)
  }, [text, speaker, terminalBeat])

  const closeHistory = useCallback(() => {
    setHistoryOpen(false)
  }, [])

  const openHistory = useCallback(() => {
    if (hasChoices || history.length === 0) return
    setHistoryOpen(true)
  }, [hasChoices, history.length])

  const advance = useCallback(() => {
    if (historyOpen) return
    if (!canAdvance) return

    primeSpeechAudio()

    const now = Date.now()
    if (now - advanceLock.current < ADVANCE_DEBOUNCE_MS) return
    advanceLock.current = now

    if (typewriter.consumeAdvance()) return

    if (terminalBeat && !endPrimed) {
      setEndPrimed(true)
      return
    }
    onContinue?.()
  }, [canAdvance, endPrimed, historyOpen, onContinue, primeSpeechAudio, terminalBeat, typewriter])

  const wheelDeltaY = useCallback((e: WheelEvent) => {
    if (e.deltaMode === 1) return e.deltaY * 16
    if (e.deltaMode === 2) return e.deltaY * window.innerHeight
    return e.deltaY
  }, [])

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (historyOpen) return
      const now = Date.now()
      if (now - wheelLock.current < 100) return

      if (hasChoices) return
      const dy = wheelDeltaY(e)
      if (dy === 0) return

      e.preventDefault()
      wheelLock.current = now

      if (dy > 0) advance()
      else openHistory()
    },
    [advance, hasChoices, historyOpen, openHistory, wheelDeltaY],
  )

  useLayoutEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const root = vnRootRef.current
      if (!root) return
      const scene = root.closest('.vn-scene')
      if (!scene?.contains(e.target as Node)) return
      handleWheel(e)
    }
    document.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => document.removeEventListener('wheel', onWheel, { capture: true })
  }, [handleWheel])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (hasChoices) return
      if (historyOpen) {
        if (e.key === 'Escape' || e.key === 'PageDown') {
          e.preventDefault()
          closeHistory()
        }
        return
      }
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault()
        setHistoryOpen((v) => !v)
        return
      }
      if (e.key === 'PageUp' || e.key === 'ArrowUp') {
        e.preventDefault()
        openHistory()
        return
      }
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        advance()
      } else if (e.key === 'Backspace' && canRewind) {
        e.preventDefault()
        onRewind?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, canRewind, closeHistory, hasChoices, historyOpen, onRewind, openHistory])

  const handleChoice = useCallback(
    (id: string) => {
      const label = choices?.find((c) => c.id === id)?.label
      if (label) {
        if (sceneHistory) sceneHistory.pushChoice(label)
        else fallbackPush({ text: `▸ ${label.trim()}` })
      }
      onChoice?.(id)
    },
    [choices, fallbackPush, onChoice, sceneHistory],
  )

  const choiceHeading = choiceVariant === 'topics' ? 'Escolha um assunto' : undefined
  const portraitSide: 'left' | 'right' | 'none' =
    portraitSideProp ??
    (portraitSrc && (forcePortrait || (speaker && speaker !== 'Augusto'))
      ? 'left'
      : 'none')

  return (
    <div
      ref={vnRootRef}
      className="vn"
      data-testid="vn-dialog"
      data-mode={hasChoices ? 'choices' : historyOpen ? 'backlog' : 'adv'}
    >
      <VNCharacterLayer
        leftSrc={portraitSide === 'left' ? portraitSrc : undefined}
        leftSpriteId={portraitSide === 'left' ? portraitId : undefined}
        rightSrc={portraitSide === 'right' ? portraitSrc : undefined}
        rightSpriteId={portraitSide === 'right' ? portraitId : undefined}
        activeSide={portraitSide === 'none' ? 'none' : portraitSide}
      />

      {hasChoices ? (
        <ChoiceOverlay
          heading={choiceHeading}
          hint={choiceHint}
          choices={choices!}
          onChoice={handleChoice}
        />
      ) : historyOpen ? null : (
        <ADVDialogue
          speaker={speaker}
          text={typewriter.displayedText}
          narration={narration}
          canAdvance={canAdvance}
          onAdvance={advance}
          textReady={typewriter.ready}
          onPrimeAudio={primeSpeechAudio}
          continueLabel={
            endPrimed && terminalBeat
              ? 'Encerrar cena'
              : continueLabel ?? (terminalBeat ? 'Continuar' : undefined)
          }
          endPrimed={endPrimed && Boolean(terminalBeat)}
          extra={extra}
        />
      )}

      {historyOpen ? <BacklogView lines={history} onClose={closeHistory} /> : null}

      <VNControls onLog={() => setHistoryOpen(true)} />
    </div>
  )
}

export { VNSceneShell } from './vn/VNSceneShell'
