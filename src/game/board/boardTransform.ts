/**
 * Matemática pura do quadro de ligações (pan + zoom).
 *
 * Modelo: `screen = pan + board * z` (origem do viewport no canto superior esquerdo).
 * Tudo aqui é livre de DOM para ser testável.
 */

export interface BoardTransform {
  /** Deslocamento em px de tela. */
  x: number
  y: number
  /** Escala (zoom). */
  z: number
}

export interface BoardPoint {
  x: number
  y: number
}

export interface BoardViewport {
  width: number
  height: number
}

export interface BoardRect {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface ZoomLimits {
  min: number
  max: number
}

export const BOARD_ZOOM_LIMITS: ZoomLimits = { min: 0.3, max: 1.8 }
/** Fração mínima de pixels do conteúdo que deve permanecer visível ao arrastar. */
export const BOARD_PAN_MARGIN = 80
/** Sensibilidade da roda: `z *= exp(-deltaY * k)`. */
export const WHEEL_ZOOM_SENSITIVITY = 0.0015
export const FALLBACK_VIEWPORT: BoardViewport = { width: 720, height: 480 }

export function clampZoom(z: number, limits: ZoomLimits = BOARD_ZOOM_LIMITS): number {
  if (!Number.isFinite(z)) return limits.min
  return Math.min(limits.max, Math.max(limits.min, z))
}

/** Coordenada de tela (relativa ao viewport) → coordenada do quadro. */
export function screenToBoard(t: BoardTransform, sx: number, sy: number): BoardPoint {
  return { x: (sx - t.x) / t.z, y: (sy - t.y) / t.z }
}

/** Coordenada do quadro → coordenada de tela (relativa ao viewport). */
export function boardToScreen(t: BoardTransform, bx: number, by: number): BoardPoint {
  return { x: t.x + bx * t.z, y: t.y + by * t.z }
}

/** Converte `WheelEvent.deltaY` em fator multiplicativo suave (independente de deltaMode). */
export function wheelZoomFactor(deltaY: number, deltaMode = 0): number {
  const px = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 400 : deltaY
  const capped = Math.max(-240, Math.min(240, px))
  return Math.exp(-capped * WHEEL_ZOOM_SENSITIVITY)
}

/**
 * Zoom focal: o ponto do quadro sob (sx, sy) permanece sob (sx, sy).
 * 1) tela → quadro com a escala atual; 2) troca zoom (clamp); 3) recalcula pan.
 */
export function zoomAtPoint(
  t: BoardTransform,
  nextZoom: number,
  sx: number,
  sy: number,
  limits: ZoomLimits = BOARD_ZOOM_LIMITS,
): BoardTransform {
  const z = clampZoom(nextZoom, limits)
  if (z === t.z) return t
  const b = screenToBoard(t, sx, sy)
  return { x: sx - b.x * z, y: sy - b.y * z, z }
}

/** Zoom focal por fator (roda do mouse). */
export function zoomByFactor(
  t: BoardTransform,
  factor: number,
  sx: number,
  sy: number,
  limits: ZoomLimits = BOARD_ZOOM_LIMITS,
): BoardTransform {
  return zoomAtPoint(t, t.z * factor, sx, sy, limits)
}

/**
 * Limita o pan para que o conteúdo nunca saia totalmente do viewport
 * (sempre sobra `margin` px de conteúdo visível em cada eixo).
 */
export function clampPan(
  t: BoardTransform,
  viewport: BoardViewport,
  content: BoardRect,
  margin = BOARD_PAN_MARGIN,
): BoardTransform {
  const m = Math.min(margin, viewport.width / 2, viewport.height / 2)
  const minX = m - content.maxX * t.z
  const maxX = viewport.width - m - content.minX * t.z
  const minY = m - content.maxY * t.z
  const maxY = viewport.height - m - content.minY * t.z
  const x = minX > maxX ? (minX + maxX) / 2 : Math.min(maxX, Math.max(minX, t.x))
  const y = minY > maxY ? (minY + maxY) / 2 : Math.min(maxY, Math.max(minY, t.y))
  return x === t.x && y === t.y ? t : { x, y, z: t.z }
}

/** Centraliza o ponto do quadro no viewport mantendo o zoom. */
export function centerOnPoint(
  t: BoardTransform,
  point: BoardPoint,
  viewport: BoardViewport,
  zoom = t.z,
  limits: ZoomLimits = BOARD_ZOOM_LIMITS,
): BoardTransform {
  const z = clampZoom(zoom, limits)
  return { x: viewport.width / 2 - point.x * z, y: viewport.height / 2 - point.y * z, z }
}

/** Transformação que enquadra `rect` no viewport (com padding), centralizado. */
export function fitRect(
  rect: BoardRect,
  viewport: BoardViewport,
  opts?: { padding?: number; maxZoom?: number; minZoom?: number },
): BoardTransform {
  const padding = opts?.padding ?? 24
  const w = Math.max(1, rect.maxX - rect.minX)
  const h = Math.max(1, rect.maxY - rect.minY)
  const availW = Math.max(1, viewport.width - padding * 2)
  const availH = Math.max(1, viewport.height - padding * 2)
  const raw = Math.min(availW / w, availH / h)
  const z = Math.min(opts?.maxZoom ?? BOARD_ZOOM_LIMITS.max, Math.max(opts?.minZoom ?? 0.01, raw))
  const cx = (rect.minX + rect.maxX) / 2
  const cy = (rect.minY + rect.maxY) / 2
  return { x: viewport.width / 2 - cx * z, y: viewport.height / 2 - cy * z, z }
}

export function transformCss(t: BoardTransform): string {
  return `translate(${t.x}px, ${t.y}px) scale(${t.z})`
}
