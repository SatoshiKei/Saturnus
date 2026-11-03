import { describe, expect, it } from 'vitest'
import { paginateNvlLines } from '../../src/components/story/vn/nvlPages'

describe('paginateNvlLines', () => {
  it('divide histórico em páginas', () => {
    const lines = Array.from({ length: 12 }, (_, i) => ({ text: `line ${i}` }))
    const pages = paginateNvlLines(lines)
    expect(pages.length).toBe(3)
    expect(pages[0]).toHaveLength(5)
  })
})
