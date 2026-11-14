import { describe, expect, it } from 'vitest'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'

describe('Lucas evidence semantics', () => {
  it('não resume Mariana a “provar inocência de André”', () => {
    const ev = seedEvidenceCatalog.find((e) => e.id === 'mariana_andre_innocence')!
    expect(ev.title.toLowerCase()).not.toMatch(/provar a inocência/)
    expect(ev.title.toLowerCase()).toMatch(/testemunho|interpreta/)
    const desc = (ev.description ?? '').toLowerCase()
    expect(desc).toMatch(/fatos/)
    expect(desc).toMatch(/elisa/)
    expect(desc).toMatch(/conclus/)
    expect(desc).not.toMatch(/^mariana queria provar a inocência/)
  })
})
