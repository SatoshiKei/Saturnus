import { useState } from 'react'
import { appDefinitions } from '../../data/game/seedApps'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { installMarianaApp } from '../../game/state/investigationStore'

interface AppStoreViewProps {
  onBack: () => void
}

export function AppStoreView({ onBack }: AppStoreViewProps) {
  const inv = useInvestigation()
  const [query, setQuery] = useState('')
  const [password, setPassword] = useState('')
  const [pendingInstall, setPendingInstall] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const q = query.trim().toLowerCase()
  const results =
    q.length >= 2
      ? appDefinitions.filter(
          (a) =>
            a.searchableInStore &&
            (a.storeKeywords?.some((k) => k.includes(q) || q.includes(k)) ||
              a.name.toLowerCase().includes(q)),
        )
      : []

  const tryInstall = (appId: string) => {
    if (!inv.passwordsDiscovered.marianaAccount) {
      setPendingInstall(appId)
      setMessage('Senha da conta de Mariana necessária para instalar.')
      return
    }
    const r = installMarianaApp(appId)
    if (r === 'needs-password') {
      setPendingInstall(appId)
      setMessage('Informe a senha da conta.')
      return
    }
    if (r === 'already') setMessage('App já instalado.')
    else {
      setMessage('Instalado.')
      setPendingInstall(null)
    }
  }

  const submitPassword = () => {
    if (!inv.passwordsDiscovered.marianaAccount) {
      setMessage('Senha da conta ainda desconhecida na investigação.')
      return
    }
    if (password !== 'demo-account') {
      setMessage('Senha incorreta.')
      return
    }
    if (pendingInstall) {
      installMarianaApp(pendingInstall)
      setMessage('Instalado.')
      setPendingInstall(null)
      setPassword('')
    }
  }

  return (
    <div className="device-app" data-testid="app-store">
      <button type="button" onClick={onBack}>
        ‹ Início
      </button>
      <h2>Loja de apps</h2>
      <p className="inv-muted">Pesquise pelo nome do aplicativo.</p>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar apps"
        data-testid="app-store-search"
      />
      <ul className="inv-list">
        {results.map((a) => (
          <li key={a.id}>
            <strong>{a.name}</strong>
            <p>{a.narrativeDescription}</p>
            <button type="button" data-testid={`install-${a.id}`} onClick={() => tryInstall(a.id)}>
              Instalar
            </button>
          </li>
        ))}
      </ul>
      {pendingInstall ? (
        <div data-testid="app-store-password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha da conta"
          />
          <button type="button" onClick={submitPassword}>
            Confirmar
          </button>
        </div>
      ) : null}
      {message ? <p>{message}</p> : null}
    </div>
  )
}
