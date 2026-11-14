import { cleanup, render, screen, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LINK_BOARD_EDGES, LINK_BOARD_NODES } from '../../src/data/linkBoard/catalog'
import {
  BOARD_WORLD,
  CARD_H,
  CARD_H_PORTRAIT,
  CARD_W,
  CARD_W_NARROW,
  CLUSTER_IDS,
  CLUSTER_NORMALIZED,
  NODE_SLOTS,
  clusterAnchor,
  resolveNodePosition,
} from '../../src/game/board/boardLayout'
import { boardBounds, buildLinkBoard, nodeSize } from '../../src/game/board/buildLinkBoard'
import { CHARACTER_SPRITE_URLS } from '../../src/lib/characterSprites'
import type { LinkBoardCluster } from '../../src/game/board/linkBoardTypes'
import { createInitialState } from '../../src/game/state/initialState'
import { buildStateFromActions } from '../../src/game/state/gameSave'
import { getCumulativeActions } from '../../src/game/story/devCheckpointCatalog'
import { dispatchActions, loadDevCheckpoint, resetGame } from '../../src/game/state/investigationStore'
import type { InvestigationState, StoryCondition } from '../../src/game/types'
import { LinkBoard } from '../../src/components/investigation/LinkBoard'
import { LinkBoardThumbnail } from '../../src/components/investigation/LinkBoardThumbnail'

/** Estado “tudo desbloqueado”: aplica todas as condições positivas do catálogo (só para medir layout). */
function lateState(): InvestigationState {
  const inv = createInitialState()
  const conds: StoryCondition[] = [
    ...LINK_BOARD_NODES.flatMap((n) => n.showWhen),
    ...LINK_BOARD_EDGES.flatMap((e) => e.showWhen),
  ]
  for (const c of conds) {
    if (c.type === 'flag') inv.flags[c.id] = c.value ?? true
    if (c.type === 'evidenceOwned' && !inv.evidenceOwned.includes(c.id)) inv.evidenceOwned.push(c.id)
    if (c.type === 'contradictionConfirmed') {
      inv.contradictionsConfirmed.push({ id: c.id } as InvestigationState['contradictionsConfirmed'][number])
    }
  }
  return inv
}

const ALL_CLUSTERS = new Set<LinkBoardCluster>(CLUSTER_IDS)

/** Pares mutuamente exclusivos (hideWhen) que dividem o mesmo slot de propósito. */
const SHARED_SLOT_PAIRS = new Set([
  'lb-morsa-unknown|lb-morsa-revealed',
  'lb-ricardo|lb-henrique',
  'lb-hyp-homicide|lb-hyp-unjust',
])

function rect(id: string) {
  const def = LINK_BOARD_NODES.find((n) => n.id === id)!
  const w = def.kind === 'contradiction' ? CARD_W_NARROW : CARD_W
  const h = def.portraitPersonId && CHARACTER_SPRITE_URLS[def.portraitPersonId] ? CARD_H_PORTRAIT : CARD_H
  const p = resolveNodePosition(id, def.cluster, { w, h })
  return { x1: p.x, y1: p.y, x2: p.x + w, y2: p.y + h }
}

function overlap(a: ReturnType<typeof rect>, b: ReturnType<typeof rect>, gap = 12) {
  return a.x1 < b.x2 + gap && b.x1 < a.x2 + gap && a.y1 < b.y2 + gap && b.y1 < a.y2 + gap
}

describe('quadro — clusters e layout', () => {
  it('âncoras seguem as posições normalizadas pedidas', () => {
    expect(CLUSTER_NORMALIZED).toEqual({
      maralto: { x: 0.2, y: 0.27 },
      mariana: { x: 0.5, y: 0.25 },
      henrique: { x: 0.8, y: 0.27 },
      elisa: { x: 0.22, y: 0.68 },
      guardrail: { x: 0.79, y: 0.7 },
      augusto: { x: 0.53, y: 0.75 },
    })
    const a = clusterAnchor('mariana')
    expect(a.x).toBeCloseTo(BOARD_WORLD.width * 0.5)
    expect(a.y).toBeCloseTo(BOARD_WORLD.height * 0.25)
  })

  it('todo nó do catálogo tem slot, cluster válido e cai dentro do mundo', () => {
    for (const n of LINK_BOARD_NODES) {
      expect(NODE_SLOTS[n.id], `slot de ${n.id}`).toBeDefined()
      expect(ALL_CLUSTERS.has(n.cluster)).toBe(true)
      const r = rect(n.id)
      expect(r.x1, n.id).toBeGreaterThanOrEqual(0)
      expect(r.y1, n.id).toBeGreaterThanOrEqual(0)
      expect(r.x2, n.id).toBeLessThanOrEqual(BOARD_WORLD.width)
      expect(r.y2, n.id).toBeLessThanOrEqual(BOARD_WORLD.height)
    }
    for (const id of Object.keys(NODE_SLOTS)) {
      expect(LINK_BOARD_NODES.some((n) => n.id === id), `slot órfão ${id}`).toBe(true)
    }
  })

  it('nenhum par de cartões se sobrepõe (exceto exclusivos que trocam de lugar)', () => {
    const ids = LINK_BOARD_NODES.map((n) => n.id)
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const key = `${ids[i]}|${ids[j]}`
        const rev = `${ids[j]}|${ids[i]}`
        if (SHARED_SLOT_PAIRS.has(key) || SHARED_SLOT_PAIRS.has(rev)) continue
        expect(overlap(rect(ids[i]), rect(ids[j])), `${ids[i]} × ${ids[j]}`).toBe(false)
      }
    }
  })

  it('pares exclusivos nunca ficam visíveis juntos', () => {
    const { nodes } = buildLinkBoard(lateState(), { expandedClusters: ALL_CLUSTERS })
    const ids = new Set(nodes.map((n) => n.id))
    for (const pair of SHARED_SLOT_PAIRS) {
      const [a, b] = pair.split('|')
      expect(ids.has(a) && ids.has(b), pair).toBe(false)
    }
  })

  it('clusters ocupam regiões distintas: todos os 6 existem e cada nó está mais perto da própria âncora', () => {
    const { regions, nodes } = buildLinkBoard(lateState(), { expandedClusters: ALL_CLUSTERS })
    expect(regions.map((r) => r.cluster).sort()).toEqual([...CLUSTER_IDS].sort())
    for (const n of nodes) {
      const s = nodeSize(n)
      const cx = n.x + s.w / 2
      const cy = n.y + s.h / 2
      const own = Math.hypot(cx - clusterAnchor(n.cluster).x, cy - clusterAnchor(n.cluster).y)
      for (const k of CLUSTER_IDS) {
        if (k === n.cluster) continue
        const other = Math.hypot(cx - clusterAnchor(k).x, cy - clusterAnchor(k).y)
        expect(own, `${n.id} (${n.cluster}) vs ${k}`).toBeLessThan(other)
      }
    }
  })

  it('âncoras de cluster ficam bem separadas (nenhum colapso)', () => {
    for (let i = 0; i < CLUSTER_IDS.length; i += 1) {
      for (let j = i + 1; j < CLUSTER_IDS.length; j += 1) {
        const a = clusterAnchor(CLUSTER_IDS[i])
        const b = clusterAnchor(CLUSTER_IDS[j])
        expect(Math.hypot(a.x - b.x, a.y - b.y), `${CLUSTER_IDS[i]}–${CLUSTER_IDS[j]}`).toBeGreaterThan(450)
      }
    }
  })

  it('centro de cada região fica perto da âncora normalizada do cluster', () => {
    const { regions } = buildLinkBoard(lateState(), { expandedClusters: ALL_CLUSTERS })
    for (const r of regions) {
      const a = clusterAnchor(r.cluster)
      const cx = (r.minX + r.maxX) / 2
      const cy = (r.minY + r.maxY) / 2
      expect(Math.abs(cx - a.x), `${r.cluster} x`).toBeLessThan(260)
      expect(Math.abs(cy - a.y), `${r.cluster} y`).toBeLessThan(260)
    }
  })

  it('layout geral segue o mapa: Maralto/Elisa à esquerda, Henrique/Guarda-corpo à direita, Mariana no topo', () => {
    const c = (k: LinkBoardCluster) => clusterAnchor(k)
    expect(c('maralto').x).toBeLessThan(c('mariana').x)
    expect(c('mariana').x).toBeLessThan(c('henrique').x)
    expect(c('elisa').y).toBeGreaterThan(c('maralto').y)
    expect(c('guardrail').y).toBeGreaterThan(c('henrique').y)
    expect(c('mariana').y).toBeLessThan(c('augusto').y)
  })

  it('membros dos clusters correspondem ao pedido', () => {
    const cluster = (id: string) => LINK_BOARD_NODES.find((n) => n.id === id)?.cluster
    expect(cluster('lb-protests')).toBe('maralto')
    expect(cluster('lb-samuel')).toBe('maralto')
    expect(cluster('lb-morsa-unknown')).toBe('maralto')
    expect(cluster('lb-mariana')).toBe('mariana')
    expect(cluster('lb-hidden-diary')).toBe('mariana')
    expect(cluster('lb-cell')).toBe('mariana')
    expect(cluster('lb-elisa')).toBe('elisa')
    expect(cluster('lb-andre')).toBe('elisa')
    expect(cluster('lb-jana')).toBe('elisa')
    expect(cluster('lb-vertice')).toBe('elisa')
    expect(cluster('lb-henrique')).toBe('henrique')
    expect(cluster('lb-omitido')).toBe('henrique')
    expect(cluster('lb-miro')).toBe('guardrail')
    expect(cluster('lb-rui')).toBe('guardrail')
    expect(cluster('lb-augusto')).toBe('augusto')
  })
})

describe('quadro — cross-links', () => {
  it('cada nó tem poucas ligações entre clusters (sem teia)', () => {
    const { nodes, edges } = buildLinkBoard(lateState(), { expandedClusters: ALL_CLUSTERS })
    const cross = new Map<string, number>()
    for (const e of edges) {
      if (!e.crossCluster) continue
      cross.set(e.from, (cross.get(e.from) ?? 0) + 1)
      cross.set(e.to, (cross.get(e.to) ?? 0) + 1)
    }
    for (const n of nodes) {
      // Mariana é o hub do caso: 5 pessoas/eventos + a hipótese final (Augusto) = 6; o resto fica em ≤5.
      expect(cross.get(n.id) ?? 0, n.id).toBeLessThanOrEqual(n.id === 'lb-mariana' ? 6 : 5)
    }
    const crossEdges = edges.filter((e) => e.crossCluster).length
    expect(crossEdges).toBeGreaterThanOrEqual(6)
    expect(crossEdges).toBeLessThanOrEqual(Math.ceil(edges.length * 0.5))
    // toda aresta renderizada vem do catálogo (nada inventado)
    const catalog = new Set(LINK_BOARD_EDGES.map((e) => e.id))
    for (const e of edges) expect(catalog.has(e.id)).toBe(true)
  })

  /**
   * Num quadro físico o barbante passa por trás de um papel de vez em quando; o orçamento abaixo
   * documenta as passagens restantes (hub Mariana com vizinhos W/E/SE) e impede regressão.
   */
  const MAX_STRING_PASS_BEHIND = 4

  it('poucas arestas passam por trás de cartões de terceiros (orçamento)', () => {
    const { nodes, edges } = buildLinkBoard(lateState(), { expandedClusters: ALL_CLUSTERS })
    const byId = new Map(nodes.map((n) => [n.id, n]))
    const hits: string[] = []
    for (const e of edges) {
      const a = byId.get(e.from)!
      const b = byId.get(e.to)!
      const sa = nodeSize(a)
      const sb = nodeSize(b)
      const p1 = { x: a.x + sa.w / 2, y: a.y + sa.h / 2 }
      const p2 = { x: b.x + sb.w / 2, y: b.y + sb.h / 2 }
      for (const n of nodes) {
        if (n.id === a.id || n.id === b.id) continue
        const s = nodeSize(n)
        if (segmentHitsRect(p1, p2, { x1: n.x, y1: n.y, x2: n.x + s.w, y2: n.y + s.h })) hits.push(`${e.id}→${n.id}`)
      }
    }
    expect(hits.length, hits.join(' ')).toBeLessThanOrEqual(MAX_STRING_PASS_BEHIND)
    // Arestas dentro do mesmo cluster nunca cruzam cartões de outros clusters.
    const byCluster = new Map(nodes.map((n) => [n.id, n.cluster]))
    for (const h of hits) {
      const [edgeId, nodeId] = h.split('→')
      const edge = edges.find((e) => e.id === edgeId)!
      if (!edge.crossCluster) {
        expect(byCluster.get(nodeId), h).toBe(byCluster.get(edge.from))
      }
    }
  })
})

function segmentHitsRect(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  r: { x1: number; y1: number; x2: number; y2: number },
) {
  // Liang–Barsky
  let t0 = 0
  let t1 = 1
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const clip = (p: number, q: number) => {
    if (p === 0) return q >= 0
    const t = q / p
    if (p < 0) {
      if (t > t1) return false
      if (t > t0) t0 = t
    } else {
      if (t < t0) return false
      if (t < t1) t1 = t
    }
    return true
  }
  return (
    clip(-dx, p1.x - r.x1) && clip(dx, r.x2 - p1.x) && clip(-dy, p1.y - r.y1) && clip(dy, r.y2 - p1.y) && t0 <= t1
  )
}

describe('quadro — progressão', () => {
  const FUTURE = [
    'lb-elisa',
    'lb-andre',
    'lb-miro',
    'lb-guardrail',
    'lb-rui',
    'lb-henrique',
    'lb-ricardo',
    'lb-omitido',
    'lb-hyp-path',
    'lb-hyp-unjust',
    'lb-nico',
    'lb-jana',
  ]

  it('estado inicial não mostra nós futuros (só B1)', () => {
    const { nodes } = buildLinkBoard(createInitialState(), { expandedClusters: ALL_CLUSTERS })
    const ids = new Set(nodes.map((n) => n.id))
    for (const f of FUTURE) expect(ids.has(f), f).toBe(false)
    expect(ids.has('lb-mariana')).toBe(true)
    expect(nodes.every((n) => ['mariana', 'augusto'].includes(n.cluster))).toBe(true)
  })

  it('checkpoint inicial da campanha (DEV) não vaza nós futuros', () => {
    const inv = buildStateFromActions(getCumulativeActions('b01-start'))
    const { nodes } = buildLinkBoard(inv, { expandedClusters: ALL_CLUSTERS })
    const ids = new Set(nodes.map((n) => n.id))
    for (const f of FUTURE) expect(ids.has(f), f).toBe(false)
  })

  it('checkpoint tardio mostra mais nós que o inicial, em vários clusters', () => {
    const early = buildLinkBoard(buildStateFromActions(getCumulativeActions('b01-start'))).nodes
    const late = buildLinkBoard(buildStateFromActions(getCumulativeActions('b09-start'))).nodes
    expect(late.length).toBeGreaterThan(early.length)
    expect(new Set(late.map((n) => n.cluster)).size).toBeGreaterThanOrEqual(5)
  })

  it('dados do quadro só aparecem pela mesma regra (showWhen/hideWhen) — sem cartões novos', () => {
    const ids = new Set(LINK_BOARD_NODES.map((n) => n.id))
    const { nodes } = buildLinkBoard(lateState(), { expandedClusters: ALL_CLUSTERS })
    for (const n of nodes) expect(ids.has(n.id)).toBe(true)
  })

  it('bounds cobrem todos os cartões visíveis', () => {
    const { nodes } = buildLinkBoard(lateState(), { expandedClusters: ALL_CLUSTERS })
    const b = boardBounds(nodes, 0)
    for (const n of nodes) {
      const s = nodeSize(n)
      expect(n.x).toBeGreaterThanOrEqual(b.minX)
      expect(n.y).toBeGreaterThanOrEqual(b.minY)
      expect(n.x + s.w).toBeLessThanOrEqual(b.maxX)
      expect(n.y + s.h).toBeLessThanOrEqual(b.maxY)
    }
  })
})

describe('miniatura da parede', () => {
  beforeEach(() => resetGame())
  afterEach(() => {
    cleanup()
    resetGame()
  })

  const nodeIds = (root: ParentNode) =>
    Array.from(root.querySelectorAll('[data-node-id]'))
      .map((el) => el.getAttribute('data-node-id'))
      .sort()

  it('LinkBoard interactive=false renderiza a miniatura estática (sem botões/abas)', () => {
    render(<LinkBoard interactive={false} scale="thumbnail" />)
    const thumb = screen.getByTestId('link-board-thumbnail')
    expect(thumb.querySelectorAll('button')).toHaveLength(0)
    expect(screen.queryByTestId('link-board')).toBeNull()
    expect(thumb.querySelector('.lb-world')?.getAttribute('data-scale')).toBe('thumbnail')
    expect(thumb.querySelector('.lb-node--static')).not.toBeNull()
  })

  it('miniatura e quadro completo mostram exatamente os mesmos nós/linhas', () => {
    const { container: full, unmount } = render(<LinkBoard onOpen={() => {}} />)
    const fullIds = nodeIds(full)
    const fullEdges = full.querySelectorAll('[data-edge]').length
    unmount()
    const { container: thumb } = render(<LinkBoard interactive={false} />)
    expect(nodeIds(thumb)).toEqual(fullIds)
    expect(thumb.querySelectorAll('[data-edge]').length).toBe(fullEdges)
    expect(fullIds).toContain('lb-mariana')
  })

  it('quando o quadro atualiza, a miniatura atualiza (mesmo store)', () => {
    const { container } = render(<LinkBoardThumbnail />)
    const before = nodeIds(container)
    expect(before).not.toContain('lb-elisa')
    act(() => {
      dispatchActions([{ type: 'setFlag', id: 'block02_started', value: true }])
    })
    const after = nodeIds(container)
    expect(after).toContain('lb-elisa')
    expect(after).toContain('lb-andre')
    expect(after.length).toBeGreaterThan(before.length)
  })

  it('voltar para checkpoint DEV anterior remove nós futuros da miniatura', () => {
    const { container } = render(<LinkBoardThumbnail />)
    act(() => loadDevCheckpoint(getCumulativeActions('b09-start')))
    const late = nodeIds(container)
    expect(late.length).toBeGreaterThan(8)
    expect(late).toContain('lb-hyp-path')
    act(() => loadDevCheckpoint(getCumulativeActions('b01-start')))
    const early = nodeIds(container)
    expect(early).not.toContain('lb-hyp-path')
    expect(early).not.toContain('lb-elisa')
    expect(early.length).toBeLessThan(late.length)
  })

  it('miniatura mostra a mesma progressão que o quadro completo após checkpoint', () => {
    act(() => loadDevCheckpoint(getCumulativeActions('b09-start')))
    const { container: full, unmount } = render(<LinkBoard onOpen={() => {}} />)
    const fullIds = nodeIds(full)
    unmount()
    const { container: thumb } = render(<LinkBoard interactive={false} scale="thumbnail" />)
    expect(nodeIds(thumb)).toEqual(fullIds)
  })
})
