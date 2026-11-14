import { forwardRef, useMemo } from 'react'
import { BOARD_WORLD } from '../../game/board/boardLayout'
import { nodeSize } from '../../game/board/buildLinkBoard'
import type {
  LinkBoardFilter,
  LinkBoardLayout,
  LinkBoardNode,
  LinkBoardNodeKind,
} from '../../game/board/linkBoardTypes'

export const KIND_LABEL: Record<LinkBoardNodeKind, string> = {
  person: 'Pessoa',
  event: 'Evento',
  evidence: 'Evidência-chave',
  hypothesis: 'Hipótese',
  contradiction: 'Contradição',
}

function edgeGeometry(a: LinkBoardNode, b: LinkBoardNode) {
  const sa = nodeSize(a)
  const sb = nodeSize(b)
  const x1 = a.x + sa.w / 2
  const y1 = a.y + sa.h / 2
  const x2 = b.x + sb.w / 2
  const y2 = b.y + sb.h / 2
  return { x1, y1, x2, y2, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 }
}

/** Inclinação determinística (miniatura): papéis alfinetados não ficam perfeitamente retos. */
function tiltFor(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0
  return ((Math.abs(h) % 9) - 4) * 0.35
}

export interface LinkBoardCanvasProps {
  layout: LinkBoardLayout
  /** `false` = miniatura estática (sem botões, sem foco, sem eventos). */
  interactive: boolean
  scale: 'full' | 'thumbnail'
  filter?: LinkBoardFilter
  selectedId?: string | null
  related?: Set<string>
  onPick?: (node: LinkBoardNode) => void
}

/**
 * Renderização única do quadro (papéis, fotos, linhas, regiões de cluster).
 * Usada pelo quadro completo (`interactive`) e pela miniatura da parede (`thumbnail`).
 */
export const LinkBoardCanvas = forwardRef<HTMLDivElement, LinkBoardCanvasProps>(function LinkBoardCanvas(
  { layout, interactive, scale, filter = 'all', selectedId = null, related, onPick },
  ref,
) {
  const thumb = scale === 'thumbnail'
  const nodeById = useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout.nodes])

  const opacityFor = (n: LinkBoardNode) => {
    if (filter !== 'all' && n.kind !== filter) return 0.22
    if (selectedId && related && !related.has(n.id)) return 0.35
    return 1
  }

  const edgeVisible = (from: string, to: string) => {
    const a = nodeById.get(from)
    const b = nodeById.get(to)
    if (!a || !b) return false
    if (filter !== 'all' && (a.kind !== filter || b.kind !== filter)) return false
    if (selectedId && related && (!related.has(from) || !related.has(to))) return false
    return true
  }

  return (
    <div
      ref={ref}
      className="lb-world"
      data-scale={scale}
      data-interactive={interactive || undefined}
      style={{ width: BOARD_WORLD.width, height: BOARD_WORLD.height }}
      aria-hidden={interactive ? undefined : true}
    >
      {/* Halo por cluster: um blob por cartão dentro de um grupo (opacidade no grupo → sem acúmulo). */}
      <div className="lb-halos" aria-hidden>
        {layout.regions.map((r) => (
          <div key={r.cluster} className="lb-region" data-cluster={r.cluster} data-node-count={r.nodeCount}>
            {layout.nodes
              .filter((n) => n.cluster === r.cluster)
              .map((n) => {
                const s = nodeSize(n)
                return (
                  <span
                    key={n.id}
                    className="lb-region__blob"
                    style={{ left: n.x - 30, top: n.y - 30, width: s.w + 60, height: s.h + 60 }}
                  />
                )
              })}
          </div>
        ))}
      </div>
      <svg className="lb-edges" width={BOARD_WORLD.width} height={BOARD_WORLD.height} aria-hidden>
        {layout.edges.map((e) => {
          if (!edgeVisible(e.from, e.to)) return null
          const a = nodeById.get(e.from)!
          const b = nodeById.get(e.to)!
          const { x1, y1, x2, y2, mx, my } = edgeGeometry(a, b)
          return (
            <g
              key={e.id}
              className={`lb-edge lb-edge--${e.style}${e.crossCluster ? ' lb-edge--cross' : ''}`}
              data-edge={e.id}
            >
              <line x1={x1} y1={y1} x2={x2} y2={y2} />
              {e.label && !thumb ? (
                <text x={mx} y={my - 4} className="lb-edge__label">
                  {e.label}
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
      {layout.nodes.map((n) => {
        const style = {
          left: n.x,
          top: n.y,
          opacity: opacityFor(n),
          ...(thumb ? { ['--lb-tilt' as string]: `${tiltFor(n.id)}deg` } : null),
        }
        const content = (
          <>
            {n.portraitSrc ? <img src={n.portraitSrc} alt="" className="lb-node__face" draggable={false} /> : null}
            <small>{KIND_LABEL[n.kind]}</small>
            <strong>{n.title}</strong>
            {n.subtitle ? <span className="lb-node__sub">{n.subtitle}</span> : null}
          </>
        )
        if (!interactive) {
          return (
            <div key={n.id} className="lb-node lb-node--static" data-kind={n.kind} data-node-id={n.id} style={style}>
              {content}
            </div>
          )
        }
        return (
          <button
            key={n.id}
            type="button"
            className="lb-node"
            data-kind={n.kind}
            data-node-id={n.id}
            data-enter={layout.enteringNodeIds.includes(n.id) || undefined}
            data-active={n.id === selectedId || undefined}
            style={style}
            onClick={() => onPick?.(n)}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
})
