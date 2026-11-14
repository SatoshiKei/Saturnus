import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useVnSceneHistory } from '../../lib/vnSceneHistory'
import { ADVDialogue } from './vn/ADVDialogue'
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

interface VisualNovelDialogProps {
  speaker?: string
  text: string
  portraitSrc?: string
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
  extra?: ReactNode
}

export function VisualNovelDialog({
  speaker,
  text,
  portraitSrc,
  choices,
  choiceHint,
  choiceVariant = 'default',
  onChoice,
  onContinue,
  onRewind,
  continueLabel,
  terminalBeat,
  extra,
}: VisualNovelDialogProps) {
  const sceneHistory = useVnSceneHistory()
  const localLinesRef = useRef<VnLine[]>([])
  const localSeenRef = useRef(new Set<string>())
  const [localLines, setLocalLines] = useState<VnLine[]>([])
  const [endPrimed, setEndPrimed] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const wheelLock = useRef(0)

  const hasChoices = Boolean(choices?.length)
  const canAdvance = Boolean(onContinue) && !hasChoices
  const canRewind = Boolean(onRewind) && !hasChoices && !historyOpen

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
    if (terminalBeat && !endPrimed) {
      setEndPrimed(true)
      return
    }
    onContinue?.()
  }, [canAdvance, endPrimed, historyOpen, onContinue, terminalBeat])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (historyOpen) return
      const now = Date.now()
      if (now - wheelLock.current < 100) return
      wheelLock.current = now

      if (hasChoices) return
      e.preventDefault()
      if (e.deltaY > 0) advance()
      else if (e.deltaY < 0) openHistory()
    },
    [advance, hasChoices, historyOpen, openHistory],
  )

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
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
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
  const portraitSide =
    portraitSrc && speaker && speaker !== 'Augusto' ? ('left' as const) : ('none' as const)

  return (
    <div
      className="vn"
      data-testid="vn-dialog"
      data-mode={hasChoices ? 'choices' : historyOpen ? 'backlog' : 'adv'}
      onWheel={handleWheel}
    >
      <VNCharacterLayer
        leftSrc={portraitSide === 'left' ? portraitSrc : undefined}
        activeSide={portraitSide}
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
          text={text}
          canAdvance={canAdvance}
          onAdvance={advance}
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
