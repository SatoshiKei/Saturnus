import { LINK_BOARD_EDGES, LINK_BOARD_NODES } from '../../data/linkBoard/catalog'
import { CHARACTER_SPRITE_URLS } from '../../lib/characterSprites'
import type { InvestigationState } from '../types'
import { evaluateAllConditions, evaluateCondition } from '../story/conditions'
import type { LinkBoardCluster, LinkBoardLayout, LinkBoardNode, LinkBoardEdge } from './linkBoardTypes'

const CLUSTER_CENTERS: Record<LinkBoardCluster, { x: number; y: number }> = {
  mariana: { x: 720, y: 400 },
  elisa: { x: 300, y: 520 },
  maralto: { x: 260, y: 160 },
  henrique: { x: 1260, y: 200 },
  guardrail: { x: 980, y: 680 },
  augusto: { x: 640, y: 700 },
}

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

export function buildLinkBoard(
  inv: InvestigationState,
  opts?: { knownNodeIds?: string[]; expandedClusters?: Set<LinkBoardCluster | string> },
): LinkBoardLayout {
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
    nodes.push({
      id: def.id,
      kind: def.kind,
      title: def.title,
      subtitle: def.subtitle,
      x: def.x,
      y: def.y,
      cluster: def.cluster,
      tier,
      portraitSrc: def.portraitPersonId ? CHARACTER_SPRITE_URLS[def.portraitPersonId] : undefined,
      refTab: def.refTab,
      refId: def.refId,
      revealFocus: def.revealFocus,
      detail: def.detail,
    })
  }

  const nodeIds = new Set(nodes.map((n) => n.id))
  const edges: LinkBoardEdge[] = []
  for (const def of LINK_BOARD_EDGES) {
    if (!visible(def, inv)) continue
    if (!nodeIds.has(def.from) || !nodeIds.has(def.to)) continue
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
    })
  }

  const enteringNodeIds = nodes.filter((n) => !known.has(n.id)).map((n) => n.id)

  return {
    nodes,
    edges,
    focusCluster: resolveFocusCluster(inv),
    enteringNodeIds,
  }
}

export function clusterCenter(cluster: LinkBoardCluster) {
  return CLUSTER_CENTERS[cluster]
}

export function boardBounds(nodes: LinkBoardNode[]) {
  if (!nodes.length) return { minX: 0, minY: 0, maxX: 1400, maxY: 800 }
  const pad = 120
  const minX = Math.min(...nodes.map((n) => n.x)) - pad
  const minY = Math.min(...nodes.map((n) => n.y)) - pad
  const maxX = Math.max(...nodes.map((n) => n.x)) + pad + 200
  const maxY = Math.max(...nodes.map((n) => n.y)) + pad + 80
  return { minX, minY, maxX, maxY }
}
