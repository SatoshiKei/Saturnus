import { describe, expect, it, beforeEach } from 'vitest'
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  DVR_CATALOG,
  DVR_RAW_STORAGE,
  MISSING_SEGMENT_ID,
  RING_CAMERAS,
  RING_CONTINUITY_FRAMES,
  RING_ROUTES,
  compareAudioFingerprints,
  compareFramePatterns,
  inspectCam11Structure,
  searchRawStorage,
} from '../../src/data/block08/ringsPuzzle'
import { MORSA_CCTV_BEATS } from '../../src/data/block08/morsaCctvBeats'
import { seedAchievements } from '../../src/data/game/seedAchievements'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { createInitialState } from '../../src/game/state/initialState'
import {
  __setStateForTests,
  getInvestigationState,
  resetGame,
} from '../../src/game/state/investigationStore'
import {
  onMorsaContinuityConfirmed,
  onRingsTimelineSolved,
} from '../../src/game/story/block08Handlers'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { puzzle09CassiniHuygensSession } from '../../src/forensic/puzzles/puzzle09CassiniHuygens'
import { getForensicSessionForEvidence } from '../../src/forensic/forensicRegistry'

const ROOT = resolve(__dirname, '../..')
const P10 = resolve(ROOT, 'src/assets/audios/p10')
const PUB = resolve(ROOT, 'public/assets/block08/rings/p10')
const AUDIO = resolve(ROOT, 'public/assets/audio/forensic/puzzle10')

const REQUIRED = [
  'BG-01 — rua de aproximação.png',
  'BG-02 — curva I transição.png',
  'BG-04 — corredor intermediário.png',
  'BG-05 — área final I asset já existente como destino.png',
  'SP-01 — masked-walk-away-1.png',
  'SP-01 — masked-walk-away-2.png',
  'SP-01 — masked-walk-away-3.png',
  'SP-01 — masked-walk-away-4.png',
  'SP-03 — masked-turn-look.png',
  'SP-04 — masked-enter-passage.png',
  'SP-05 — unmasked-emerge-1.png',
  'SP-05 — unmasked-emerge-2.png',
]

describe('Puzzle 10 — ORDEM DOS ANÉIS', () => {
  beforeEach(() => {
    resetGame()
    __setStateForTests(createInitialState())
  })

  it('A: required assets present; no BG-03', () => {
    for (const name of REQUIRED) {
      expect(existsSync(resolve(P10, name))).toBe(true)
      expect(existsSync(resolve(PUB, name))).toBe(true)
    }
    expect(readdirSync(P10).some((n) => /BG-03/i.test(n))).toBe(false)
    expect(existsSync(resolve(AUDIO, 'livia_protest_clip.wav'))).toBe(true)
    expect(existsSync(resolve(AUDIO, 'samuel_phone_clip.wav'))).toBe(true)
  }, 60_000)

  it('B/C: fingerprint Livia+Samuel matches; wrong pair fails', () => {
    const ok = compareAudioFingerprints('livia', 'samuel')
    expect(ok.match).toBe(true)
    expect(ok.score).toBeGreaterThan(0.85)
    const bad = compareAudioFingerprints('livia', 'secondary')
    expect(bad.match).toBe(false)
  })

  it('C: frame pattern B+C matches; wrong fails', () => {
    const ok = compareFramePatterns('samuel', 'secondary')
    expect(ok.match).toBe(true)
    const bad = compareFramePatterns('livia', 'samuel')
    expect(bad.match).toBe(false)
  })

  it('D/E: only service route compatible', () => {
    expect(RING_ROUTES.filter((r) => r.compatible)).toHaveLength(1)
    expect(RING_ROUTES.find((r) => r.compatible)?.id).toBe('service')
  })

  it('F/G/H/I/J: DVR gap and raw 1279', () => {
    const ids = DVR_CATALOG.map((s) => s.segmentId)
    expect(ids).toContain('CAM11_SEG_1278')
    expect(ids).toContain('CAM11_SEG_1280')
    expect(ids).not.toContain(MISSING_SEGMENT_ID)
    const struct = inspectCam11Structure()
    expect(struct.gapSec).toBe(60)
    expect(struct.expectedSegment).toBe(MISSING_SEGMENT_ID)
    const hits = searchRawStorage('1279')
    expect(hits.some((h) => h.segmentId === MISSING_SEGMENT_ID && !h.indexed)).toBe(true)
    expect(DVR_RAW_STORAGE.find((h) => h.segmentId === MISSING_SEGMENT_ID)?.thumbnailAmbiguous).toBe(
      true,
    )
  })

  it('K–O: cutscene frames — masked until CAM11 unmasked sprites', () => {
    expect(RING_CAMERAS.map((c) => c.id)).toEqual(['CAM 03', 'CAM 07', 'CAM 11'])
    expect(RING_CONTINUITY_FRAMES[0]!.masked).toBe(true)
    expect(RING_CONTINUITY_FRAMES[1]!.masked).toBe(true)
    expect(RING_CONTINUITY_FRAMES[2]!.masked).toBe(false)
    expect(RING_CONTINUITY_FRAMES[0]!.timeLabel).toBe('21:14:08')
    expect(RING_CONTINUITY_FRAMES[1]!.timeLabel).toBe('21:14:31')
    expect(RING_CONTINUITY_FRAMES[2]!.timeLabel).toBe('21:15:02')
    const nameBeat = MORSA_CCTV_BEATS.find((b) => b.kind === 'name')
    expect(nameBeat && nameBeat.kind === 'name' && nameBeat.text).toBe('André.')
    const preName = MORSA_CCTV_BEATS.slice(
      0,
      MORSA_CCTV_BEATS.findIndex((b) => b.kind === 'name'),
    )
    expect(preName.every((b) => b.kind !== 'name')).toBe(true)
    expect(
      JSON.stringify(preName).toLowerCase().includes('andré') ||
        JSON.stringify(preName).toLowerCase().includes('andre'),
    ).toBe(false)
  })

  it('P/Q: reveal registers morsa_was_andre; cameras locked without route', () => {
    const s0 = getInvestigationState()
    __setStateForTests({
      ...s0,
      flags: { ...s0.flags, block08_rings_available: true },
      evidenceOwned: [...s0.evidenceOwned, 'protest_heterogeneous_sources'],
      tasks: [...s0.tasks, { id: 'task_rings_puzzle', label: 'x', completed: false }],
    })
    expect(getInvestigationState().evidenceOwned.includes('morsa_was_andre')).toBe(false)
    onMorsaContinuityConfirmed()
    expect(getInvestigationState().flags.block08_morsa_continuity_confirmed).toBeFalsy()

    onRingsTimelineSolved()
    expect(getInvestigationState().flags.block08_rings_timeline_solved).toBe(true)
    expect(getInvestigationState().evidenceOwned.includes('morsa_was_andre')).toBe(false)

    onMorsaContinuityConfirmed()
    const s = getInvestigationState()
    expect(s.flags.block08_morsa_reveal_played).toBe(true)
    expect(s.evidenceOwned.includes('morsa_was_andre')).toBe(true)
    expect(s.locations.presidio?.status).not.toBe('visitAvailable')
  })

  it('R: puzzles 01/09 registry untouched; achievement exists', () => {
    expect(getForensicSessionForEvidence('emergency_call_raw')?.id ?? puzzle01CassiniSession.id).toBeTruthy()
    expect(puzzle09CassiniHuygensSession.completion?.kind).toBe('rtp-stream-separation')
    expect(getForensicSessionForEvidence('protest_heterogeneous_sources')).toBeNull()
    const ach = seedAchievements.find((a) => a.id === 'ach-ordem-aneis')!
    expect(ach.title).toBe('ORDEM DOS ANÉIS')
    expect(ach.description.toLowerCase()).not.toContain('andré')
    expect(ach.description.toLowerCase()).not.toContain('andre')
    const ev = seedEvidenceCatalog.find((e) => e.id === 'protest_heterogeneous_sources')!
    expect(ev.puzzleMeta?.implementation).toBe('full')
  })
})
