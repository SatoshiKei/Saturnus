import { describe, expect, it } from 'vitest'
import {
  applyBufferProcess,
  applyLinearFade,
  measurePeak,
  normalizePeakSamples,
  reverseSamples,
} from '../../src/forensic/forensicMix'
import { DEFAULT_PROCESS } from '../../src/forensic/forensicTypes'

describe('forensic DSP — reverse / normalize / fade', () => {
  it('reverse flips a known mono buffer', () => {
    const data = new Float32Array([1, 2, 3, 4, 5])
    reverseSamples(data)
    expect(Array.from(data)).toEqual([5, 4, 3, 2, 1])
  })

  it('reverse flips only the selection range', () => {
    const data = new Float32Array([1, 2, 3, 4, 5, 6])
    reverseSamples(data, 1, 5)
    expect(Array.from(data)).toEqual([1, 5, 4, 3, 2, 6])
  })

  it('normalize brings peak to target within tolerance without clipping', () => {
    const data = new Float32Array([0.1, -0.25, 0.2, -0.05])
    const targetDb = -1
    const targetLin = Math.pow(10, targetDb / 20)
    const gain = normalizePeakSamples(data, targetDb)
    expect(gain).toBeGreaterThan(1)
    const peak = measurePeak(data)
    expect(peak).toBeLessThanOrEqual(1)
    expect(Math.abs(peak - targetLin)).toBeLessThan(1e-5)
  })

  it('normalize never exceeds the peak ceiling', () => {
    const data = new Float32Array([0.5, -0.5])
    normalizePeakSamples(data, 6) // +6 dBFS would clip without ceiling
    expect(measurePeak(data)).toBeLessThanOrEqual(1 + 1e-9)
  })

  it('fade reduces samples at the edges', () => {
    const sampleRate = 100
    const data = new Float32Array(100)
    data.fill(1)
    applyLinearFade(data, sampleRate, 0.1, 0.1)
    expect(data[0]!).toBe(0)
    expect(data[9]!).toBeCloseTo(1, 5)
    expect(data[50]!).toBe(1)
    expect(data[99]!).toBe(0)
    expect(data[90]!).toBeCloseTo(1, 5)
    expect(data[5]!).toBeLessThan(data[8]!)
    expect(data[94]!).toBeLessThan(data[91]!)
  })

  it('applyBufferProcess composes reverse, normalize, and fade on a region', () => {
    const sampleRate = 10
    const source = new Float32Array(20)
    for (let i = 0; i < source.length; i++) source[i] = 0.2 + (i % 5) * 0.05
    const out = applyBufferProcess(
      source,
      sampleRate,
      {
        ...DEFAULT_PROCESS,
        reverse: true,
        normalizePeak: -1,
        fadeInSec: 0.2,
        fadeOutSec: 0.2,
      },
      { startSec: 0.5, endSec: 1.5 },
    )
    // Outside the region stays original.
    expect(out[0]).toBeCloseTo(source[0]!, 5)
    expect(out[19]).toBeCloseTo(source[19]!, 5)
    // Edges of the processed region are faded toward silence.
    expect(Math.abs(out[5]!)).toBeLessThan(0.05)
    expect(Math.abs(out[14]!)).toBeLessThan(0.05)
    // Peak inside the region is at or below unity.
    let peak = 0
    for (let i = 5; i < 15; i++) peak = Math.max(peak, Math.abs(out[i]!))
    expect(peak).toBeLessThanOrEqual(1 + 1e-9)
  })

  it('bypass leaves samples unchanged', () => {
    const source = new Float32Array([1, 2, 3])
    const out = applyBufferProcess(
      source,
      10,
      { ...DEFAULT_PROCESS, reverse: true, fadeInSec: 1, bypass: true },
      null,
    )
    expect(Array.from(out)).toEqual([1, 2, 3])
  })
})
