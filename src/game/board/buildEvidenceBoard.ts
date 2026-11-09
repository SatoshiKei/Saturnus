import { seedDocuments } from '../../data/game/seedDocuments'
import { contradictionDefs } from '../../data/game/seedStory'
import { CHARACTER_SPRITE_URLS } from '../../lib/characterSprites'
import { hypothesisStateLabel } from '../../lib/labels'
import { isPersonVisibleInRegistry } from '../personRegistryGates'
import type { Evidence, InvestigationState } from '../types'

export type BoardNodeKind = 'person' | 'source' | 'event' | 'fact' | 'contradiction' | 'hypothesis'

export interface BoardNode {
  id: string
  kind: BoardNodeKind
  title: string
  subtitle?: string
  x: number
  y: number
  portraitSrc?: string
  refTab: string
  refId: string
}

export interface BoardEdge {
  id: string
  from: string
  to: string
  label?: string
}

const COL: Record<BoardNodeKind, number> = {
  person: 36,
  source: 280,
  event: 530,
  fact: 780,
  contradiction: 1030,
  hypothesis: 1280,
}

const ROW = 108

function evidenceKind(e: Evidence): 'source' | 'fact' {
  if (e.originalOrDerived === 'derived' || e.type === 'derived') return 'fact'
  return 'source'
}

export function buildEvidenceBoard(inv: InvestigationState): { nodes: BoardNode[]; edges: BoardEdge[] } {
  const nodes: BoardNode[] = []
  const edges: BoardEdge[] = []
  const index: Record<BoardNodeKind, number> = {
    person: 0,
    source: 0,
    event: 0,
    fact: 0,
    contradiction: 0,
    hypothesis: 0,
  }

  const push = (node: Omit<BoardNode, 'x' | 'y'>) => {
    const i = index[node.kind]
    index[node.kind] += 1
    nodes.push({ ...node, x: COL[node.kind], y: 28 + i * ROW })
  }

  const people = Object.values(inv.people).filter((p) => isPersonVisibleInRegistry(p.id, inv))
  for (const p of people) {
    push({
      id: `person:${p.id}`,
      kind: 'person',
      title: p.name,
      subtitle: p.occupation,
      portraitSrc: CHARACTER_SPRITE_URLS[p.id],
      refTab: 'people',
      refId: p.id,
    })
  }

  const evidence = inv.evidenceOwned
    .map((id) => inv.evidence[id])
    .filter((e): e is Evidence => Boolean(e) && !e.catalogHidden)

  for (const e of evidence) {
    const kind = evidenceKind(e)
    push({
      id: `evidence:${e.id}`,
      kind,
      title: e.title,
      subtitle: kind === 'fact' ? 'Fato' : 'Fonte',
      refTab: 'evidence',
      refId: e.id,
    })
  }

  const docs = inv.documentsOwned
    .map((id) => seedDocuments.find((d) => d.id === id))
    .filter((d) => d && d.playerFacing !== false)
  for (const d of docs) {
    if (!d) continue
    if (evidence.some((e) => e.contentRef === d.id || e.title === d.title)) continue
    push({
      id: `doc:${d.id}`,
      kind: 'source',
      title: d.title,
      subtitle: d.category,
      refTab: 'evidence',
      refId: d.id,
    })
  }

  for (const ev of inv.timeline) {
    push({
      id: `event:${ev.id}`,
      kind: 'event',
      title: ev.label,
      subtitle: ev.start,
      refTab: 'timeline',
      refId: ev.id,
    })
  }

  for (const c of inv.contradictionsConfirmed) {
    const def = contradictionDefs.find((d) => d.id === c.id)
    push({
      id: `contra:${c.id}`,
      kind: 'contradiction',
      title: def?.summary ?? 'Contradição',
      subtitle: 'Contradição',
      refTab: 'contradictions',
      refId: c.id,
    })
  }

  for (const h of Object.values(inv.hypotheses)) {
    push({
      id: `hyp:${h.id}`,
      kind: 'hypothesis',
      title: h.title,
      subtitle: hypothesisStateLabel[h.state],
      refTab: 'hypotheses',
      refId: h.id,
    })
  }

  const has = (id: string) => nodes.some((n) => n.id === id)
  const link = (from: string, to: string, label?: string) => {
    if (!has(from) || !has(to) || from === to) return
    const id = `${from}>${to}`
    if (edges.some((e) => e.id === id)) return
    edges.push({ id, from, to, label })
  }

  for (const p of people) {
    for (const other of p.relatedPersonIds) {
      if (other < p.id) continue
      link(`person:${p.id}`, `person:${other}`)
    }
  }

  for (const e of evidence) {
    const self = `evidence:${e.id}`
    for (const pid of e.relatedPersonIds) link(self, `person:${pid}`)
    if (e.sourceId) link(`evidence:${e.sourceId}`, self)
  }

  for (const ev of inv.timeline) {
    for (const pid of ev.relatedPersonIds) link(`event:${ev.id}`, `person:${pid}`)
    for (const sid of ev.sourceIds) {
      if (has(`evidence:${sid}`)) link(`event:${ev.id}`, `evidence:${sid}`)
    }
  }

  for (const c of inv.contradictionsConfirmed) {
    const def = contradictionDefs.find((d) => d.id === c.id)
    if (!def) continue
    link(`contra:${c.id}`, `evidence:${def.evidenceAId}`)
    link(`contra:${c.id}`, `evidence:${def.evidenceBId}`)
  }

  for (const h of Object.values(inv.hypotheses)) {
    for (const id of h.supportingEvidenceIds) link(`hyp:${h.id}`, `evidence:${id}`, 'apoia')
    for (const id of h.contradictingEvidenceIds) link(`hyp:${h.id}`, `evidence:${id}`, 'contradiz')
  }

  return { nodes, edges }
}
