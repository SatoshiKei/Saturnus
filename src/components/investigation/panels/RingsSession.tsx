import { useEffect, useMemo, useState } from 'react'
import {
  RING_CONTINUITY_CHECKS,
  RING_CONTINUITY_FRAMES,
  RING_SOURCES,
  RING_TRUE_ORDER,
  type ContinuityCheckId,
  type RingSourceId,
  isRingOrderCorrect,
  rawOrderByTimestamp,
} from '../../../data/block08/ringsPuzzle'
import {
  onMorsaContinuityConfirmed,
  onRingsTimelineSolved,
} from '../../../game/story/block08Handlers'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { resolveChatMediaSrc } from '../../../lib/characterSprites'
import { playSfx } from '../../../lib/sfx'

/**
 * Puzzle 10 — Ordem dos Anéis.
 * Timeline correta → confirmação visual de continuidade → Reflection (nome fora desta UI).
 */
export function RingsSession() {
  const inv = useInvestigation()
  const fullyDone = Boolean(inv.flags.block08_rings_done)
  const timelineDone = Boolean(inv.flags.block08_rings_timeline_solved) || fullyDone
  const continuityDone =
    Boolean(inv.flags.block08_morsa_continuity_confirmed) || fullyDone

  const [order, setOrder] = useState<RingSourceId[]>([])
  const [synced, setSynced] = useState(timelineDone)
  const [msg, setMsg] = useState<string | null>(null)
  const [checks, setChecks] = useState<Record<ContinuityCheckId, boolean>>({
    backpack: continuityDone,
    radio: continuityDone,
    timing: continuityDone,
  })
  const [hold, setHold] = useState(false)

  useEffect(() => {
    if (timelineDone) setSynced(true)
  }, [timelineDone])

  const remaining = useMemo(
    () => RING_SOURCES.filter((s) => !order.includes(s.id)),
    [order],
  )

  const allChecks = RING_CONTINUITY_CHECKS.every((c) => checks[c.id])

  const applySync = () => {
    if (fullyDone || timelineDone) return
    playSfx('ui')
    setSynced(true)
    setMsg(null)
    setOrder([])
  }

  const add = (id: RingSourceId) => {
    if (fullyDone || timelineDone || !synced) return
    setMsg(null)
    playSfx('ui')
    const next = [...order, id]
    setOrder(next)
    if (next.length === RING_TRUE_ORDER.length) {
      if (isRingOrderCorrect(next)) {
        playSfx('unlock')
        onRingsTimelineSolved()
      } else {
        playSfx('error')
        setMsg(
          'Ordem incorreta. Use a timeline corrigida (eventos compartilhados + offsets), não os timestamps brutos.',
        )
        setOrder([])
      }
    }
  }

  const toggleCheck = (id: ContinuityCheckId) => {
    if (continuityDone || hold) return
    playSfx('ui')
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const confirmContinuity = () => {
    if (!allChecks || continuityDone || hold) return
    playSfx('unlock')
    setHold(true)
    window.setTimeout(() => {
      onMorsaContinuityConfirmed()
      setHold(false)
    }, 900)
  }

  const raw = rawOrderByTimestamp().join(' → ')
  const showContinuity = timelineDone && !fullyDone
  const showSolvedSummary = fullyDone

  return (
    <div className="aw-hex" data-testid="rings-panel">
      <p className="aw-orbit__title">Ordem dos anéis — fontes dessincronizadas</p>
      <p className="aw-provisional__note">
        Relógios com offset/drift. Sincronize por eventos compartilhados e ordene a timeline corrigida.
        Depois, confirme a continuidade visual entre os frames.
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
              disabled={fullyDone || timelineDone || !synced || order.includes(s.id)}
              onClick={() => add(s.id)}
            >
              {s.id}: {s.label} · bruto t={s.rawTMin} · offset {s.offsetMin}
              {s.driftMin ? ` · drift ${s.driftMin}` : ''}
            </button>
            <span className="aw-provisional__note"> — {s.note}</span>
          </li>
        ))}
      </ul>

      {!synced && !timelineDone ? (
        <button type="button" className="aw-provisional__go" data-testid="rings-sync" onClick={applySync}>
          Sincronizar por fingerprints / eventos compartilhados
        </button>
      ) : null}

      <p data-testid="rings-order">
        Ordem montada: {timelineDone ? RING_TRUE_ORDER.join(' → ') : order.join(' → ') || '—'}
      </p>
      {msg ? (
        <p role="alert" data-testid="rings-error">
          {msg}
        </p>
      ) : null}
      {!timelineDone && order.length ? (
        <button type="button" className="pc-inline" onClick={() => setOrder([])}>
          Limpar ordem
        </button>
      ) : null}

      {showContinuity ? (
        <div className="rings-continuity" data-testid="rings-continuity">
          <h4 className="pc-sub">Continuidade observada</h4>
          <p className="aw-provisional__note">
            Timeline corrigida. Marque o que a sequência de frames demonstra — sem antecipar nomes.
          </p>
          <div className="rings-continuity__frames" data-testid="rings-continuity-frames">
            {RING_CONTINUITY_FRAMES.map((f) => (
              <figure key={f.id} className="rings-continuity__frame" data-testid={`rings-frame-${f.id}`}>
                {f.imageSrc ? (
                  <img src={resolveChatMediaSrc(f.imageSrc)} alt="" className="rings-continuity__img" />
                ) : (
                  <div className="rings-continuity__placeholder" aria-hidden>
                    FRAME PENDENTE
                    <span>{f.id}</span>
                  </div>
                )}
                <figcaption>
                  <strong>{f.timeLabel}</strong>
                  <span>{f.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <fieldset className="rings-continuity__checks" data-testid="rings-continuity-checks">
            <legend>Correspondências observadas</legend>
            {RING_CONTINUITY_CHECKS.map((c) => (
              <label key={c.id} className="rings-continuity__check">
                <input
                  type="checkbox"
                  data-testid={`rings-check-${c.id}`}
                  checked={checks[c.id]}
                  disabled={continuityDone || hold}
                  onChange={() => toggleCheck(c.id)}
                />
                {c.label}
              </label>
            ))}
          </fieldset>
          {hold ? (
            <p className="aw-provisional__note" data-testid="rings-continuity-hold">
              Sequência alinhada…
            </p>
          ) : continuityDone ? (
            <p className="aw-provisional__note" data-testid="rings-continuity-done">
              Continuidade registrada. Feche a bancada.
            </p>
          ) : (
            <button
              type="button"
              className="aw-provisional__go"
              data-testid="rings-confirm-continuity"
              disabled={!allChecks}
              onClick={confirmContinuity}
            >
              Confirmar continuidade
            </button>
          )}
        </div>
      ) : null}

      {showSolvedSummary ? (
        <div data-testid="rings-solved">
          <p>Timeline corrigida: {RING_TRUE_ORDER.join(' → ')}</p>
          <p>
            Continuidade confirmada: máscara some na área lateral; a câmera de serviço registra a saída com o
            mesmo rádio e a mesma mochila.
          </p>
        </div>
      ) : null}

      {!timelineDone ? (
        <p className="aw-provisional__note">
          {synced ? `Restam ${remaining.length} fonte(s).` : 'Sincronize antes de ordenar.'}
        </p>
      ) : null}
    </div>
  )
}
