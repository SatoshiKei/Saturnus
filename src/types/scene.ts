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
  /** Opens investigation hub tool from desk */
  hubTarget?:
    | 'computer'
    | 'case-files'
    | 'casebook'
    | 'map'
    | 'audio-lab'
    | 'mariana-phone'
    | 'augusto-phone'
  ariaLabel: string
  opacity?: number
  /** How the asset fills its hit box (background uses cover). */
  objectFit?: 'contain' | 'cover'
  objectPosition?: string
  /** Photo props get a light desk shadow. */
  visual?: 'default' | 'desk-prop'
}

export const DESIGN_WIDTH = 1920
export const DESIGN_HEIGHT = 1080
