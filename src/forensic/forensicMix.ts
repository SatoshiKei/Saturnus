import type { ClickEvent, DropoutEvent, GainWindow } from './forensicTypes'

/** RNG determinístico. A mesma seed produz a mesma sequência. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function measureRms(data: Float32Array): number {
  if (!data.length) return 0
  let s = 0
  for (let i = 0; i < data.length; i++) s += data[i]! * data[i]!
  return Math.sqrt(s / data.length)
}

export function normalizeRms(data: Float32Array, targetDb: number) {
  const measured = measureRms(data)
  if (measured < 1e-8) return
  const g = Math.pow(10, targetDb / 20) / measured
  for (let i = 0; i < data.length; i++) data[i]! *= g
}

/**
 * Ganho linear de um clip: level-match opcional para um RMS comum,
 * depois o gainDb relativo do dataset.
 */
export function clipPlaybackGain(samples: Float32Array, gainDb = 0, matchRmsDb?: number): number {
  const rel = Math.pow(10, gainDb / 20)
  if (matchRmsDb == null) return rel
  const measured = measureRms(samples)
  if (measured < 1e-7) return rel
  return rel * (Math.pow(10, matchRmsDb / 20) / measured)
}

function onePole(cutoffHz: number, sampleRate: number): number {
  return 1 - Math.exp((-2 * Math.PI * cutoffHz) / sampleRate)
}

function applyDropouts(data: Float32Array, sampleRate: number, dropouts: DropoutEvent[]) {
  for (const d of dropouts) {
    const start = Math.floor(d.timeSec * sampleRate)
    const n = Math.max(1, Math.floor((d.durationMs / 1000) * sampleRate))
    for (let i = 0; i < n; i++) {
      const idx = start + i
      if (idx < 0 || idx >= data.length) continue
      const u = n === 1 ? 1 : i / (n - 1)
      const bell = Math.sin(Math.PI * u)
      data[idx]! *= 1 + (d.gain - 1) * bell
    }
  }
}

/**
 * Ruído contínuo: white + grave filtrado + banda de telefonia.
 * Normalizado para `targetRmsDb`. Seed fixa.
 */
export function renderBackgroundNoise(
  frames: number,
  sampleRate: number,
  seed: number,
  targetRmsDb: number,
  dropouts: DropoutEvent[] = [],
): Float32Array {
  const rng = mulberry32(seed)
  const out = new Float32Array(frames)
  const lowCoef = onePole(180, sampleRate)
  const hpCoef = onePole(300, sampleRate)
  const bandCoef = onePole(3400, sampleRate)
  let low = 0
  let hp = 0
  let band = 0
  for (let i = 0; i < frames; i++) {
    const white = rng() * 2 - 1
    low += (white - low) * lowCoef
    hp += (white - hp) * hpCoef
    const high = white - hp
    band += (high - band) * bandCoef
    out[i] = white * 0.35 + low * 1.15 + band * 0.95
  }
  normalizeRms(out, targetRmsDb)
  applyDropouts(out, sampleRate, dropouts)
  return out
}

function envelopeAt(t: number, windows: GainWindow[], fadeSec: number): number {
  let g = 1
  for (const w of windows) {
    if (t < w.startSec || t > w.endSec) continue
    const dur = Math.max(0.001, w.endSec - w.startSec)
    const fade = Math.min(fadeSec, dur / 3)
    let a = 1
    if (t < w.startSec + fade) a = (t - w.startSec) / fade
    else if (t > w.endSec - fade) a = (w.endSec - t) / fade
    const s = a * a * (3 - 2 * a)
    g = 1 + (w.gain - 1) * s
  }
  return g
}

/** Senoide com envelope de amplitude. O ganho do stem escala o buffer inteiro. */
export function renderTone(
  frames: number,
  sampleRate: number,
  frequencyHz: number,
  envelope: GainWindow[] = [],
  fadeSec = 0.05,
): Float32Array {
  const out = new Float32Array(frames)
  const omega = (2 * Math.PI * frequencyHz) / sampleRate
  for (let i = 0; i < frames; i++) {
    const env = envelopeAt(i / sampleRate, envelope, fadeSec)
    out[i] = Math.sin(omega * i) * env
  }
  return out
}

export function renderClicks(
  frames: number,
  sampleRate: number,
  events: ClickEvent[],
  seed: number,
): Float32Array {
  const rng = mulberry32(seed)
  const out = new Float32Array(frames)
  for (const ev of events) {
    const start = Math.floor(ev.timeSec * sampleRate)
    const n = Math.max(1, Math.floor((ev.durationMs / 1000) * sampleRate))
    for (let i = 0; i < n; i++) {
      const idx = start + i
      if (idx < 0 || idx >= frames) continue
      const env = Math.sin((Math.PI * i) / n)
      out[idx]! += (rng() * 2 - 1) * env * ev.amplitude
    }
  }
  return out
}

export function sliceFragment(
  samples: Float32Array,
  sampleRate: number,
  offsetSec: number,
  durationMs: number,
  reverse: boolean,
): Float32Array {
  const n = Math.max(1, Math.round((durationMs / 1000) * sampleRate))
  const start = Math.round(offsetSec * sampleRate)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const idx = reverse ? start + (n - 1 - i) : start + i
    out[i] = idx >= 0 && idx < samples.length ? samples[idx]! : 0
  }
  return out
}

function hashUnit(a: number, b: number): number {
  let x = (a * 374761393 + b * 668265263) | 0
  x = Math.imul(x ^ (x >>> 13), 1274126177)
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296
}

export function buildCompositeWaveform(opts: {
  durationSec: number
  bars?: number
  seed: number
  noiseFloor: number
  voice: { startSec: number; endSec: number; amplitude: number }[]
}): number[] {
  const bars = opts.bars ?? 320
  const rng = mulberry32(opts.seed)
  const out: number[] = []
  for (let i = 0; i < bars; i++) {
    const t0 = (i / bars) * opts.durationSec
    const t1 = ((i + 1) / bars) * opts.durationSec
    let v = opts.noiseFloor * (0.72 + rng() * 0.56)
    const span = t1 - t0
    for (const w of opts.voice) {
      const overlap = Math.max(0, Math.min(t1, w.endSec) - Math.max(t0, w.startSec))
      if (overlap > 0) v += w.amplitude * (overlap / span)
    }
    out.push(Math.max(0.05, Math.min(1, v)))
  }
  return out
}

export function buildCompositeSpectrum(peakHz: number): {
  frequencies: number[]
  magnitudes: number[]
} {
  const frequencies: number[] = []
  const magnitudes: number[] = []
  for (let hz = 50; hz <= 4000; hz += 25) {
    frequencies.push(hz)
    const dist = Math.abs(hz - peakHz)
    const peak = Math.exp(-(dist * dist) / (2 * 55 * 55))
    const speech = hz > 200 && hz < 3200 ? 0.12 * Math.exp(-Math.pow((hz - 900) / 1100, 2)) : 0
    const floor = 0.1 + 0.04 * Math.sin(hz / 140)
    magnitudes.push(Math.min(1, floor + speech + peak * 0.9))
  }
  return { frequencies, magnitudes }
}

export function buildCompositeSpectrogram(opts: {
  durationSec: number
  peakHz: number
  maxHz?: number
  cols?: number
  rows?: number
  voice?: { startSec: number; endSec: number; weight: number }[]
  tone?: { startSec: number; endSec: number; weight: number }[]
}): { cols: number; rows: number; values: number[]; maxHz: number } {
  const cols = opts.cols ?? 72
  const rows = opts.rows ?? 40
  const maxHz = opts.maxHz ?? 4000
  const values: number[] = []
  for (let r = 0; r < rows; r++) {
    const hz = (r / (rows - 1)) * maxHz
    for (let c = 0; c < cols; c++) {
      const t = ((c + 0.5) / cols) * opts.durationSec
      const n = 0.07 + hashUnit(c, r) * 0.08
      let toneW = 1
      for (const w of opts.tone ?? []) {
        if (t >= w.startSec && t <= w.endSec) toneW = Math.max(toneW, w.weight)
      }
      const dist = Math.abs(hz - opts.peakHz)
      const ridge = Math.exp(-(dist * dist) / (2 * 60 * 60)) * (0.62 + 0.28 * Math.min(toneW, 2.4))
      let voice = 0
      if (hz > 220 && hz < 3400) {
        for (const w of opts.voice ?? []) {
          if (t < w.startSec || t > w.endSec) continue
          const band = Math.exp(-Math.pow((hz - 1200) / 980, 2))
          voice = Math.max(voice, w.weight * band * 0.7)
        }
      }
      values.push(Math.min(1, n + ridge + voice))
    }
  }
  return { cols, rows, values, maxHz }
}
