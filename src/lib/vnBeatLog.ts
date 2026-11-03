import type { VnLine } from '../components/story/VisualNovelDialog'

/** Linhas já “ditas” no tópico atual (para log e rewind). */
export function vnLinesThrough<T extends { speaker?: string; text: string; portrait?: string }>(
  beats: T[],
  throughIndex: number,
  portraitFor: (key: string) => string | undefined,
): VnLine[] {
  if (throughIndex < 0) return []
  return beats.slice(0, throughIndex + 1).map((b) => ({
    speaker: b.speaker,
    text: b.text,
    portraitSrc: b.portrait ? portraitFor(b.portrait) : undefined,
  }))
}
