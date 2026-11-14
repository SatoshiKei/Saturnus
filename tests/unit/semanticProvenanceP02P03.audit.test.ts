/**
 * AUDITORIA SEMÂNTICA — contrato canónico P02/P03.
 * Falha se alguém voltar a misturar as duas cadeias de proveniência.
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { puzzle02IapetusSession } from '../../src/forensic/puzzles/puzzle02Iapetus'
import { puzzle03AnelsSession } from '../../src/forensic/puzzles/puzzle03Anels'
import { createInitialState } from '../../src/game/state/initialState'
import {
  __setStateForTests,
  getInvestigationState,
  resetGame,
} from '../../src/game/state/investigationStore'
import {
  finishVerticeArchive,
  onRafaelForwardAudioPlayed,
  runProvisionalRafaelForwardAnalysis,
} from '../../src/game/story/block02Handlers'

const P02_SRC = '/assets/audio/forensic/puzzle02/rafael_1610_2147_full.mp3'
const P03_SRC = '/assets/audio/forensic/puzzle03/rec_vtx_old_01_final.mp3'
const P02_ID = 'rafael_voice_to_augusto'
const P03_ID = 'rec_vtx_old_01'

describe('SEMANTIC AUDIT — P02/P03 provenance (canon contract)', () => {
  beforeEach(() => {
    resetGame()
    __setStateForTests(createInitialState())
  })

  it('P02: Rafael + WhatsApp + asset Rafael + lead Vértice', () => {
    expect(puzzle02IapetusSession.evidenceId).toBe(P02_ID)
    const e2 = seedEvidenceCatalog.find((e) => e.id === P02_ID)!
    expect(e2.audioSrc).toBe(P02_SRC)
    expect(e2.sourceType).toBe('augusto-whatsapp')
    expect(e2.relatedPersonIds).toContain('rafael')
    const blob = `${e2.title}\n${e2.description ?? ''}`.toLowerCase()
    expect(blob).toMatch(/rafael/)
    expect(blob).toMatch(/an[aá]lise/)
    expect(blob).not.toMatch(/encaminhada por rafael|forward from mariana/)
    expect(blob).toMatch(/n[aã]o [eé] a grava[cç][aã]o da balada|an[aá]lise pr[eé]via/)

    const metaSrc = puzzle02IapetusSession.sources[0]?.metadata?.find((m) => m.key === 'source')
    expect(metaSrc?.value.toLowerCase()).toMatch(/whatsapp/)
    expect(metaSrc?.value.toLowerCase()).toMatch(/rafael/)
    expect(metaSrc?.value.toLowerCase()).toMatch(/augusto/)

    onRafaelForwardAudioPlayed()
    runProvisionalRafaelForwardAnalysis()
    const s = getInvestigationState()
    expect(s.evidenceOwned).toContain(P02_ID)
    expect(s.flags.block02_rafael_forward_provisional).toBe(true)
    expect(s.locations.vertice?.status).toBe('visitAvailable')
  })

  it('P03: finishVerticeArchive + source Vértice; não WhatsApp; não Rafael; asset ≠ P02', () => {
    expect(P02_SRC).not.toBe(P03_SRC)
    expect(puzzle03AnelsSession.evidenceId).toBe(P03_ID)
    const e3 = seedEvidenceCatalog.find((e) => e.id === P03_ID)!
    expect(e3.audioSrc).toBe(P03_SRC)
    expect(e3.sourceType).not.toBe('augusto-whatsapp')
    expect(e3.sourceType).toMatch(/location|archive|vertice|case/i)

    const blob = `${e3.title}\n${e3.description ?? ''}\n${e3.sourceType}`.toLowerCase()
    expect(blob).not.toMatch(/via rafael|mariana\s*→\s*rafael|c[oó]pia via/)
    expect(blob).toMatch(/v[eé]rtice/)
    expect(blob).toMatch(/augusto/)
    expect(blob).toMatch(/n[aã]o passou por rafael|location-archive/)

    const metaSrc = puzzle03AnelsSession.sources[0]?.metadata?.find((m) => m.key === 'source')
    const metaChain = puzzle03AnelsSession.sources[0]?.metadata?.find((m) => m.key === 'chain')
    const metaBlob = `${metaSrc?.value ?? ''} ${metaChain?.value ?? ''}`.toLowerCase()
    expect(metaBlob).not.toMatch(/whatsapp|rafael|mariana/)
    expect(metaBlob).toMatch(/v[eé]rtice/)
    expect(metaBlob).toMatch(/augusto/)

    onRafaelForwardAudioPlayed()
    runProvisionalRafaelForwardAnalysis()
    let s = getInvestigationState()
    expect(s.evidenceOwned).not.toContain(P03_ID)

    finishVerticeArchive()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain(P03_ID)
    expect(s.flags.block02_vertice_archive).toBe(true)
  })

  it('cadeias permanecem distintas se misturadas no futuro', () => {
    const e2 = seedEvidenceCatalog.find((e) => e.id === P02_ID)!
    const e3 = seedEvidenceCatalog.find((e) => e.id === P03_ID)!
    expect(e2.audioSrc).not.toBe(e3.audioSrc)
    expect(e2.id).not.toBe(e3.id)
    expect(e2.sourceType).not.toBe(e3.sourceType)
  })
})
