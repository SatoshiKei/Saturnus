import type { CSSProperties } from 'react'
import { useGameHub } from '../app/GameHubContext'
import { PhoneAppRouter } from './PhoneAppRouter'
import { PhoneStatusBar } from './PhoneStatusBar'
import '../styles/phone.css'

interface PhoneShellProps {
  onClose: () => void
  scale: number
}

export function PhoneShell({ onClose, scale }: PhoneShellProps) {
  const { phoneDevice } = useGameHub()
  const shellScale = Math.min(1.15, Math.max(0.72, scale * 1.4))

  return (
    <div
      className="phone-shell"
      style={{ '--phone-scale': shellScale } as CSSProperties}
      data-testid="phone-shell"
      data-device={phoneDevice}
    >
      <div className="phone-shell__device">
        <PhoneStatusBar />
        <div className="phone-shell__content">
          <PhoneAppRouter />
        </div>
        <div className="phone-shell__home-indicator" aria-hidden />
      </div>
      <button
        type="button"
        className="phone-shell__close"
        onClick={onClose}
        data-testid="phone-close"
      >
        Voltar à mesa
      </button>
    </div>
  )
}
