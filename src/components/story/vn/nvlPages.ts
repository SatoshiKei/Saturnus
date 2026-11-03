import type { VnLine } from '../VisualNovelDialog'

/** Blocos por página NVL — evita scroll infinito durante leitura. */
const BLOCKS_PER_PAGE = 5

export function paginateNvlLines(lines: VnLine[]): VnLine[][] {
  if (lines.length === 0) return [[]]
  const pages: VnLine[][] = []
  for (let i = 0; i < lines.length; i += BLOCKS_PER_PAGE) {
    pages.push(lines.slice(i, i + BLOCKS_PER_PAGE))
  }
  return pages
}
