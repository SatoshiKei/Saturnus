import { CallList } from '../whatsapp/CallList'

interface PhoneCallsHomeProps {
  onBack: () => void
}

export function PhoneCallsHome({ onBack }: PhoneCallsHomeProps) {
  return (
    <div className="phone-app-recents" data-testid="phone-calls-home">
      <header className="phone-app-recents__header">
        <button type="button" className="ios-app-header__back" onClick={onBack}>
          ‹ Início
        </button>
        <h1>Recentes</h1>
        <nav className="phone-app-recents__seg" aria-label="Tipo de chamada">
          <span className="phone-app-recents__seg-item phone-app-recents__seg-item--active">Todos</span>
          <span className="phone-app-recents__seg-item">Perdidas</span>
        </nav>
      </header>
      <CallList variant="phone" />
    </div>
  )
}
