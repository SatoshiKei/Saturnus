import { useMemo, useState } from 'react'
import {
  PASTOR_CODE_TABLE,
  PASTOR_CYCLES,
  PASTOR_TOKEN,
  decodeBurst,
  decodeCyclesInOrder,
  isPastorOrderCorrect,
  type PastorCycle,
} from '../../../data/block06/pastorMoonsPuzzle'
import { onPastorMoonsSolved } from '../../../game/story/block06Handlers'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { playSfx } from '../../../lib/sfx'

/**
 * Puzzle 7 — Luas Pastoras (placeholder).
 * Ordenar os quatro ciclos pelo sequence ID; XOR payload⊕senderId → G17N → tabela logística.
 */
export function ShepherdMoonsSession() {
  const inv = useInvestigation()
  const solved = Boolean(inv.flags.block06_pastor_done)
  const [order, setOrder] = useState<string[]>([])
  const [msg, setMsg] = useState<string | null>(null)

  const remaining = useMemo(
    () => PASTOR_CYCLES.filter((c) => !order.includes(c.id)),
    [order],
  )
  const selected: PastorCycle[] = order
    .map((id) => PASTOR_CYCLES.find((c) => c.id === id)!)
    .filter(Boolean)

  const tokenPreview = selected.length ? decodeCyclesInOrder(selected) : ''

  const add = (id: string) => {
    setMsg(null)
    if (order.includes(id)) return
    playSfx('ui')
    const next = [...order, id]
    setOrder(next)
    if (next.length === PASTOR_CYCLES.length) {
      if (isPastorOrderCorrect(next)) {
        playSfx('unlock')
        onPastorMoonsSolved()
      } else {
        playSfx('error')
        setMsg('Ordem incorreta. Os ciclos devem seguir o sequence ID 1→4.')
        setOrder([])
      }
    }
  }

  const reset = () => {
    setOrder([])
    setMsg(null)
  }

  return (
    <div className="aw-hex" data-testid="pastor-moons-panel">
      <p className="aw-orbit__title">Luas pastoras — três canais</p>
      <p className="aw-provisional__note">
        Placeholder do Puzzle 7. Canais A e C delimitam bursts curtos em B. Ordene os quatro ciclos pelo
        sequence ID; cada burst: decoded = payload XOR senderId. O token consulta a tabela logística.
      </p>

      <div className="aw-dl" data-testid="pastor-channels">
        <p>
          <strong>A / C</strong> — tráfego recorrente · <strong>B</strong> — quase vazio, bursts entre pares A–C
        </p>
      </div>

      <h4 className="pc-sub">Ciclos capturados</h4>
      <ul className="pc-ul" data-testid="pastor-cycle-list">
        {PASTOR_CYCLES.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className="pc-inline"
              data-testid={`pastor-cycle-${c.id}`}
              disabled={solved || order.includes(c.id)}
              onClick={() => add(c.id)}
            >
              seq {c.sequence}: A {c.leftA.time} → B {c.burstB.time} (ID {c.burstB.radioId} / 0x
              {c.burstB.senderId.toString(16)}) → C {c.rightC.time}
            </button>
            <span className="aw-provisional__note">
              {' '}
              XOR demo: 0x{c.burstB.payload.toString(16)} ⊕ 0x{c.burstB.senderId.toString(16)} → “
              {decodeBurst(c.burstB.senderId, c.burstB.payload)}”
            </span>
          </li>
        ))}
      </ul>

      <p data-testid="pastor-order">
        Ordem montada: {selected.map((c) => c.sequence).join(' → ') || '—'}
        {tokenPreview ? ` · preview “${tokenPreview}”` : ''}
      </p>
      {msg ? (
        <p role="alert" data-testid="pastor-error">
          {msg}
        </p>
      ) : null}
      {!solved && order.length ? (
        <button type="button" className="pc-inline" onClick={reset}>
          Limpar ordem
        </button>
      ) : null}

      {solved ? (
        <div data-testid="pastor-solved">
          <p>
            Token: <strong>{PASTOR_TOKEN}</strong>
          </p>
          <h4 className="pc-sub">Tabela logística</h4>
          <ul className="pc-ul">
            {PASTOR_CODE_TABLE.map((row) => (
              <li key={row.token}>
                {row.token} → {row.place}
                {row.token === PASTOR_TOKEN ? ' ← correspondente' : ''}
              </li>
            ))}
          </ul>
          <p>Localização operacional confirmada. A operação pode ser deflagrada no mapa.</p>
        </div>
      ) : (
        <p className="aw-provisional__note">Restam {remaining.length} ciclo(s) para enfileirar.</p>
      )}
    </div>
  )
}
