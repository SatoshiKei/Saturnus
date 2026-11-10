export type SceneObjectKind = 'image' | 'phone'

/** Retângulo normalizado (0–1) relativo ao próprio objeto. */
export type HitRect = readonly [x: number, y: number, w: number, h: number]

export type SceneHubTarget =
  | 'computer'
  | 'case-files'
  | 'casebook'
  | 'map'
  | 'audio-lab'
  | 'landline'
  | 'wall-board'
  | 'mariana-phone'
  | 'augusto-phone'

export interface SceneObjectDef {
  id: string
  kind: SceneObjectKind
  /** Path under public/ — PNG/WebP com transparência real */
  asset?: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  rotation?: number
  interactive?: boolean
  cursor?: 'default' | 'pointer' | 'grab'
  action?: string
  /** Opens investigation tool / device from the desk */
  hubTarget?: SceneHubTarget
  ariaLabel: string
  /** Legenda curta exibida no hover (e na dica inicial) */
  label?: string
  opacity?: number
  /** How the asset fills its box (background uses cover). */
  objectFit?: 'contain' | 'cover'
  objectPosition?: string
  /** Área clicável (fração do objeto) — evita hitbox gigante sobre transparência */
  hit?: HitRect
  /** Qual aparelho um objeto `phone` representa */
  phoneDevice?: 'mariana' | 'augusto'
  /** Aproximação de câmera ao abrir o painel (1 = sem zoom) */
  focusZoom?: number
  /** Ponto de foco da câmera (fração do objeto); padrão = centro */
  focusAnchor?: readonly [x: number, y: number]
}

export const DESIGN_WIDTH = 1920
export const DESIGN_HEIGHT = 1080
