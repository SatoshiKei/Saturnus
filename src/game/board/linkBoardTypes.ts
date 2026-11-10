import type { StoryCondition } from '../types'

export type LinkBoardCluster = 'mariana' | 'elisa' | 'maralto' | 'henrique' | 'guardrail' | 'augusto'

export type LinkBoardNodeKind = 'person' | 'event' | 'evidence' | 'hypothesis' | 'contradiction'

export type LinkBoardFilter = 'all' | LinkBoardNodeKind

export interface LinkBoardNodeDef {
  id: string
  kind: LinkBoardNodeKind
  title: string
  subtitle?: string
  /** Posição canônica no mundo do quadro (px). */
  x: number
  y: number
  cluster: LinkBoardCluster
  /** Secundários só aparecem com foco no cluster ou no nó pai. */
  tier?: 'primary' | 'secondary'
  /** Cluster ou id de nó que revela secundários do mesmo cluster. */
  revealFocus?: LinkBoardCluster | string
  portraitPersonId?: string
  refTab?: string
  refId?: string
  showWhen: StoryCondition[]
  hideWhen?: StoryCondition[]
  detail?: {
    blurb?: string
    relations?: string[]
    evidenceRefs?: string[]
  }
}

export type LinkBoardEdgeStyle = 'solid' | 'dashed' | 'refuted'

export interface LinkBoardEdgeDef {
  id: string
  from: string
  to: string
  label?: string
  style?: LinkBoardEdgeStyle
  showWhen: StoryCondition[]
  hideWhen?: StoryCondition[]
}

export interface LinkBoardNode {
  id: string
  kind: LinkBoardNodeKind
  title: string
  subtitle?: string
  x: number
  y: number
  cluster: LinkBoardCluster
  tier: 'primary' | 'secondary'
  portraitSrc?: string
  refTab?: string
  refId?: string
  revealFocus?: LinkBoardCluster | string
  detail?: LinkBoardNodeDef['detail']
}

export interface LinkBoardEdge {
  id: string
  from: string
  to: string
  label?: string
  style: LinkBoardEdgeStyle
}

export interface LinkBoardLayout {
  nodes: LinkBoardNode[]
  edges: LinkBoardEdge[]
  /** Cluster sugerido ao abrir (núcleo atualizado). */
  focusCluster: LinkBoardCluster
  /** Nós visíveis pela primeira vez (animação). */
  enteringNodeIds: string[]
}
