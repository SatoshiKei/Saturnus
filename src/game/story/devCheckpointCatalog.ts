import type { StoryActionRef } from '../types'
import { block01DevCheckpoints } from './block01DevCheckpoints'
import { block02DevCheckpoints } from './block02DevCheckpoints'
import { block03DevCheckpoints } from './block03DevCheckpoints'
import { block04DevCheckpoints } from './block04DevCheckpoints'
import { block05DevCheckpoints } from './block05DevCheckpoints'
import { block06DevCheckpoints } from './block06DevCheckpoints'
import { block07DevCheckpoints } from './block07DevCheckpoints'
import { block08DevCheckpoints } from './block08DevCheckpoints'
import { block09DevCheckpoints } from './block09DevCheckpoints'

export interface DevCheckpointDef {
  id: string
  label: string
  /** Delta local do arquivo de bloco (não cumulativo). */
  actions: StoryActionRef[]
  block: number
  order: number
  /** Índice global 0-based na campanha. */
  globalIndex: number
}

export interface DevBlockSection {
  block: number
  title: string
  /** Flag que indica bloco iniciado (ou completo como fallback). */
  startedFlag: string
  completeFlag: string
  checkpoints: DevCheckpointDef[]
}

const BLOCK_META: { block: number; title: string; startedFlag: string; completeFlag: string }[] = [
  { block: 1, title: 'O DESAPARECIMENTO', startedFlag: 'block01_started', completeFlag: 'block01_complete' },
  { block: 2, title: 'DUAS TRILHAS', startedFlag: 'block02_started', completeFlag: 'block02_complete' },
  { block: 3, title: 'NOITES FORA DE ORDEM', startedFlag: 'block03_started', completeFlag: 'block03_complete' },
  { block: 4, title: 'MEMÓRIAS QUE NÃO PERTENCEM', startedFlag: 'block04_started', completeFlag: 'block04_complete' },
  { block: 5, title: 'O PERCURSO DEIXADO', startedFlag: 'block05_started', completeFlag: 'block05_complete' },
  { block: 6, title: 'A PESSOA ERRADA', startedFlag: 'block06_started', completeFlag: 'block06_complete' },
  { block: 7, title: 'O HOMEM QUE NÃO ERA RICARDO', startedFlag: 'block07_started', completeFlag: 'block07_complete' },
  { block: 8, title: 'A NOITE SEM ASSASSINATO', startedFlag: 'block08_started', completeFlag: 'block08_complete' },
  { block: 9, title: 'MEMÓRIA', startedFlag: 'block09_started', completeFlag: 'block09_complete' },
]

const RAW_BY_BLOCK: { block: number; rows: { id: string; label: string; actions: StoryActionRef[] }[] }[] = [
  { block: 1, rows: block01DevCheckpoints },
  { block: 2, rows: block02DevCheckpoints },
  { block: 3, rows: block03DevCheckpoints },
  { block: 4, rows: block04DevCheckpoints },
  { block: 5, rows: block05DevCheckpoints },
  { block: 6, rows: block06DevCheckpoints },
  { block: 7, rows: block07DevCheckpoints },
  { block: 8, rows: block08DevCheckpoints },
  { block: 9, rows: block09DevCheckpoints },
]

function buildCatalog(): { sections: DevBlockSection[]; flat: DevCheckpointDef[] } {
  const flat: DevCheckpointDef[] = []
  const sections: DevBlockSection[] = BLOCK_META.map((meta) => {
    const raw = RAW_BY_BLOCK.find((r) => r.block === meta.block)?.rows ?? []
    const checkpoints = raw.map((row, order) => {
      const def: DevCheckpointDef = {
        id: row.id,
        label: row.label,
        actions: row.actions,
        block: meta.block,
        order,
        globalIndex: flat.length,
      }
      flat.push(def)
      return def
    })
    return { ...meta, checkpoints }
  })
  return { sections, flat }
}

const built = buildCatalog()
export const DEV_BLOCK_SECTIONS = built.sections
export const DEV_CHECKPOINTS = built.flat

/**
 * Actions canônicas até o checkpoint (inclusive).
 *
 * B1–B2: acumulação incremental de todos os deltas anteriores.
 * B3+: o checkpoint de início do bloco já carrega EntryActions completas;
 *      checkpoints seguintes = Entry do bloco + deltas locais até o alvo.
 */
export function getCumulativeActions(checkpointId: string): StoryActionRef[] {
  const target = DEV_CHECKPOINTS.find((c) => c.id === checkpointId)
  if (!target) return []

  if (target.block <= 2) {
    return DEV_CHECKPOINTS.filter((c) => c.globalIndex <= target.globalIndex).flatMap((c) => c.actions)
  }

  const section = DEV_BLOCK_SECTIONS.find((s) => s.block === target.block)
  if (!section) return []
  const start = section.checkpoints[0]
  const locals = section.checkpoints.filter((c) => c.order > 0 && c.order <= target.order)
  return [...(start?.actions ?? []), ...locals.flatMap((c) => c.actions)]
}

function checkpointReached(cp: DevCheckpointDef, flags: Record<string, boolean>): boolean {
  const section = DEV_BLOCK_SECTIONS.find((s) => s.block === cp.block)
  if (!section) return false
  if (flags[section.completeFlag] && cp.order === section.checkpoints.length - 1) return true
  if (flags[section.completeFlag] && cp.order < section.checkpoints.length - 1) return true

  if (cp.order === 0) {
    if (cp.block === 1) return true
    return Boolean(flags[section.startedFlag] || flags[section.completeFlag])
  }

  const markers = cp.actions.filter(
    (a): a is Extract<StoryActionRef, { type: 'setFlag' }> =>
      a.type === 'setFlag' && a.value !== false,
  )
  if (markers.length === 0) {
    // Sem flag própria: considera alcançado se o bloco já passou deste ponto via completeFlag
    return Boolean(flags[section.completeFlag])
  }
  return markers.every((a) => Boolean(flags[a.id]))
}

/** Progresso 0–100 baseado no checkpoint canônico mais avançado alcançado pelas flags. */
export function campaignProgressPercent(flags: Record<string, boolean>): {
  percent: number
  currentIndex: number
  total: number
  currentCheckpointId: string | null
  currentBlock: number
} {
  const total = DEV_CHECKPOINTS.length
  let currentIndex = 0
  for (let i = 0; i < DEV_CHECKPOINTS.length; i++) {
    if (checkpointReached(DEV_CHECKPOINTS[i], flags)) currentIndex = i
  }

  let activeBlock = 1
  for (const s of DEV_BLOCK_SECTIONS) {
    if (flags[s.completeFlag]) activeBlock = Math.min(9, s.block + 1)
    else if (flags[s.startedFlag] || s.block === 1) {
      activeBlock = s.block
      break
    }
  }

  const currentCheckpointId = DEV_CHECKPOINTS[currentIndex]?.id ?? null
  const percent = total <= 1 ? 0 : Math.round((currentIndex / (total - 1)) * 100)
  return { percent, currentIndex, total, currentCheckpointId, currentBlock: activeBlock }
}

export function resolveCheckpointStatus(
  cp: DevCheckpointDef,
  currentIndex: number,
): 'done' | 'current' | 'future' {
  if (cp.globalIndex < currentIndex) return 'done'
  if (cp.globalIndex === currentIndex) return 'current'
  return 'future'
}

export function resolveBlockStatus(
  block: number,
  flags: Record<string, boolean>,
  currentBlock: number,
): 'done' | 'current' | 'future' {
  const meta = BLOCK_META.find((b) => b.block === block)
  if (!meta) return 'future'
  if (flags[meta.completeFlag]) return 'done'
  if (block === currentBlock) return 'current'
  if (block < currentBlock) return 'done'
  return 'future'
}
