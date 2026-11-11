import { describe, expect, it } from 'vitest'
import {
  alwaysAvailableTabs,
  captureNoiseProfile,
  classifyNoiseProfile,
  computeStemGains,
  createInitialUiState,
  notchToneEffect,
  resetProcess,
  spectralStemGains,
  toneStemGain,
  transcriptionComplete,
} from '../../src/forensic/forensicEngine'
import { DEFAULT_PROCESS } from '../../src/forensic/forensicTypes'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { INSPECTOR_TABS } from '../../src/forensic/forensicTypes'

describe('forensic workbench — permanent tabs', () => {
  it('exposes all inspector tabs regardless of puzzle', () => {
    const tabs = alwaysAvailableTabs()
    expect(tabs).toEqual(INSPECTOR_TABS.map((t) => t.id))
    expect(tabs).toContain('structure')
    expect(tabs).toContain('packets')
    expect(tabs).toContain('compare')
  })

  it('WAV source keeps empty structure/packets messages — does not hide tabs', () => {
    const src = puzzle01CassiniSession.sources[0]!
    expect(src.type).toBe('audio')
    expect(src.structure?.emptyMessage).toMatch(/estrutura/i)
    expect(src.packets?.emptyMessage).toMatch(/pacotes/i)
    expect(src.structure?.blocks).toBeUndefined()
    expect(src.packets?.rows).toBeUndefined()
  })
})

describe('forensic notch / stems', () => {
  it('notch far from 1700 Hz does not resolve tone stem', () => {
    expect(notchToneEffect(900, -18)).toBe(0)
    expect(notchToneEffect(2500, -24)).toBe(0)
    const g = toneStemGain(0.55, {
      ...DEFAULT_PROCESS,
      notchCenterHz: 900,
      notchReductionDb: -18,
    })
    expect(g).toBeCloseTo(0.55, 3)
  })

  it('notch near 1700 Hz reduces TONE_1700 stem', () => {
    expect(notchToneEffect(1700, -18)).toBeGreaterThan(0.9)
    expect(notchToneEffect(1650, -18)).toBeGreaterThan(0.9)
    expect(notchToneEffect(1850, -18)).toBeGreaterThan(0.4)
    const g = toneStemGain(1, {
      ...DEFAULT_PROCESS,
      notchCenterHz: 1700,
      notchReductionDb: -18,
    })
    expect(g).toBeLessThan(0.05)
  })

  it('partial band has weaker effect than center', () => {
    const center = notchToneEffect(1700, -18)
    const partial = notchToneEffect(1880, -18)
    expect(partial).toBeGreaterThan(0)
    expect(partial).toBeLessThan(center)
  })
})

describe('noise profile + spectral reduction', () => {
  const regions = puzzle01CassiniSession.sources[0]!.noiseRegions!

  it('requires selection to capture profile', () => {
    const r = captureNoiseProfile(null, regions, [])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('no-selection')
  })

  it('good vs contaminated profiles differ', () => {
    expect(classifyNoiseProfile({ startSec: 0.2, endSec: 3.2 }, regions)).toBe('good')
    expect(classifyNoiseProfile({ startSec: 4.0, endSec: 7.0 }, regions)).toBe('contaminated')
  })

  it('spectral reduction without profile applies no noise cut', () => {
    const g = spectralStemGains(
      { ...DEFAULT_PROCESS, spectralReduction: 100 },
      null,
    )
    expect(g.noiseGain).toBe(1)
    expect(g.voiceClarity).toBe(1)
  })

  it('good profile reduces noise more than contaminated; contaminated hurts voice', () => {
    const good = spectralStemGains(
      { ...DEFAULT_PROCESS, spectralReduction: 100 },
      {
        id: 'g',
        name: 'P1',
        startSec: 0,
        endSec: 3,
        quality: 'good',
        capturedAt: 1,
      },
    )
    const bad = spectralStemGains(
      { ...DEFAULT_PROCESS, spectralReduction: 100 },
      {
        id: 'b',
        name: 'P2',
        startSec: 4,
        endSec: 7,
        quality: 'contaminated',
        capturedAt: 1,
      },
    )
    expect(good.noiseGain).toBeLessThan(bad.noiseGain)
    expect(good.voiceClarity).toBe(1)
    expect(bad.voiceClarity).toBeLessThan(1)
  })
})

describe('mixer primitives', () => {
  it('gain scales stem masters', () => {
    const base = {
      VOICE: 1,
      BACKGROUND_NOISE: 1,
      TONE_1700: 1,
      VOCAL_DEBRIS: 1,
      CLICKS: 1,
    } as const
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

  it('bypass restores tone regardless of notch', () => {
    const g = computeStemGains(
      {
        VOICE: 1,
        BACKGROUND_NOISE: 1,
        TONE_1700: 0.55,
        VOCAL_DEBRIS: 1,
        CLICKS: 1,
      },
      {
        ...DEFAULT_PROCESS,
        bypass: true,
        notchCenterHz: 1700,
        notchReductionDb: -24,
      },
      null,
    )
    expect(g.TONE_1700).toBeCloseTo(0.55, 3)
  })
})

describe('session reset + transcription', () => {
  it('reset restores process defaults without revealing answers', () => {
    const ui = createInitialUiState(puzzle01CassiniSession)
    ui.process.notchCenterHz = 1700
    ui.process.notchReductionDb = -18
    ui.noiseProfiles = [
      {
        id: 'x',
        name: 'P',
        startSec: 0,
        endSec: 1,
        quality: 'good',
        capturedAt: 1,
      },
    ]
    ui.transcriptionNotes = 'rascunho'
    const reset = resetProcess(ui)
    expect(reset.process.notchReductionDb).toBe(0)
    expect(reset.noiseProfiles).toHaveLength(0)
    expect(reset.transcriptionNotes).toBe('rascunho')
  })

  it('incorrect transcription does not complete', () => {
    const frags = puzzle01CassiniSession.sources[0]!.transcription!
    expect(transcriptionComplete('texto qualquer', frags)).toBe(false)
    expect(transcriptionComplete('escute isso ate o fim', frags)).toBe(false)
  })

  it('five correct phrases complete puzzle', () => {
    const frags = puzzle01CassiniSession.sources[0]!.transcription!
    const notes = [
      'escute isso ate o fim',
      'desde aquela noite',
      'eu sentia medo',
      'eu estava confusa',
      'eu nao lembro',
    ].join('\n')
    expect(transcriptionComplete(notes, frags)).toBe(true)
  })

  it('accepts reasonable equivalences without revealing context', () => {
    const frags = puzzle01CassiniSession.sources[0]!.transcription!
    const notes = [
      'escuta isso até o fim',
      'desde aquela noite',
      'eu estava com medo',
      'eu tava confusa',
      'eu não lembro',
    ].join('\n')
    expect(transcriptionComplete(notes, frags)).toBe(true)
    const blob = JSON.stringify(puzzle01CassiniSession)
    expect(blob).not.toMatch(/Augusto|Rui|Elisa/i)
  })
})

describe('no UI-label hardcoding of puzzle behavior', () => {
  it('engine APIs take numeric params / dataset ids, not button labels', () => {
    // notchToneEffect(centerHz, reductionDb) — no label parameter
    expect(notchToneEffect.length).toBe(2)
    expect(captureNoiseProfile.length).toBe(3)
    expect(spectralStemGains.length).toBe(2)
  })
})
