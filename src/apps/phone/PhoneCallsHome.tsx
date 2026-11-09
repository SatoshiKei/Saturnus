import { useEffect, useState } from 'react'
import { useGameHub } from '../../app/GameHubContext'
import { scriptByContact, type CallScript } from '../../data/calls'
import { CallSession } from '../../components/investigation/CallSession'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { dispatchActions } from '../../game/state/investigationStore'
import { deliverAnonWhatsApp } from '../../game/story/block07Handlers'
import { markContactSeen, newContactIds } from '../../lib/contactsSeen'
import { CallList } from '../whatsapp/CallList'

interface PhoneCallsHomeProps {
  onBack: () => void
}

type Tab = 'contacts' | 'recents'

function contactInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  return name.trim().slice(0, 2).toUpperCase() || '?'
}

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

  // Compat: save antigo que concluiu a checagem pelo botão do Caso, sem a ligação.
  useEffect(() => {
    if (!isAugusto) return
    if (inv.flags.block07_julia_camila_checked && !inv.callsDone.includes('call-julia-onset')) {
      dispatchActions([{ type: 'completeCall', id: 'call-julia-onset' }])
    }
  }, [isAugusto, inv.flags.block07_julia_camila_checked, inv.callsDone])

  // Se a checagem já passou e o áudio não chegou (save antigo / hangup a meio), entregar fora da chamada.
  useEffect(() => {
    if (!isAugusto || session) return
    if (!inv.flags.block07_julia_camila_checked || inv.flags.block07_anon_message_received) return
    const t = window.setTimeout(() => deliverAnonWhatsApp(), 900)
    return () => window.clearTimeout(t)
  }, [isAugusto, session, inv.flags.block07_julia_camila_checked, inv.flags.block07_anon_message_received])

  // Instituições ficam no telefone fixo — não na agenda pessoal.
  const contacts = Object.values(inv.contacts).filter((c) => c.unlocked && !c.institution)

  return (
    <div
      className={`phone-app-recents${session ? ' phone-app-recents--in-call' : ''}`}
      data-testid="phone-calls-home"
    >
      {!session ? (
      <header className="phone-app-recents__header">
        <div className="phone-app-recents__bar">
          <button type="button" className="phone-app-recents__back" onClick={onBack}>
            Início
          </button>
        </div>
        <h1 className="phone-app-recents__title">{tab === 'contacts' ? 'Contatos' : 'Recentes'}</h1>
        {isAugusto && tab === 'contacts' && !session ? (
          <div className="phone-contacts__search" role="search" aria-label="Buscar (apenas visual)">
            <span className="phone-contacts__search-icon" aria-hidden>
              ⌕
            </span>
            <span className="phone-contacts__search-placeholder">Buscar</span>
          </div>
        ) : null}
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
      ) : null}

      {isAugusto && tab === 'contacts' ? (
        session ? (
          <CallSession
            key={session.id}
            script={session}
            compact
            onEnd={() => {
              const endedId = session.id
              setSession(null)
              // Áudio anônimo chega DEPOIS da conversa — não é Júlia quem envia.
              if (endedId === 'call-julia-onset') {
                window.setTimeout(() => deliverAnonWhatsApp(), 700)
              }
            }}
          />
        ) : (
          <ul className="phone-contacts" data-testid="phone-contacts">
            {contacts.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="phone-contacts__row"
                  data-new={fresh.includes(c.id)}
                  data-testid={`phone-call-${c.id}`}
                  aria-label={`Abrir ${c.displayName} — ligar`}
                  onClick={() => setSession(scriptByContact(c.id) ?? noAnswer(c.displayName))}
                >
                  <span className="phone-contacts__avatar" aria-hidden>
                    {contactInitials(c.displayName)}
                  </span>
                  <div className="phone-contacts__who">
                    <span className="phone-contacts__name">{c.displayName}</span>
                    <span className="phone-contacts__num">{c.phone ?? 'Sem número'}</span>
                  </div>
                  {fresh.includes(c.id) ? <span className="phone-contacts__new">NOVO</span> : null}
                  <span className="phone-contacts__chevron" aria-hidden>
                    ›
                  </span>
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
