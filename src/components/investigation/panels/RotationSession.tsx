import { useState } from 'react'
import {
  ROTATION_CALLSIGN,
  ROTATION_LOGS,
  isRotationSynced,
  resolveCallsignAfterSync,
  type RotationSystemId,
} from '../../../data/block08/rotationPuzzle'
import { onRotationSolved } from '../../../game/story/block08Handlers'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { playSfx } from '../../../lib/sfx'

const SYSTEMS: RotationSystemId[] = ['radio', 'cad', 'dispatch', 'scale']

/**
 * Puzzle 11 — Rotação de Saturno (placeholder).
 * Aplicar offsets por sistema; âncoras revelam o indicativo.
 */
export function RotationSession() {
  const inv = useInvestigation()
  const solved = Boolean(inv.flags.block08_rotation_done)
  const [offsets, setOffsets] = useState<Record<RotationSystemId, number>>({
    radio: 0,
    cad: 0,
    dispatch: 0,
    scale: 0,
  })
  const [msg, setMsg] = useState<string | null>(null)

  const setOff = (sys: RotationSystemId, value: number) => {
    if (solved) return
    setMsg(null)
    playSfx('ui')
    setOffsets((prev) => ({ ...prev, [sys]: value }))
  }

  const trySolve = () => {
    if (!isRotationSynced(offsets)) {
      playSfx('error')
      setMsg('Ajuste os offsets pelos eventos âncora (abertura / abordagem) até os sistemas coincidirem.')
      return
    }
    playSfx('unlock')
    onRotationSolved()
  }

  return (
    <div className="aw-hex" data-testid="rotation-panel">
      <p className="aw-orbit__title">Rotação de Saturno — relógios da corporação</p>
      <p className="aw-provisional__note">
        Placeholder do Puzzle 11. Rádio, CAD e despacho discordam. Use eventos compartilhados como âncoras;
        corrija offsets. O resultado é um indicativo — não um nome.
      </p>

      <h4 className="pc-sub">Logs</h4>
      <ul className="pc-ul" data-testid="rotation-log-list">
        {ROTATION_LOGS.map((l) => (
          <li key={l.id}>
            {l.system} · t bruto {l.rawTMin} · evento “{l.event}”
            {l.callsign ? ` · indicativo bruto ${l.callsign}` : ''}
          </li>
        ))}
      </ul>

      <h4 className="pc-sub">Offsets por sistema (min)</h4>
      <ul className="pc-ul">
        {SYSTEMS.map((sys) => {
          const truth = ROTATION_LOGS.find((l) => l.system === sys)?.offsetMin ?? 0
          return (
            <li key={sys}>
              <label>
                {sys}:{' '}
                <select
                  data-testid={`rotation-offset-${sys}`}
                  disabled={solved}
                  value={offsets[sys]}
                  onChange={(e) => setOff(sys, Number(e.target.value))}
                >
                  {[-4, -3, -2, -1, 0, 1, 2].map((n) => (
                    <option key={n} value={n}>
                      {n}
                      {n === truth ? ' ← âncora' : ''}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          )
        })}
      </ul>

      {msg ? (
        <p role="alert" data-testid="rotation-error">
          {msg}
        </p>
      ) : null}

      {!solved ? (
        <button type="button" className="aw-provisional__go" data-testid="rotation-solve" onClick={trySolve}>
          Converter para timeline comum
        </button>
      ) : (
        <div data-testid="rotation-solved">
          <p>
            Indicativo compatível com local, horário e deslocamento:{' '}
            <strong>{resolveCallsignAfterSync() || ROTATION_CALLSIGN}</strong>
          </p>
          <p className="aw-provisional__note">Consulte a escala antiga desse indicativo no sistema policial.</p>
        </div>
      )}
    </div>
  )
}
