import type { SyntheticEvent } from 'react'
import { phoneFeatureLocks } from '../../data/phoneFeatures'

interface ChatComposerProps {
  /** Campo de texto clicável para abrir opções de roteiro (conversas iniciadas pelo jogador). */
  composeAvailable?: boolean
  composing?: boolean
  onComposeOpen?: () => void
  onBlockedAction?: () => void
}

export function ChatComposer({
  composeAvailable = false,
  composing = false,
  onComposeOpen,
  onBlockedAction,
}: ChatComposerProps) {
  const openOrBlock = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (composeAvailable) {
      onComposeOpen?.()
      return
    }
    onBlockedAction?.()
  }

  return (
    <footer
      className="wa-composer"
      data-testid="chat-composer"
      data-composing={composing}
      data-compose-available={composeAvailable}
    >
      <button
        type="button"
        className="wa-composer__icon wa-composer__icon--clip"
        aria-label="Anexar"
        aria-disabled={phoneFeatureLocks.attachmentClip}
        data-locked={phoneFeatureLocks.attachmentClip}
        onClick={openOrBlock}
      >
        <svg viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M16.5 6.5v8.25a4.25 4.25 0 11-8.5 0V6.75a2.75 2.75 0 115.5 0v7.5a1.25 1.25 0 11-2.5 0V7h-1.5v7.25a2.75 2.75 0 105.5 0V6.75a4.25 4.25 0 10-8.5 0v8.25h1.5V6.75a2.75 2.75 0 115.5 0z"
          />
        </svg>
      </button>
      <button
        type="button"
        className="wa-composer__field"
        data-active={composing || composeAvailable}
        data-testid="composer-open"
        aria-label={composing ? 'Escolher como escrever' : 'Mensagem'}
        aria-expanded={composing}
        onClick={openOrBlock}
      >
        <span className="wa-composer__input" data-testid="composer-input" aria-hidden={!composeAvailable}>
          {composeAvailable
            ? composing
              ? 'Escolha como escrever…'
              : 'Mensagem'
            : 'Mensagem'}
        </span>
        <span className="wa-composer__icon wa-composer__icon--inline" aria-hidden>
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 7a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-5.2 5.8c1.2 1.8 3.2 2.9 5.2 2.9s4-1.1 5.2-2.9c.3-.5.1-1.2-.5-1.4-.5-.2-1.1 0-1.4.5-.8 1.2-2.1 1.9-3.3 1.9s-2.5-.7-3.3-1.9c-.3-.5-.9-.7-1.4-.5-.6.2-.8.9-.5 1.4z"
            />
          </svg>
        </span>
      </button>
      <button
        type="button"
        className="wa-composer__icon wa-composer__icon--camera"
        aria-label="Câmera"
        aria-disabled={phoneFeatureLocks.cameraButton}
        onClick={openOrBlock}
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
