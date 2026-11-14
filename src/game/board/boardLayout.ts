import type { LinkBoardCluster } from './linkBoardTypes'

/**
 * Layout do quadro: apenas posições. Gates narrativos continuam no catálogo (showWhen/hideWhen).
 * Cada cluster tem uma âncora normalizada (0–1) sobre o mundo; cada nó tem um slot
 * (offset do CENTRO do cartão em relação à âncora).
 */
export const BOARD_WORLD = { width: 2000, height: 1200 } as const

/** Tamanho aproximado dos cartões (para colisão / bounds). */
export const CARD_W = 192
export const CARD_W_NARROW = 168
export const CARD_H = 76
export const CARD_H_PORTRAIT = 112

export const CLUSTER_NORMALIZED: Record<LinkBoardCluster, { x: number; y: number }> = {
  maralto: { x: 0.2, y: 0.27 },
  mariana: { x: 0.5, y: 0.25 },
  henrique: { x: 0.8, y: 0.27 },
  elisa: { x: 0.22, y: 0.68 },
  guardrail: { x: 0.79, y: 0.7 },
  augusto: { x: 0.53, y: 0.75 },
}

export const CLUSTER_IDS = Object.keys(CLUSTER_NORMALIZED) as LinkBoardCluster[]

export function clusterAnchor(cluster: LinkBoardCluster): { x: number; y: number } {
  const n = CLUSTER_NORMALIZED[cluster]
  return { x: n.x * BOARD_WORLD.width, y: n.y * BOARD_WORLD.height }
}

const COL = 215
const ROW = 125

/**
 * Offset do CENTRO do cartão (dx, dy) em relação à âncora do cluster.
 *
 * Regras de composição (para as linhas não cortarem cartões de terceiros):
 *  - o corredor de saída de cada hub (para outros clusters) fica livre;
 *  - pares mutuamente exclusivos (hideWhen) trocam de lugar no MESMO slot;
 *  - hipótese final de Mariana fica no cluster Augusto (conexões finais).
 */
export const NODE_SLOTS: Record<string, readonly [dx: number, dy: number]> = {
  // —— Mariana: hub em (0,85); fileira norte + vizinhos laterais; sul/sudoeste livres para ligações ——
  'lb-mariana': [0, 85],
  'lb-apartment': [-COL, -30],
  'lb-vanished': [0, -30],
  'lb-unknown-caller': [COL, -30],
  'lb-julia': [-COL, 85],
  'lb-hidden-diary': [COL, 85],
  'lb-cell': [COL, 175],
  'lb-call-0803': [COL, 270],

  // —— Maralto ——
  'lb-protests': [-108, -62],
  'lb-morsa-unknown': [-108, 62],
  'lb-morsa-revealed': [-108, 62],
  'lb-samuel': [108, 62],

  // —— Elisa: Elisa em (0,-62); leste/nordeste livres para Mariana, guarda-corpo e Miro ——
  'lb-hyp-homicide': [-COL, -187],
  'lb-hyp-unjust': [-COL, -187],
  'lb-andre': [0, -187],
  'lb-jana': [-COL, -62],
  'lb-elisa': [0, -62],
  'lb-jacket': [-COL, 62],
  'lb-vertice': [0, 62],
  'lb-nico': [COL, 62],
  'lb-geraldo': [-COL, 187],
  'lb-contra-vertice': [0, 187],
  'lb-elisa-alcohol': [COL, 187],
  'lb-sandra': [-COL, 312],

  // —— Henrique / Omitido ——
  'lb-ricardo': [-108, 62],
  'lb-henrique': [-108, 62],
  'lb-omitido': [108, 62],
  'lb-henrique-sessions': [-108, -62],
  'lb-hospital': [108, -62],

  // —— Guarda-corpo / acidente ——
  'lb-miro': [-108, -ROW],
  'lb-fall': [108, -ROW],
  'lb-guardrail': [-108, 0],
  'lb-bia': [108, 0],
  'lb-rui': [-108, ROW],
  'lb-vehicle': [108, ROW],

  // —— Augusto ——
  'lb-augusto': [0, 0],
  'lb-hyp-path': [185, 125],
}

/** Canto superior esquerdo do cartão no mundo (slot = centro do cartão). */
export function resolveNodePosition(
  id: string,
  cluster: LinkBoardCluster,
  size: { w: number; h: number } = { w: CARD_W, h: CARD_H },
): { x: number; y: number } {
  const a = clusterAnchor(cluster)
  const [dx, dy] = NODE_SLOTS[id] ?? [0, 0]
  return { x: Math.round(a.x + dx - size.w / 2), y: Math.round(a.y + dy - size.h / 2) }
}
