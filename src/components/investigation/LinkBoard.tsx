import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as PE,
  type WheelEvent,
} from 'react'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { boardBounds, buildLinkBoard, clusterCenter } from '../../game/board/buildLinkBoard'
import type { LinkBoardFilter, LinkBoardNode, LinkBoardNodeKind } from '../../game/board/linkBoardTypes'
import { loadLinkBoardSession, saveLinkBoardSession } from '../../app/uiStore'

const FILTERS: { id: LinkBoardFilter; label: string }[] = [
  { id: 'all', label: 'Tudo' },
  { id: 'person', label: 'Pessoas' },
  { id: 'evidence', label: 'Evidências' },
  { id: 'event', label: 'Eventos' },
  { id: 'hypothesis', label: 'Hipóteses' },
  { id: 'contradiction', label: 'Contradições' },
]

const KIND_LABEL: Record<LinkBoardNodeKind, string> = {
  person: 'Pessoa',
  event: 'Evento',
  evidence: 'Evidência-chave',
  hypothesis: 'Hipótese',
  contradiction: 'Contradição',
}

function edgePath(a: LinkBoardNode, b: LinkBoardNode) {
  const x1 = a.x + 96
  const y1 = a.y + 36
  const x2 = b.x + 96
  const y2 = b.y + 36
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return { x1, y1, x2, y2, mx, my }
}

export function LinkBoard({ onOpen }: { onOpen: (tab: string, id: string) => void }) {
  const inv = useInvestigation()
  const sessionRef = useRef(loadLinkBoardSession())
  const [filter, setFilter] = useState<LinkBoardFilter>('all')
  const [sel, setSel] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const pan = useRef({
    x: sessionRef.current.panX,
    y: sessionRef.current.panY,
    z: sessionRef.current.zoom,
  })
  const layerRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  const openedRef = useRef(false)

  const layout = useMemo(
    () =>
      buildLinkBoard(inv, {
        knownNodeIds: sessionRef.current.knownNodeIds,
        expandedClusters: expanded,
      }),
  [inv, expanded],
  )

  const persistSession = useCallback(() => {
    const ids = layout.nodes.map((n) => n.id)
    const merged = Array.from(new Set([...sessionRef.current.knownNodeIds, ...ids]))
    sessionRef.current = {
      panX: pan.current.x,
      panY: pan.current.y,
      zoom: pan.current.z,
      knownNodeIds: merged,
    }
    saveLinkBoardSession(sessionRef.current)
  }, [layout.nodes])

  const applyTransform = useCallback(() => {
    const el = layerRef.current
    if (!el) return
    const { x, y, z } = pan.current
    el.style.transform = `translate(${x}px, ${y}px) scale(${z})`
  }, [])

  useEffect(() => {
    if (openedRef.current) return
    openedRef.current = true
    if (sessionRef.current.panX === 0 && sessionRef.current.panY === 0 && sessionRef.current.zoom === 1) {
      const c = clusterCenter(layout.focusCluster)
      const vw = 720
      const vh = 480
      pan.current.x = vw / 2 - c.x
      pan.current.y = vh / 2 - c.y
    }
    applyTransform()
    window.setTimeout(() => persistSession(), 520)
  }, [applyTransform, layout.focusCluster, persistSession])

  const bounds = useMemo(() => boardBounds(layout.nodes), [layout.nodes])
  const worldW = bounds.maxX - bounds.minX + 200
  const worldH = bounds.maxY - bounds.minY + 200

  const related = useMemo(() => {
    if (!sel) return new Set<string>()
    const set = new Set<string>([sel])
    for (const e of layout.edges) {
      if (e.from === sel) set.add(e.to)
      if (e.to === sel) set.add(e.from)
    }
    return set
  }, [sel, layout.edges])

  const selected = layout.nodes.find((n) => n.id === sel)

  const focusCluster = useCallback(
    (cluster: string) => {
      const c = clusterCenter(cluster as import('../../game/board/linkBoardTypes').LinkBoardCluster)
      pan.current.x = 360 - c.x * pan.current.z
      pan.current.y = 280 - c.y * pan.current.z
      applyTransform()
      persistSession()
    },
    [applyTransform, persistSession],
  )

  const fitBoard = useCallback(() => {
    if (!layout.nodes.length) return
    const b = boardBounds(layout.nodes)
    const w = b.maxX - b.minX
    const h = b.maxY - b.minY
    const z = Math.min(1.25, Math.min(900 / w, 620 / h))
    pan.current.z = z
    pan.current.x = 420 - ((b.minX + b.maxX) / 2) * z
    pan.current.y = 320 - ((b.minY + b.maxY) / 2) * z
    applyTransform()
    persistSession()
  }, [layout.nodes, applyTransform, persistSession])

  const recenter = useCallback(() => {
    focusCluster(layout.focusCluster)
  }, [focusCluster, layout.focusCluster])

  const onPointerDown = (e: PE<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.lb-node')) return
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
    if (drag.current) persistSession()
    drag.current = null
  }
  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const next = Math.min(1.6, Math.max(0.45, pan.current.z * (e.deltaY > 0 ? 0.94 : 1.06)))
    pan.current.z = next
    applyTransform()
    persistSession()
  }

  const pickNode = (n: LinkBoardNode) => {
    const next = n.id === sel ? null : n.id
    setSel(next)
    if (next) {
      setExpanded((prev) => {
        const copy = new Set(prev)
        copy.add(n.cluster)
        copy.add(n.id)
        return copy
      })
    }
  }

  const opacityFor = (n: LinkBoardNode) => {
    if (filter !== 'all' && n.kind !== filter) return 0.22
    if (sel && !related.has(n.id)) return 0.35
    return 1
  }

  const edgeVisible = (from: string, to: string) => {
    const a = layout.nodes.find((n) => n.id === from)
    const b = layout.nodes.find((n) => n.id === to)
    if (!a || !b) return false
    if (filter !== 'all' && (a.kind !== filter || b.kind !== filter)) return false
    if (sel && (!related.has(from) || !related.has(to))) return false
    return true
  }

  return (
    <div className="lb" data-testid="link-board">
      <nav className="lb-tabs" role="tablist" aria-label="Filtrar quadro">
        {FILTERS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="tab"
            className="lb-tabs__item"
            aria-selected={filter === opt.id}
            data-active={filter === opt.id || undefined}
            onClick={() => setFilter(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </nav>

      <div className="lb-stage">
        <div
          className="lb-viewport"
          data-testid="evidence-board-view"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          <div className="lb-toolbar">
            <button type="button" className="lb-toolbar__btn" onClick={recenter}>
              Recentralizar
            </button>
            <button type="button" className="lb-toolbar__btn" onClick={fitBoard}>
              Ajustar ao quadro
            </button>
          </div>
          <div ref={layerRef} className="lb-world" style={{ width: worldW, height: worldH }}>
            <svg className="lb-edges" width={worldW} height={worldH} aria-hidden>
              {layout.edges.map((e) => {
                if (!edgeVisible(e.from, e.to)) return null
                const a = layout.nodes.find((n) => n.id === e.from)!
                const b = layout.nodes.find((n) => n.id === e.to)!
                const { x1, y1, x2, y2, mx, my } = edgePath(a, b)
                return (
                  <g key={e.id} className={`lb-edge lb-edge--${e.style}`}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} />
                    {e.label ? (
                      <text x={mx} y={my - 4} className="lb-edge__label">
                        {e.label}
                      </text>
                    ) : null}
                  </g>
                )
              })}
            </svg>
            {layout.nodes.map((n) => (
              <button
                key={n.id}
                type="button"
                className="lb-node"
                data-kind={n.kind}
                data-enter={layout.enteringNodeIds.includes(n.id) || undefined}
                data-active={n.id === sel || undefined}
                style={{ left: n.x, top: n.y, opacity: opacityFor(n) }}
                onClick={() => pickNode(n)}
              >
                {n.portraitSrc ? <img src={n.portraitSrc} alt="" className="lb-node__face" /> : null}
                <small>{KIND_LABEL[n.kind]}</small>
                <strong>{n.title}</strong>
                {n.subtitle ? <span className="lb-node__sub">{n.subtitle}</span> : null}
              </button>
            ))}
          </div>
          {layout.nodes.length === 0 ? (
            <p className="lb-empty">Nada no quadro ainda — continue a investigação.</p>
          ) : null}
        </div>

        {selected ? (
          <aside className="lb-detail" data-testid="link-board-detail">
            <p className="lb-detail__k">{KIND_LABEL[selected.kind]}</p>
            <h3>{selected.title}</h3>
            {selected.subtitle ? <p className="lb-detail__sub">{selected.subtitle}</p> : null}
            {selected.detail?.blurb ? <p className="lb-detail__blurb">{selected.detail.blurb}</p> : null}
            {selected.detail?.relations?.length ? (
              <section>
                <h4>Relações</h4>
                <ul>
                  {selected.detail.relations.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {selected.detail?.evidenceRefs?.length ? (
              <section>
                <h4>Evidências relacionadas</h4>
                <ul>
                  {selected.detail.evidenceRefs.map((id) => (
                    <li key={id}>{inv.evidence[id]?.title ?? id}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {selected.refTab && selected.refId ? (
              <button
                type="button"
                className="lb-detail__cta"
                onClick={() => onOpen(selected.refTab!, selected.refId!)}
              >
                Ver no caderno
              </button>
            ) : null}
          </aside>
        ) : (
          <p className="lb-hint">Arraste · zoom · clique para focar · secundários ao expandir cluster</p>
        )}
      </div>
    </div>
  )
}
