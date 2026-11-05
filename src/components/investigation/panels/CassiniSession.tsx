import { useState } from 'react'
import {
  CASSINI_CAPTURE,
  CASSINI_SESSION_A_SUMMARY,
  CASSINI_SESSION_B_SUMMARY,
  isCassiniSeparated,
  packetsForSsrc,
  type CassiniSsrc,
} from '../../../data/block07/cassiniPuzzle'
import { onCassiniSolved } from '../../../game/story/block07Handlers'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { playSfx } from '../../../lib/sfx'

/**
 * Puzzle 9 — Cassini-Huygens (placeholder).
 * Atribuir pacotes aos dois SSRCs; a chave é perceber duas sessões misturadas.
 */
export function CassiniSession() {
  const inv = useInvestigation()
  const solved = Boolean(inv.flags.block07_cassini_done)
  const [assigned, setAssigned] = useState<Record<string, CassiniSsrc | ''>>({})
  const [msg, setMsg] = useState<string | null>(null)

  const setSsrc = (id: string, ssrc: CassiniSsrc | '') => {
    if (solved) return
    setMsg(null)
    playSfx('ui')
    setAssigned((prev) => ({ ...prev, [id]: ssrc }))
  }

  const trySolve = () => {
    if (!isCassiniSeparated(assigned)) {
      playSfx('error')
      setMsg('Separe os pacotes nos dois SSRCs corretos (ignore duplicatas).')
      return
    }
    playSfx('unlock')
    onCassiniSolved()
  }

  const flowA = packetsForSsrc('A1')
  const flowB = packetsForSsrc('B7')

  return (
    <div className="aw-hex" data-testid="cassini-panel">
      <p className="aw-orbit__title">Cassini-Huygens — duas trajetórias</p>
      <p className="aw-provisional__note">
        Placeholder do Puzzle 9. PCAP com RTP: sequence, timestamp, SSRC. Não é uma transmissão
        corrompida — são duas sessões misturadas.
      </p>

      <h4 className="pc-sub">Pacotes capturados</h4>
      <ul className="pc-ul" data-testid="cassini-packet-list">
        {CASSINI_CAPTURE.map((p) => (
          <li key={p.id}>
            <span>
              {p.id} · SSRC? · seq {p.seq} · ts {p.ts}
              {p.note === 'dup' ? ' (dup)' : p.note === 'gap' ? ' (gap)' : ''}
            </span>{' '}
            <select
              data-testid={`cassini-assign-${p.id}`}
              disabled={solved || p.note === 'dup'}
              value={assigned[p.id] ?? ''}
              onChange={(e) => setSsrc(p.id, e.target.value as CassiniSsrc | '')}
            >
              <option value="">—</option>
              <option value="A1">SSRC A1</option>
              <option value="B7">SSRC B7</option>
            </select>
          </li>
        ))}
      </ul>

      {msg ? (
        <p role="alert" data-testid="cassini-error">
          {msg}
        </p>
      ) : null}

      {!solved ? (
        <button type="button" className="aw-provisional__go" data-testid="cassini-solve" onClick={trySolve}>
          Separar fluxos e reconstruir
        </button>
      ) : (
        <div data-testid="cassini-solved">
          <p>
            Fluxo A1 ordenado: {flowA.map((p) => p.seq).join(' → ')}
          </p>
          <p>
            Fluxo B7 ordenado: {flowB.map((p) => p.seq).join(' → ')}
          </p>
          <blockquote className="aw-provisional__transcript">{CASSINI_SESSION_A_SUMMARY}</blockquote>
          <blockquote className="aw-provisional__transcript">{CASSINI_SESSION_B_SUMMARY}</blockquote>
          <p className="aw-provisional__note">
            Interpretação inicial: sistema automatizado / interface com contexto — possivelmente operado ou
            explorado por pessoa. Sem identidade do interlocutor.
          </p>
        </div>
      )}
    </div>
  )
}
