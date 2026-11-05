import { useMemo, useState } from 'react'
import {
  ENCELADUS_BURSTS,
  ENCELADUS_HOSPITAL_MATCH,
  ENCELADUS_PERIOD_SEC,
  ENCELADUS_REF_TABLE,
  ENCELADUS_SHIFT_HINT,
  ENCELADUS_VOICE_FRAGMENT,
  enceladusPeriodMatches,
} from '../../../data/block07/enceladusPuzzle'
import { onEnceladusSolved } from '../../../game/story/block07Handlers'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { playSfx } from '../../../lib/sfx'

/**
 * Puzzle 8 — Enceladus (placeholder).
 * Marcar rajadas periódicas e cruzar com tabela hospitalar → ambiente + “Ricardo”.
 */
export function EnceladusSession() {
  const inv = useInvestigation()
  const solved = Boolean(inv.flags.block07_enceladus_done)
  const [marked, setMarked] = useState<string[]>([])
  const [msg, setMsg] = useState<string | null>(null)

  const selected = useMemo(
    () => ENCELADUS_BURSTS.filter((b) => marked.includes(b.id)),
    [marked],
  )

  const toggle = (id: string) => {
    if (solved) return
    setMsg(null)
    playSfx('ui')
    setMarked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const trySolve = () => {
    const equipment = selected.filter((b) => b.kind === 'equipment')
    const hasVoice = selected.some((b) => b.kind === 'voice')
    if (equipment.length < 2 || !hasVoice) {
      playSfx('error')
      setMsg('Marque as rajadas de equipamento periódicas e o fragmento de voz.')
      return
    }
    if (!enceladusPeriodMatches(selected.length ? selected : ENCELADUS_BURSTS)) {
      playSfx('error')
      setMsg(`Periodicidade esperada ≈ ${ENCELADUS_PERIOD_SEC}s entre alarmes de equipamento.`)
      return
    }
    playSfx('unlock')
    onEnceladusSolved()
  }

  return (
    <div className="aw-hex" data-testid="enceladus-panel">
      <p className="aw-orbit__title">Enceladus — rajadas no silêncio</p>
      <p className="aw-provisional__note">
        Placeholder do Puzzle 8. Fundo quase silencioso; bursts periódicos. Separe equipamento de voz e
        compare com a tabela de padrões hospitalares.
      </p>

      <h4 className="pc-sub">Waveform / bursts detectados</h4>
      <ul className="pc-ul" data-testid="enceladus-burst-list">
        {ENCELADUS_BURSTS.map((b) => (
          <li key={b.id}>
            <button
              type="button"
              className="pc-inline"
              data-testid={`enceladus-burst-${b.id}`}
              data-marked={marked.includes(b.id) || undefined}
              disabled={solved}
              onClick={() => toggle(b.id)}
            >
              t={b.tSec}s · {b.kind} · {b.label}
              {marked.includes(b.id) ? ' ✓' : ''}
            </button>
          </li>
        ))}
      </ul>

      <h4 className="pc-sub">Tabela — equipamentos hospitalares</h4>
      <ul className="pc-ul" data-testid="enceladus-ref-table">
        {ENCELADUS_REF_TABLE.map((r) => (
          <li key={r.id}>
            {r.name}: {r.pattern}
          </li>
        ))}
      </ul>

      {msg ? (
        <p role="alert" data-testid="enceladus-error">
          {msg}
        </p>
      ) : null}

      {!solved ? (
        <button type="button" className="aw-provisional__go" data-testid="enceladus-solve" onClick={trySolve}>
          Cruzar periodicidade × tabela
        </button>
      ) : (
        <div data-testid="enceladus-solved">
          <p>
            Ambiente: <strong>{ENCELADUS_HOSPITAL_MATCH}</strong>
          </p>
          <p>Janela: {ENCELADUS_SHIFT_HINT}</p>
          <p>
            Fragmento de voz: <strong>{ENCELADUS_VOICE_FRAGMENT}</strong>
          </p>
          <p className="aw-provisional__note">
            Hospital + período + nome. A busca nominal fica a cargo da investigação.
          </p>
        </div>
      )}
    </div>
  )
}
