import type { ReactNode } from 'react'

export function ADVDialogue({
  speaker,
  text,
  narration,
  canAdvance,
  onAdvance,
  continueLabel,
  endPrimed,
  textReady,
  onPrimeAudio,
  extra,
}: {
  speaker?: string
  text: string
  narration?: boolean
  canAdvance: boolean
  onAdvance: () => void
  continueLabel?: string
  endPrimed?: boolean
  /** Período actual revelado por completo — mostra ▾. */
  textReady?: boolean
  onPrimeAudio?: () => void
  extra?: ReactNode
}) {
  const showNext = canAdvance && (textReady ?? true)
  return (
    <>
      <div className="vn-adv__shade" aria-hidden />
      <div
        className="vn-adv"
        data-testid="vn-advance-zone"
        data-advance={canAdvance}
        data-ready={showNext || undefined}
        data-end-primed={endPrimed || undefined}
        onPointerDown={() => onPrimeAudio?.()}
        onClick={(e) => {
          if (!canAdvance) return
          const target = e.target as HTMLElement
          if (target.closest('button, a, input, textarea, select, label')) return
          onAdvance()
        }}
        onKeyDown={(e) => {
          if (canAdvance && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onAdvance()
          }
        }}
        role={canAdvance ? 'button' : undefined}
        tabIndex={canAdvance ? 0 : -1}
        aria-label={continueLabel ?? (canAdvance ? 'Avançar diálogo' : undefined)}
      >
        <div className="vn-adv__panel" data-narration={narration || undefined}>
          {speaker ? <p className="vn-adv__speaker">{speaker.toUpperCase()}</p> : null}
          <p className="vn-adv__text">{text}</p>
          {extra}
          {showNext ? <span className="vn-adv__next" aria-hidden /> : null}
        </div>
      </div>
    </>
  )
}
