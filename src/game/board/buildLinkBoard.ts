import { LINK_BOARD_EDGES, LINK_BOARD_NODES } from '../../data/linkBoard/catalog'
import { CHARACTER_SPRITE_URLS } from '../../lib/characterSprites'
import type { InvestigationState } from '../types'
import { evaluateAllConditions, evaluateCondition } from '../story/conditions'
import {
  BOARD_WORLD,
  CARD_H,
  CARD_H_PORTRAIT,
  CARD_W,
  CARD_W_NARROW,
  clusterAnchor,
  resolveNodePosition,
} from './boardLayout'
import type {
  LinkBoardCluster,
  LinkBoardEdge,
  LinkBoardLayout,
  LinkBoardNode,
  LinkBoardRegion,
} from './linkBoardTypes'

/** Prioridade: último núcleo “tocado” pela história (spec §25). */
const FOCUS_FLAG_PRIORITY: { flag: string; cluster: LinkBoardCluster }[] = [
  { flag: 'block09_started', cluster: 'mariana' },
  { flag: 'block08_rui_interview_done', cluster: 'guardrail' },
  { flag: 'block08_morsa_reflection_done', cluster: 'maralto' },
  { flag: 'block07_henrique_identified', cluster: 'henrique' },
  { flag: 'block06_miro_interview_done', cluster: 'guardrail' },
  { flag: 'block05_jana_interview_done', cluster: 'elisa' },
  { flag: 'block04_andre_chronology_done', cluster: 'mariana' },
  { flag: 'block03_nico_interview_done', cluster: 'elisa' },
  { flag: 'block02_started', cluster: 'elisa' },
  { flag: 'block01_hospital_done', cluster: 'mariana' },
]

const REGION_PAD = 36

function visible(
  conds: { showWhen: import('../types').StoryCondition[]; hideWhen?: import('../types').StoryCondition[] },
  inv: InvestigationState,
): boolean {
  if (conds.hideWhen?.some((c) => evaluateCondition(inv, c))) return false
  return evaluateAllConditions(inv, conds.showWhen)
}

export function resolveFocusCluster(inv: InvestigationState): LinkBoardCluster {
  for (const row of FOCUS_FLAG_PRIORITY) {
    if (inv.flags[row.flag]) return row.cluster
  }
  return 'mariana'
}

/** Largura/altura aproximadas do cartão (para bounds e colisão). */
export function nodeSize(n: Pick<LinkBoardNode, 'kind' | 'portraitSrc'>) {
  return {
    w: n.kind === 'contradiction' ? CARD_W_NARROW : CARD_W,
    h: n.portraitSrc ? CARD_H_PORTRAIT : CARD_H,
  }
}

export interface BuildLinkBoardOptions {
  knownNodeIds?: string[]
  expandedClusters?: Set<LinkBoardCluster | string>
}

/**
 * Fonte única do quadro: a mesma função alimenta o quadro completo e a miniatura da parede.
 * Progressão = showWhen/hideWhen do catálogo contra `inv`.
 */
export function buildLinkBoard(inv: InvestigationState, opts?: BuildLinkBoardOptions): LinkBoardLayout {
  const expanded = opts?.expandedClusters ?? new Set<LinkBoardCluster | string>()
  const known = new Set(opts?.knownNodeIds ?? [])

  const nodes: LinkBoardNode[] = []
  for (const def of LINK_BOARD_NODES) {
    if (!visible(def, inv)) continue
    const tier = def.tier ?? 'primary'
    if (tier === 'secondary') {
      const focusOk =
        expanded.has(def.cluster) ||
        (def.revealFocus && expanded.has(def.revealFocus))
      if (!focusOk) continue
    }
    const portraitSrc = def.portraitPersonId ? CHARACTER_SPRITE_URLS[def.portraitPersonId] : undefined
    const pos = resolveNodePosition(def.id, def.cluster, nodeSize({ kind: def.kind, portraitSrc }))
    nodes.push({
      id: def.id,
      kind: def.kind,
      title: def.title,
      subtitle: def.subtitle,
      x: pos.x,
      y: pos.y,
      cluster: def.cluster,
      tier,
      portraitSrc,
      refTab: def.refTab,
      refId: def.refId,
      revealFocus: def.revealFocus,
      detail: def.detail,
    })
  }

  const byId = new Map(nodes.map((n) => [n.id, n]))
  const edges: LinkBoardEdge[] = []
  for (const def of LINK_BOARD_EDGES) {
    if (!visible(def, inv)) continue
    const a = byId.get(def.from)
    const b = byId.get(def.to)
    if (!a || !b) continue
    let style = def.style ?? 'solid'
    if (def.id === 'e-hyp-homicide' && inv.flags.block08_complete) {
      style = 'refuted'
    }
    edges.push({
      id: def.id,
      from: def.from,
      to: def.to,
      label: def.label,
      style,
      crossCluster: a.cluster !== b.cluster,
    })
  }

  const enteringNodeIds = nodes.filter((n) => !known.has(n.id)).map((n) => n.id)

  return {
    nodes,
    edges,
    regions: buildRegions(nodes),
    focusCluster: resolveFocusCluster(inv),
    enteringNodeIds,
  }
}

function buildRegions(nodes: LinkBoardNode[]): LinkBoardRegion[] {
  const map = new Map<LinkBoardCluster, LinkBoardRegion>()
  for (const n of nodes) {
    const { w, h } = nodeSize(n)
    const r = map.get(n.cluster)
    if (!r) {
      map.set(n.cluster, {
        cluster: n.cluster,
        minX: n.x - REGION_PAD,
        minY: n.y - REGION_PAD,
        maxX: n.x + w + REGION_PAD,
        maxY: n.y + h + REGION_PAD,
        nodeCount: 1,
      })
    } else {
      r.minX = Math.min(r.minX, n.x - REGION_PAD)
      r.minY = Math.min(r.minY, n.y - REGION_PAD)
      r.maxX = Math.max(r.maxX, n.x + w + REGION_PAD)
      r.maxY = Math.max(r.maxY, n.y + h + REGION_PAD)
      r.nodeCount += 1
    }
  }
  return [...map.values()]
}

/** Centro (mundo) da âncora do cluster. */
export function clusterCenter(cluster: LinkBoardCluster) {
  return clusterAnchor(cluster)
}

/** Bounds do conteúdo visível (com padding); sem nós = mundo inteiro. */
export function boardBounds(nodes: LinkBoardNode[], pad = 60) {
  if (!nodes.length) return { minX: 0, minY: 0, maxX: BOARD_WORLD.width, maxY: BOARD_WORLD.height }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const n of nodes) {
    const { w, h } = nodeSize(n)
    minX = Math.min(minX, n.x)
    minY = Math.min(minY, n.y)
    maxX = Math.max(maxX, n.x + w)
    maxY = Math.max(maxY, n.y + h)
  }
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad }
}
