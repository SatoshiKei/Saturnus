/**
 * Puzzle 12 — MEMÓRIA (placeholder funcional).
 * Gravação “recente” de Mariana composta de fontes incompatíveis do caso.
 * TODO(puzzle-12): fingerprints/espectro/fase reais.
 */

export type MemorySourceId = 'apartment' | 'emergency' | 'enceladus' | 'cassini'

export interface MemorySegment {
  id: string
  label: string
  tStart: number
  tEnd: number
  /** Fonte verdadeira — o jogador associa. */
  trueSource: MemorySourceId
  hint: string
}

export const MEMORY_SOURCES: { id: MemorySourceId; label: string }[] = [
  { id: 'apartment', label: 'Acústica do apartamento de Mariana' },
  { id: 'emergency', label: 'Chamada de emergência (08:03) — frase exclusiva' },
  { id: 'enceladus', label: 'Padrão de equipamento hospitalar (Puzzle 8)' },
  { id: 'cassini', label: 'Artefato digital só existente no material reconstruído (Puzzle 9)' },
]

export const MEMORY_SEGMENTS: MemorySegment[] = [
  {
    id: 'seg-a',
    label: 'Trecho A — reverberação ambiente',
    tStart: 0.4,
    tEnd: 2.1,
    trueSource: 'apartment',
    hint: 'Eco / HVAC idêntico ao apartamento',
  },
  {
    id: 'seg-b',
    label: 'Trecho B — palavra isolada',
    tStart: 3.0,
    tEnd: 3.8,
    trueSource: 'emergency',
    hint: 'Formulação que só existe na chamada original',
  },
  {
    id: 'seg-c',
    label: 'Trecho C — burst periódico',
    tStart: 5.2,
    tEnd: 6.5,
    trueSource: 'enceladus',
    hint: 'Alarme de monitor ~12 s / ~1 kHz',
  },
  {
    id: 'seg-d',
    label: 'Trecho D — artefato de sessão',
    tStart: 7.0,
    tEnd: 8.4,
    trueSource: 'cassini',
    hint: 'Fragmento que nunca existiu como áudio simples',
  },
]

export const MEMORY_WORD = 'MEMÓRIA'

export function isMemoryProvenanceComplete(
  assigned: Record<string, MemorySourceId | ''>,
): boolean {
  return MEMORY_SEGMENTS.every((s) => assigned[s.id] === s.trueSource)
}
