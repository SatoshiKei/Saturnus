import { describe, expect, it, beforeEach } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  CASSINI_DERIVED_META,
  CASE_MEDIA_CORPUS,
  MEMORY_DURATION_SEC,
  MEMORY_FINAL_SRC,
  MEMORY_REGIONS,
  MEMORY_SCORES,
  MEMORY_WORD,
  isMemoryProvenanceComplete,
  isTemporalImpossibility,
  searchCaseMedia,
} from '../../src/data/block09/memoryPuzzle'
import { seedAchievements } from '../../src/data/game/seedAchievements'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { createInitialState } from '../../src/game/state/initialState'
import {
  __setStateForTests,
  getInvestigationState,
  resetGame,
} from '../../src/game/state/investigationStore'
import { onMemoryPuzzleSolved } from '../../src/game/story/block09Handlers'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { puzzle11SaturnRotation } from '../../src/forensic/puzzles/puzzle11SaturnRotation'
import meta from '../../src/forensic/puzzles/puzzle12Meta.json'

const ROOT = resolve(__dirname, '../..')
const P1 = resolve(ROOT, 'src/assets/audios/p1')
const CLEAN = resolve(ROOT, 'tools/audio/out/puzzle01_reference_clean.wav')
const PUB = resolve(ROOT, 'public/assets/audio/forensic/puzzle12')
const DEBUG = resolve(ROOT, 'tools/audio/out/puzzle12_debug')
const DERIVED = resolve(ROOT, 'public/assets/audio/forensic/puzzle09/stream_b_reconstructed.wav')

describe('Puzzle 12 — MEMÓRIA', () => {
  beforeEach(() => {
    resetGame()
    __setStateForTests(createInitialState())
  })

  it('A: nenhum TTS — carrier usa clips p1 + clean master', () => {
    expect(meta.carrier.noTts).toBe(true)
    expect(String(meta.carrier.kind)).toMatch(/puzzle01/)
    for (const clip of meta.carrier.clips as string[]) {
      expect(existsSync(resolve(ROOT, clip))).toBe(true)
    }
    expect(existsSync(CLEAN)).toBe(true)
    expect(existsSync(resolve(P1, 'mariana escute isso até o fim.mp3'))).toBe(true)
  })

  it('B/C: final message existe e tem duração plausível', () => {
    expect(existsSync(resolve(PUB, 'memory_final_message.wav'))).toBe(true)
    expect(MEMORY_FINAL_SRC).toContain('puzzle12/memory_final_message.wav')
    expect(MEMORY_DURATION_SEC).toBeGreaterThan(8)
    expect(MEMORY_DURATION_SEC).toBeLessThan(12)
  })

  it('D: UI data não expõe quatro caixas pré-rotuladas como mecanismo', () => {
    // regiões existem internamente; Search Case Media não lista TRECHO A–D
    expect(MEMORY_REGIONS).toHaveLength(4)
    expect(CASE_MEDIA_CORPUS.every((m) => !/^TRECHO [A-D]$/.test(m.label))).toBe(true)
  })

  it('E–H: fingerprints canônicos batem nas quatro fontes', () => {
    expect(MEMORY_SCORES.A_apartment).toBeGreaterThanOrEqual(0.55)
    expect(MEMORY_SCORES.B_emergency).toBeGreaterThanOrEqual(0.55)
    expect(MEMORY_SCORES.C_enceladus).toBeGreaterThanOrEqual(0.55)
    expect(MEMORY_SCORES.D_cassini_derived).toBeGreaterThanOrEqual(0.55)
  })

  it('I: região D não tem o mesmo fingerprint no capture-order', () => {
    expect(MEMORY_SCORES.D_cassini_derived).toBeGreaterThan(MEMORY_SCORES.D_vs_capture_order)
    expect(MEMORY_SCORES.D_vs_capture_order).toBeLessThan(0.85)
  })

  it('J: output Cassini tem hash/timestamp reais', () => {
    expect(existsSync(DERIVED)).toBe(true)
    expect(CASSINI_DERIVED_META.sha256.length).toBe(64)
    expect(CASSINI_DERIVED_META.createdAt).toMatch(/^\d{4}-/)
    expect(CASSINI_DERIVED_META.kind).toMatch(/derived/i)
  })

  it('K: seleção larga/errada não resolve', () => {
    const derived = {
      'cassini-stream-b': {
        contentHash: 'runtime-hash-test',
        createdAtMs: 1_700_000_000_000,
        audioSrc: CASSINI_DERIVED_META.publicUrl,
      },
    }
    const wide = searchCaseMedia(0.2, 8.5, derived)
    expect(wide.every((h) => !h.strong)).toBe(true)
    const wrong = searchCaseMedia(2.2, 2.7, derived)
    expect(wrong.every((h) => !h.strong)).toBe(true)
  })

  it('L/M: Search confirma cada proveniência com artifact runtime; D exige persistência', () => {
    const regionD = MEMORY_REGIONS.find((r) => r.id === 'D')!
    const without = searchCaseMedia(regionD.start, regionD.end)
    expect(without.every((h) => !(h.strong && h.source === 'cassini_derived'))).toBe(true)

    const derived = {
      'cassini-stream-b': {
        contentHash: 'runtime-hash-test',
        createdAtMs: 1_700_000_000_000,
        audioSrc: CASSINI_DERIVED_META.publicUrl,
      },
    }
    const confirmed = new Set<
      'apartment' | 'emergency' | 'enceladus' | 'cassini_derived'
    >()
    for (const r of MEMORY_REGIONS) {
      const hits = searchCaseMedia(r.start, r.end, derived)
      const strong = hits.find((h) => h.strong && h.source === r.source)
      expect(strong).toBeTruthy()
      confirmed.add(r.source)
      expect(isMemoryProvenanceComplete(confirmed)).toBe(confirmed.size === 4)
    }
  })

  it('PCAP original ≠ fingerprint D; derived artifact correto = fingerprint D', () => {
    const regionD = MEMORY_REGIONS.find((r) => r.id === 'D')!
    const derived = {
      'cassini-stream-b': {
        contentHash: 'deadbeef0001',
        createdAtMs: 1_700_000_000_000,
        audioSrc: '/assets/audio/forensic/puzzle09/stream_b_reconstructed.wav',
      },
    }
    const hits = searchCaseMedia(regionD.start, regionD.end, derived)
    const pcap = hits.find((h) => h.mediaId === 'media-cassini-pcap')
    const capture = hits.find((h) => h.mediaId === 'media-cassini-capture')
    const art = hits.find((h) => h.mediaId === 'media-cassini-derived')
    expect(pcap?.strong).toBe(false)
    expect(capture?.strong).toBe(false)
    expect(art?.strong).toBe(true)
    expect(art?.sha256).toBe('deadbeef0001')
    expect(pcap?.score ?? 0).toBeLessThan(art?.score ?? 0)
  })

  it('N/O: impossibilidade temporal só com D; complete depois', () => {
    const partial = new Set(['apartment', 'emergency', 'enceladus'] as const)
    expect(isTemporalImpossibility(new Set(partial))).toBe(false)
    expect(isMemoryProvenanceComplete(new Set(partial))).toBe(false)
    const full = new Set(['apartment', 'emergency', 'enceladus', 'cassini_derived'] as const)
    expect(isTemporalImpossibility(new Set(full))).toBe(true)
    expect(isMemoryProvenanceComplete(new Set(full))).toBe(true)
    onMemoryPuzzleSolved()
    const s = getInvestigationState()
    expect(s.flags.block09_memory_done).toBe(true)
    expect(s.evidenceOwned).toContain('final_audio_impossible_provenance')
    const ach = seedAchievements.find((a) => a.id === 'ach-memoria')!
    expect(ach.title).toBe(MEMORY_WORD)
    expect(ach.unlocked(s)).toBe(true)
  })

  it('DEBUG outputs presentes', () => {
    for (const name of [
      'final_message.wav',
      'isolated_region_A.wav',
      'isolated_region_B.wav',
      'isolated_region_C.wav',
      'isolated_region_D.wav',
      'source_comparison_A.wav',
      'source_comparison_B.wav',
      'source_comparison_C.wav',
      'source_comparison_D.wav',
      'provenance_report.json',
    ]) {
      expect(existsSync(resolve(DEBUG, name))).toBe(true)
    }
    const report = JSON.parse(readFileSync(resolve(DEBUG, 'provenance_report.json'), 'utf8'))
    expect(report.regions.D.source).toBe('cassini_derived')
  })

  it('P: puzzles 01 e 11 intactos + evidence full', () => {
    expect(puzzle01CassiniSession.id).toBeTruthy()
    expect(puzzle11SaturnRotation.expectedVehicle).toBe('VTR-14')
    const ev = seedEvidenceCatalog.find((e) => e.id === 'mariana_recent_recording_claim')!
    expect(ev.puzzleMeta?.implementation).toBe('full')
    expect(ev.audioSrc).toContain('puzzle12')
  })
})
