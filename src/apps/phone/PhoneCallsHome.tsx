import { useEffect, useState } from 'react'
import { useGameHub } from '../../app/GameHubContext'
import { scriptByContact, type CallScript } from '../../data/calls'
import { CallSession } from '../../components/investigation/CallSession'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { markContactSeen, newContactIds } from '../../lib/contactsSeen'
import { CallList } from '../whatsapp/CallList'

interface PhoneCallsHomeProps {
  onBack: () => void
}

type Tab = 'contacts' | 'recents'

function noAnswer(name: string): CallScript {
  return {
    id: `noanswer-${name}`,
    speaker: name,
    available: () => true,
    lines: [{ who: 'other', text: 'Sem resposta. Tente mais tarde.' }],
    onComplete: [],
    repeat: [{ who: 'other', text: 'Sem resposta. Tente mais tarde.' }],
  }
}

export function PhoneCallsHome({ onBack }: PhoneCallsHomeProps) {
  const { phoneDevice } = useGameHub()
  const inv = useInvestigation()
  const isAugusto = phoneDevice === 'augusto'
  const [tab, setTab] = useState<Tab>(isAugusto ? 'contacts' : 'recents')
  const [session, setSession] = useState<CallScript | null>(null)
  const fresh = isAugusto ? newContactIds(inv) : []

  // Abrir a agenda no celular de Augusto marca os contatos novos como vistos.
  useEffect(() => {
    if (isAugusto && tab === 'contacts') for (const id of fresh) markContactSeen(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAugusto, tab, fresh.join('|')])

  const contacts = Object.values(inv.contacts).filter((c) => c.unlocked)

  return (
    <div className="phone-app-recents" data-testid="phone-calls-home">
      <header className="phone-app-recents__header">
        <button type="button" className="ios-app-header__back" onClick={onBack}>
          ‹ Início
        </button>
        <h1>{tab === 'contacts' ? 'Contatos' : 'Recentes'}</h1>
        {isAugusto ? (
          <nav className="phone-app-recents__seg" aria-label="Seção do telefone">
            <button
              type="button"
              data-testid="phone-tab-contacts"
              className={`phone-app-recents__seg-item${tab === 'contacts' ? ' phone-app-recents__seg-item--active' : ''}`}
              onClick={() => {
                setTab('contacts')
                setSession(null)
              }}
            >
              Contatos
            </button>
            <button
              type="button"
              data-testid="phone-tab-recents"
              className={`phone-app-recents__seg-item${tab === 'recents' ? ' phone-app-recents__seg-item--active' : ''}`}
              onClick={() => {
                setTab('recents')
                setSession(null)
              }}
            >
              Recentes
            </button>
          </nav>
        ) : (
          <nav className="phone-app-recents__seg" aria-label="Tipo de chamada">
            <span className="phone-app-recents__seg-item phone-app-recents__seg-item--active">Todos</span>
            <span className="phone-app-recents__seg-item">Perdidas</span>
          </nav>
        )}
      </header>

      {isAugusto && tab === 'contacts' ? (
        session ? (
          <CallSession key={session.id} script={session} compact onEnd={() => setSession(null)} />
        ) : (
          <ul className="phone-contacts" data-testid="phone-contacts">
            {contacts.map((c) => (
              <li key={c.id} className="phone-contacts__row" data-new={fresh.includes(c.id)}>
                <div className="phone-contacts__who">
                  <span className="phone-contacts__name">{c.displayName}</span>
                  <span className="phone-contacts__num">{c.phone ?? 'sem número'}</span>
                </div>
                {fresh.includes(c.id) ? <span className="new-badge">NOVO</span> : null}
                <button
                  type="button"
                  className="phone-contacts__call"
                  data-testid={`phone-call-${c.id}`}
                  aria-label={`Ligar para ${c.displayName}`}
                  onClick={() => setSession(scriptByContact(c.id) ?? noAnswer(c.displayName))}
                >
                  Ligar
                </button>
              </li>
            ))}
          </ul>
        )
      ) : (
        <CallList variant="phone" device={phoneDevice} />
      )}
    </div>
  )
}
