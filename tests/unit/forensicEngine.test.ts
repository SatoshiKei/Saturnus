import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  alwaysAvailableTabs,
  CLEAN_VOICE_MAX_GAIN,
  captureNoiseProfile,
  centerAccuracy,
  clipRecoveryGain,
  computeRecoveryMetrics,
  computeStemGains,
  createInitialUiState,
  evaluateSegmentClarity,
  notchDepthEffect,
  notchToneEffect,
  notchWidthQuality,
  noiseReductionEffect,
  profileQualityScore,
  resetProcess,
  speechRecoveryComplete,
  spectralStemGains,
  voiceContaminationScore,
  voiceDamageAmount,
  voiceSpansFromSource,
} from '../../src/forensic/forensicEngine'
import { DEFAULT_PROCESS, INSPECTOR_TABS } from '../../src/forensic/forensicTypes'
import {
  puzzle01CassiniSession,
  puzzle01Ideal,
  puzzle01NotchRule,
  puzzle01SpeechSegments,
} from '../../src/forensic/puzzles/puzzle01Cassini'

const src = puzzle01CassiniSession.sources[0]!
const rule = puzzle01NotchRule
const base = {
  CORRUPTED_BASE: 1,
  VOICE: 1,
  BACKGROUND_NOISE: 0.78,
  TONE_1700: 0.12,
  VOCAL_DEBRIS: 0.62,
  CLICKS: 0.38,
} as const
const rules = { notch: puzzle01NotchRule, spectral: src.audio!.spectral }
const spans = voiceSpansFromSource(src)

function goodProfile() {
  return {
    id: 'g',
    name: 'P',
    startSec: 0.3,
    endSec: 1.8,
    quality: 'good' as const,
    qualityScore: 0.98,
    voiceContamination: 0,
    durationSec: 1.5,
    capturedAt: 1,
  }
}

function selectAllProfile() {
  const sel = { startSec: 0, endSec: 44 }
  const contam = voiceContaminationScore(sel, spans)
  const q = profileQualityScore(sel, spans)
  return {
    id: 'all',
    name: 'P',
    startSec: 0,
    endSec: 44,
    quality: 'contaminated' as const,
    qualityScore: q,
    voiceContamination: contam,
    durationSec: 44,
    capturedAt: 1,
  }
}

const fullNotch = {
  ...DEFAULT_PROCESS,
  notchCenterHz: 1700,
  notchWidthHz: 180,
  notchReductionDb: -24,
  spectralReduction: 72,
  spectralSensitivity: 55,
  spectralSmoothing: 30,
}

function unlockedIds(process: typeof DEFAULT_PROCESS, profile: ReturnType<typeof goodProfile> | null) {
  return puzzle01SpeechSegments
    .filter((seg) => evaluateSegmentClarity(seg, process, profile, base, rules).unlocked)
    .map((s) => s.id)
}

describe('forensic workbench — permanent tabs', () => {
  it('exposes all inspector tabs regardless of puzzle', () => {
    expect(alwaysAvailableTabs()).toEqual(INSPECTOR_TABS.map((t) => t.id))
  })
})

describe('puzzle 1 dataset', () => {
  it('keeps master source, corrupted base, clean clips and five texts', () => {
    expect(src.speechSegments).toHaveLength(5)
    expect(src.speechSegments?.map((s) => s.text)).toEqual([
      'escute isso até o fim',
      'desde aquela noite',
      'eu sentia medo',
      'eu estava confusa',
      'eu não lembro',
    ])
    const corrupted = src.audio!.stems.find((s) => s.id === 'CORRUPTED_BASE')!
    expect(corrupted.kind).toBe('file')
    expect(
      fs.existsSync(
        path.join(process.cwd(), 'public/assets/audio/forensic/puzzle01/p01_corrupted_base.wav'),
      ),
    ).toBe(true)
    for (const seg of puzzle01SpeechSegments) {
      expect(seg.recoveryWeights.center + seg.recoveryWeights.depth + seg.recoveryWeights.width + seg.recoveryWeights.noise).toBeCloseTo(1, 5)
    }
  })
})

describe('progressive recovery calibration', () => {
  it('1 bruto: zero unlocks', () => {
    expect(unlockedIds(DEFAULT_PROCESS, null)).toEqual([])
  })

  it('2 Center 1700 only unlocks eu não lembro', () => {
    const process = { ...DEFAULT_PROCESS, notchCenterHz: 1700 }
    expect(unlockedIds(process, null)).toEqual(['seg_lembro'])
    expect(centerAccuracy(1700)).toBe(1)
  })

  it('3 Center + Reduction -12 unlocks medo', () => {
    const process = {
      ...DEFAULT_PROCESS,
      notchCenterHz: 1700,
      notchReductionDb: -12,
    }
    const ids = unlockedIds(process, null)
    expect(ids).toContain('seg_lembro')
    expect(ids).toContain('seg_medo')
    expect(ids).not.toContain('seg_noite')
    expect(ids).not.toContain('seg_escute')
  })

  it('4 Center + Reduction -17 unlocks confusa', () => {
    const process = {
      ...DEFAULT_PROCESS,
      notchCenterHz: 1700,
      notchReductionDb: -17,
    }
    const ids = unlockedIds(process, null)
    expect(ids).toContain('seg_confusa')
    expect(ids).not.toContain('seg_noite')
  })

  it('5 full Notch unlocks escute but NOT noite', () => {
    const process = {
      ...DEFAULT_PROCESS,
      notchCenterHz: 1700,
      notchWidthHz: 180,
      notchReductionDb: -24,
    }
    const ids = unlockedIds(process, null)
    expect(ids).toContain('seg_escute')
    expect(ids).toHaveLength(4)
    expect(ids).not.toContain('seg_noite')
  })

  it('5b bad width blocks escute', () => {
    const process = {
      ...DEFAULT_PROCESS,
      notchCenterHz: 1700,
      notchWidthHz: 20,
      notchReductionDb: -24,
    }
    expect(unlockedIds(process, null)).not.toContain('seg_escute')
  })

  it('6 Notch + profile + spectral unlocks all five', () => {
    const process = {
      ...DEFAULT_PROCESS,
      notchCenterHz: puzzle01Ideal.notchCenterHz,
      notchWidthHz: puzzle01Ideal.notchWidthHz,
      notchReductionDb: puzzle01Ideal.notchReductionDb,
      spectralReduction: puzzle01Ideal.spectralReduction,
      spectralSensitivity: puzzle01Ideal.spectralSensitivity,
      spectralSmoothing: puzzle01Ideal.spectralSmoothing,
    }
    const ids = unlockedIds(process, goodProfile())
    expect(ids).toHaveLength(5)
    expect(
      speechRecoveryComplete(
        ids.map((id) => {
          const s = puzzle01SpeechSegments.find((x) => x.id === id)!
          return { segmentId: s.id, text: s.text, startSec: s.startSec, unlockedAt: 1 }
        }),
        src.speechSegments,
      ),
    ).toBe(true)
  })

  it('NEG: Notch alone never unlocks desde aquela noite', () => {
    const process = {
      ...DEFAULT_PROCESS,
      notchCenterHz: 1700,
      notchWidthHz: 180,
      notchReductionDb: -24,
    }
    expect(unlockedIds(process, null)).not.toContain('seg_noite')
  })

  it('NEG: wrong center + good noise does not complete', () => {
    const process = {
      ...DEFAULT_PROCESS,
      notchCenterHz: 800,
      notchWidthHz: 180,
      notchReductionDb: -24,
      spectralReduction: 72,
      spectralSensitivity: 55,
      spectralSmoothing: 30,
    }
    expect(unlockedIds(process, goodProfile()).length).toBeLessThan(5)
  })
})

describe('independent tool metrics', () => {
  it('splits center / depth / width', () => {
    expect(centerAccuracy(1700)).toBe(1)
    expect(centerAccuracy(800)).toBeLessThan(0.05)
    expect(notchDepthEffect(0)).toBe(0)
    expect(notchDepthEffect(-12)).toBeCloseTo(0.5, 2)
    expect(notchWidthQuality(180)).toBe(1)
    expect(notchWidthQuality(20)).toBeLessThan(0.3)
    expect(notchToneEffect(1700, 0, 180, rule)).toBeGreaterThan(0.2)
  })

  it('contaminated profile cannot max noise reduction', () => {
    const process = {
      ...DEFAULT_PROCESS,
      spectralReduction: 100,
      spectralSensitivity: 55,
      spectralSmoothing: 30,
    }
    const good = noiseReductionEffect(process, goodProfile())
    const bad = noiseReductionEffect(process, {
      id: 'b',
      name: 'P',
      startSec: 4,
      endSec: 7,
      quality: 'contaminated' as const,
      qualityScore: 0.2,
      voiceContamination: 0.85,
      durationSec: 3,
      capturedAt: 1,
    })
    expect(good).toBeGreaterThan(bad)
  })

  it('clean voice gain never exceeds calibrated max', () => {
    expect(clipRecoveryGain(1, 1.2)).toBeLessThanOrEqual(CLEAN_VOICE_MAX_GAIN)
    expect(clipRecoveryGain(0.3, 1)).toBeLessThan(clipRecoveryGain(0.7, 1))
  })
})

describe('voice contamination / Select All', () => {
  it('ideal quiet region has near-zero contamination', () => {
    expect(voiceContaminationScore({ startSec: 0.3, endSec: 1.8 }, spans)).toBeLessThan(0.05)
    expect(profileQualityScore({ startSec: 0.3, endSec: 1.8 }, spans)).toBeGreaterThan(0.9)
  })

  it('alternate quiet gap can also be a good profile', () => {
    // gap between medo and confusa ≈ 23.4–29.1
    const q = profileQualityScore({ startSec: 24.0, endSec: 28.5 }, spans)
    expect(q).toBeGreaterThan(0.72)
  })

  it('Select All has high contamination and does not unlock noite', () => {
    const all = selectAllProfile()
    expect(all.voiceContamination).toBeGreaterThan(0.7)
    expect(all.qualityScore).toBeLessThan(0.35)
    const ids = unlockedIds(fullNotch, all)
    expect(ids).not.toContain('seg_noite')
    expect(ids.length).toBeLessThan(5)
    const damage = voiceDamageAmount(fullNotch, all)
    expect(damage).toBeGreaterThan(0.45)
    const spectral = spectralStemGains(fullNotch, all, rules.spectral)
    expect(spectral.voiceClarity).toBeLessThan(0.35)
    const noite = evaluateSegmentClarity(
      puzzle01SpeechSegments.find((s) => s.id === 'seg_noite')!,
      fullNotch,
      all,
      base,
      rules,
    )
    expect(noite.clarityScore).toBeLessThan(noite.threshold)
    expect(noite.effectiveVoiceGain).toBeLessThan(0.25)
  })

  it('selecting desde aquela noite as profile damages that region', () => {
    const sel = { startSec: 12.2, endSec: 14.2 }
    const contam = voiceContaminationScore(sel, spans)
    expect(contam).toBeGreaterThan(0.7)
    const profile = {
      id: 'noite-as-noise',
      name: 'P',
      startSec: sel.startSec,
      endSec: sel.endSec,
      quality: 'contaminated' as const,
      qualityScore: profileQualityScore(sel, spans),
      voiceContamination: contam,
      durationSec: 2,
      capturedAt: 1,
    }
    const process = { ...fullNotch }
    expect(unlockedIds(process, profile)).not.toContain('seg_noite')
    const spectral = spectralStemGains(process, profile, rules.spectral)
    expect(spectral.voiceClarity).toBeLessThan(0.4)
  })

  it('captureNoiseProfile stores voiceContamination', () => {
    const bad = captureNoiseProfile({ startSec: 0, endSec: 44 }, src.noiseRegions, [], spans)
    expect(bad.ok).toBe(true)
    if (bad.ok) {
      expect(bad.profile.voiceContamination).toBeGreaterThan(0.7)
      expect(bad.profile.quality).toBe('contaminated')
    }
    const good = captureNoiseProfile({ startSec: 0.3, endSec: 1.8 }, src.noiseRegions, [], spans)
    expect(good.ok).toBe(true)
    if (good.ok) {
      expect(good.profile.voiceContamination).toBeLessThan(0.05)
      expect(good.profile.quality).toBe('good')
    }
  })

  it('full solution keeps residual degraded texture', () => {
    const gains = computeStemGains(base, fullNotch, goodProfile(), rules)
    expect(gains.CORRUPTED_BASE).toBeGreaterThan(0.3)
    expect(gains.BACKGROUND_NOISE).toBeGreaterThan(0.15)
    expect(gains.VOICE).toBeLessThan(0.7)
    const noite = evaluateSegmentClarity(
      puzzle01SpeechSegments.find((s) => s.id === 'seg_noite')!,
      fullNotch,
      goodProfile(),
      base,
      rules,
    )
    expect(noite.unlocked).toBe(true)
    expect(noite.clarityScore).toBeLessThan(0.98)
    expect(noite.effectiveVoiceGain).toBeLessThanOrEqual(CLEAN_VOICE_MAX_GAIN + 0.01)
  })
})

describe('reset / stems', () => {
  it('reset keeps recovered speech', () => {
    const ui = createInitialUiState(puzzle01CassiniSession, [
      { segmentId: 'seg_lembro', text: 'eu não lembro', startSec: 38.5, unlockedAt: 1 },
    ])
    const reset = resetProcess(ui)
    expect(reset.recoveredSpeech).toHaveLength(1)
  })

  it('stem gains respond to notch and noise separately', () => {
    const raw = computeStemGains(base, DEFAULT_PROCESS, null, rules)
    const notchOnly = computeStemGains(
      base,
      { ...DEFAULT_PROCESS, notchCenterHz: 1700, notchReductionDb: -24, notchWidthHz: 180 },
      null,
      rules,
    )
    const full = computeStemGains(
      base,
      {
        ...DEFAULT_PROCESS,
        notchCenterHz: 1700,
        notchReductionDb: -24,
        notchWidthHz: 180,
        spectralReduction: 72,
        spectralSensitivity: 55,
        spectralSmoothing: 30,
      },
      goodProfile(),
      rules,
    )
    expect(notchOnly.TONE_1700).toBeLessThan(raw.TONE_1700)
    expect(full.BACKGROUND_NOISE).toBeLessThan(notchOnly.BACKGROUND_NOISE)
  })

  it('ideal noise region scores high', () => {
    expect(profileQualityScore({ startSec: 0.3, endSec: 1.8 }, spans, { startSec: 0.3, endSec: 1.8 })).toBeGreaterThan(0.9)
  })

  it('capture profile works', () => {
    const r = captureNoiseProfile({ startSec: 0.3, endSec: 1.8 }, src.noiseRegions, [], spans, {
      startSec: 0.3,
      endSec: 1.8,
    })
    expect(r.ok).toBe(true)
  })

  it('recovery metrics expose independent fields', () => {
    const m = computeRecoveryMetrics(
      { ...DEFAULT_PROCESS, notchCenterHz: 1700, notchReductionDb: -12 },
      null,
      rule,
    )
    expect(m.centerAccuracy).toBe(1)
    expect(m.notchDepthEffect).toBeCloseTo(0.5, 2)
    expect(m.notchWidthQuality).toBe(1)
  })
})
