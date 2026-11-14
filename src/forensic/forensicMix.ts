import type { ClickEvent, DropoutEvent, GainWindow, ProcessParams, SelectionRange } from './forensicTypes'

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
  envelope: GainWindow[] = [],
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
  if (envelope.length) {
    for (let i = 0; i < frames; i++) {
      out[i]! *= envelopeAt(i / sampleRate, envelope, 0.12)
    }
  }
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

/** Clamp a sample index range into [0, length]. */
export function clampSampleRange(
  length: number,
  startIdx: number,
  endIdx: number,
): { start: number; end: number } {
  const start = Math.max(0, Math.min(length, Math.floor(startIdx)))
  const end = Math.max(start, Math.min(length, Math.ceil(endIdx)))
  return { start, end }
}

/** Reverse samples in [startIdx, endIdx) in place. */
export function reverseSamples(data: Float32Array, startIdx = 0, endIdx = data.length): void {
  const { start, end } = clampSampleRange(data.length, startIdx, endIdx)
  let i = start
  let j = end - 1
  while (i < j) {
    const tmp = data[i]!
    data[i] = data[j]!
    data[j] = tmp
    i++
    j--
  }
}

/** Absolute peak in [startIdx, endIdx). */
export function measurePeak(data: Float32Array, startIdx = 0, endIdx = data.length): number {
  const { start, end } = clampSampleRange(data.length, startIdx, endIdx)
  let peak = 0
  for (let i = start; i < end; i++) {
    const a = Math.abs(data[i]!)
    if (a > peak) peak = a
  }
  return peak
}

/**
 * Linear gain that maps `peak` to `targetDb` dBFS, capped so the result
 * never exceeds `peakCeiling` (default 1.0).
 */
export function normalizePeakGain(peak: number, targetDb: number, peakCeiling = 1): number {
  if (peak < 1e-12) return 1
  const targetLin = Math.min(peakCeiling, Math.pow(10, targetDb / 20))
  return targetLin / peak
}

/**
 * Peak-normalize [startIdx, endIdx) toward `targetDb` dBFS.
 * Peak is capped at `peakCeiling` (default 1.0) so the result never clips.
 * Returns the linear gain applied (1 if silent / no-op).
 */
export function normalizePeakSamples(
  data: Float32Array,
  targetDb: number,
  startIdx = 0,
  endIdx = data.length,
  peakCeiling = 1,
): number {
  const { start, end } = clampSampleRange(data.length, startIdx, endIdx)
  if (end <= start) return 1
  const peak = measurePeak(data, start, end)
  const g = normalizePeakGain(peak, targetDb, peakCeiling)
  if (g === 1) return 1
  for (let i = start; i < end; i++) data[i]! *= g
  return g
}

/** Scale [startIdx, endIdx) by a precomputed linear gain. */
export function scaleSamples(
  data: Float32Array,
  gain: number,
  startIdx = 0,
  endIdx = data.length,
): void {
  if (gain === 1) return
  const { start, end } = clampSampleRange(data.length, startIdx, endIdx)
  for (let i = start; i < end; i++) data[i]! *= gain
}

/**
 * Linear amplitude fade-in / fade-out on [startIdx, endIdx).
 * Fade lengths are clamped so they do not overlap past the midpoint.
 */
export function applyLinearFade(
  data: Float32Array,
  sampleRate: number,
  fadeInSec: number,
  fadeOutSec: number,
  startIdx = 0,
  endIdx = data.length,
): void {
  const { start, end } = clampSampleRange(data.length, startIdx, endIdx)
  const n = end - start
  if (n <= 0) return
  const maxFade = Math.floor(n / 2)
  const fadeInN = Math.max(0, Math.min(maxFade, Math.round(Math.max(0, fadeInSec) * sampleRate)))
  const fadeOutN = Math.max(0, Math.min(maxFade, Math.round(Math.max(0, fadeOutSec) * sampleRate)))
  for (let i = 0; i < fadeInN; i++) {
    data[start + i]! *= fadeInN <= 1 ? 0 : i / (fadeInN - 1)
  }
  for (let i = 0; i < fadeOutN; i++) {
    const idx = end - 1 - i
    data[idx]! *= fadeOutN <= 1 ? 0 : i / (fadeOutN - 1)
  }
}

export type BufferProcessParams = Pick<
  ProcessParams,
  'reverse' | 'normalizePeak' | 'fadeInSec' | 'fadeOutSec' | 'bypass'
>

export function regionSampleRange(
  sampleRate: number,
  length: number,
  region: SelectionRange | null,
  durationSec?: number,
): { start: number; end: number } {
  const fullEndSec = durationSec ?? length / Math.max(1e-9, sampleRate)
  const startSec = region ? Math.max(0, region.startSec) : 0
  const endSec = region ? Math.max(startSec, region.endSec) : fullEndSec
  return clampSampleRange(length, Math.round(startSec * sampleRate), Math.round(endSec * sampleRate))
}

/**
 * Copy `source` and apply reverse → normalize → fade on the selection
 * (or the full buffer when `region` is null). Bypass skips all three.
 * Pass `sharedNormalizeGain` to keep multi-stem balance (same scale on all).
 */
export function applyBufferProcess(
  source: Float32Array,
  sampleRate: number,
  process: BufferProcessParams,
  region: SelectionRange | null,
  durationSec?: number,
  sharedNormalizeGain?: number,
): Float32Array {
  const out = new Float32Array(source.length)
  out.set(source)
  if (process.bypass) return out

  const { start, end } = regionSampleRange(sampleRate, out.length, region, durationSec)
  if (process.reverse) reverseSamples(out, start, end)
  if (sharedNormalizeGain != null) scaleSamples(out, sharedNormalizeGain, start, end)
  else normalizePeakSamples(out, process.normalizePeak, start, end, 1)
  if (process.fadeInSec > 0 || process.fadeOutSec > 0) {
    applyLinearFade(out, sampleRate, process.fadeInSec, process.fadeOutSec, start, end)
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

/** FFT radix-2 in-place (Cooley–Tukey). */
function fftRadix2(re: Float64Array, im: Float64Array) {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      const tr = re[i]!
      re[i] = re[j]!
      re[j] = tr
      const ti = im[i]!
      im[i] = im[j]!
      im[j] = ti
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len
    const wlenRe = Math.cos(ang)
    const wlenIm = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let wr = 1
      let wi = 0
      for (let j = 0; j < len / 2; j++) {
        const uRe = re[i + j]!
        const uIm = im[i + j]!
        const vRe = re[i + j + len / 2]! * wr - im[i + j + len / 2]! * wi
        const vIm = re[i + j + len / 2]! * wi + im[i + j + len / 2]! * wr
        re[i + j] = uRe + vRe
        im[i + j] = uIm + vIm
        re[i + j + len / 2] = uRe - vRe
        im[i + j + len / 2] = uIm - vIm
        const nwr = wr * wlenRe - wi * wlenIm
        wi = wr * wlenIm + wi * wlenRe
        wr = nwr
      }
    }
  }
}

/**
 * STFT real a partir de amostras mono (espectrograma da Bancada).
 * Resolução limitada para UI; a energia é a do áudio decodificado.
 */
export function computeSpectrogramFromSamples(
  layers: { data: Float32Array; gain: number; startSec: number }[],
  durationSec: number,
  sampleRate: number,
  opts?: { cols?: number; rows?: number; maxHz?: number },
): { cols: number; rows: number; values: number[]; maxHz: number } {
  const cols = opts?.cols ?? 144
  const rows = opts?.rows ?? 56
  const maxHz = opts?.maxHz ?? 6000
  const nperseg = 1024
  const mix = new Float32Array(Math.max(1, Math.ceil(durationSec * sampleRate)))
  for (const layer of layers) {
    const offset = Math.floor(layer.startSec * sampleRate)
    const { data, gain } = layer
    for (let i = 0; i < data.length; i++) {
      const j = offset + i
      if (j < 0 || j >= mix.length) continue
      mix[j]! += data[i]! * gain
    }
  }
  const window = new Float32Array(nperseg)
  for (let i = 0; i < nperseg; i++) window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (nperseg - 1))
  const hop = Math.max(1, Math.floor((mix.length - nperseg) / Math.max(1, cols - 1)))
  const maxBin = Math.min(nperseg / 2, Math.floor((maxHz / sampleRate) * nperseg))
  const grid: number[] = new Array(rows * cols).fill(0)
  let peak = 1e-12
  const re = new Float64Array(nperseg)
  const im = new Float64Array(nperseg)
  for (let c = 0; c < cols; c++) {
    const i0 = Math.min(Math.max(0, c * hop), Math.max(0, mix.length - nperseg))
    for (let i = 0; i < nperseg; i++) {
      re[i] = (mix[i0 + i] ?? 0) * (window[i] ?? 0)
      im[i] = 0
    }
    fftRadix2(re, im)
    for (let r = 0; r < rows; r++) {
      const hz = (r / Math.max(1, rows - 1)) * maxHz
      const bin = Math.min(maxBin, Math.max(0, Math.round((hz / sampleRate) * nperseg)))
      const v = Math.hypot(re[bin]!, im[bin]!)
      grid[r * cols + c] = v
      if (v > peak) peak = v
    }
  }
  const values = grid.map((v) => {
    const db = 20 * Math.log10(v / peak + 1e-8)
    return Math.min(1, Math.max(0, (db + 55) / 55))
  })
  return { cols, rows, values, maxHz }
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
