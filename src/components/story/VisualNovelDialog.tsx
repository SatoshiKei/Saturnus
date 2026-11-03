import type { ReactNode } from 'react'
import '../../styles/visual-novel.css'

export interface VnChoice {
  id: string
  label: string
}

interface VisualNovelDialogProps {
  speaker?: string
  text: string
  portraitSrc?: string
  choices?: VnChoice[]
  onChoice?: (id: string) => void
  onContinue?: () => void
  continueLabel?: string
  extra?: ReactNode
}

export function VisualNovelDialog({
  speaker,
  text,
  portraitSrc,
  choices,
  onChoice,
  onContinue,
  continueLabel = 'Continuar',
  extra,
}: VisualNovelDialogProps) {
  return (
    <div className="vn" data-testid="vn-dialog">
      {portraitSrc ? (
        <figure className="vn__portrait">
          <img src={portraitSrc} alt="" />
        </figure>
      ) : null}
      <div className="vn__box">
        {speaker ? <p className="vn__speaker">{speaker}</p> : null}
        <p className="vn__text">{text}</p>
        {extra}
        {choices?.length ? (
          <ul className="vn__choices">
            {choices.map((c) => (
              <li key={c.id}>
                <button type="button" className="vn__choice" onClick={() => onChoice?.(c.id)}>
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        ) : onContinue ? (
          <button type="button" className="vn__continue" onClick={onContinue}>
            {continueLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
