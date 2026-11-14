import { describe, expect, it } from 'vitest'
import {
  formatSegmentMonitorLine,
  opaqueLabelLeaksSemantics,
  opaqueSegmentLabel,
  segmentRecoveryPhase,
} from '../../src/forensic/opaqueSegmentId'
import { puzzle01SpeechSegments } from '../../src/forensic/puzzles/puzzle01Cassini'
import { DEFAULT_PROCESS, evaluateSegmentClarity } from '../../src/forensic/forensicEngine'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'

describe('opaque segment IDs', () => {
  it('gera labels estáveis e únicos sem palavras da transcrição', () => {
    const labels = puzzle01SpeechSegments.map((s) => opaqueSegmentLabel(s.id))
    expect(new Set(labels).size).toBe(labels.length)
    for (const seg of puzzle01SpeechSegments) {
      const label = opaqueSegmentLabel(seg.id)
      expect(label).toMatch(/^SEG_[A-Z0-9]{4}-[A-Z0-9]{5}$/)
      expect(opaqueSegmentLabel(seg.id)).toBe(label)
      const words = seg.text.split(/\s+/).concat(seg.id.replace(/^seg_/, ''))
      expect(opaqueLabelLeaksSemantics(label, words)).toBe(false)
      expect(label.toUpperCase()).not.toContain('LEMBRO')
      expect(label.toUpperCase()).not.toContain('NOITE')
      expect(label.toUpperCase()).not.toContain('MEDO')
    }
  })

  it('fases não colapsam recovered sem audição', () => {
    expect(
      segmentRecoveryPhase({ clarityScore: 0.95, threshold: 0.7, heard: false, recovered: false }),
    ).toBe('intelligible')
    expect(
      segmentRecoveryPhase({ clarityScore: 0.95, threshold: 0.7, heard: true, recovered: false }),
    ).toBe('heard')
    expect(
      segmentRecoveryPhase({ clarityScore: 0.95, threshold: 0.7, heard: true, recovered: true }),
    ).toBe('recoveredSpeech')
  })

  it('monitor line usa ✓ sem texto', () => {
    const id = opaqueSegmentLabel('seg_lembro')
    const line = formatSegmentMonitorLine({
      opaqueId: id,
      clarityScore: 0.9,
      threshold: 0.7,
      phase: 'intelligible',
    })
    expect(line).toContain('✓')
    expect(line.toLowerCase()).not.toContain('lembro')
    expect(line.toLowerCase()).not.toContain('não')
  })
})

describe('P01 notch ~1700 não adiciona Recovered Speech sozinho', () => {
  it('clareza inteligível ≠ recovered speech', () => {
    const src = puzzle01CassiniSession.sources[0]!
    const lembro = puzzle01SpeechSegments.find((s) => s.id === 'seg_lembro')!
    const base = { FILE: 1, CORRUPTED_BASE: 1, VOICE: 1, BACKGROUND_NOISE: 1, TONE_1700: 1, VOCAL_DEBRIS: 1, CLICKS: 1 }
    const process = {
      ...DEFAULT_PROCESS,
      notchEnabled: true,
      notchCenterHz: 1700,
      notchWidthHz: 180,
      notchReductionDb: -24,
    }
    const clarity = evaluateSegmentClarity(
      lembro,
      process,
      null,
      base,
      { notch: src.audio?.notch, spectral: src.audio?.spectral },
      false,
    )
    expect(clarity.clarityScore).toBeGreaterThanOrEqual(clarity.threshold)
    expect(clarity.unlocked).toBe(true)
    // Recovered Speech continua vazio — só audição registra.
    const recovered: { segmentId: string; text: string }[] = []
    expect(recovered.some((r) => r.text.toLowerCase().includes('lembro'))).toBe(false)
    expect(opaqueSegmentLabel(lembro.id).toLowerCase()).not.toContain('lembro')
  })
})
