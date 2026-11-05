import { useState } from 'react'
import {
  MEMORY_SEGMENTS,
  MEMORY_SOURCES,
  MEMORY_WORD,
  isMemoryProvenanceComplete,
  type MemorySourceId,
} from '../../../data/block09/memoryPuzzle'
import { onMemoryPuzzleSolved } from '../../../game/story/block09Handlers'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { playSfx } from '../../../lib/sfx'

/**
 * Puzzle 12 — MEMÓRIA (placeholder).
 * Player + waveform + trechos selecionáveis + fontes conhecidas + proveniência.
 */
export function MemorySession() {
  const inv = useInvestigation()
  const solved = Boolean(inv.flags.block09_memory_done)
  const [assigned, setAssigned] = useState<Record<string, MemorySourceId | ''>>({})
  const [selected, setSelected] = useState<string | null>(MEMORY_SEGMENTS[0]?.id ?? null)
  const [playing, setPlaying] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const setSrc = (segId: string, src: MemorySourceId | '') => {
    if (solved) return
    setMsg(null)
    playSfx('ui')
    setAssigned((prev) => ({ ...prev, [segId]: src }))
  }

  const trySolve = () => {
    if (!isMemoryProvenanceComplete(assigned)) {
      playSfx('error')
      setMsg('Associe cada trecho à fonte correta. As origens são incompatíveis entre si.')
      return
    }
    playSfx('unlock')
    onMemoryPuzzleSolved()
  }

  const sel = MEMORY_SEGMENTS.find((s) => s.id === selected)

  return (
    <div className="aw-hex" data-testid="memory-panel">
      <p className="aw-orbit__title">Proveniência — gravação atribuída a Mariana</p>
      <p className="aw-provisional__note">
        Placeholder do Puzzle 12. Reproduza, marque trechos e associe às fontes já conhecidas. Nenhuma
        pessoa gravou organicamente essa fala naquele momento.
      </p>

      <div className="aw-hex__row" data-testid="memory-player">
        <button
          type="button"
          className="pc-inline"
          data-testid="memory-play"
          disabled={solved}
          onClick={() => {
            playSfx('ui')
            setPlaying((p) => !p)
          }}
        >
          {playing ? 'Pausar' : 'Reproduzir'}
        </button>
        <span className="aw-provisional__note">mariana_claim_recent.wav · ~12 s</span>
      </div>

      <div
        data-testid="memory-waveform"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 2,
          height: 56,
          margin: '0.75rem 0',
          padding: '0.35rem',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: 4,
        }}
        aria-hidden
      >
        {Array.from({ length: 48 }, (_, i) => {
          const h = 8 + ((i * 17) % 40)
          const t = (i / 48) * 12
          const active = sel && t >= sel.tStart && t <= sel.tEnd
          return (
            <span
              key={i}
              style={{
                flex: 1,
                height: h,
                background: active ? 'rgba(180,210,200,0.85)' : 'rgba(120,140,135,0.45)',
                borderRadius: 1,
              }}
            />
          )
        })}
      </div>

      <h4 className="pc-sub">Fontes conhecidas</h4>
      <ul className="pc-ul" data-testid="memory-sources">
        {MEMORY_SOURCES.map((s) => (
          <li key={s.id}>
            {s.id}: {s.label}
          </li>
        ))}
      </ul>

      <h4 className="pc-sub">Trechos</h4>
      <ul className="pc-ul" data-testid="memory-segments">
        {MEMORY_SEGMENTS.map((seg) => (
          <li key={seg.id}>
            <button
              type="button"
              className="pc-inline"
              data-testid={`memory-select-${seg.id}`}
              disabled={solved}
              onClick={() => {
                playSfx('ui')
                setSelected(seg.id)
              }}
              style={{
                fontWeight: selected === seg.id ? 700 : 400,
                marginRight: '0.5rem',
              }}
            >
              {seg.label}
            </button>
            <span>
              ({seg.tStart}s–{seg.tEnd}s) — {seg.hint}
            </span>{' '}
            <select
              data-testid={`memory-assign-${seg.id}`}
              disabled={solved}
              value={assigned[seg.id] ?? ''}
              onChange={(e) => setSrc(seg.id, e.target.value as MemorySourceId | '')}
            >
              <option value="">—</option>
              {MEMORY_SOURCES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <h4 className="pc-sub">Painel de proveniência</h4>
      <ul className="pc-ul" data-testid="memory-provenance">
        {MEMORY_SEGMENTS.map((seg) => (
          <li key={seg.id}>
            {seg.id}: {assigned[seg.id] || '—'}
            {assigned[seg.id] === seg.trueSource ? ' ✓' : ''}
          </li>
        ))}
      </ul>

      {msg ? (
        <p role="alert" data-testid="memory-error">
          {msg}
        </p>
      ) : null}

      {!solved ? (
        <button type="button" className="aw-provisional__go" data-testid="memory-solve" onClick={trySolve}>
          Confirmar proveniência
        </button>
      ) : (
        <div data-testid="memory-solved">
          <p>
            A gravação nunca aconteceu como gravação real. Foi recombinada a partir da memória operacional do
            caso — o mesmo repertório que Augusto investigou.
          </p>
          <p className="aw-orbit__title" data-testid="memory-word">
            {MEMORY_WORD}
          </p>
        </div>
      )}
    </div>
  )
}
