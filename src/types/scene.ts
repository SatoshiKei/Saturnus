export type SceneObjectKind = 'image' | 'phone'

export interface SceneObjectDef {
  id: string
  kind: SceneObjectKind
  /** Path under public/ */
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
  ariaLabel: string
  opacity?: number
}

export const DESIGN_WIDTH = 1920
export const DESIGN_HEIGHT = 1080
