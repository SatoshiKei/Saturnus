import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  createInitialUiState,
  spectrogramSurveyComplete,
} from '../../src/forensic/forensicEngine'
import { computeSpectrogramFromSamples } from '../../src/forensic/forensicMix'
import {
  puzzle06ExpectedPin,
  puzzle06ExpectedSymbols,
  puzzle06FileOrder,
  puzzle06HexagonSession,
} from '../../src/forensic/puzzles/puzzle06Hexagon'
import { getForensicSessionForEvidence } from '../../src/forensic/forensicRegistry'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { puzzle02IapetusSession } from '../../src/forensic/puzzles/puzzle02Iapetus'
import { puzzle03AnelsSession } from '../../src/forensic/puzzles/puzzle03Anels'
import { puzzle04JanusSession } from '../../src/forensic/puzzles/puzzle04Janus'
import { puzzle05SaturnaliaSession } from '../../src/forensic/puzzles/puzzle05Saturnalia'
import {
  HEX_EVIDENCE_IDS,
  HEX_FILES,
  HEX_PIN,
  expectedPinFromSymbols,
} from '../../src/data/block04/hexagonPuzzle'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { seedAchievements } from '../../src/data/game/seedAchievements'
import {
  __setStateForTests,
  getInvestigationState,
  resetGame,
  tryDiaryPin,
} from '../../src/game/state/investigationStore'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { runStoryEngine } from '../../src/game/story/engine'
import { block04EntryActions } from '../../src/game/story/block04DevCheckpoints'
import {
  onHexagonSolved,
  onHexCallsPreserved,
  runHexagonSpectrogramSurvey,
} from '../../src/game/story/block04Handlers'
import { dispatchActions } from '../../src/game/state/investigationStore'

const ROOT = resolve(__dirname, '../..')
const PUBLIC = resolve(ROOT, 'public/assets/audio/forensic/puzzle06')
const DEBUG = resolve(ROOT, 'tools/audio/out/puzzle06_debug')
const TIMING = resolve(ROOT, 'tools/audio/out/puzzle06_timing.json')

function readWavPcm16(path: string): { sampleRate: number; samples: Float32Array; durationSec: number } {
  const buf = readFileSync(path)
  const sampleRate = buf.readUInt32LE(24)
  const bits = buf.readUInt16LE(34)
  expect(bits).toBe(16)
  let dataOffset = 12
  while (dataOffset < buf.length - 8) {
    const id = buf.toString('ascii', dataOffset, dataOffset + 4)
    const size = buf.readUInt32LE(dataOffset + 4)
    if (id === 'data') {
      dataOffset += 8
      const pcm = buf.subarray(dataOffset, dataOffset + size)
      const samples = new Float32Array(pcm.length / 2)
      for (let i = 0; i < samples.length; i++) samples[i] = pcm.readInt16LE(i * 2) / 32768
      return { sampleRate, samples, durationSec: samples.length / sampleRate }
    }
    dataOffset += 8 + size + (size % 2)
  }
  throw new Error(`no data chunk in ${path}`)
}

function bandEnergy(samples: Float32Array, sr: number, f0: number, f1: number): number {
  const n = Math.min(4096, samples.length)
  const re = new Float64Array(n)
  const im = new Float64Array(n)
  for (let i = 0; i < n; i++) re[i] = samples[i]!
  // naive DFT magnitude sum in band
  let e = 0
  const k0 = Math.floor((f0 / sr) * n)
  const k1 = Math.floor((f1 / sr) * n)
  for (let k = k0; k <= k1; k++) {
    let srSum = 0
    let siSum = 0
    const ang = (-2 * Math.PI * k) / n
    for (let t = 0; t < n; t++) {
      const a = ang * t
      srSum += re[t]! * Math.cos(a)
      siSum += re[t]! * Math.sin(a)
    }
    e += srSum * srSum + siSum * siSum
  }
  return e / Math.max(1, k1 - k0 + 1)
}

describe('Puzzle 06 — HEXÁGONO', () => {
  it('exactly 6 WAV assets with distinct durations', () => {
    const files = readdirSync(PUBLIC).filter((f) => f.endsWith('.wav'))
    expect(files.sort()).toEqual([
      'UNK_01.wav',
      'UNK_02.wav',
      'UNK_03.wav',
      'UNK_04.wav',
      'UNK_05.wav',
      'UNK_06.wav',
    ])
    const durs = HEX_FILES.map((f) => {
      const w = readWavPcm16(resolve(PUBLIC, f.displayName))
      expect(Math.abs(w.durationSec - f.durationSec)).toBeLessThan(0.15)
      return w.durationSec
    })
    expect(new Set(durs.map((d) => d.toFixed(1))).size).toBe(6)
  })

  it('DEBUG spectrograms exist for all six', () => {
    for (const id of puzzle06FileOrder) {
      expect(existsSync(resolve(DEBUG, `${id}_spectrogram.png`))).toBe(true)
    }
  })

  it('roman mapping yields PIN 481526; finding does not spoiler PIN', () => {
    expect(expectedPinFromSymbols()).toBe('481526')
    expect(puzzle06ExpectedPin).toBe(HEX_PIN)
    expect(Object.values(puzzle06ExpectedSymbols)).toEqual(['IV', 'VIII', 'I', 'V', 'II', 'VI'])
    const finding = seedEvidenceCatalog.find((e) => e.id === 'hex_spectral_patterns')
    expect(finding?.description).toMatch(/padrões espectrais deliberadamente estruturados/i)
    expect(finding?.description).not.toMatch(/481526/)
  })

  it('all load in ForensicWorkbench registry; survey completes only after 6 spectrograms', () => {
    for (const id of HEX_EVIDENCE_IDS) {
      expect(getForensicSessionForEvidence(id)?.id).toBe('puzzle-06-hexagon')
    }
    expect(puzzle06HexagonSession.sources.filter((s) => s.audio)).toHaveLength(6)
    const ui = createInitialUiState(puzzle06HexagonSession)
    expect(spectrogramSurveyComplete(puzzle06HexagonSession, ui)).toBe(false)
    ui.spectrogramViewedSourceIds = [...puzzle06FileOrder]
    expect(spectrogramSurveyComplete(puzzle06HexagonSession, ui)).toBe(true)
  })

  it('I/V band energy and motif counts match distribution', () => {
    const meta = JSON.parse(readFileSync(TIMING, 'utf8')) as {
      files: Array<{ id: string; motifs: Array<{ kind: string }> }>
    }
    const byId = Object.fromEntries(meta.files.map((f) => [f.id, f]))
    for (const f of HEX_FILES) {
      const motifs = byId[f.id]!.motifs
      expect(motifs.filter((m) => m.kind === 'I')).toHaveLength(f.iCount)
      expect(motifs.filter((m) => m.kind === 'V')).toHaveLength(f.vCount)
      const wav = readWavPcm16(resolve(PUBLIC, f.displayName))
      const mid = bandEnergy(wav.samples, wav.sampleRate, 1600, 4800)
      const low = bandEnergy(wav.samples, wav.sampleRate, 40, 800)
      expect(mid).toBeGreaterThan(0)
      expect(low).toBeGreaterThan(0)
    }
    // UNK_04 no I; UNK_03/05 no V
    expect(byId.UNK_04!.motifs.every((m) => m.kind !== 'I')).toBe(true)
    expect(byId.UNK_03!.motifs.every((m) => m.kind !== 'V')).toBe(true)
    expect(byId.UNK_05!.motifs.every((m) => m.kind !== 'V')).toBe(true)
  })

  it('measured STFT returns real energy (not empty canvas)', () => {
    const wav = readWavPcm16(resolve(PUBLIC, 'UNK_04.wav'))
    const spec = computeSpectrogramFromSamples(
      [{ data: wav.samples, gain: 1, startSec: 0 }],
      wav.durationSec,
      wav.sampleRate,
      { cols: 64, rows: 32, maxHz: 6000 },
    )
    expect(spec.values.length).toBe(64 * 32)
    expect(spec.values.some((v) => v > 0.4)).toBe(true)
    expect(spec.values.every((v) => v === 1)).toBe(false)
  })

  it('WAV payloads do not contain spoken digit tokens', () => {
    for (const f of HEX_FILES) {
      const raw = readFileSync(resolve(PUBLIC, f.displayName))
      const ascii = raw.toString('latin1')
      expect(ascii).not.toMatch(/quatro|oito|um|cinco|dois|seis|four|eight|481526/i)
    }
  })

  it('PIN keypad: wrong fails, 481526 unlocks after forensics access', () => {
    resetGame()
    __setStateForTests(runStoryEngine(applyStoryActions(createInitialState(), block04EntryActions)))
    onHexCallsPreserved()
    onHexagonSolved()
    expect(tryDiaryPin(HEX_PIN)).toBe('locked')
    dispatchActions([
      { type: 'setFlag', id: 'block04_forensics_access', value: true },
      { type: 'setFlag', id: 'block04_diary_icon_revealed', value: true },
    ])
    expect(tryDiaryPin('000000')).toBe('wrong')
    expect(tryDiaryPin(HEX_PIN)).toBe('unlocked')
    expect(getInvestigationState().phones.mariana.diaryUnlocked).toBe(true)
  })

  it('spectrogram survey ≠ solved; PIN 481526 marks hexagon done + achievement', () => {
    const ach = seedAchievements.find((a) => a.id === 'ach-hexagon')
    expect(ach?.title).toBe('HEXÁGONO')
    resetGame()
    __setStateForTests(runStoryEngine(applyStoryActions(createInitialState(), block04EntryActions)))
    onHexCallsPreserved()
    runHexagonSpectrogramSurvey()
    let s = getInvestigationState()
    expect(s.flags.block04_hex_spectrograms_inspected).toBe(true)
    expect(s.flags.block04_hexagon_done).toBeFalsy()
    expect(ach!.unlocked(s)).toBe(false)
    dispatchActions([
      { type: 'setFlag', id: 'block04_forensics_access', value: true },
      { type: 'setFlag', id: 'block04_diary_icon_revealed', value: true },
    ])
    expect(tryDiaryPin(HEX_PIN)).toBe('unlocked')
    s = getInvestigationState()
    expect(s.flags.block04_hexagon_done).toBe(true)
    expect(ach!.unlocked(s)).toBe(true)
  })

  it('Puzzles 01–05 sessions remain registered', () => {
    expect(puzzle01CassiniSession.id).toBeTruthy()
    expect(puzzle02IapetusSession.id).toBeTruthy()
    expect(puzzle03AnelsSession.id).toBeTruthy()
    expect(puzzle04JanusSession.id).toBeTruthy()
    expect(puzzle05SaturnaliaSession.id).toBeTruthy()
    expect(getForensicSessionForEvidence(puzzle01CassiniSession.evidenceId!)?.id).toBe(
      puzzle01CassiniSession.id,
    )
    expect(getForensicSessionForEvidence(puzzle05SaturnaliaSession.evidenceId!)?.id).toBe(
      puzzle05SaturnaliaSession.id,
    )
  })
})
