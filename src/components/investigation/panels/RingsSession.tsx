import { useEffect, useMemo, useState } from 'react'
import {
  RING_CONTINUITY_FRAMES,
  RING_SOURCES,
  RING_TRUE_ORDER,
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
import { MorsaCctvReveal } from '../MorsaCctvReveal'

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
  const [showCctv, setShowCctv] = useState(false)

  useEffect(() => {
    if (timelineDone) setSynced(true)
  }, [timelineDone])

  const remaining = useMemo(
    () => RING_SOURCES.filter((s) => !order.includes(s.id)),
    [order],
  )

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

      {showContinuity && !continuityDone ? (
        <article className="rings-replay" data-testid="rings-replay-card">
          <h4 className="pc-sub">Sequência reconstruída — câmeras do protesto</h4>
          <div className="rings-replay__thumb">
            <img
              src={resolveChatMediaSrc(RING_CONTINUITY_FRAMES[0].imageSrc)}
              alt=""
              className="rings-replay__img"
            />
            <span className="rings-replay__label">{RING_CONTINUITY_FRAMES[0].cameraId}</span>
          </div>
          <p className="aw-provisional__note">
            Registros sincronizados. Reproduza a passagem antes de registrar a conclusão.
          </p>
          <button
            type="button"
            className="aw-provisional__go"
            data-testid="rings-replay-start"
            onClick={() => setShowCctv(true)}
          >
            Reproduzir
          </button>
        </article>
      ) : null}
      {continuityDone && !fullyDone ? (
        <p className="aw-provisional__note" data-testid="rings-continuity-done">
          Continuidade registrada. Aguarde a reflexão na mesa.
        </p>
      ) : null}
      {showCctv ? (
        <MorsaCctvReveal
          onComplete={() => {
            setShowCctv(false)
            onMorsaContinuityConfirmed()
          }}
        />
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
