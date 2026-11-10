import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ADVDialogue } from './vn/ADVDialogue'
import { BacklogView, NVLView } from './vn/NVLView'
import { ChoiceOverlay } from './vn/ChoiceOverlay'
import { VNCharacterLayer } from './vn/VNCharacterLayer'
import { VNControls } from './vn/VNControls'
import { paginateNvlLines } from './vn/nvlPages'
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
  logLines = [],
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
  const [nvlOpen, setNvlOpen] = useState(false)
  const [endPrimed, setEndPrimed] = useState(false)
  const [nvlPage, setNvlPage] = useState(0)
  const [backlogOpen, setBacklogOpen] = useState(false)
  const wheelLock = useRef(0)

  const hasChoices = Boolean(choices?.length)
  const canAdvance = Boolean(onContinue) && !hasChoices
  const canRewind = Boolean(onRewind) && !hasChoices && !nvlOpen && !backlogOpen
  const history = logLines.length ? logLines : [{ speaker, text, portraitSrc }]

  const nvlPages = useMemo(() => paginateNvlLines(history), [history])
  const nvlPageLines = nvlPages[nvlPage] ?? []

  useEffect(() => {
    setEndPrimed(false)
  }, [text, speaker, terminalBeat])

  const advance = useCallback(() => {
    if (backlogOpen) return
    if (nvlOpen) {
      if (nvlPage < nvlPages.length - 1) setNvlPage((p) => p + 1)
      else {
        setNvlOpen(false)
        setNvlPage(0)
      }
      return
    }
    if (!canAdvance) return
    if (terminalBeat && !endPrimed) {
      setEndPrimed(true)
      return
    }
    onContinue?.()
  }, [backlogOpen, canAdvance, endPrimed, nvlOpen, nvlPage, nvlPages.length, onContinue, terminalBeat])

  const openNvl = useCallback(() => {
    if (hasChoices || history.length === 0) return
    setBacklogOpen(false)
    setNvlPage(0)
    setNvlOpen(true)
  }, [hasChoices, history.length])

  const closeOverlays = useCallback(() => {
    setNvlOpen(false)
    setNvlPage(0)
    setBacklogOpen(false)
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now()
      if (now - wheelLock.current < 100) return
      wheelLock.current = now

      if (backlogOpen) return
      if (nvlOpen) {
        if (e.deltaY > 0) advance()
        else if (e.deltaY < 0 && nvlPage === 0) closeOverlays()
        e.preventDefault()
        return
      }
      if (hasChoices) return
      e.preventDefault()
      if (e.deltaY > 0) advance()
      else if (e.deltaY < 0) openNvl()
    },
    [advance, backlogOpen, closeOverlays, hasChoices, nvlOpen, nvlPage, openNvl],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (hasChoices) return
      if (backlogOpen) {
        if (e.key === 'Escape') closeOverlays()
        return
      }
      if (nvlOpen) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
          e.preventDefault()
          advance()
        }
        if (e.key === 'Escape') closeOverlays()
        return
      }
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault()
        setNvlOpen(false)
        setBacklogOpen((v) => !v)
        return
      }
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault()
        advance()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        openNvl()
      } else if (e.key === 'Backspace' && canRewind) {
        e.preventDefault()
        onRewind?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, backlogOpen, canRewind, closeOverlays, hasChoices, nvlOpen, onRewind, openNvl])

  const choiceHeading = choiceVariant === 'topics' ? 'Escolha um assunto' : undefined
  const portraitSide =
    portraitSrc && speaker && speaker !== 'Augusto' ? ('left' as const) : ('none' as const)

  return (
    <div
      className="vn"
      data-testid="vn-dialog"
      data-mode={hasChoices ? 'choices' : nvlOpen ? 'nvl' : backlogOpen ? 'backlog' : 'adv'}
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
          onChoice={(id) => onChoice?.(id)}
        />
      ) : nvlOpen || backlogOpen ? null : (
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

      {nvlOpen ? (
        <NVLView
          pageLines={nvlPageLines}
          pageIndex={nvlPage}
          pageCount={nvlPages.length}
          onAdvance={advance}
          onClose={closeOverlays}
        />
      ) : null}

      {backlogOpen ? <BacklogView lines={history} onClose={closeOverlays} /> : null}

      <VNControls onLog={() => setBacklogOpen(true)} />
    </div>
  )
}

export { VNSceneShell } from './vn/VNSceneShell'
