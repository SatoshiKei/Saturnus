import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as PE,
} from 'react'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { boardBounds, buildLinkBoard, clusterCenter } from '../../game/board/buildLinkBoard'
import {
  BOARD_ZOOM_LIMITS,
  FALLBACK_VIEWPORT,
  centerOnPoint,
  clampPan,
  clampZoom,
  fitRect,
  transformCss,
  wheelZoomFactor,
  zoomAtPoint,
  zoomByFactor,
  type BoardTransform,
  type BoardViewport,
} from '../../game/board/boardTransform'
import type {
  LinkBoardCluster,
  LinkBoardFilter,
  LinkBoardNode,
} from '../../game/board/linkBoardTypes'
import { loadLinkBoardSession, saveLinkBoardSession } from '../../app/uiStore'
import { KIND_LABEL, LinkBoardCanvas } from './LinkBoardCanvas'
import { LinkBoardThumbnail } from './LinkBoardThumbnail'

const FILTERS: { id: LinkBoardFilter; label: string }[] = [
  { id: 'all', label: 'Tudo' },
  { id: 'person', label: 'Pessoas' },
  { id: 'evidence', label: 'Evidências' },
  { id: 'event', label: 'Eventos' },
  { id: 'hypothesis', label: 'Hipóteses' },
  { id: 'contradiction', label: 'Contradições' },
]

const BUTTON_ZOOM_STEP = 1.2

export interface LinkBoardProps {
  onOpen?: (tab: string, id: string) => void
  /** `false` ou `scale="thumbnail"` → miniatura estática do mesmo estado (sem filtros/pan/zoom). */
  interactive?: boolean
  scale?: 'full' | 'thumbnail'
}

export function LinkBoard({ onOpen, interactive = true, scale = 'full' }: LinkBoardProps) {
  if (!interactive || scale === 'thumbnail') return <LinkBoardThumbnail />
  return <LinkBoardFull onOpen={onOpen ?? (() => undefined)} />
}

function LinkBoardFull({ onOpen }: { onOpen: (tab: string, id: string) => void }) {
  const inv = useInvestigation()
  const sessionRef = useRef(loadLinkBoardSession())
  const [filter, setFilter] = useState<LinkBoardFilter>('all')
  const [sel, setSel] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const view = useRef<BoardTransform>({
    x: sessionRef.current.panX,
    y: sessionRef.current.panY,
    z: clampZoom(sessionRef.current.zoom),
  })
  const viewportRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  const openedRef = useRef(false)
  const persistTimer = useRef<number | null>(null)

  const layout = useMemo(
    () =>
      buildLinkBoard(inv, {
        knownNodeIds: sessionRef.current.knownNodeIds,
        expandedClusters: expanded,
      }),
    [inv, expanded],
  )

  const bounds = useMemo(() => boardBounds(layout.nodes, 160), [layout.nodes])
  const boundsRef = useRef(bounds)
  boundsRef.current = bounds
  const layoutRef = useRef(layout)
  layoutRef.current = layout

  const persistSession = useCallback(() => {
    const ids = layoutRef.current.nodes.map((n) => n.id)
    const merged = Array.from(new Set([...sessionRef.current.knownNodeIds, ...ids]))
    sessionRef.current = {
      panX: view.current.x,
      panY: view.current.y,
      zoom: view.current.z,
      knownNodeIds: merged,
    }
    saveLinkBoardSession(sessionRef.current)
  }, [])

  const schedulePersist = useCallback(() => {
    if (persistTimer.current != null) window.clearTimeout(persistTimer.current)
    persistTimer.current = window.setTimeout(() => {
      persistTimer.current = null
      persistSession()
    }, 200)
  }, [persistSession])

  useEffect(
    () => () => {
      if (persistTimer.current != null) window.clearTimeout(persistTimer.current)
    },
    [],
  )

  const getViewport = useCallback((): BoardViewport => {
    const el = viewportRef.current
    if (!el || !el.clientWidth || !el.clientHeight) return FALLBACK_VIEWPORT
    return { width: el.clientWidth, height: el.clientHeight }
  }, [])

  const applyTransform = useCallback(() => {
    const el = layerRef.current
    if (!el) return
    el.style.transform = transformCss(view.current)
  }, [])

  const commit = useCallback(
    (next: BoardTransform, opts?: { clamp?: boolean; persist?: 'now' | 'later' | false }) => {
      view.current =
        opts?.clamp === false ? next : clampPan(next, getViewport(), boundsRef.current)
      applyTransform()
      if (opts?.persist === 'now') persistSession()
      else if (opts?.persist !== false) schedulePersist()
    },
    [applyTransform, getViewport, persistSession, schedulePersist],
  )

  useLayoutEffect(() => {
    if (openedRef.current) return
    openedRef.current = true
    const s = sessionRef.current
    if (s.panX === 0 && s.panY === 0 && s.zoom === 1) {
      view.current = centerOnPoint(view.current, clusterCenter(layout.focusCluster), getViewport(), 1)
    } else {
      view.current = clampPan(view.current, getViewport(), boundsRef.current)
    }
    applyTransform()
    const t = window.setTimeout(() => persistSession(), 520)
    return () => window.clearTimeout(t)
  }, [applyTransform, getViewport, layout.focusCluster, persistSession])

  /** Posição do ponteiro relativa ao viewport, em px de layout (compensa escala CSS de ancestrais). */
  const toLocal = useCallback((clientX: number, clientY: number) => {
    const el = viewportRef.current
    if (!el) return { x: 0, y: 0, k: 1 }
    const rect = el.getBoundingClientRect()
    const k = el.offsetWidth > 0 && rect.width > 0 ? rect.width / el.offsetWidth : 1
    return { x: (clientX - rect.left) / k, y: (clientY - rect.top) / k, k }
  }, [])

  // Wheel precisa de listener não-passivo para impedir scroll da página.
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const p = toLocal(e.clientX, e.clientY)
      const factor = wheelZoomFactor(e.deltaY, e.deltaMode)
      commit(zoomByFactor(view.current, factor, p.x, p.y, BOARD_ZOOM_LIMITS))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [commit, toLocal])

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
    (cluster: LinkBoardCluster) => {
      commit(centerOnPoint(view.current, clusterCenter(cluster), getViewport()), { persist: 'now' })
    },
    [commit, getViewport],
  )

  const fitBoard = useCallback(() => {
    if (!layoutRef.current.nodes.length) return
    const b = boardBounds(layoutRef.current.nodes, 40)
    commit(fitRect(b, getViewport(), { padding: 24, maxZoom: 1.25, minZoom: BOARD_ZOOM_LIMITS.min }), {
      persist: 'now',
    })
  }, [commit, getViewport])

  const recenter = useCallback(() => {
    focusCluster(layout.focusCluster)
  }, [focusCluster, layout.focusCluster])

  const zoomButton = useCallback(
    (factor: number) => {
      const vp = getViewport()
      commit(zoomAtPoint(view.current, view.current.z * factor, vp.width / 2, vp.height / 2), {
        persist: 'now',
      })
    },
    [commit, getViewport],
  )

  const onPointerDown = (e: PE<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest('.lb-node') || target.closest('.lb-toolbar')) return
    const p = toLocal(e.clientX, e.clientY)
    drag.current = { x: p.x, y: p.y, px: view.current.x, py: view.current.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PE<HTMLDivElement>) => {
    if (!drag.current) return
    const p = toLocal(e.clientX, e.clientY)
    commit(
      { x: drag.current.px + (p.x - drag.current.x), y: drag.current.py + (p.y - drag.current.y), z: view.current.z },
      { persist: false },
    )
  }
  const onPointerUp = () => {
    if (drag.current) persistSession()
    drag.current = null
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
          ref={viewportRef}
          className="lb-viewport"
          data-testid="evidence-board-view"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="lb-toolbar">
            <button type="button" className="lb-toolbar__btn" onClick={() => zoomButton(1 / BUTTON_ZOOM_STEP)} aria-label="Reduzir zoom">
              −
            </button>
            <button type="button" className="lb-toolbar__btn" onClick={() => zoomButton(BUTTON_ZOOM_STEP)} aria-label="Aumentar zoom">
              +
            </button>
            <button type="button" className="lb-toolbar__btn" onClick={recenter}>
              Recentralizar
            </button>
            <button type="button" className="lb-toolbar__btn" onClick={fitBoard}>
              Ajustar ao quadro
            </button>
          </div>
          <LinkBoardCanvas
            ref={layerRef}
            layout={layout}
            interactive
            scale="full"
            filter={filter}
            selectedId={sel}
            related={related}
            onPick={pickNode}
          />
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
          <p className="lb-hint">Arraste · roda para zoom no cursor · clique para focar · secundários ao expandir cluster</p>
        )}
      </div>
    </div>
  )
}
