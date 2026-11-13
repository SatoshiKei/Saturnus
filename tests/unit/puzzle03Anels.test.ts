import { describe, expect, it } from 'vitest'
import {
  estimateTempoFromSelection,
  linkSources,
} from '../../src/forensic/forensicEngine'
import { INSPECTOR_TABS } from '../../src/forensic/forensicTypes'
import {
  puzzle03AnelsSession,
  puzzle03CorrectSetSourceId,
  puzzle03Timing,
} from '../../src/forensic/puzzles/puzzle03Anels'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { puzzle02IapetusSession } from '../../src/forensic/puzzles/puzzle02Iapetus'
import { getForensicSessionForEvidence } from '../../src/forensic/forensicRegistry'

const recording = puzzle03AnelsSession.sources[0]!

describe('Puzzle 03 — ANÉIS', () => {
  it('A — loads composed final asset path', () => {
    const stem = recording.audio?.stems.find((s) => s.id === 'FILE')
    expect(stem?.src).toBe('/assets/audio/forensic/puzzle03/rec_vtx_old_01_final.mp3')
  })

  it('B — player-facing source is only the composed file name', () => {
    expect(recording.filename).toBe('REC_VTX_OLD_01.m4a')
    const blob = JSON.stringify(recording)
    expect(blob).not.toMatch(/Give-Me-Everything|Hardtekk|club-crowd|DJ -/i)
  })

  it('C — has pre-DJ and post-DJ tempo regions', () => {
    const pre = recording.tempoRegions?.find((t) => t.id === 'pre')
    const post = recording.tempoRegions?.find((t) => t.id === 'post')
    expect(pre).toBeTruthy()
    expect(post).toBeTruthy()
    expect(pre!.endSec).toBeLessThan(puzzle03Timing.djStartSec)
    expect(post!.startSec).toBeGreaterThan(puzzle03Timing.djEndSec)
  })

  it('D — pre tempo ≈ 126', () => {
    const r = estimateTempoFromSelection(recording, { startSec: 10, endSec: 40 })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.bpm).toBeGreaterThanOrEqual(125.7)
      expect(r.bpm).toBeLessThanOrEqual(126.5)
    }
  })

  it('E — post tempo ≈ 128', () => {
    const r = estimateTempoFromSelection(recording, { startSec: 100, endSec: 140 })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.bpm).toBeGreaterThanOrEqual(127.5)
      expect(r.bpm).toBeLessThanOrEqual(128.5)
    }
  })

  it('F — DJ window matches timing metadata', () => {
    expect(puzzle03Timing.djDurationSec).toBeGreaterThan(18)
    expect(puzzle03Timing.djEndSec - puzzle03Timing.djStartSec).toBeCloseTo(
      puzzle03Timing.djDurationSec,
      2,
    )
  })

  it('G — ducking amount is configured', () => {
    expect(puzzle03Timing.duckAmount).toBeGreaterThan(0.2)
    expect(puzzle03Timing.duckAmount).toBeLessThan(0.7)
  })

  it('H — crowd / dataset has no narrative finding text', () => {
    const blob = JSON.stringify(puzzle03AnelsSession)
    expect(blob).not.toMatch(/Elisa|André|assassin|homicídio|cabine revel/i)
  })

  it('I/J/K — wrong candidates do not complete', () => {
    for (const id of ['set_vtx_20_a', 'set_vtx_20_b', 'set_vtx_20_d']) {
      const r = linkSources(puzzle03AnelsSession, 'rec_vtx_old_01', id)
      expect(r.complete).toBe(false)
      expect(r.message).toMatch(/do not fully correspond/i)
    }
  })

  it('L — Nico record completes', () => {
    const r = linkSources(puzzle03AnelsSession, 'rec_vtx_old_01', puzzle03CorrectSetSourceId)
    expect(r.ok).toBe(true)
    expect(r.complete).toBe(true)
    expect(r.linkedSetId).toBe(puzzle03CorrectSetSourceId)
  })

  it('M — no Elisa reveal in session', () => {
    expect(JSON.stringify(puzzle03AnelsSession)).not.toMatch(/Elisa|elisa/)
  })

  it('N — no Rings-specific inspector tabs', () => {
    const labels = INSPECTOR_TABS.map((t) => t.label)
    expect(labels).toEqual([
      'Process',
      'Analysis',
      'File',
      'Structure',
      'Packets',
      'Timing',
      'Spectrum',
      'Compare',
      'Notes',
    ])
    expect(labels.some((l) => /anel|rings|vertice set/i.test(l))).toBe(false)
  })

  it('O — puzzles 01 and 02 still registered', () => {
    expect(getForensicSessionForEvidence('emergency_call_raw')?.id).toBe(puzzle01CassiniSession.id)
    expect(getForensicSessionForEvidence('rafael_forward_from_mariana')?.id).toBe(
      puzzle02IapetusSession.id,
    )
    expect(getForensicSessionForEvidence('rec_vtx_old_01')?.id).toBe(puzzle03AnelsSession.id)
  })
})
