import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../src/game/state/initialState'
import { buildLinkBoard } from '../../src/game/board/buildLinkBoard'
import { BOARD_WORLD } from '../../src/game/board/boardLayout'

describe('Quadro de ligações', () => {
  it('B1 — núcleo Mariana sem grafo automático do caderno', () => {
    const inv = createInitialState()
    const { nodes } = buildLinkBoard(inv)
    const ids = new Set(nodes.map((n) => n.id))
    expect(ids.has('lb-mariana')).toBe(true)
    expect(ids.has('lb-call-0803')).toBe(true)
    expect(ids.has('lb-cell')).toBe(true)
    expect(ids.has('lb-elisa')).toBe(false)
    expect(nodes.length).toBeLessThanOrEqual(12)
  })

  it('B2 — Elisa e André entram com posições fixas no cluster Elisa (~22% / 68%)', () => {
    const inv = createInitialState()
    inv.flags.block02_started = true
    const { nodes } = buildLinkBoard(inv)
    const elisa = nodes.find((n) => n.id === 'lb-elisa')
    const andre = nodes.find((n) => n.id === 'lb-andre')
    expect(elisa).toBeDefined()
    expect(andre).toBeDefined()
    // determinístico: mesma entrada → mesma posição
    const again = buildLinkBoard(inv).nodes.find((n) => n.id === 'lb-elisa')
    expect(again?.x).toBe(elisa?.x)
    expect(again?.y).toBe(elisa?.y)
    // lado esquerdo / metade inferior do mundo
    expect(elisa!.x).toBeLessThan(BOARD_WORLD.width * 0.5)
    expect(elisa!.y).toBeGreaterThan(BOARD_WORLD.height * 0.5)
    expect(andre!.x).toBeLessThan(BOARD_WORLD.width * 0.5)
  })
})
