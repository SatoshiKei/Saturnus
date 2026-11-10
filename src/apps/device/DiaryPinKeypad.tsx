import { playSfx } from '../../lib/sfx'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'] as const

export function DiaryPinKeypad({
  value,
  onChange,
  onSubmit,
  error,
}: {
  value: string
  onChange: (next: string) => void
  onSubmit: () => void
  error: string | null
}) {
  const press = (key: string) => {
    playSfx('ui')
    if (key === '⌫') {
      onChange(value.slice(0, -1))
      return
    }
    if (!key || value.length >= 6) return
    onChange(value + key)
  }

  return (
    <div className="diary-pin diary-pin--keypad" data-testid="diary-pin-screen">
      <p className="diary-pin__hint">Digite o código de 6 dígitos</p>
      <h2 className="diary-pin__title">Diário</h2>
      <PinDots value={value} />
      <div className="diary-pin__pad" role="group" aria-label="Teclado numérico">
        {KEYS.map((k, i) =>
          k === '' ? (
            <span key={`sp-${i}`} className="diary-pin__pad-spacer" aria-hidden />
          ) : (
            <button
              key={k}
              type="button"
              className="diary-pin__key"
              data-testid={k === '⌫' ? 'diary-pin-back' : `diary-pin-key-${k}`}
              onClick={() => press(k)}
              aria-label={k === '⌫' ? 'Apagar' : k}
            >
              {k}
            </button>
          ),
        )}
      </div>
      <button
        type="button"
        className="diary-pin__go"
        data-testid="diary-pin-submit"
        disabled={value.length < 6}
        onClick={onSubmit}
      >
        OK
      </button>
      {error ? (
        <p className="diary-pin__error" role="alert" data-testid="diary-pin-error">
          {error}
        </p>
      ) : null}
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
