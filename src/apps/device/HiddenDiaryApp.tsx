import { useState } from 'react'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { tryDiaryPassword } from '../../game/state/investigationStore'

const mockEntries = [
  { id: 'd1', title: 'Entrada bloqueada', body: 'Conteúdo revelado após desbloqueio.', flag: 'diary_entry_1' },
]

interface HiddenDiaryAppProps {
  onBack: () => void
}

export function HiddenDiaryApp({ onBack }: HiddenDiaryAppProps) {
  const inv = useInvestigation()
  const phone = inv.phones.mariana
  const [password, setPassword] = useState('')

  if (!phone.diaryUnlocked) {
    return (
      <div className="device-app" data-testid="hidden-diary-lock">
        <button type="button" onClick={onBack}>
          ‹ Início
        </button>
        <h2>Diário</h2>
        <p>Protegido por senha.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="diary-password-input"
        />
        <button
          type="button"
          data-testid="diary-password-submit"
          onClick={() => tryDiaryPassword(password)}
        >
          Desbloquear
        </button>
        {phone.diaryPasswordAttempts > 0 ? (
          <p className="inv-muted">Tentativas: {phone.diaryPasswordAttempts}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="device-app" data-testid="hidden-diary-unlocked">
      <button type="button" onClick={onBack}>
        ‹ Início
      </button>
      <h2>Diário</h2>
      {mockEntries.map((e) => (
        <article key={e.id}>
          <h3>{e.title}</h3>
          <p>{e.body}</p>
        </article>
      ))}
    </div>
  )
}
