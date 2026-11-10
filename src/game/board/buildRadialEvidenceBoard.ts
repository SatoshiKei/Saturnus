import type { InvestigationState } from '../types'
import { buildEvidenceBoard, type BoardEdge, type BoardNode } from './buildEvidenceBoard'

const CX = 520
const CY = 460

export function buildRadialEvidenceBoard(inv: InvestigationState): {
  nodes: BoardNode[]
  edges: BoardEdge[]
} {
  const base = buildEvidenceBoard(inv)
  const nodes = base.nodes.map((n, i) => {
    const mariana = n.refId === 'mariana' && n.kind === 'person'
    if (mariana) return { ...n, x: CX, y: CY }
    const ring =
      n.kind === 'person' ? 195 : n.kind === 'hypothesis' ? 340 : n.kind === 'contradiction' ? 300 : 265
    const angle = (i / Math.max(1, base.nodes.length)) * Math.PI * 2 - Math.PI / 2
    return {
      ...n,
      x: CX + Math.cos(angle) * ring,
      y: CY + Math.sin(angle) * ring,
    }
  })

  const edges = base.edges.slice(0, 48)
  if (inv.flags.block02_started) {
    const elisa = nodes.find((n) => n.refId === 'elisa')
    const mariana = nodes.find((n) => n.refId === 'mariana')
    if (elisa && mariana) {
      edges.push({
        id: 'radial-mariana-elisa',
        from: mariana.id,
        to: elisa.id,
        label: 'reconstruía',
      })
    }
  }

  return { nodes, edges }
}
