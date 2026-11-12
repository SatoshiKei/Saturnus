import { describe, expect, it, beforeEach } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  createInitialUiState,
  computeRtpOrderQuality,
  createDerivedRtpStream,
  evaluateRtpReconstruction,
  filterPacketRows,
  rtpStreamSeparationComplete,
  sortPacketRows,
} from '../../src/forensic/forensicEngine'
import { readFileSync } from 'node:fs'
import {
  mapPuzzle09Packets,
  puzzle09CassiniHuygensSession,
  puzzle09PacketCount,
  puzzle09RtpConfig,
  puzzle09SsrcA,
  puzzle09SsrcB,
} from '../../src/forensic/puzzles/puzzle09CassiniHuygens'
import { getForensicSessionForEvidence } from '../../src/forensic/forensicRegistry'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { puzzle08EnceladusSession } from '../../src/forensic/puzzles/puzzle08Enceladus'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { seedAchievements } from '../../src/data/game/seedAchievements'
import { seedDocuments } from '../../src/data/game/seedDocuments'
import {
  __setStateForTests,
  getInvestigationState,
  resetGame,
} from '../../src/game/state/investigationStore'
import { createInitialState } from '../../src/game/state/initialState'
import {
  unlockHenriqueDump,
  onCassiniSolved,
  finishCeciliaInterview,
} from '../../src/game/story/block07Handlers'
import { ceciliaBeats } from '../../src/data/block07/ceciliaInterview'

const ROOT = resolve(__dirname, '../..')
const PUBLIC = resolve(ROOT, 'public/assets/audio/forensic/puzzle09')
const SRC = resolve(ROOT, 'src/assets/audios/p9')
const cfg = puzzle09RtpConfig
const rows = mapPuzzle09Packets(
  (
    JSON.parse(
      readFileSync(resolve(ROOT, 'public/assets/audio/forensic/puzzle09/capture_meta.json'), 'utf8'),
    ) as { packets: Array<Record<string, unknown>> }
  ).packets,
)

describe('Puzzle 09 — CASSINI-HUYGENS', () => {
  beforeEach(() => {
    resetGame()
    __setStateForTests(createInitialState())
  })

  it('A: human assets + public capture exist', () => {
    expect(existsSync(resolve(SRC, 'H.V - Chamado.mp3'))).toBe(true)
    expect(existsSync(resolve(SRC, 'H.V - O Omitido.mp3'))).toBe(true)
    expect(existsSync(resolve(PUBLIC, 'hv_session_capture.pcap'))).toBe(true)
    expect(existsSync(resolve(PUBLIC, 'stream_a_reconstructed.wav'))).toBe(true)
    expect(existsSync(resolve(PUBLIC, 'stream_b_reconstructed.wav'))).toBe(true)
    expect(existsSync(resolve(PUBLIC, 'stream_b_capture_order.wav'))).toBe(true)
  })

  it('B: exactly two SSRCs; packet counts', () => {
    expect(puzzle09SsrcA).toBe('48A21C30')
    expect(puzzle09SsrcB).toBe('91F47B12')
    expect(puzzle09SsrcA).not.toBe(puzzle09SsrcB)
    expect(puzzle09PacketCount).toBe(rows.length)
    const ssrcs = [...new Set(rows.map((r) => r.ssrc))]
    expect(ssrcs.sort()).toEqual([puzzle09SsrcA, puzzle09SsrcB].sort())
    expect(rows.every((r) => r.protocol === 'RTP')).toBe(true)
  })

  it('C: PCAP comes from ticket path — not magic bancada', () => {
    const s0 = getInvestigationState()
    __setStateForTests({
      ...s0,
      flags: { ...s0.flags, block07_henrique_dump_unlocked: true },
    })
    expect(getInvestigationState().evidenceOwned.includes('henrique_rtp_capture')).toBe(false)
    unlockHenriqueDump()
    const s = getInvestigationState()
    expect(s.evidenceOwned.includes('henrique_rtp_capture')).toBe(true)
    expect(s.flags.block07_cassini_available).toBe(true)
    const ev = seedEvidenceCatalog.find((e) => e.id === 'henrique_rtp_capture')!
    expect(ev.displayFileName).toBe('hv_session_capture.pcap')
    const ticket = seedDocuments.find((d) => d.id === 'doc-henrique-incidente')!
    expect(ticket.blocks.some((b) => /pcap|captura/i.test(b.text))).toBe(true)
  })

  it('D: mixed reconstruction / capture order B fails; sequence B succeeds', () => {
    const aRows = filterPacketRows(rows, puzzle09SsrcA)
    const bRows = filterPacketRows(rows, puzzle09SsrcB)

    const mixedCreate = createDerivedRtpStream(
      rows,
      rows.map((r) => r.index),
      'index',
      1,
    )
    expect(mixedCreate.ok).toBe(false)

    const streamA = createDerivedRtpStream(
      rows,
      aRows.map((r) => r.index),
      'index',
      1,
    )
    expect(streamA.ok).toBe(true)
    const recA = evaluateRtpReconstruction(cfg, streamA.stream!, rows, 'sequence')
    expect(recA.ok).toBe(true)
    expect(recA.isStreamA).toBe(true)
    expect(recA.audioSrc).toContain('stream_a_reconstructed')

    const streamB = createDerivedRtpStream(
      rows,
      bRows.map((r) => r.index),
      'index',
      2,
    )
    expect(streamB.ok).toBe(true)
    const badB = evaluateRtpReconstruction(cfg, streamB.stream!, rows, 'index')
    expect(badB.ok).toBe(false)
    expect(badB.audioSrc).toContain('capture_order')
    expect(badB.quality).toBeLessThan(cfg.minOrderQuality)

    const goodB = evaluateRtpReconstruction(cfg, streamB.stream!, rows, 'sequence')
    expect(goodB.ok).toBe(true)
    expect(goodB.audioSrc).toContain('stream_b_reconstructed')
    expect(computeRtpOrderQuality(sortPacketRows(bRows, 'sequence'))).toBeGreaterThanOrEqual(0.99)
  })

  it('E: RTP timestamps coherent after sequence sort', () => {
    const b = sortPacketRows(filterPacketRows(rows, puzzle09SsrcB), 'sequence')
    for (let i = 1; i < Math.min(40, b.length); i++) {
      expect((b[i]!.rtpTimestamp ?? 0) > (b[i - 1]!.rtpTimestamp ?? 0)).toBe(true)
      expect((b[i]!.sequence ?? 0) - (b[i - 1]!.sequence ?? 0)).toBe(1)
    }
  })

  it('F: completion requires both streams; no Omitido naming in findings', () => {
    let ui = createInitialUiState(puzzle09CassiniHuygensSession)
    expect(rtpStreamSeparationComplete(puzzle09CassiniHuygensSession, ui)).toBe(false)
    ui = { ...ui, streamARecovered: true }
    expect(rtpStreamSeparationComplete(puzzle09CassiniHuygensSession, ui)).toBe(false)
    ui = { ...ui, streamBRecovered: true }
    expect(rtpStreamSeparationComplete(puzzle09CassiniHuygensSession, ui)).toBe(true)

    expect(cfg.findings.separated.toLowerCase()).not.toContain('omitido')
    expect(cfg.findings.anomalousKnowledge.toLowerCase()).not.toContain('omitido')
    const talk = seedEvidenceCatalog.find((e) => e.id === 'henrique_talked_to_contextual_system')!
    expect(talk.title.toLowerCase()).not.toContain('omitido')
  })

  it('G: Cecília does not deliver the call content', () => {
    const all = Object.values(ceciliaBeats).flat()
    expect(all.every((b) => !/pcap|rtp|omitido|reconstru/i.test(b.text))).toBe(true)
    const s0 = getInvestigationState()
    __setStateForTests({
      ...s0,
      flags: { ...s0.flags },
      locations: {
        ...s0.locations,
        'cecilia-casa': { ...(s0.locations['cecilia-casa'] ?? { id: 'cecilia-casa', status: 'visitAvailable' }) },
      },
    })
    finishCeciliaInterview()
    const s = getInvestigationState()
    expect(s.flags.block07_henrique_dump_unlocked).toBe(true)
    expect(s.flags.block07_cassini_done).toBeFalsy()
  })

  it('H: solve wires story; registry; puzzles 01/08 kinds untouched', () => {
    const s0 = getInvestigationState()
    __setStateForTests({
      ...s0,
      flags: { ...s0.flags, block07_cassini_available: true },
      evidenceOwned: [...s0.evidenceOwned, 'henrique_rtp_capture'],
      tasks: [
        ...s0.tasks,
        { id: 'task_cassini_puzzle', label: 'x', completed: false },
      ],
    })
    onCassiniSolved()
    const s = getInvestigationState()
    expect(s.flags.block07_cassini_done).toBe(true)
    expect(s.evidenceOwned.includes('henrique_two_rtp_sessions')).toBe(true)

    expect(getForensicSessionForEvidence('henrique_rtp_capture')?.id).toBe(
      'puzzle-09-cassini-huygens',
    )
    expect(puzzle09CassiniHuygensSession.completion?.kind).toBe('rtp-stream-separation')
    expect(puzzle01CassiniSession.completion?.kind).toBe('speech-recovery')
    expect(puzzle08EnceladusSession.completion?.kind).toBe('cycle-difference')

    const ach = seedAchievements.find((a) => a.id === 'ach-cassini-huygens')!
    expect(ach.title).toBe('CASSINI-HUYGENS')
    expect(ach.unlocked({ ...createInitialState(), flags: { block07_cassini_done: true } } as never)).toBe(
      true,
    )
  })
})
