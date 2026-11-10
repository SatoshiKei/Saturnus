import type { InvestigationState } from '../game/types'

const BLOCKS: { flag: string; label: string }[] = [
  { flag: 'block09_started', label: 'BLOCO 9 — MEMÓRIA' },
  { flag: 'block09_complete', label: 'BLOCO 9 — MEMÓRIA' },
  { flag: 'block08_started', label: 'BLOCO 8 — A NOITE SEM ASSASSINATO' },
  { flag: 'block08_complete', label: 'BLOCO 8 — A NOITE SEM ASSASSINATO' },
  { flag: 'block07_started', label: 'BLOCO 7 — O HOMEM QUE NÃO ERA RICARDO' },
  { flag: 'block07_complete', label: 'BLOCO 7 — O HOMEM QUE NÃO ERA RICARDO' },
  { flag: 'block06_started', label: 'BLOCO 6 — A PESSOA ERRADA' },
  { flag: 'block06_complete', label: 'BLOCO 6 — A PESSOA ERRADA' },
  { flag: 'block05_started', label: 'BLOCO 5 — O PERCURSO DEIXADO' },
  { flag: 'block05_complete', label: 'BLOCO 5 — O PERCURSO DEIXADO' },
  { flag: 'block04_started', label: 'BLOCO 4 — MEMÓRIAS EMPRESTADAS' },
  { flag: 'block04_complete', label: 'BLOCO 4 — MEMÓRIAS EMPRESTADAS' },
  { flag: 'block03_started', label: 'BLOCO 3 — NOITES FORA DE ORDEM' },
  { flag: 'block03_complete', label: 'BLOCO 3 — NOITES FORA DE ORDEM' },
  { flag: 'block02_started', label: 'BLOCO 2 — DUAS TRILHAS' },
  { flag: 'block02_complete', label: 'BLOCO 2 — DUAS TRILHAS' },
  { flag: 'block01_started', label: 'BLOCO 1 — O DESAPARECIMENTO' },
]

export function currentBlockLabel(flags: Record<string, boolean>): string {
  for (const row of BLOCKS) {
    if (flags[row.flag]) return row.label
  }
  return 'BLOCO 1 — O DESAPARECIMENTO'
}

export function hubLocationLabel(): string {
  return 'Delegacia'
}

export function formatPlayTime(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h <= 0) return `${m} min`
  return `${h} h ${m.toString().padStart(2, '0')} min`
}

/** Tempo de jogo no formato de slot de save: `00:05:34`. */
export function formatPlayTimeClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function formatSaveClock(ts: number): string {
  const d = new Date(ts)
  const dd = d.getDate().toString().padStart(2, '0')
  const mm = (d.getMonth() + 1).toString().padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${dd}/${mm}/${yyyy} · ${hh}:${min}`
}

export function playTimeOf(state: InvestigationState): number {
  return state.playTimeMs ?? 0
}
