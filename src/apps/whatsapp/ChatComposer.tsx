import type { SyntheticEvent } from 'react'
import { phoneFeatureLocks } from '../../data/phoneFeatures'

interface ChatComposerProps {
  onBlockedAction?: () => void
}

export function ChatComposer({ onBlockedAction }: ChatComposerProps) {
  const locked = phoneFeatureLocks.composerText

  const guard = (e: SyntheticEvent) => {
    if (!locked) return
    e.preventDefault()
    onBlockedAction?.()
  }

  return (
    <footer className="wa-composer" data-testid="chat-composer">
      <button
        type="button"
        className="wa-composer__icon wa-composer__icon--clip"
        aria-label="Anexar"
        aria-disabled={phoneFeatureLocks.attachmentClip}
        data-locked={phoneFeatureLocks.attachmentClip}
        onClick={guard}
      >
        <svg viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M16.5 6.5v8.25a4.25 4.25 0 11-8.5 0V6.75a2.75 2.75 0 115.5 0v7.5a1.25 1.25 0 11-2.5 0V7h-1.5v7.25a2.75 2.75 0 105.5 0V6.75a4.25 4.25 0 10-8.5 0v8.25h1.5V6.75a2.75 2.75 0 115.5 0z"
          />
        </svg>
      </button>
      <div className="wa-composer__field">
        <input
          type="text"
          className="wa-composer__input"
          placeholder="Mensagem"
          readOnly={locked}
          aria-label="Mensagem"
          onFocus={guard}
          onClick={guard}
          data-testid="composer-input"
        />
        <button
          type="button"
          className="wa-composer__icon wa-composer__icon--inline"
          aria-label="Figurinhas"
          aria-disabled={phoneFeatureLocks.stickerButton}
          onClick={guard}
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 7a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-5.2 5.8c1.2 1.8 3.2 2.9 5.2 2.9s4-1.1 5.2-2.9c.3-.5.1-1.2-.5-1.4-.5-.2-1.1 0-1.4.5-.8 1.2-2.1 1.9-3.3 1.9s-2.5-.7-3.3-1.9c-.3-.5-.9-.7-1.4-.5-.6.2-.8.9-.5 1.4z"
            />
          </svg>
        </button>
      </div>
      <button
        type="button"
        className="wa-composer__icon wa-composer__icon--camera"
        aria-label="Câmera"
        aria-disabled={phoneFeatureLocks.cameraButton}
        onClick={guard}
      >
        <svg viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M9 3L7.2 5H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-2.2L15 3H9zm3 14a5 5 0 110-10 5 5 0 010 10z"
          />
        </svg>
      </button>
    </footer>
  )
}
