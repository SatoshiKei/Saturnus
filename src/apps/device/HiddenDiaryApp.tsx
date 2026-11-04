import { useState } from 'react'
import { block04DiaryEntries } from '../../data/block04/diaryEntries'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { setFlag, tryDiaryPassword } from '../../game/state/investigationStore'
import { onDiaryEntryRead } from '../../game/story/block04Handlers'

interface HiddenDiaryAppProps {
  onBack: () => void
}

export function HiddenDiaryApp({ onBack }: HiddenDiaryAppProps) {
  const inv = useInvestigation()
  const phone = inv.phones.mariana
  const [password, setPassword] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  if (!inv.flags.block04_forensics_done) {
    return (
      <div className="device-app" data-testid="hidden-diary-locked-story">
        <button type="button" onClick={onBack}>
          ‹ Início
        </button>
        <h2>Diário</h2>
        <p className="inv-muted">Aplicativo não listado no launcher comum.</p>
      </div>
    )
  }

  if (!phone.diaryUnlocked) {
    return (
      <div className="device-app" data-testid="hidden-diary-lock">
        <button type="button" onClick={onBack}>
          ‹ Início
        </button>
        <h2>Diário</h2>
        <p>Protegido por senha. Chave obtida na perícia digital.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="diary-password-input"
          placeholder="Senha"
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

  const open = block04DiaryEntries.find((e) => e.id === openId)

  return (
    <div className="device-app" data-testid="hidden-diary-unlocked">
      <button type="button" onClick={onBack}>
        ‹ Início
      </button>
      <h2>Diário</h2>
      {!open ? (
        <ul className="diary-list" data-testid="diary-entry-list">
          {block04DiaryEntries.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                className="diary-list__row"
                data-testid={`diary-entry-${e.id}`}
                onClick={() => {
                  setOpenId(e.id)
                  if (!inv.flags[e.readFlag]) {
                    setFlag(e.readFlag, true)
                    onDiaryEntryRead(e.id, Boolean(e.unlocksUnknownRecording))
                  }
                }}
              >
                <span>{e.title}</span>
                <span className="diary-list__date">{e.dateLabel}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <article data-testid="diary-entry-view">
          <button type="button" onClick={() => setOpenId(null)}>
            ‹ Entradas
          </button>
          <h3>{open.title}</h3>
          <p className="inv-muted">{open.dateLabel}</p>
          <p>{open.body}</p>
        </article>
      )}
    </div>
  )
}
