import type { VnLine } from '../VisualNovelDialog'

/** Blocos por página NVL — evita scroll infinito durante leitura. */
export const NVL_BLOCKS_PER_PAGE = 5

export function paginateNvlLines(lines: VnLine[]): VnLine[][] {
  if (lines.length === 0) return [[]]
  const pages: VnLine[][] = []
  for (let i = 0; i < lines.length; i += NVL_BLOCKS_PER_PAGE) {
    pages.push(lines.slice(i, i + NVL_BLOCKS_PER_PAGE))
  }
  return pages
}

export function paginateStringBlocks(blocks: string[]): string[][] {
  if (blocks.length === 0) return [[]]
  const pages: string[][] = []
  for (let i = 0; i < blocks.length; i += NVL_BLOCKS_PER_PAGE) {
    pages.push(blocks.slice(i, i + NVL_BLOCKS_PER_PAGE))
  }
  return pages
}
