import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  createInitialUiState,
  evaluateRfExtraction,
  rfChannelExtractComplete,
} from '../../src/forensic/forensicEngine'
import {
  puzzle07Bursts,
  puzzle07Frequencies,
  puzzle07ShepherdMoonsSession,
  puzzle07ExpectedToken,
  puzzle07ExpectedTime,
  puzzle07RfCapture,
} from '../../src/forensic/puzzles/puzzle07ShepherdMoons'
import { getForensicSessionForEvidence } from '../../src/forensic/forensicRegistry'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { puzzle06HexagonSession } from '../../src/forensic/puzzles/puzzle06Hexagon'
import {
  lookupPastorToken,
  PASTOR_CODE_TABLE,
  PASTOR_TOKEN,
} from '../../src/data/block06/pastorMoonsPuzzle'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { seedAchievements } from '../../src/data/game/seedAchievements'
import {
  __setStateForTests,
  getInvestigationState,
  resetGame,
} from '../../src/game/state/investigationStore'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { runStoryEngine } from '../../src/game/story/engine'
import { block06EntryActions } from '../../src/game/story/block06DevCheckpoints'
import {
  finishPoliceOperation,
  onPastorHiddenExtracted,
  onPastorLogisticsCrossRef,
  onPastorMoonsSolved,
} from '../../src/game/story/block06Handlers'
import { onDocumentConsulted } from '../../src/game/story/documentConsultHooks'
import { openDocument } from '../../src/game/state/investigationStore'

const ROOT = resolve(__dirname, '../..')
const PUBLIC = resolve(ROOT, 'public/assets/audio/forensic/puzzle07')
const SRC = resolve(ROOT, 'src/assets/audios/p7')

describe('Puzzle 07 — LUAS PASTORAS', () => {
  it('A: three real source assets exist', () => {
    expect(existsSync(resolve(SRC, 'Capangas do Valter - Track A.mp3'))).toBe(true)
    expect(existsSync(resolve(SRC, 'Capangas do Valter - Secret Track B.mp3'))).toBe(true)
    expect(existsSync(resolve(SRC, 'Capangas do Valter - Track C.mp3'))).toBe(true)
    expect(existsSync(resolve(PUBLIC, 'INTERCEPT_0511_RF_CAPTURE.wav'))).toBe(true)
    expect(existsSync(resolve(PUBLIC, 'DERIVED_CHANNEL_462_575.wav'))).toBe(true)
  })

  it('B/C: known channels strong; hidden weaker between them', () => {
    const a = puzzle07RfCapture.channels.find((c) => c.id === 'A')!
    const b = puzzle07RfCapture.channels.find((c) => c.id === 'B')!
    const c = puzzle07RfCapture.channels.find((c) => c.id === 'C')!
    expect(a.centerMhz).toBeLessThan(b.centerMhz)
    expect(b.centerMhz).toBeLessThan(c.centerMhz)
    expect(a.known).toBe(true)
    expect(c.known).toBe(true)
    expect(b.known).toBe(false)
    expect((a.nominalPower ?? 0) > (b.nominalPower ?? 1)).toBe(true)
    const powersB = puzzle07Bursts.filter((x) => x.channelId === 'B').map((x) => x.power)
    const powersA = puzzle07Bursts.filter((x) => x.channelId === 'A').map((x) => x.power)
    expect(Math.max(...powersB)).toBeLessThan(Math.min(...powersA))
  })

  it('D/E: selecting A or C does not extract hidden', () => {
    const rf = puzzle07RfCapture
    const onA = evaluateRfExtraction(rf, puzzle07Frequencies.A, 0.022)
    const onC = evaluateRfExtraction(rf, puzzle07Frequencies.C, 0.022)
    expect(onA.ok).toBe(false)
    expect(onC.ok).toBe(false)
  })

  it('F: intermediate frequency extracts hidden channel', () => {
    const ok = evaluateRfExtraction(puzzle07RfCapture, puzzle07Frequencies.B, 0.022)
    expect(ok.ok).toBe(true)
    expect(ok.hiddenOverlap).toBeGreaterThanOrEqual(0.85)
  })

  it('G/H: narrow loses; wide contaminates', () => {
    const narrow = evaluateRfExtraction(puzzle07RfCapture, puzzle07Frequencies.B, 0.008)
    const wide = evaluateRfExtraction(puzzle07RfCapture, puzzle07Frequencies.B, 0.12)
    expect(narrow.ok).toBe(false)
    expect(wide.ok).toBe(false)
    expect(wide.contamination).toBeGreaterThan(0)
  })

  it('I/J: derived asset exists; findings are G17N / 23:40', () => {
    expect(existsSync(resolve(PUBLIC, 'DERIVED_CHANNEL_462_575.wav'))).toBe(true)
    expect(puzzle07ExpectedToken).toBe('G17N')
    expect(puzzle07ExpectedTime).toBe('23:40')
    const tokenEv = seedEvidenceCatalog.find((e) => e.id === 'pastor_token_g17n')
    expect(tokenEv?.description).toMatch(/G17N|G · 1-7|Norte/i)
    expect(tokenEv?.description).toMatch(/23:40/)
  })

  it('K/L: token alone does not unlock Galpão; table cross does', () => {
    resetGame()
    __setStateForTests(runStoryEngine(applyStoryActions(createInitialState(), block06EntryActions)))
    onPastorHiddenExtracted()
    let s = getInvestigationState()
    expect(s.evidenceOwned).toContain('pastor_token_g17n')
    expect(s.locations['galpao-17']?.status).not.toBe('visitAvailable')
    expect(s.flags.block06_pastor_done).toBeFalsy()

    openDocument('doc-tabela-logistica-g17n')
    onDocumentConsulted('doc-tabela-logistica-g17n')
    s = getInvestigationState()
    expect(s.flags.block06_pastor_done).toBe(true)
    expect(s.evidenceOwned).toContain('galpao17_operational_site')
    expect(lookupPastorToken(PASTOR_TOKEN)).toBe('Galpão 17 — Pátio Norte')
    expect(PASTOR_CODE_TABLE.some((r) => r.token === 'G17N')).toBe(true)
  })

  it('M/N: operation unlocks; Miro arrested for current crimes', () => {
    resetGame()
    __setStateForTests(runStoryEngine(applyStoryActions(createInitialState(), block06EntryActions)))
    onPastorMoonsSolved()
    expect(getInvestigationState().flags.block06_operation_ready).toBe(true)
    finishPoliceOperation()
    const s = getInvestigationState()
    expect(s.evidenceOwned).toContain('miro_arrested_current_crimes')
    const arrest = seedEvidenceCatalog.find((e) => e.id === 'miro_arrested_current_crimes')
    expect(`${arrest?.title} ${arrest?.description}`).not.toMatch(/Elisa|Jana/i)
  })

  it('O/P: no Elisa/Jana in pastor findings; chefe wording only', () => {
    const ids = ['pastor_token_g17n', 'pastor_delivery_finding', 'galpao17_operational_site']
    for (const id of ids) {
      const e = seedEvidenceCatalog.find((x) => x.id === id)
      const blob = `${e?.title ?? ''} ${e?.description ?? ''}`
      expect(blob).not.toMatch(/Elisa|Jana/i)
    }
  })

  it('Q: RF extract completion + registry; puzzles 01/06 intact', () => {
    expect(getForensicSessionForEvidence('valter_group_active_intercepts')?.id).toBe(
      'puzzle-07-shepherd-moons',
    )
    const ui = createInitialUiState(puzzle07ShepherdMoonsSession)
    expect(rfChannelExtractComplete(puzzle07ShepherdMoonsSession, ui)).toBe(false)
    ui.rfExtracted = true
    ui.rfExtractionQuality = 0.8
    expect(rfChannelExtractComplete(puzzle07ShepherdMoonsSession, ui)).toBe(true)
    expect(puzzle01CassiniSession.id).toBeTruthy()
    expect(puzzle06HexagonSession.id).toBeTruthy()
  })

  it('achievement LUAS PASTORAS requires extract + cross-ref', () => {
    const ach = seedAchievements.find((a) => a.id === 'ach-shepherd-moons')
    expect(ach?.title).toBe('LUAS PASTORAS')
    resetGame()
    __setStateForTests(runStoryEngine(applyStoryActions(createInitialState(), block06EntryActions)))
    onPastorHiddenExtracted()
    expect(ach!.unlocked(getInvestigationState())).toBe(false)
    onPastorLogisticsCrossRef()
    expect(ach!.unlocked(getInvestigationState())).toBe(true)
  })

  it('capture meta has no spoiler label HIDDEN CHANNEL', () => {
    const meta = readFileSync(resolve(PUBLIC, 'capture_meta.json'), 'utf8')
    expect(meta).not.toMatch(/HIDDEN CHANNEL|FIND HIDDEN|SOLVE PASTOR/i)
  })
})
