import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as PE, type WheelEvent } from 'react'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { buildEvidenceBoard, type BoardNode, type BoardNodeKind } from '../../game/board/buildEvidenceBoard'
import { CasebookFilterBar } from './CasebookFilterBar'

const KIND_LABEL: Record<BoardNodeKind, string> = {
  person: 'Pessoa',
  source: 'Fonte',
  event: 'Evento',
  fact: 'Fato',
  contradiction: 'Contradição',
  hypothesis: 'Hipótese',
}

const FILTERS: { id: 'all' | BoardNodeKind; label: string }[] = [
  { id: 'all', label: 'Tudo' },
  { id: 'person', label: 'Pessoas' },
  { id: 'source', label: 'Fontes' },
  { id: 'fact', label: 'Fatos' },
  { id: 'event', label: 'Eventos' },
  { id: 'contradiction', label: 'Contradições' },
  { id: 'hypothesis', label: 'Hipóteses' },
]

export function EvidenceBoard({ onOpen }: { onOpen: (tab: string, id: string) => void }) {
  const inv = useInvestigation()
  const { nodes, edges } = useMemo(() => buildEvidenceBoard(inv), [inv])
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const [sel, setSel] = useState<string | null>(null)
  const pan = useRef({ x: 24, y: 16, z: 1 })
  const layerRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)

  const applyTransform = () => {
    const el = layerRef.current
    if (!el) return
    const { x, y, z } = pan.current
    el.style.transform = `translate(${x}px, ${y}px) scale(${z})`
  }

  useEffect(() => {
    applyTransform()
  }, [])

  const visible = filter === 'all' ? nodes : nodes.filter((n) => n.kind === filter)
  const visibleIds = new Set(visible.map((n) => n.id))
  const related = useMemo(() => {
    if (!sel) return new Set<string>()
    const set = new Set<string>([sel])
    for (const e of edges) {
      if (e.from === sel) set.add(e.to)
      if (e.to === sel) set.add(e.from)
    }
    return set
  }, [sel, edges])

  const selected: BoardNode | undefined = nodes.find((n) => n.id === sel)

  const onPointerDown = (e: PE<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.eb-node')) return
    drag.current = { x: e.clientX, y: e.clientY, px: pan.current.x, py: pan.current.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PE<HTMLDivElement>) => {
    if (!drag.current) return
    pan.current.x = drag.current.px + (e.clientX - drag.current.x)
    pan.current.y = drag.current.py + (e.clientY - drag.current.y)
    applyTransform()
  }
  const onPointerUp = () => {
    drag.current = null
  }
  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const next = Math.min(1.6, Math.max(0.55, pan.current.z * (e.deltaY > 0 ? 0.94 : 1.06)))
    pan.current.z = next
    applyTransform()
  }

  const focusRelated = useCallback(() => {
    if (!selected) return
    const rel = nodes.filter((n) => related.has(n.id))
    if (!rel.length) return
    const minX = Math.min(...rel.map((n) => n.x))
    const minY = Math.min(...rel.map((n) => n.y))
    pan.current.x = 80 - minX * pan.current.z
    pan.current.y = 40 - minY * pan.current.z
    applyTransform()
  }, [selected, nodes, related])

  const worldW = Math.max(1400, ...nodes.map((n) => n.x + 220))
  const worldH = Math.max(720, ...nodes.map((n) => n.y + 120))

  const emptyLabel =
    filter === 'fact'
      ? 'Nenhum fato registrado até o momento.'
      : filter === 'all'
        ? 'Nada registrado no quadro ainda.'
        : `Nenhum item em “${FILTERS.find((f) => f.id === filter)?.label ?? filter}”.`

  return (
    <div className="eb" data-testid="evidence-board">
      <CasebookFilterBar
        ariaLabel="Filtrar quadro"
        options={FILTERS}
        value={filter}
        onChange={(id) => {
          setFilter(id)
          setSel(null)
        }}
      />
      <div
        className="eb-viewport"
        data-testid="evidence-board-view"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div ref={layerRef} className="eb-world" style={{ width: worldW, height: worldH }}>
          <svg className="eb-edges" width={worldW} height={worldH} aria-hidden>
            {edges.map((e) => {
              const a = nodes.find((n) => n.id === e.from)
              const b = nodes.find((n) => n.id === e.to)
              if (!a || !b) return null
              if (filter !== 'all' && (!visibleIds.has(a.id) || !visibleIds.has(b.id))) return null
              const hot = !sel || (related.has(a.id) && related.has(b.id))
              return (
                <line
                  key={e.id}
                  x1={a.x + 96}
                  y1={a.y + 28}
                  x2={b.x + 96}
                  y2={b.y + 28}
                  className={hot ? 'eb-edge' : 'eb-edge eb-edge--dim'}
                />
              )
            })}
          </svg>
          {visible.map((n) => (
            <button
              key={n.id}
              type="button"
              className="eb-node"
              data-kind={n.kind}
              data-active={n.id === sel || undefined}
              data-dim={sel && !related.has(n.id) ? true : undefined}
              style={{ left: n.x, top: n.y }}
              onClick={() => setSel(n.id === sel ? null : n.id)}
            >
              {n.portraitSrc ? <img src={n.portraitSrc} alt="" className="eb-node__face" /> : null}
              <small>{KIND_LABEL[n.kind]}</small>
              <strong>{n.title}</strong>
            </button>
          ))}
        </div>
        {visible.length === 0 ? <p className="eb-empty">{emptyLabel}</p> : null}
      </div>
      {selected ? (
        <aside className="eb-detail">
          <p className="eb-detail__k">{KIND_LABEL[selected.kind]}</p>
          <h3>{selected.title}</h3>
          {selected.subtitle ? <p>{selected.subtitle}</p> : null}
          <div className="eb-detail__actions">
            <button type="button" onClick={() => onOpen(selected.refTab, selected.refId)}>
              Abrir no caderno
            </button>
            <button type="button" onClick={focusRelated}>
              Mostrar relacionados
            </button>
          </div>
        </aside>
      ) : (
        <p className="eb-hint">Arraste para mover · role para zoom · clique um nó</p>
      )}
    </div>
  )
}
