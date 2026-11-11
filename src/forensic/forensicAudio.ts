import type { AudioAssetConfig, ProcessParams, StemConfig, StemId } from './forensicTypes'
import { computeStemGains, evaluateSegmentClarity } from './forensicEngine'
import type { NoiseProfileState, SpeechSegment } from './forensicTypes'
import {
  clipPlaybackGain,
  renderBackgroundNoise,
  renderClicks,
  renderTone,
  sliceFragment,
} from './forensicMix'

type WebAudioBuffer = AudioBuffer

const EQ_FREQ: Record<string, number> = {
  '125': 125,
  '250': 250,
  '500': 500,
  '1k': 1000,
  '2k': 2000,
  '4k': 4000,
  '8k': 8000,
}

interface DebrisPiece {
  buffer: WebAudioBuffer
  timelineSec: number
  gain: number
}

/**
 * Motor de áudio: stems cacheados na sessão, Biquad real no bus de voz/ruído.
 * O stem tonal entra depois do Notch para que centro, largura e redução
 * o atenuem pela curva do dataset, sem um nulo booleano na senoide.
 */
export class ForensicAudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private panNode: StereoPannerNode | null = null
  private bus: GainNode | null = null
  private toneBus: GainNode | null = null
  private eqNodes: { band: string; node: BiquadFilterNode }[] = []
  private eqHead: BiquadFilterNode | null = null
  private filters: {
    hp: BiquadFilterNode
    lp: BiquadFilterNode
    bp: BiquadFilterNode
    notch: BiquadFilterNode
  } | null = null
  private stemGains = new Map<StemId, GainNode>()
  private decoded = new Map<string, WebAudioBuffer>()
  private procedural = new Map<StemId, WebAudioBuffer>()
  private clipGains = new Map<string, number>()
  private clipGainNodes = new Map<string, GainNode>()
  private speechSegments: SpeechSegment[] = []
  private debris: DebrisPiece[] = []
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
  private onWaveform: ((peaks: number[]) => void) | null = null
  private bpPassthrough = true
  private ready = false
  private disposed = false
  private token = 0
  private loading: Promise<void> | null = null
  private lastApply: {
    process: ProcessParams
    profile: NoiseProfileState | null
    muted: boolean
  } | null = null
  /** Limite de decode (container danificado). null = duração total. */
  private playableUntilSec: number | null = null

  async ensureCtx(): Promise<AudioContext> {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.panNode = this.ctx.createStereoPanner()
      this.bus = this.ctx.createGain()
      this.toneBus = this.ctx.createGain()
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
      notch.type = 'peaking'
      notch.frequency.value = 1000
      notch.Q.value = 8
      notch.gain.value = 0
      this.filters = { hp, lp, bp, notch }

      const bands = Object.keys(EQ_FREQ)
      let prev: AudioNode = notch
      this.eqNodes = bands.map((band) => {
        const eq = this.ctx!.createBiquadFilter()
        eq.type = 'peaking'
        eq.frequency.value = EQ_FREQ[band]!
        eq.Q.value = 1
        eq.gain.value = 0
        prev.connect(eq)
        prev = eq
        return { band, node: eq }
      })
      this.eqHead = this.eqNodes[0]?.node ?? null
      prev.connect(this.panNode)

      this.bus.connect(hp)
      hp.connect(lp)
      lp.connect(notch)
      this.toneBus.connect(this.panNode)
      this.panNode.connect(this.master)
      this.master.connect(this.ctx.destination)
      this.bpPassthrough = true
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume()
    return this.ctx
  }

  private reconnectFilterChain(useBandPass: boolean) {
    if (!this.filters || !this.eqHead) return
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
    notch.connect(this.eqHead)
  }

  setTickHandler(fn: ((t: number) => void) | null) {
    this.onTick = fn
  }

  setWaveformHandler(fn: ((peaks: number[]) => void) | null) {
    this.onWaveform = fn
  }

  async loadAsset(
    asset: AudioAssetConfig,
    durationSec: number,
    speechSegments: SpeechSegment[] = [],
  ) {
    const token = ++this.token
    this.ready = false
    this.asset = asset
    this.durationSec = durationSec
    this.speechSegments = speechSegments
    this.loading = this.buildAsset(asset, durationSec, token)
    return this.loading
  }

  private async buildAsset(asset: AudioAssetConfig, durationSec: number, token: number) {
    const ctx = await this.ensureCtx()
    if (token !== this.token || this.disposed) return
    const sampleRate = ctx.sampleRate
    const frames = Math.max(1, Math.ceil(durationSec * sampleRate))

    const srcs = new Set<string>()
    for (const stem of asset.stems) {
      if (stem.src) srcs.add(stem.src)
      for (const clip of stem.clips ?? []) srcs.add(clip.src)
      for (const frag of stem.fragments ?? []) srcs.add(frag.src)
    }
    await Promise.all([...srcs].map((src) => this.decodeUrl(src, ctx)))
    if (token !== this.token || this.disposed) return

    this.procedural.clear()
    this.clipGains.clear()
    this.debris = []

    const layers: { data: Float32Array; gain: number; startSec: number }[] = []

    for (const stem of asset.stems) {
      if (stem.kind === 'file' && stem.src) {
        const buf = this.decoded.get(stem.src)
        if (!buf) continue
        const mono = this.mono(buf)
        // Pad / trim to session duration so seek/play stay in sync with other stems.
        const data = new Float32Array(frames)
        data.set(mono.subarray(0, Math.min(mono.length, frames)))
        this.procedural.set(stem.id, this.bufferFrom(data, sampleRate))
        layers.push({ data, gain: stem.initialGain, startSec: 0 })
      } else if (stem.kind === 'noise') {
        const data = renderBackgroundNoise(
          frames,
          sampleRate,
          stem.seed ?? asset.seed ?? 1,
          stem.targetRmsDb ?? -24,
          stem.dropouts ?? [],
          stem.envelope ?? [],
        )
        this.procedural.set(stem.id, this.bufferFrom(data, sampleRate))
        layers.push({ data, gain: stem.initialGain, startSec: 0 })
      } else if (stem.kind === 'tone') {
        const data = renderTone(frames, sampleRate, stem.frequencyHz ?? 1000, stem.envelope ?? [])
        this.procedural.set(stem.id, this.bufferFrom(data, sampleRate))
        layers.push({ data, gain: stem.initialGain, startSec: 0 })
      } else if (stem.kind === 'clicks') {
        const data = renderClicks(frames, sampleRate, stem.events ?? [], stem.seed ?? asset.seed ?? 1)
        this.procedural.set(stem.id, this.bufferFrom(data, sampleRate))
        layers.push({ data, gain: stem.initialGain, startSec: 0 })
      } else if (stem.kind === 'clips') {
        for (const clip of stem.clips ?? []) {
          const buf = this.decoded.get(clip.src)
          if (!buf) continue
          const mono = this.mono(buf)
          const g = clipPlaybackGain(mono, clip.gainDb ?? 0, stem.matchRmsDb)
          this.clipGains.set(clip.id, g)
          layers.push({ data: mono, gain: g * stem.initialGain, startSec: clip.startSec })
        }
      } else if (stem.kind === 'debris') {
        for (const frag of stem.fragments ?? []) {
          const buf = this.decoded.get(frag.src)
          if (!buf) continue
          const slice = sliceFragment(
            this.mono(buf),
            sampleRate,
            frag.sourceOffsetSec,
            frag.durationMs,
            Boolean(frag.reverse),
          )
          const gain = Math.pow(10, frag.gainDb / 20)
          this.debris.push({
            buffer: this.bufferFrom(slice, sampleRate),
            timelineSec: frag.timelineSec,
            gain,
          })
          layers.push({ data: slice, gain: gain * stem.initialGain, startSec: frag.timelineSec })
        }
      }
    }

    if (token !== this.token || this.disposed) return
    this.ready = true
    this.onWaveform?.(this.peakWaveform(layers, durationSec, sampleRate))
  }

  private async decodeUrl(src: string, ctx: AudioContext) {
    if (this.decoded.has(src)) return
    try {
      const res = await fetch(src)
      if (!res.ok) throw new Error(String(res.status))
      const arr = await res.arrayBuffer()
      const buf = await ctx.decodeAudioData(arr.slice(0))
      this.decoded.set(src, buf)
    } catch {
      console.warn('forensic audio: failed to decode', src)
    }
  }

  private mono(buf: WebAudioBuffer): Float32Array {
    const ch0 = buf.getChannelData(0)
    const channels = buf.numberOfChannels || 1
    if (channels <= 1) return ch0
    const out = new Float32Array(ch0.length)
    for (let c = 0; c < channels; c++) {
      const d = buf.getChannelData(c)
      for (let i = 0; i < d.length; i++) out[i]! += d[i]! / channels
    }
    return out
  }

  private bufferFrom(data: Float32Array, sampleRate: number): WebAudioBuffer {
    const buf = this.ctx!.createBuffer(1, data.length, sampleRate)
    const ch = buf.getChannelData(0)
    if (ch.length === data.length) ch.set(data)
    return buf
  }

  private peakWaveform(
    layers: { data: Float32Array; gain: number; startSec: number }[],
    duration: number,
    sampleRate: number,
    bars = 360,
  ): number[] {
    const peaks = new Float32Array(bars)
    const step = 4
    for (const layer of layers) {
      const { data, gain, startSec } = layer
      for (let i = 0; i < data.length; i += step) {
        const t = startSec + i / sampleRate
        if (t < 0 || t >= duration) continue
        const b = Math.min(bars - 1, Math.floor((t / duration) * bars))
        const a = Math.abs(data[i]! * gain)
        if (a > peaks[b]!) peaks[b] = a
      }
    }
    let max = 1e-6
    for (let i = 0; i < peaks.length; i++) if (peaks[i]! > max) max = peaks[i]!
    const out: number[] = []
    for (let i = 0; i < peaks.length; i++) out.push(Math.max(0.035, peaks[i]! / max))
    return out
  }

  getCurrentTime(): number {
    if (!this.playing || !this.ctx) return this.startOffsetSec
    const elapsed = (this.ctx.currentTime - this.startCtxTime) * this.rate
    return this.startOffsetSec + elapsed
  }

  applyProcess(process: ProcessParams, profile: NoiseProfileState | null, muted: boolean) {
    this.lastApply = { process, profile, muted }
    if (!this.ctx || !this.filters || !this.master || !this.panNode || !this.asset) return
    const base: Record<StemId, number> = {
      FILE: 1,
      CORRUPTED_BASE: 1,
      VOICE: 1,
      BACKGROUND_NOISE: 1,
      TONE_1700: 1,
      VOCAL_DEBRIS: 1,
      CLICKS: 1,
    }
    for (const s of this.asset.stems) base[s.id] = s.initialGain
    const rules = { notch: this.asset.notch, spectral: this.asset.spectral }
    const gains = computeStemGains(base, process, profile, rules)
    for (const [id, g] of Object.entries(gains) as [StemId, number][]) {
      const node = this.stemGains.get(id)
      if (node) node.gain.value = muted ? 0 : g
    }

    // Presença limpa por fragmento — acompanha o score do segmento.
    for (const stem of this.asset.stems) {
      if (stem.kind !== 'clips') continue
      for (const clip of stem.clips ?? []) {
        const seg =
          this.speechSegments.find((s) => s.clipId === clip.id) ??
          this.speechSegments.find((s) => Math.abs(s.startSec - clip.startSec) < 0.05)
        const baseClip = this.clipGains.get(clip.id) ?? Math.pow(10, (clip.gainDb ?? 0) / 20)
        let mul = 0.02
        if (seg && !process.bypass) {
          const clarity = evaluateSegmentClarity(seg, process, profile, base, rules)
          // effectiveVoiceGain já inclui voiceDamage do perfil contaminado.
          mul = clarity.effectiveVoiceGain
        } else if (process.bypass) {
          mul = 0.02
        }
        const node = this.clipGainNodes.get(clip.id)
        if (node) node.gain.value = muted ? 0 : baseClip * mul
      }
    }

    if (process.bypass) {
      this.filters.hp.frequency.value = 20
      this.filters.lp.frequency.value = 20000
      this.filters.notch.gain.value = 0
      this.reconnectFilterChain(false)
      for (const eq of this.eqNodes) eq.node.gain.value = 0
      this.panNode.pan.value = 0
      return
    }

    this.filters.hp.frequency.value = Math.max(20, process.highPassHz)
    this.filters.lp.frequency.value = Math.min(20000, process.lowPassHz)

    const useBp = process.bandPassLowHz > 40 || process.bandPassHighHz < 18000
    if (useBp !== !this.bpPassthrough) this.reconnectFilterChain(useBp)
    if (useBp) {
      const center = (process.bandPassLowHz + process.bandPassHighHz) / 2
      const width = Math.max(1, process.bandPassHighHz - process.bandPassLowHz)
      this.filters.bp.frequency.value = center
      this.filters.bp.Q.value = center / width
    }

    this.filters.notch.frequency.value = Math.max(20, process.notchCenterHz)
    const q = process.notchCenterHz / Math.max(10, process.notchWidthHz)
    this.filters.notch.Q.value = Math.min(40, Math.max(0.3, q))
    this.filters.notch.gain.value = process.notchReductionDb

    for (const eq of this.eqNodes) eq.node.gain.value = process.eqBands[eq.band] ?? 0

    this.panNode.pan.value = Math.max(-1, Math.min(1, process.pan / 100))
  }

  setPlaybackRate(rate: number) {
    if (rate === this.rate) return
    const t = this.getCurrentTime()
    this.rate = rate
    if (this.playing) void this.play(t, this.loop, this.loopSel)
  }

  setLoop(loop: boolean, sel: { startSec: number; endSec: number } | null) {
    this.loop = loop
    this.loopSel = sel
  }

  async play(fromSec: number, loop: boolean, sel: { startSec: number; endSec: number } | null) {
    if (this.loading) await this.loading
    await this.ensureCtx()
    if (!this.asset || !this.filters || !this.bus || !this.toneBus || !this.ready) return
    this.stopInternal()
    this.loop = loop
    this.loopSel = sel
    const start = Math.max(0, fromSec)
    this.startOffsetSec = start
    this.startCtxTime = this.ctx!.currentTime
    this.playing = true
    this.clipGainNodes.clear()

    for (const stem of this.asset.stems) {
      const g = this.ctx!.createGain()
      g.gain.value = stem.initialGain
      this.stemGains.set(stem.id, g)
      // Tom entra depois do Notch no bus; o restante (incl. base corrompida) passa pelos filtros.
      const dest = stem.kind === 'tone' ? this.toneBus : this.bus
      g.connect(dest)
      this.scheduleStem(stem, g, start)
    }

    if (this.lastApply) {
      const { process, profile, muted } = this.lastApply
      this.applyProcess(process, profile, muted)
    }
    this.tickLoop()
  }

  private scheduleStem(stem: StemConfig, dest: GainNode, fromSec: number) {
    const ctx = this.ctx!
    if (stem.kind === 'clips' && stem.clips) {
      for (const clip of stem.clips) {
        const buf = this.decoded.get(clip.src)
        if (!buf) continue
        const clipDur = buf.duration
        const clipEnd = clip.startSec + clipDur
        if (clipEnd <= fromSec) continue
        const src = ctx.createBufferSource()
        src.buffer = buf
        src.playbackRate.value = this.rate
        const clipGain = ctx.createGain()
        const baseClip = this.clipGains.get(clip.id) ?? Math.pow(10, (clip.gainDb ?? 0) / 20)
        clipGain.gain.value = baseClip * 0.04
        this.clipGainNodes.set(clip.id, clipGain)
        src.connect(clipGain)
        clipGain.connect(dest)
        const offsetIntoClip = Math.max(0, fromSec - clip.startSec)
        if (offsetIntoClip >= clipDur) continue
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

    if (stem.kind === 'debris') {
      for (const piece of this.debris) {
        const dur = piece.buffer.duration
        const end = piece.timelineSec + dur
        if (end <= fromSec) continue
        const src = ctx.createBufferSource()
        src.buffer = piece.buffer
        src.playbackRate.value = this.rate
        const g = ctx.createGain()
        g.gain.value = piece.gain
        src.connect(g)
        g.connect(dest)
        const offset = Math.max(0, fromSec - piece.timelineSec)
        if (offset >= dur) continue
        const when = ctx.currentTime + Math.max(0, (piece.timelineSec - fromSec) / this.rate)
        try {
          src.start(when, offset)
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

    const buf = this.procedural.get(stem.id)
    if (!buf) return
    if (fromSec >= buf.duration) return
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.playbackRate.value = this.rate
    src.connect(dest)
    try {
      src.start(ctx.currentTime, fromSec)
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

  setPlayableUntil(sec: number | null) {
    this.playableUntilSec = sec == null ? null : Math.max(0, sec)
  }

  private tickLoop() {
    if (this.anim) cancelAnimationFrame(this.anim)
    const step = () => {
      if (!this.playing) return
      const t = this.getCurrentTime()
      const limit =
        this.playableUntilSec == null ? this.durationSec : Math.min(this.durationSec, this.playableUntilSec)
      const end = this.loop && this.loopSel ? Math.min(this.loopSel.endSec, limit) : limit
      const start = this.loop && this.loopSel ? this.loopSel.startSec : 0
      if (t >= end - 0.001) {
        if (this.loop && !(this.playableUntilSec != null && end >= this.playableUntilSec - 0.001)) {
          void this.play(start, true, this.loopSel)
          return
        }
        this.pause()
        this.startOffsetSec = end
        this.onTick?.(end)
        return
      }
      this.onTick?.(t)
      this.anim = requestAnimationFrame(step)
    }
    this.anim = requestAnimationFrame(step)
  }

  seek(sec: number) {
    const was = this.playing
    this.stopInternal()
    const limit =
      this.playableUntilSec == null ? this.durationSec : Math.min(this.durationSec, this.playableUntilSec)
    this.startOffsetSec = Math.max(0, Math.min(limit, sec))
    this.playing = false
    if (was) void this.play(this.startOffsetSec, this.loop, this.loopSel)
    else this.onTick?.(this.startOffsetSec)
  }

  pause() {
    const t = this.getCurrentTime()
    this.stopInternal()
    this.startOffsetSec = t
    this.playing = false
  }

  stop() {
    this.stopInternal()
    this.startOffsetSec = 0
    this.playing = false
    this.onTick?.(0)
  }

  private stopInternal() {
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
    this.disposed = true
    this.token++
    this.onTick = null
    this.onWaveform = null
    this.stopInternal()
    void this.ctx?.close()
    this.ctx = null
    this.ready = false
  }

  isPlaying() {
    return this.playing
  }
}
