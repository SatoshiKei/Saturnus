import { useEffect, useRef, useState } from 'react'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { mockCallLog } from '../../../data/mockCalls'
import { GamePanel } from '../../ui/GamePanel'

/** Ramais internos da delegacia — conteúdo institucional, não narrativo. */
const extensions = [
  { ext: '100', name: 'Gabinete do delegado' },
  { ext: '201', name: 'Plantão' },
  { ext: '204', name: 'Cartório' },
  { ext: '212', name: 'Perícia' },
  { ext: '220', name: 'Arquivo' },
]

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

/**
 * Telefone fixo da delegacia (PoliceLandline).
 * Interface própria de equipamento institucional — NÃO é o celular de Augusto.
 * Hoje é uma simulação: discar mostra o estado da linha; não altera a investigação.
 */
export function PoliceLandline({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [number, setNumber] = useState('')
  const [line, setLine] = useState<string>('LINHA LIVRE')

  const timer = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  const callable = Object.values(inv.contacts).filter((c) => c.unlocked)
  const dial = (n: string, label?: string) => {
    setNumber(n)
    setLine(label ? `CHAMANDO ${label.toUpperCase()}…` : 'CHAMANDO…')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setLine('SEM RESPOSTA — TENTE MAIS TARDE'), 1400)
  }

  const received = mockCallLog.filter((c) => c.direction !== 'outgoing').slice(0, 5)

  return (
    <GamePanel
      title="Telefone da delegacia"
      kicker="Linha institucional"
      variant="console"
      testId="hub-landline"
      onClose={onClose}
    >
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
          <div className="ll-lcd" aria-live="polite">
            <span className="ll-lcd__num">{number || '—'}</span>
            <span className="ll-lcd__line">{line}</span>
          </div>
          <div className="ll-keys">
            {keys.map((k) => (
              <button
                key={k}
                type="button"
                className="ll-key"
                onClick={() => {
                  setNumber((n) => (n + k).slice(0, 14))
                  setLine('DISCANDO')
                }}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="ll-actions">
            <button type="button" className="ll-call" disabled={!number} onClick={() => dial(number)}>
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
        </section>

        <section className="ll-dir" aria-label="Ramais e retorno">
          <h3 className="ll-h">Ramais</h3>
          <ul>
            {extensions.map((e) => (
              <li key={e.ext}>
                <button type="button" onClick={() => dial(e.ext, e.name)}>
                  <b>{e.ext}</b>
                  <span>{e.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <h3 className="ll-h">Retorno de ligações</h3>
          {callable.length ? (
            <ul>
              {callable.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => dial(c.phone ?? 'EXT.', c.displayName)}>
                    <b>{c.displayName}</b>
                    <span>{c.phone ?? 'número registrado'}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ll-note">Nenhum contato liberado para retorno ainda.</p>
          )}
        </section>
      </div>
    </GamePanel>
  )
}
