import type { AudioAssetConfig, ProcessParams, StemConfig, StemId } from './forensicTypes'
import { computeStemGains, dbToLinear } from './forensicEngine'
import type { NoiseProfileState } from './forensicTypes'

/**
 * Motor de áudio híbrido: stems compostos na reprodução + Biquad real.
 * Stems de tom/ruído/clicks são gerados proceduralmente; voz usa clips.
 */
export class ForensicAudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private panNode: StereoPannerNode | null = null
  private filters: {
    hp: BiquadFilterNode
    lp: BiquadFilterNode
    bp: BiquadFilterNode
    notch: BiquadFilterNode
  } | null = null
  private stemGains = new Map<StemId, GainNode>()
  private buffers = new Map<string, AudioBuffer>()
  private playing = false
  private startCtxTime = 0
  private startOffsetSec = 0
  private rate = 1
  private durationSec = 44
  private asset: AudioAssetConfig | null = null
  private stopFns: Array<() => void> = []
  private loop = false
  private loopSel: { startSec: number; endSec: number } | null = null
  private anim: number | null = null
  private onTick: ((t: number) => void) | null = null

  async ensureCtx(): Promise<AudioContext> {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.panNode = this.ctx.createStereoPanner()
      const hp = this.ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 20
      const lp = this.ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 20000
      const bp = this.ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 1000
      bp.Q.value = 0.7
      const notch = this.ctx.createBiquadFilter()
      notch.type = 'notch'
      notch.frequency.value = 1000
      notch.Q.value = 10
      this.filters = { hp, lp, bp, notch }
      // Chain: stems → sum → hp → lp → bp → notch → pan → master → dest
      // bp is bypassed unless band meaningfully narrowed (handled in applyProcess)
      hp.connect(lp)
      lp.connect(notch)
      notch.connect(this.panNode)
      this.panNode.connect(this.master)
      this.master.connect(this.ctx.destination)
      this.bpPassthrough = true
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume()
    return this.ctx
  }

  private bpPassthrough = true

  private reconnectFilterChain(useBandPass: boolean) {
    if (!this.filters || !this.panNode) return
    const { lp, bp, notch } = this.filters
    try {
      lp.disconnect()
      bp.disconnect()
      notch.disconnect()
    } catch {
      /* ignore */
    }
    if (useBandPass) {
      lp.connect(bp)
      bp.connect(notch)
      this.bpPassthrough = false
    } else {
      lp.connect(notch)
      this.bpPassthrough = true
    }
    notch.connect(this.panNode)
  }

  async loadAsset(asset: AudioAssetConfig, durationSec: number) {
    await this.ensureCtx()
    this.asset = asset
    this.durationSec = durationSec
    const ctx = this.ctx!
    for (const stem of asset.stems) {
      if (stem.clips) {
        for (const clip of stem.clips) {
          if (this.buffers.has(clip.src)) continue
          const res = await fetch(clip.src)
          const arr = await res.arrayBuffer()
          const buf = await ctx.decodeAudioData(arr.slice(0))
          this.buffers.set(clip.src, buf)
        }
      }
    }
  }

  setTickHandler(fn: ((t: number) => void) | null) {
    this.onTick = fn
  }

  getCurrentTime(): number {
    if (!this.playing || !this.ctx) return this.startOffsetSec
    const elapsed = (this.ctx.currentTime - this.startCtxTime) * this.rate
    return this.startOffsetSec + elapsed
  }

  applyProcess(process: ProcessParams, profile: NoiseProfileState | null, muted: boolean) {
    if (!this.ctx || !this.filters || !this.master || !this.panNode || !this.asset) return
    const base: Record<StemId, number> = {
      VOICE: 1,
      BACKGROUND_NOISE: 1,
      TONE_1700: 1,
      VOCAL_DEBRIS: 1,
      CLICKS: 1,
    }
    for (const s of this.asset.stems) {
      base[s.id] = s.initialGain
    }
    const gains = computeStemGains(base, process, profile)
    for (const [id, g] of Object.entries(gains) as [StemId, number][]) {
      const node = this.stemGains.get(id)
      if (node) node.gain.value = muted ? 0 : g
    }

    if (process.bypass) {
      this.filters.hp.frequency.value = 20
      this.filters.lp.frequency.value = 20000
      this.filters.notch.Q.value = 0.707
      this.filters.notch.gain.value = 0
      this.reconnectFilterChain(false)
      this.panNode.pan.value = 0
      this.master.gain.value = 1
      return
    }

    this.filters.hp.frequency.value = Math.max(20, process.highPassHz)
    this.filters.lp.frequency.value = Math.min(20000, process.lowPassHz)

    const useBp =
      process.bandPassLowHz > 40 || process.bandPassHighHz < 18000
    if (useBp !== !this.bpPassthrough) this.reconnectFilterChain(useBp)
    if (useBp) {
      const center = (process.bandPassLowHz + process.bandPassHighHz) / 2
      const width = Math.max(1, process.bandPassHighHz - process.bandPassLowHz)
      this.filters.bp.frequency.value = center
      this.filters.bp.Q.value = center / width
    }

    this.filters.notch.frequency.value = Math.max(20, process.notchCenterHz)
    // Q ≈ center / width
    const q = process.notchCenterHz / Math.max(10, process.notchWidthHz)
    this.filters.notch.Q.value = Math.min(100, Math.max(0.5, q))

    this.panNode.pan.value = Math.max(-1, Math.min(1, process.pan / 100))
    this.master.gain.value = muted ? 0 : 1
  }

  setPlaybackRate(rate: number) {
    const t = this.getCurrentTime()
    this.rate = rate
    if (this.playing) {
      void this.stopInternal(false)
      void this.play(t, this.loop, this.loopSel)
    }
  }

  setLoop(loop: boolean, sel: { startSec: number; endSec: number } | null) {
    this.loop = loop
    this.loopSel = sel
  }

  async play(fromSec: number, loop: boolean, sel: { startSec: number; endSec: number } | null) {
    await this.ensureCtx()
    if (!this.asset || !this.filters) return
    this.stopInternal(false)
    this.loop = loop
    this.loopSel = sel
    const start = Math.max(0, fromSec)
    this.startOffsetSec = start
    this.startCtxTime = this.ctx!.currentTime
    this.playing = true

    const sum = this.ctx!.createGain()
    sum.gain.value = 1
    sum.connect(this.filters.hp)

    for (const stem of this.asset.stems) {
      const g = this.ctx!.createGain()
      g.gain.value = stem.initialGain
      this.stemGains.set(stem.id, g)
      g.connect(sum)
      this.scheduleStem(stem, g, start)
    }

    this.tickLoop()
  }

  private scheduleStem(stem: StemConfig, dest: GainNode, fromSec: number) {
    const ctx = this.ctx!
    if (stem.kind === 'clips' && stem.clips) {
      for (const clip of stem.clips) {
        const buf = this.buffers.get(clip.src)
        if (!buf) continue
        const clipEnd = clip.startSec + (clip.durationSec ?? buf.duration)
        if (clipEnd <= fromSec) continue
        const src = ctx.createBufferSource()
        src.buffer = buf
        src.playbackRate.value = this.rate
        src.connect(dest)
        const offsetIntoClip = Math.max(0, fromSec - clip.startSec)
        const when = ctx.currentTime + Math.max(0, (clip.startSec - fromSec) / this.rate)
        try {
          src.start(when, offsetIntoClip)
        } catch {
          /* ignore */
        }
        this.stopFns.push(() => {
          try {
            src.stop()
          } catch {
            /* ignore */
          }
        })
      }
      return
    }

    if (stem.kind === 'tone' && stem.frequencyHz) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = stem.frequencyHz
      const env = ctx.createGain()
      env.gain.value = 1
      osc.connect(env)
      env.connect(dest)
      osc.start(ctx.currentTime)
      this.stopFns.push(() => {
        try {
          osc.stop()
        } catch {
          /* ignore */
        }
      })
      return
    }

    if (stem.kind === 'noise' || stem.kind === 'debris' || stem.kind === 'clicks') {
      const remaining = Math.max(0.1, this.durationSec - fromSec)
      const frames = Math.ceil(ctx.sampleRate * remaining)
      const buf = ctx.createBuffer(1, frames, ctx.sampleRate)
      const data = buf.getChannelData(0)
      const density = stem.density ?? 1
      for (let i = 0; i < frames; i++) {
        if (stem.kind === 'clicks') {
          // Sparse clicks
          data[i] = Math.random() < 0.0008 * density ? (Math.random() * 2 - 1) * 0.9 : 0
        } else if (stem.kind === 'debris') {
          data[i] =
            Math.random() < 0.02 * density
              ? (Math.random() * 2 - 1) * 0.35 * Math.sin(i / 40)
              : (Math.random() * 2 - 1) * 0.02
        } else {
          data[i] = (Math.random() * 2 - 1) * 0.45 * density
        }
      }
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.playbackRate.value = this.rate
      src.connect(dest)
      src.start(ctx.currentTime)
      this.stopFns.push(() => {
        try {
          src.stop()
        } catch {
          /* ignore */
        }
      })
    }
  }

  private tickLoop() {
    if (this.anim) cancelAnimationFrame(this.anim)
    const step = () => {
      if (!this.playing) return
      let t = this.getCurrentTime()
      const end =
        this.loop && this.loopSel
          ? this.loopSel.endSec
          : this.durationSec
      const start =
        this.loop && this.loopSel ? this.loopSel.startSec : 0
      if (t >= end) {
        if (this.loop) {
          void this.play(start, true, this.loopSel)
          return
        }
        this.stop()
        this.onTick?.(end)
        return
      }
      this.onTick?.(t)
      this.anim = requestAnimationFrame(step)
    }
    this.anim = requestAnimationFrame(step)
  }

  pause() {
    const t = this.getCurrentTime()
    this.stopInternal(false)
    this.startOffsetSec = t
    this.playing = false
  }

  stop() {
    this.stopInternal(false)
    this.startOffsetSec = 0
    this.playing = false
    this.onTick?.(0)
  }

  seek(sec: number) {
    const was = this.playing
    this.stopInternal(false)
    this.startOffsetSec = Math.max(0, Math.min(this.durationSec, sec))
    this.playing = false
    if (was) void this.play(this.startOffsetSec, this.loop, this.loopSel)
    else this.onTick?.(this.startOffsetSec)
  }

  private stopInternal(_resetOffset: boolean) {
    for (const fn of this.stopFns) fn()
    this.stopFns = []
    this.stemGains.clear()
    this.playing = false
    if (this.anim) {
      cancelAnimationFrame(this.anim)
      this.anim = null
    }
  }

  dispose() {
    this.stopInternal(false)
    void this.ctx?.close()
    this.ctx = null
  }

  isPlaying() {
    return this.playing
  }
}

export function buildDemoWaveform(seed: string, n = 220): number[] {
  let s = 0
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    s = (s * 1664525 + 1013904223) >>> 0
    const r = s / 4294967296
    const env = 0.2 + 0.8 * Math.abs(Math.sin(i / 11))
    out.push(Math.max(0.04, env * (0.3 + r * 0.7)))
  }
  return out
}

export function buildDemoSpectrum(peakHz = 1700): {
  frequencies: number[]
  magnitudes: number[]
} {
  const frequencies: number[] = []
  const magnitudes: number[] = []
  for (let hz = 50; hz <= 4000; hz += 25) {
    frequencies.push(hz)
    const dist = Math.abs(hz - peakHz)
    const peak = Math.exp(-(dist * dist) / (2 * 80 * 80))
    const floor = 0.08 + 0.05 * Math.sin(hz / 90)
    magnitudes.push(Math.min(1, floor + peak * 0.92))
  }
  return { frequencies, magnitudes }
}

export function buildDemoSpectrogram(
  durationSec: number,
  peakHz = 1700,
): { cols: number; rows: number; values: number[]; maxHz: number } {
  const cols = 64
  const rows = 32
  const maxHz = 4000
  const values: number[] = []
  for (let r = 0; r < rows; r++) {
    const hz = (r / (rows - 1)) * maxHz
    for (let c = 0; c < cols; c++) {
      const t = (c / cols) * durationSec
      const dist = Math.abs(hz - peakHz)
      const tone = Math.exp(-(dist * dist) / (2 * 90 * 90)) * 0.85
      const noise = 0.12 + 0.08 * Math.sin(t * 3 + r)
      values.push(Math.min(1, noise + tone))
    }
  }
  return { cols, rows, values, maxHz }
}

export { dbToLinear }
