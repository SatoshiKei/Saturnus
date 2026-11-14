import { playDiaryPinKey } from '../../lib/diaryPinSounds'
import { playSfx } from '../../lib/sfx'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'] as const

export function DiaryPinKeypad({
  value,
  onChange,
  onSubmit,
  error,
}: {
  value: string
  onChange: (next: string) => void
  onSubmit: (code: string) => void
  error: string | null
}) {
  const press = (key: string) => {
    if (key === 'back') {
      playSfx('ui')
      onChange(value.slice(0, -1))
      return
    }
    if (!key || value.length >= 6) return
    playDiaryPinKey(key)
    const next = value + key
    onChange(next)
    if (next.length === 6) onSubmit(next)
  }

  return (
    <div
      className={`diary-pin diary-pin--keypad${error ? ' diary-pin--error' : ''}`}
      data-testid="diary-pin-screen"
    >
      <div className="diary-pin__head">
        <p className="diary-pin__hint">Digite o código de 6 dígitos</p>
        <h2 className="diary-pin__title">Diário</h2>
        <PinDots value={value} />
        {error ? (
          <p className="diary-pin__error" role="alert" data-testid="diary-pin-error">
            {error}
          </p>
        ) : (
          <p className="diary-pin__error" aria-hidden="true" />
        )}
      </div>
      <div className="diary-pin__pad" role="group" aria-label="Teclado numérico">
        {KEYS.map((k, i) =>
          k === '' ? (
            <span key={`sp-${i}`} className="diary-pin__pad-spacer" aria-hidden />
          ) : k === 'back' ? (
            <button
              key="back"
              type="button"
              className="diary-pin__key diary-pin__key--back"
              data-testid="diary-pin-back"
              onClick={() => press(k)}
              aria-label="Apagar"
            >
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
                <path
                  fill="currentColor"
                  d="M9.5 5.5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9.5a1.5 1.5 0 0 1-1.06-.44L4.7 13.5H4a1 1 0 0 1 0-2h.7l3.74-5.56A1.5 1.5 0 0 1 9.5 5.5zm4.2 3.2-3.2 3.2 3.2 3.2 1.06-1.06L12.1 12l2.66-2.66-1.06-1.04z"
                />
              </svg>
            </button>
          ) : (
            <button
              key={k}
              type="button"
              className="diary-pin__key"
              data-testid={`diary-pin-key-${k}`}
              onClick={() => press(k)}
              aria-label={k}
            >
              {k}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

function PinDots({ value }: { value: string }) {
  return (
    <p className="diary-pin__dots" aria-live="polite" data-testid="diary-pin-dots">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} data-filled={i < value.length || undefined} />
      ))}
    </p>
  )
}