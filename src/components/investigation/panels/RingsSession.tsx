import { useMemo, useState } from 'react'
import {
  RING_SOURCES,
  RING_TRUE_ORDER,
  isRingOrderCorrect,
  rawOrderByTimestamp,
  type RingSourceId,
} from '../../../data/block08/ringsPuzzle'
import { onRingsSolved } from '../../../game/story/block08Handlers'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { playSfx } from '../../../lib/sfx'

/**
 * Puzzle 10 — Ordem dos Anéis (placeholder).
 * Aplicar offsets/drift e ordenar fontes pela timeline corrigida.
 */
export function RingsSession() {
  const inv = useInvestigation()
  const solved = Boolean(inv.flags.block08_rings_done)
  const [order, setOrder] = useState<RingSourceId[]>([])
  const [synced, setSynced] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const remaining = useMemo(
    () => RING_SOURCES.filter((s) => !order.includes(s.id)),
    [order],
  )

  const applySync = () => {
    if (solved) return
    playSfx('ui')
    setSynced(true)
    setMsg(null)
    setOrder([])
  }

  const add = (id: RingSourceId) => {
    if (solved || !synced) return
    setMsg(null)
    playSfx('ui')
    const next = [...order, id]
    setOrder(next)
    if (next.length === RING_TRUE_ORDER.length) {
      if (isRingOrderCorrect(next)) {
        playSfx('unlock')
        onRingsSolved()
      } else {
        playSfx('error')
        setMsg('Ordem incorreta. Use a timeline corrigida (eventos compartilhados + offsets), não os timestamps brutos.')
        setOrder([])
      }
    }
  }

  const raw = rawOrderByTimestamp().join(' → ')

  return (
    <div className="aw-hex" data-testid="rings-panel">
      <p className="aw-orbit__title">Ordem dos anéis — fontes dessincronizadas</p>
      <p className="aw-provisional__note">
        Placeholder do Puzzle 10. A ordem de descoberta ≠ ordem dos fatos. Relógios com offset/drift.
        Sincronize por eventos compartilhados e ordene a timeline corrigida.
      </p>

      <p data-testid="rings-raw-order">Ordem só pelos timestamps brutos: {raw}</p>

      <h4 className="pc-sub">Fontes</h4>
      <ul className="pc-ul" data-testid="rings-source-list">
        {RING_SOURCES.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className="pc-inline"
              data-testid={`rings-source-${s.id}`}
              disabled={solved || !synced || order.includes(s.id)}
              onClick={() => add(s.id)}
            >
              {s.id}: {s.label} · bruto t={s.rawTMin} · offset {s.offsetMin}
              {s.driftMin ? ` · drift ${s.driftMin}` : ''}
            </button>
            <span className="aw-provisional__note"> — {s.note}</span>
          </li>
        ))}
      </ul>

      {!synced && !solved ? (
        <button type="button" className="aw-provisional__go" data-testid="rings-sync" onClick={applySync}>
          Sincronizar por fingerprints / eventos compartilhados
        </button>
      ) : null}

      <p data-testid="rings-order">Ordem montada: {order.join(' → ') || '—'}</p>
      {msg ? (
        <p role="alert" data-testid="rings-error">
          {msg}
        </p>
      ) : null}
      {!solved && order.length ? (
        <button type="button" className="pc-inline" onClick={() => setOrder([])}>
          Limpar ordem
        </button>
      ) : null}

      {solved ? (
        <div data-testid="rings-solved">
          <p>Timeline corrigida: {RING_TRUE_ORDER.join(' → ')}</p>
          <p>
            Continuidade D→F: máscara some na área lateral; a câmera de serviço registra a saída com o mesmo
            rádio e a mesma mochila do núcleo — sem máscara.
          </p>
          <p className="aw-provisional__note">
            A evidência demonstra a continuidade física. O intervalo de atividade cobre parte essencial usada na
            condenação.
          </p>
        </div>
      ) : (
        <p className="aw-provisional__note">
          {synced ? `Restam ${remaining.length} fonte(s).` : 'Sincronize antes de ordenar.'}
        </p>
      )}
    </div>
  )
}
