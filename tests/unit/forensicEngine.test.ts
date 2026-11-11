import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  alwaysAvailableTabs,
  captureNoiseProfile,
  classifyNoiseProfile,
  computeStemGains,
  createInitialUiState,
  notchToneEffect,
  profileQualityScore,
  resetProcess,
  spectralStemGains,
  toneStemGain,
  transcriptionComplete,
  voiceSpansFromSource,
} from '../../src/forensic/forensicEngine'
import { measureRms, renderBackgroundNoise, renderTone } from '../../src/forensic/forensicMix'
import { DEFAULT_PROCESS } from '../../src/forensic/forensicTypes'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { INSPECTOR_TABS } from '../../src/forensic/forensicTypes'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'

const src = puzzle01CassiniSession.sources[0]!
const rule = src.audio!.notch!
const spectral = src.audio!.spectral!
const spans = voiceSpansFromSource(src)

describe('forensic workbench — permanent tabs', () => {
  it('exposes all inspector tabs regardless of puzzle', () => {
    const tabs = alwaysAvailableTabs()
    expect(tabs).toEqual(INSPECTOR_TABS.map((t) => t.id))
    expect(tabs).toContain('structure')
    expect(tabs).toContain('packets')
    expect(tabs).toContain('compare')
  })

  it('WAV source keeps empty structure/packets messages — does not hide tabs', () => {
    expect(src.type).toBe('audio')
    expect(src.structure?.emptyMessage).toMatch(/estrutura/i)
    expect(src.packets?.emptyMessage).toMatch(/pacotes/i)
    expect(src.structure?.blocks).toBeUndefined()
    expect(src.packets?.rows).toBeUndefined()
  })
})

describe('puzzle 1 dataset', () => {
  const voice = src.audio!.stems.find((s) => s.kind === 'clips')!

  it('loads five real assets on a 44s master the player sees as one file', () => {
    expect(src.durationSec).toBe(44)
    expect(src.filename).toBe('EMG_0803.wav')
    expect(puzzle01CassiniSession.sources).toHaveLength(1)
    expect(src.tracks?.filter((t) => t.visible).map((t) => t.name)).toEqual(['MASTER'])
    expect(src.tracks?.some((t) => /VOICE|NOISE|TONE|DEBRIS|CLICK/i.test(t.name))).toBe(false)
    expect(voice.clips).toHaveLength(5)
    expect(voice.clips?.map((c) => c.startSec)).toEqual([4, 12.5, 22, 29.5, 38.5])
    expect(voice.clips?.map((c) => c.gainDb)).toEqual([-18, -20, -15, -17, -13])
    for (const clip of voice.clips ?? []) {
      const rel = clip.src.replace(/^\//, '')
      expect(rel.startsWith('assets/audio/forensic/puzzle01/')).toBe(true)
      expect(fs.existsSync(path.join(process.cwd(), 'public', rel))).toBe(true)
    }
    const blob = JSON.stringify(puzzle01CassiniSession)
    expect(blob).not.toMatch(/puzzle01_final|SATURNUS_Puzzle01/)
    expect(blob).not.toMatch(/Augusto|Rui|Elisa|você não lembra/)
    expect(puzzle01CassiniSession.completion?.onCompleteAction).toBe('runProvisionalEmergencyAnalysis')
  })

  it('keeps internal stems out of the visible mixer and off the speech for clicks', () => {
    const ids = src.audio!.stems.map((s) => s.id)
    expect(ids).toEqual(['VOICE', 'BACKGROUND_NOISE', 'TONE_1700', 'VOCAL_DEBRIS', 'CLICKS'])
    const debris = src.audio!.stems.find((s) => s.kind === 'debris')!
    for (const frag of debris.fragments ?? []) {
      expect(frag.durationMs).toBeGreaterThanOrEqual(40)
      expect(frag.durationMs).toBeLessThanOrEqual(120)
      const f0 = frag.timelineSec
      const f1 = frag.timelineSec + frag.durationMs / 1000
      for (const span of spans) {
        const overlap = Math.min(f1, span.endSec) - Math.max(f0, span.startSec)
        expect(overlap).toBeLessThanOrEqual(0)
      }
    }
    const clicks = src.audio!.stems.find((s) => s.kind === 'clicks')!
    for (const ev of clicks.events ?? []) {
      for (const span of spans) {
        expect(ev.timeSec < span.startSec || ev.timeSec > span.endSec).toBe(true)
      }
    }
    const pre = src.noiseRegions!.find((r) => r.id === 'pre')!
    expect(pre.startSec).toBeCloseTo(0.3)
    expect(pre.endSec).toBeCloseTo(2)
    const wave = src.audio!.waveform!
    expect(Math.min(...wave)).toBeGreaterThan(0.04)
    const spec = src.audio!.spectrum!
    let maxI = 0
    spec.magnitudes.forEach((m, i) => {
      if (m > spec.magnitudes[maxI]!) maxI = i
    })
    expect(spec.frequencies[maxI]).toBe(1700)
    const sg = src.audio!.spectrogram!
    const rowHz = (r: number) => (r / (sg.rows - 1)) * sg.maxHz
    let toneRow = 0
    let best = Infinity
    for (let r = 0; r < sg.rows; r++) {
      const d = Math.abs(rowHz(r) - 1700)
      if (d < best) {
        best = d
        toneRow = r
      }
    }
    const mean = (r: number) => {
      let s = 0
      for (let c = 0; c < sg.cols; c++) s += sg.values[r * sg.cols + c]!
      return s / sg.cols
    }
    expect(mean(toneRow)).toBeGreaterThan(mean(1) * 2)
    expect(JSON.stringify(sg)).not.toMatch(/interference|REMOVE THIS/i)
  })

  it('registers the five phrases on the existing restored evidence without the later context', () => {
    const restored = seedEvidenceCatalog.find((e) => e.id === 'emergency_call_restored')
    expect(restored?.description).toMatch(/escute isso até o fim/)
    expect(restored?.description).toMatch(/desde aquela noite/)
    expect(restored?.description).toMatch(/eu sentia medo/)
    expect(restored?.description).toMatch(/eu estava confusa/)
    expect(restored?.description).toMatch(/eu não lembro/)
    expect(restored?.description).not.toMatch(/Augusto|Rui|Elisa|você não lembra/)
    expect(restored?.description).not.toMatch(/eu preciso|ele tá aqui/)
  })
})

describe('forensic notch / stems', () => {
  it('notch far from the target does not meaningfully reduce the tone stem', () => {
    expect(notchToneEffect(900, -18, 160, rule)).toBeLessThan(0.05)
    expect(notchToneEffect(2500, -24, 180, rule)).toBeLessThan(0.05)
    const g = toneStemGain(
      0.55,
      { ...DEFAULT_PROCESS, notchCenterHz: 900, notchReductionDb: -18, notchWidthHz: 160 },
      rule,
    )
    expect(g).toBeGreaterThan(0.55 * 0.9)
  })

  it('notch near the target reduces the tone stem, and width changes how much', () => {
    expect(notchToneEffect(1700, -18, 160, rule)).toBeGreaterThan(0.9)
    expect(notchToneEffect(1650, -18, 160, rule)).toBeGreaterThan(0.9)
    expect(notchToneEffect(1600, -18, 160, rule)).toBeGreaterThan(0.7)
    expect(notchToneEffect(1850, -18, 160, rule)).toBeGreaterThan(0.4)
    const partial = notchToneEffect(1500, -18, 160, rule)
    expect(partial).toBeGreaterThan(0.25)
    expect(partial).toBeLessThan(0.55)
    expect(notchToneEffect(1880, -18, 160, rule)).toBeLessThan(notchToneEffect(1700, -18, 160, rule))
    const narrow = notchToneEffect(1700, -18, 160, rule)
    const wide = notchToneEffect(1700, -18, 1400, rule)
    expect(wide).toBeGreaterThan(0)
    expect(wide).toBeLessThan(narrow * 0.5)
    const g = toneStemGain(
      1,
      { ...DEFAULT_PROCESS, notchCenterHz: 1700, notchReductionDb: -18, notchWidthHz: 160 },
      rule,
    )
    expect(g).toBeLessThan(0.05)
  })

  it('zero reduction does not duck the tone', () => {
    expect(notchToneEffect(1700, 0, 160, rule)).toBe(0)
  })
})

describe('noise profile + spectral reduction', () => {
  const regions = src.noiseRegions!

  it('requires selection to capture profile', () => {
    const r = captureNoiseProfile(null, regions, [])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('no-selection')
  })

  it('good vs contaminated profiles differ', () => {
    expect(classifyNoiseProfile({ startSec: 0.2, endSec: 3.2 }, regions)).toBe('good')
    expect(classifyNoiseProfile({ startSec: 4.0, endSec: 7.0 }, regions)).toBe('contaminated')
    const good = profileQualityScore({ startSec: 0.3, endSec: 2 }, spans)
    const bad = profileQualityScore({ startSec: 4, endSec: 6.5 }, spans)
    expect(good).toBeGreaterThan(0.9)
    expect(bad).toBeLessThan(0.35)
    expect(good).toBeGreaterThan(bad)
  })

  it('spectral reduction without profile applies no noise cut', () => {
    const g = spectralStemGains({ ...DEFAULT_PROCESS, spectralReduction: 100 }, null, spectral)
    expect(g.noiseGain).toBe(1)
    expect(g.voiceClarity).toBe(1)
    expect(g.debrisGain).toBe(1)
  })

  it('good profile reduces noise more than contaminated; contaminated hurts voice', () => {
    const proc = { ...DEFAULT_PROCESS, spectralReduction: 100 }
    const good = spectralStemGains(
      proc,
      { id: 'g', name: 'P1', startSec: 0, endSec: 3, quality: 'good', qualityScore: 1, capturedAt: 1 },
      spectral,
    )
    const bad = spectralStemGains(
      proc,
      {
        id: 'b',
        name: 'P2',
        startSec: 4,
        endSec: 7,
        quality: 'contaminated',
        qualityScore: 0.2,
        capturedAt: 1,
      },
      spectral,
    )
    expect(good.noiseGain).toBeLessThan(bad.noiseGain)
    expect(good.noiseGain).toBeGreaterThan(0.1)
    expect(good.debrisGain).toBeLessThan(1)
    expect(good.debrisGain).toBeGreaterThan(0.15)
    expect(good.voiceClarity).toBe(1)
    expect(bad.voiceClarity).toBeLessThan(1)
    expect(bad.voiceClarity).toBeLessThan(good.voiceClarity)
  })
})

describe('mixer primitives', () => {
  const base = {
    VOICE: 1,
    BACKGROUND_NOISE: 1,
    TONE_1700: 0.059,
    VOCAL_DEBRIS: 0.7,
    CLICKS: 0.38,
  } as const

  it('gain scales stem masters', () => {
    const g = computeStemGains(base, { ...DEFAULT_PROCESS, gainDb: 6 }, null)
    expect(g.VOICE).toBeCloseTo(Math.pow(10, 6 / 20), 4)
  })

  it('mute / solo track runtime flags are independent of process', () => {
    const ui = createInitialUiState(puzzle01CassiniSession)
    const id = Object.keys(ui.tracks)[0]!
    ui.tracks[id]!.mute = true
    expect(ui.tracks[id]!.mute).toBe(true)
    ui.tracks[id]!.solo = true
    expect(ui.tracks[id]!.solo).toBe(true)
    expect(ui.playbackRate).toBe(1)
    ui.playbackRate = 0.75
    expect(ui.playbackRate).toBe(0.75)
  })

  it('bypass restores the raw mix and keeps the parameter values', () => {
    const process = {
      ...DEFAULT_PROCESS,
      bypass: true,
      notchCenterHz: 1700,
      notchWidthHz: 140,
      notchReductionDb: -24,
      spectralReduction: 60,
      gainDb: 6,
    }
    const profile = {
      id: 'g',
      name: 'P',
      startSec: 0.3,
      endSec: 2,
      quality: 'good' as const,
      qualityScore: 1,
      capturedAt: 1,
    }
    const g = computeStemGains(base, process, profile, { notch: rule, spectral })
    expect(g.TONE_1700).toBeCloseTo(base.TONE_1700, 5)
    expect(g.BACKGROUND_NOISE).toBeCloseTo(base.BACKGROUND_NOISE, 5)
    expect(g.VOICE).toBeCloseTo(base.VOICE, 5)
    expect(process.notchCenterHz).toBe(1700)
    expect(process.spectralReduction).toBe(60)
    expect(process.gainDb).toBe(6)
  })
})

describe('session reset + transcription', () => {
  it('reset restores process, profile and markers without clearing notes', () => {
    const ui = createInitialUiState(puzzle01CassiniSession)
    ui.process.notchCenterHz = 1700
    ui.process.notchReductionDb = -18
    ui.process.spectralReduction = 40
    ui.markers = [{ id: 'm', timeSec: 4, label: 'x' }]
    ui.noiseProfiles = [
      {
        id: 'x',
        name: 'P',
        startSec: 0,
        endSec: 1,
        quality: 'good',
        qualityScore: 1,
        capturedAt: 1,
      },
    ]
    ui.activeNoiseProfileId = 'x'
    ui.transcriptionNotes = 'rascunho'
    const reset = resetProcess(ui)
    expect(reset.process.notchReductionDb).toBe(0)
    expect(reset.process.notchCenterHz).toBe(DEFAULT_PROCESS.notchCenterHz)
    expect(reset.process.spectralReduction).toBe(0)
    expect(reset.noiseProfiles).toHaveLength(0)
    expect(reset.activeNoiseProfileId).toBeNull()
    expect(reset.markers).toEqual([])
    expect(reset.transcriptionNotes).toBe('rascunho')
    const base = {
      VOICE: 1,
      BACKGROUND_NOISE: 1,
      TONE_1700: 0.059,
      VOCAL_DEBRIS: 1,
      CLICKS: 1,
    }
    const restored = computeStemGains(base, reset.process, null, { notch: rule, spectral })
    expect(restored.TONE_1700).toBeCloseTo(0.059, 5)
    expect(restored.BACKGROUND_NOISE).toBeCloseTo(1, 5)
  })

  it('incorrect transcription does not complete', () => {
    const frags = src.transcription!
    expect(transcriptionComplete('texto qualquer', frags)).toBe(false)
    expect(transcriptionComplete('escute isso ate o fim', frags)).toBe(false)
    expect(transcriptionComplete('eu estava com medo', frags)).toBe(false)
    expect(transcriptionComplete('escuta isso até o fim', frags)).toBe(false)
  })

  it('five correct phrases complete in any order, including case and accents', () => {
    const frags = src.transcription!
    const notes = [
      'Escute isso até o fim!',
      'desde aquela noite',
      'Eu sentia medo.',
      'eu estava confusa',
      'EU NÃO LEMBRO',
    ].join('\n')
    expect(transcriptionComplete(notes, frags)).toBe(true)
    const shuffled = ['eu não lembro', 'eu estava confusa', 'eu sentia medo', 'desde aquela noite', 'escute isso ate o fim'].join(
      '\n',
    )
    expect(transcriptionComplete(shuffled, frags)).toBe(true)
    expect(transcriptionComplete(notes.split('\n').slice(0, 4).join('\n'), frags)).toBe(false)
  })
})

describe('procedural mix', () => {
  it('renders the same noise for the same seed and a different one otherwise', () => {
    const a = renderBackgroundNoise(4000, 44100, 3110803, -20)
    const b = renderBackgroundNoise(4000, 44100, 3110803, -20)
    const c = renderBackgroundNoise(4000, 44100, 7, -20)
    expect(a[10]).toBe(b[10])
    expect(a[2000]).toBe(b[2000])
    expect(c[10]).not.toBe(a[10])
    expect(measureRms(a)).toBeGreaterThan(0.05)
  })

  it('raises tone amplitude inside an envelope window', () => {
    const tone = renderTone(44100, 44100, 1700, [{ startSec: 0.4, endSec: 0.7, gain: 3 }])
    const outside = tone.subarray(0, 8000)
    const inside = tone.subarray(22000, 28000)
    expect(measureRms(inside)).toBeGreaterThan(measureRms(outside) * 2)
  })
})

describe('no UI-label hardcoding of puzzle behavior', () => {
  it('notch and profile take numeric params, not button labels', () => {
    expect(notchToneEffect.length).toBe(4)
    expect(captureNoiseProfile.length).toBe(4)
    expect(spectralStemGains.length).toBe(2)
  })
})
