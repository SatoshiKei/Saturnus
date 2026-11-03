import type { ReactNode } from 'react'
import { formatAdvDialogueText } from './advText'

export function ADVDialogue({
  speaker,
  text,
  canAdvance,
  onAdvance,
  continueLabel,
  extra,
}: {
  speaker?: string
  text: string
  canAdvance: boolean
  onAdvance: () => void
  continueLabel?: string
  extra?: ReactNode
}) {
  return (
    <>
      <div className="vn-adv__shade" aria-hidden />
      <div
        className="vn-adv"
        data-testid="vn-advance-zone"
        data-advance={canAdvance}
        onClick={() => canAdvance && onAdvance()}
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
        <div className="vn-adv__panel">
          {speaker ? <p className="vn-adv__speaker">{speaker.toUpperCase()}</p> : null}
          <p className="vn-adv__text">{formatAdvDialogueText(text)}</p>
          {extra}
          {canAdvance ? <span className="vn-adv__next" aria-hidden /> : null}
        </div>
      </div>
    </>
  )
}
