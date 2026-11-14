import { describe, expect, it } from 'vitest'
import {
  BOARD_ZOOM_LIMITS,
  boardToScreen,
  centerOnPoint,
  clampPan,
  clampZoom,
  fitRect,
  screenToBoard,
  wheelZoomFactor,
  zoomAtPoint,
  zoomByFactor,
  type BoardTransform,
} from '../../src/game/board/boardTransform'

const VP = { width: 720, height: 480 }
const CONTENT = { minX: 0, minY: 0, maxX: 2000, maxY: 1200 }

describe('boardTransform — zoom focal', () => {
  const starts: BoardTransform[] = [
    { x: 0, y: 0, z: 1 },
    { x: -340, y: -120, z: 0.8 },
    { x: 120, y: 60, z: 1.4 },
    { x: -900, y: -500, z: 0.5 },
  ]
  const pointers: [number, number][] = [
    [0, 0],
    [360, 240],
    [719, 479],
    [123.5, 411.25],
  ]

  it('mantém a coordenada do quadro sob o ponteiro (zoom in e out)', () => {
    for (const t of starts) {
      for (const [sx, sy] of pointers) {
        for (const factor of [1.06, 1.5, 0.94, 0.6]) {
          const before = screenToBoard(t, sx, sy)
          const next = zoomByFactor(t, factor, sx, sy)
          const after = screenToBoard(next, sx, sy)
          expect(after.x).toBeCloseTo(before.x, 6)
          expect(after.y).toBeCloseTo(before.y, 6)
          // e o ponto continua na mesma posição de tela
          const back = boardToScreen(next, before.x, before.y)
          expect(back.x).toBeCloseTo(sx, 6)
          expect(back.y).toBeCloseTo(sy, 6)
        }
      }
    }
  })

  it('várias rodadas seguidas não derivam', () => {
    let t: BoardTransform = { x: -200, y: -80, z: 1 }
    const [sx, sy] = [500, 130]
    const anchor = screenToBoard(t, sx, sy)
    for (let i = 0; i < 40; i += 1) {
      t = zoomByFactor(t, i % 3 === 0 ? 0.9 : 1.12, sx, sy)
      const now = screenToBoard(t, sx, sy)
      expect(now.x).toBeCloseTo(anchor.x, 4)
      expect(now.y).toBeCloseTo(anchor.y, 4)
    }
  })

  it('respeita zoom mínimo/máximo sem salto de pan', () => {
    const atMax: BoardTransform = { x: -100, y: -50, z: BOARD_ZOOM_LIMITS.max }
    expect(zoomByFactor(atMax, 1.5, 300, 200)).toEqual(atMax)
    const atMin: BoardTransform = { x: -100, y: -50, z: BOARD_ZOOM_LIMITS.min }
    expect(zoomByFactor(atMin, 0.5, 300, 200)).toEqual(atMin)

    const overshoot = zoomAtPoint({ x: 0, y: 0, z: 1.7 }, 99, 360, 240)
    expect(overshoot.z).toBe(BOARD_ZOOM_LIMITS.max)
    // mesmo clampado, o ponto continua sob o cursor
    const b = screenToBoard({ x: 0, y: 0, z: 1.7 }, 360, 240)
    const a = screenToBoard(overshoot, 360, 240)
    expect(a.x).toBeCloseTo(b.x, 6)
    expect(a.y).toBeCloseTo(b.y, 6)
  })

  it('clampZoom lida com valores inválidos', () => {
    expect(clampZoom(Number.NaN)).toBe(BOARD_ZOOM_LIMITS.min)
    expect(clampZoom(-3)).toBe(BOARD_ZOOM_LIMITS.min)
    expect(clampZoom(10)).toBe(BOARD_ZOOM_LIMITS.max)
  })

  it('wheelZoomFactor: direção, simetria e limite por evento', () => {
    expect(wheelZoomFactor(-100)).toBeGreaterThan(1)
    expect(wheelZoomFactor(100)).toBeLessThan(1)
    expect(wheelZoomFactor(100) * wheelZoomFactor(-100)).toBeCloseTo(1, 10)
    expect(wheelZoomFactor(0)).toBe(1)
    // evento absurdo não explode o zoom
    expect(wheelZoomFactor(-100000)).toBeLessThan(1.5)
    expect(wheelZoomFactor(100000)).toBeGreaterThan(0.6)
    // deltaMode de linhas (Firefox) ≈ 16 px por linha
    expect(wheelZoomFactor(-3, 1)).toBeCloseTo(wheelZoomFactor(-48, 0), 10)
  })
})

describe('boardTransform — pan e enquadramento', () => {
  it('clampPan mantém ao menos uma margem de conteúdo visível', () => {
    const far = clampPan({ x: 99999, y: 99999, z: 1 }, VP, CONTENT, 80)
    expect(far.x).toBe(VP.width - 80 - CONTENT.minX)
    expect(far.y).toBe(VP.height - 80 - CONTENT.minY)

    const farNeg = clampPan({ x: -99999, y: -99999, z: 1 }, VP, CONTENT, 80)
    expect(farNeg.x).toBe(80 - CONTENT.maxX)
    expect(farNeg.y).toBe(80 - CONTENT.maxY)
  })

  it('clampPan não mexe em pan razoável (mesma referência) e preserva zoom', () => {
    const t: BoardTransform = { x: -300, y: -200, z: 0.9 }
    expect(clampPan(t, VP, CONTENT)).toBe(t)
    expect(clampPan({ x: 99999, y: 0, z: 0.9 }, VP, CONTENT).z).toBe(0.9)
  })

  it('zoom focal + clamp: ponto preservado quando pan não precisa de clamp', () => {
    const t: BoardTransform = { x: -300, y: -150, z: 1 }
    const next = clampPan(zoomByFactor(t, 1.3, 400, 260), VP, CONTENT)
    const before = screenToBoard(t, 400, 260)
    const after = screenToBoard(next, 400, 260)
    expect(after.x).toBeCloseTo(before.x, 6)
    expect(after.y).toBeCloseTo(before.y, 6)
  })

  it('centerOnPoint coloca o ponto no centro do viewport', () => {
    const t = centerOnPoint({ x: 0, y: 0, z: 1 }, { x: 400, y: 324 }, VP, 1)
    const s = boardToScreen(t, 400, 324)
    expect(s.x).toBeCloseTo(VP.width / 2, 6)
    expect(s.y).toBeCloseTo(VP.height / 2, 6)
  })

  it('fitRect enquadra o retângulo inteiro dentro do viewport', () => {
    const rect = { minX: 100, minY: 50, maxX: 1500, maxY: 900 }
    const t = fitRect(rect, VP, { padding: 20 })
    const tl = boardToScreen(t, rect.minX, rect.minY)
    const br = boardToScreen(t, rect.maxX, rect.maxY)
    expect(tl.x).toBeGreaterThanOrEqual(20 - 1e-6)
    expect(tl.y).toBeGreaterThanOrEqual(20 - 1e-6)
    expect(br.x).toBeLessThanOrEqual(VP.width - 20 + 1e-6)
    expect(br.y).toBeLessThanOrEqual(VP.height - 20 + 1e-6)
    // centralizado
    expect((tl.x + br.x) / 2).toBeCloseTo(VP.width / 2, 6)
    expect((tl.y + br.y) / 2).toBeCloseTo(VP.height / 2, 6)
  })

  it('fitRect respeita maxZoom (conteúdo pequeno não é ampliado demais)', () => {
    const t = fitRect({ minX: 0, minY: 0, maxX: 100, maxY: 60 }, VP, { maxZoom: 0.42 })
    expect(t.z).toBe(0.42)
  })
})
