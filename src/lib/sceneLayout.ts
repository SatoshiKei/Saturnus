import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../types/scene'

export interface SceneScale {
  scale: number
  offsetX: number
  offsetY: number
  width: number
  height: number
}

/** Letterbox scale to fit design resolution inside viewport. */
export function computeSceneScale(
  viewportWidth: number,
  viewportHeight: number,
): SceneScale {
  const scale = Math.min(viewportWidth / DESIGN_WIDTH, viewportHeight / DESIGN_HEIGHT)
  const width = DESIGN_WIDTH * scale
  const height = DESIGN_HEIGHT * scale
  const offsetX = (viewportWidth - width) / 2
  const offsetY = (viewportHeight - height) / 2
  return { scale, offsetX, offsetY, width, height }
}
