import { describe, expect, it } from 'vitest'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { puzzle11SaturnRotationSession } from '../../src/forensic/puzzles/puzzle11SaturnRotation'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('P11 evidence ID — no clock-drift legacy in runtime', () => {
  it('catalog e sessão usam rui_police_approach_records', () => {
    expect(puzzle11SaturnRotationSession.evidenceId).toBe('rui_police_approach_records')
    const ev = seedEvidenceCatalog.find((e) => e.id === 'rui_police_approach_records')!
    expect(ev).toBeTruthy()
    expect(ev.id).not.toMatch(/clock.?drift/i)
    const blob = `${ev.title}\n${ev.description ?? ''}`.toLowerCase()
    expect(blob).not.toMatch(/clock drift|enf/)
    expect(blob).toMatch(/passag|cad|avl|r[aá]dio|abordagem/)
  })

  it('nenhum ID runtime novo no seed/handlers contém clock_drift', () => {
    const ids = seedEvidenceCatalog.map((e) => e.id)
    expect(ids.some((id) => /clock.?drift/i.test(id))).toBe(false)

    const handler = readFileSync(
      resolve(process.cwd(), 'src/game/story/block08Handlers.ts'),
      'utf8',
    )
    expect(handler).not.toMatch(/police_clock_drift_logs/)
    expect(handler).toMatch(/rui_police_approach_records/)
  })
})
