import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  assembleClipSequence,
  clipSequenceComplete,
  clipSequenceMatchesExpected,
  createInitialUiState,
} from '../../src/forensic/forensicEngine'
import {
  puzzle05ExpectedOrder,
  puzzle05PhysicalOrder,
  puzzle05SaturnaliaSession,
  puzzle05MasterDurationSec,
} from '../../src/forensic/puzzles/puzzle05Saturnalia'
import { getForensicSessionForEvidence } from '../../src/forensic/forensicRegistry'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { puzzle02IapetusSession } from '../../src/forensic/puzzles/puzzle02Iapetus'
import { puzzle03AnelsSession } from '../../src/forensic/puzzles/puzzle03Anels'
import { puzzle04JanusSession } from '../../src/forensic/puzzles/puzzle04Janus'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { seedAchievements } from '../../src/data/game/seedAchievements'

const ROOT = resolve(__dirname, '../..')
const MASTER_SRC = resolve(ROOT, 'src/assets/audios/p5')
const PUBLIC = resolve(ROOT, 'public/assets/audio/forensic/puzzle05')

describe('Puzzle 05 — SATURNALIA', () => {
  it('keeps master intact and exports exactly 10 fragments', () => {
    const srcFiles = readdirSync(MASTER_SRC).filter((f) => f.toLowerCase().endsWith('.mp3'))
    expect(srcFiles.length).toBeGreaterThanOrEqual(1)
    expect(existsSync(resolve(PUBLIC, 'livia_maralto_master.mp3'))).toBe(true)
    for (let i = 0; i < 10; i++) {
      expect(existsSync(resolve(PUBLIC, `RC_SLOT_${String(i).padStart(2, '0')}.mp3`))).toBe(true)
    }
    expect(puzzle05PhysicalOrder).toHaveLength(10)
    expect(puzzle05ExpectedOrder).toHaveLength(10)
    expect(puzzle05MasterDurationSec).toBeGreaterThan(300)
  })

  it('physical export order is 00→09; chronological is 06…05', () => {
    expect([...puzzle05PhysicalOrder]).toEqual([
      'RC_SLOT_00',
      'RC_SLOT_01',
      'RC_SLOT_02',
      'RC_SLOT_03',
      'RC_SLOT_04',
      'RC_SLOT_05',
      'RC_SLOT_06',
      'RC_SLOT_07',
      'RC_SLOT_08',
      'RC_SLOT_09',
    ])
    expect([...puzzle05ExpectedOrder]).toEqual([
      'RC_SLOT_06',
      'RC_SLOT_07',
      'RC_SLOT_08',
      'RC_SLOT_09',
      'RC_SLOT_00',
      'RC_SLOT_01',
      'RC_SLOT_02',
      'RC_SLOT_03',
      'RC_SLOT_04',
      'RC_SLOT_05',
    ])
    const ui = createInitialUiState(puzzle05SaturnaliaSession)
    expect(ui.clipSequence).toEqual([...puzzle05PhysicalOrder])
    expect(clipSequenceMatchesExpected(ui.clipSequence, [...puzzle05ExpectedOrder])).toBe(false)
  })

  it('only the full correct order completes; partial does not', () => {
    const ui = createInitialUiState(puzzle05SaturnaliaSession)
    expect(assembleClipSequence(puzzle05SaturnaliaSession, ui.clipSequence).ok).toBe(false)
    expect(clipSequenceComplete(puzzle05SaturnaliaSession, ui)).toBe(false)

    const almost = [...puzzle05ExpectedOrder]
    almost[9] = 'RC_SLOT_04'
    almost[8] = 'RC_SLOT_05'
    expect(assembleClipSequence(puzzle05SaturnaliaSession, almost).ok).toBe(false)

    const ok = assembleClipSequence(puzzle05SaturnaliaSession, [...puzzle05ExpectedOrder])
    expect(ok.ok).toBe(true)
    ui.clipSequence = [...puzzle05ExpectedOrder]
    ui.sequenceAssembled = true
    expect(clipSequenceComplete(puzzle05SaturnaliaSession, ui)).toBe(true)
  })

  it('findings do not identify Morsa as André or unlock Samuel from audio', () => {
    const core = seedEvidenceCatalog.find((e) => e.id === 'protest_masked_core')
    const morsa = seedEvidenceCatalog.find((e) => e.id === 'morsa_unidentified')
    const blob = `${core?.title} ${core?.description} ${morsa?.title} ${morsa?.description}`
    expect(blob).not.toMatch(/André|Andre|inocente|Samuel Teixeira/i)
    expect(core?.relatedPersonIds ?? []).not.toContain('samuel')
    expect(morsa?.description).toMatch(/sem nome/i)
  })

  it('logger metadata exposes NEXT WRITE SLOT without spelling the solution', () => {
    const log = puzzle05SaturnaliaSession.sources.find((s) => s.id === 'rc_logger_log')
    const vals = (log?.metadata ?? []).map((m) => m.value).join('\n')
    expect(vals).toMatch(/CIRCULAR/)
    expect(vals).toMatch(/06/)
    expect(vals).toMatch(/PHYSICAL SLOT ORDER/)
    expect(vals).not.toMatch(/06 → 07 → 08/)
  })

  it('achievement and registry; puzzles 01–04 unchanged', () => {
    const ach = seedAchievements.find((a) => a.id === 'ach-saturnalia')
    expect(ach?.title).toBe('SATURNALIA')
    expect(getForensicSessionForEvidence('livia_radio_archive_raw')?.id).toBe('puzzle-05-saturnalia')
    expect(getForensicSessionForEvidence(puzzle01CassiniSession.evidenceId!)!.id).toBe(
      puzzle01CassiniSession.id,
    )
    expect(getForensicSessionForEvidence(puzzle02IapetusSession.evidenceId!)!.id).toBe(
      puzzle02IapetusSession.id,
    )
    expect(getForensicSessionForEvidence(puzzle03AnelsSession.evidenceId!)!.id).toBe(
      puzzle03AnelsSession.id,
    )
    expect(getForensicSessionForEvidence(puzzle04JanusSession.evidenceId!)!.id).toBe(
      puzzle04JanusSession.id,
    )
  })

  it('timing json matches expected chronological mapping', () => {
    const meta = JSON.parse(
      readFileSync(resolve(ROOT, 'tools/audio/out/puzzle05_timing.json'), 'utf8'),
    )
    expect(meta.nextWriteSlot).toBe(6)
    expect(meta.chronologicalOrder).toEqual([...puzzle05ExpectedOrder])
    expect(meta.physicalExportOrder).toEqual([...puzzle05PhysicalOrder])
  })
})
