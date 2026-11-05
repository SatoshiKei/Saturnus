import { useEffect, useMemo, useState } from 'react'
import { mockCallLog } from '../../../data/mockCalls'
import {
  callScripts,
  landlineDirectory,
  scriptByContact,
  scriptByExt,
  type CallScript,
} from '../../../data/calls'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { onHexCallsPreserved } from '../../../game/story/block04Handlers'
import { playSfx } from '../../../lib/sfx'
import { CallSession } from '../CallSession'
import { HexCallScene } from '../HexCallScene'
import { GamePanel } from '../../ui/GamePanel'

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

function idleScript(name: string, line = 'Ninguém atende neste ramal agora.'): CallScript {
  return {
    id: `idle-${name}`,
    speaker: name,
    available: () => true,
    lines: [{ who: 'other', text: line }],
    onComplete: [],
    repeat: [{ who: 'other', text: line }],
  }
}

/**
 * Telefone fixo da delegacia (PoliceLandline).
 * Ferramenta de verdade: ramais, agenda com os números anotados e ligações recebidas. Interface própria de
 * equipamento institucional — NÃO é o celular de Augusto.
 */
export function PoliceLandline({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [number, setNumber] = useState('')
  const [line, setLine] = useState<string>('LINHA LIVRE')
  const [session, setSession] = useState<CallScript | null>(null)
  const [hexScene, setHexScene] = useState(false)

  const incoming = Boolean(inv.flags.block04_hex_call_pending) && !inv.flags.block04_hex_call_answered
  const agenda = useMemo(
    () =>
      Object.values(inv.contacts)
        .filter((c) => c.unlocked && scriptByContact(c.id))
        .map((c) => ({ contact: c, script: scriptByContact(c.id)! })),
    [inv.contacts],
  )

  // Se o jogador saiu no meio da cena, as gravações ainda precisam chegar à bancada.
  useEffect(() => {
    if (inv.flags.block04_hex_call_answered && !inv.flags.block04_hex_received && !hexScene) {
      onHexCallsPreserved()
    }
  }, [inv.flags.block04_hex_call_answered, inv.flags.block04_hex_received, hexScene])

  const received = mockCallLog.filter((c) => c.direction !== 'outgoing').slice(0, 5)

  const startCall = (script: CallScript) => {
    setSession(script)
    setLine('EM LIGAÇÃO')
  }

  const endCall = () => {
    setSession(null)
    setNumber('')
    setLine('LINHA LIVRE')
  }

  const dialNumber = () => {
    if (!number) return
    const script = scriptByExt(number, inv)
    if (script) return startCall(script)
    const known = landlineDirectory.find((d) => d.key === number)
    if (known) return startCall(idleScript(known.name))
    setLine('NÚMERO NÃO CADASTRADO')
    playSfx('error')
  }

  return (
    <GamePanel title="Telefone da delegacia" kicker="Linha institucional" variant="console" testId="hub-landline" onClose={onClose}>
      <div className="ll" data-testid="landline-panel">
        <section className="ll-log" aria-label="Registro de chamadas">
          <h3 className="ll-h">Registro de chamadas</h3>
          <ul>
            {received.map((c) => (
              <li key={c.id} data-dir={c.direction}>
                <span className="ll-log__who">{c.contactId === 'mariana' ? 'Ramal externo' : 'Linha externa'}</span>
                <span className="ll-log__meta">
                  {c.direction === 'missed' ? 'não atendida' : 'recebida'} · {c.dateLabel} {c.time}
                </span>
              </li>
            ))}
          </ul>
          <p className="ll-note">Registros da central. Identificação de origem indisponível.</p>
        </section>

        <section className="ll-set" aria-label="Aparelho">
          {session ? (
            <CallSession key={session.id} script={session} onEnd={endCall} />
          ) : (
            <>
              <div className="ll-lcd" aria-live="polite" data-ringing={incoming}>
                <span className="ll-lcd__num">{incoming ? 'CHAMADA RECEBIDA' : number || '—'}</span>
                <span className="ll-lcd__line">{incoming ? 'Número não identificado' : line}</span>
              </div>
              {incoming ? (
                <button
                  type="button"
                  className="ll-call ll-call--answer"
                  data-testid="landline-answer"
                  onClick={() => setHexScene(true)}
                >
                  Atender
                </button>
              ) : null}
              <div className="ll-keys">
                {keys.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className="ll-key"
                    onClick={() => {
                      playSfx('ui')
                      setNumber((n) => (n + k).slice(0, 14))
                      setLine('DISCANDO')
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <div className="ll-actions">
                <button type="button" className="ll-call" disabled={!number} data-testid="landline-dial" onClick={dialNumber}>
                  Ligar
                </button>
                <button
                  type="button"
                  className="ll-clear"
                  onClick={() => {
                    setNumber('')
                    setLine('LINHA LIVRE')
                  }}
                >
                  Limpar
                </button>
              </div>
            </>
          )}
        </section>

        <section className="ll-dir" aria-label="Ramais e agenda">
          <h3 className="ll-h">Ramais</h3>
          <ul>
            {landlineDirectory.map((e) => (
              <li key={e.key}>
                <button
                  type="button"
                  data-testid={`landline-ext-${e.key}`}
                  disabled={Boolean(session)}
                  onClick={() => {
                    let script =
                      (e.scriptId && callScripts.find((s) => s.id === e.scriptId)) || idleScript(e.name)
                    if (e.key === 'HOSP' && inv.flags.block07_ricardo_search_unlocked) {
                      const ricardo = callScripts.find((s) => s.id === 'call-hospital-ricardo')
                      if (ricardo) script = ricardo
                    }
                    setNumber(e.key.length <= 4 && /^\d+$/.test(e.key) ? e.key : '')
                    startCall(script)
                  }}
                >
                  <b>{/^\d+$/.test(e.key) ? e.key : '—'}</b>
                  <span>{e.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <h3 className="ll-h">Agenda</h3>
          {agenda.length ? (
            <ul data-testid="landline-agenda">
              {agenda.map(({ contact, script }) => (
                <li key={contact.id}>
                  <button
                    type="button"
                    data-testid={`landline-contact-${contact.id}`}
                    disabled={Boolean(session)}
                    onClick={() => {
                      setNumber(contact.phone ?? '')
                      startCall(script)
                    }}
                  >
                    <b>{contact.displayName}</b>
                    <span>{contact.phone ?? 'número registrado'}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ll-note">Nenhum número anotado até agora.</p>
          )}
        </section>
      </div>
      {hexScene ? <HexCallScene onFinish={() => setHexScene(false)} /> : null}
    </GamePanel>
  )
}
