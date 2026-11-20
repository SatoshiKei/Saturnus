/**
 * Beats diegéticos da Mari fora de puzzle (piloto).
 * Gatilhos por flag / contexto de hub — sem meta de UI.
 */

export type MariCompanionBeat = {
  id: string
  /** Flag gravada ao dispensar (once). */
  seenFlag: string
  /** Todas precisam estar true. */
  requireFlags?: string[]
  /** Nenhuma pode estar true. */
  blockIfFlags?: string[]
  lines: Array<{
    speaker?: string
    text: string
    portraitId?: 'mari' | 'augusto'
    narration?: boolean
  }>
}

/** Pós-abertura: ela ainda na sala, reforço de relação + gestos leves. */
export const MARI_COMPANION_BEATS: MariCompanionBeat[] = [
  {
    id: 'hub-welcome',
    seenFlag: 'mari_hub_welcome_seen',
    requireFlags: ['block01_opening_seen'],
    blockIfFlags: ['mari_hub_welcome_seen', 'block01_bo_registered'],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'A pasta amarela é a dela. O fixo tem o ramal da central se quiser ouvir a ligação de novo.',
      },
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Eu fico do lado de cá. Se o senhor se perder no material, me chama — eu conheço onde a casa esconde as coisas.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'Certo.',
      },
    ],
  },
]

export function pickMariCompanionBeat(flags: Record<string, boolean>): MariCompanionBeat | null {
  for (const beat of MARI_COMPANION_BEATS) {
    if (flags[beat.seenFlag]) continue
    if (beat.requireFlags?.some((f) => !flags[f])) continue
    if (beat.blockIfFlags?.some((f) => flags[f])) continue
    return beat
  }
  return null
}
