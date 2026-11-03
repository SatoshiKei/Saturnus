import type { VnChoice } from '../VisualNovelDialog'

export function ChoiceOverlay({
  heading,
  hint,
  choices,
  onChoice,
}: {
  heading?: string
  hint?: string
  choices: VnChoice[]
  onChoice: (id: string) => void
}) {
  return (
    <div className="vn-choices-layer" data-testid="vn-choices">
      <div className="vn-choices-layer__dim" aria-hidden />
      <div className="vn-choices-layer__stack">
        {heading ? <p className="vn-choices-layer__heading">{heading}</p> : null}
        {hint ? <p className="vn-choices-layer__hint">{hint}</p> : null}
        <ul className="vn-choices-list">
          {choices.map((c, i) => (
            <li key={c.id} style={{ animationDelay: `${i * 40}ms` }}>
              <button
                type="button"
                className="vn-choice"
                data-testid={`vn-choice-${c.id}`}
                onClick={() => onChoice(c.id)}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
