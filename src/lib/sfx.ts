/**
 * Camada de SFX do Saturnus.
 *
 * Todos os sons abaixo são TEMPORÁRIOS e sintetizados em runtime com WebAudio (sem arquivos e sem
 * licenças de terceiros). Cada id é um gancho estável: para trocar por um asset real basta mapear
 * o id em `SFX_FILES` (ex.: `'door': '/assets/sfx/door.ogg'`) — o restante do código não muda.
 *
 * Grupos:
 *  - delegacia: `door`, `steps`, `paper`, `keyboard`, `chair`, `ring` (loop), `pickup`, `hangup`
 *  - celular:   `vibrate`, `msg-in`, `msg-out`, `call-out`
 *  - investigação: `evidence`, `document`, `contact`, `location`, `objective`, `contradiction`, `audio-new`, `message`
 *  - VN:        `scene-in`, `scene-out`, `ambience-hush`, `fade`
 *  - ambiente:  `ambience-phones` (várias linhas tocando ao fundo)
 */

export type SfxId =
  | 'door'
  | 'steps'
  | 'paper'
  | 'keyboard'
  | 'chair'
  | 'pickup'
  | 'hangup'
  | 'vibrate'
  | 'msg-in'
  | 'msg-out'
  | 'call-out'
  | 'evidence'
  | 'document'
  | 'contact'
  | 'location'
  | 'objective'
  | 'contradiction'
  | 'audio-new'
  | 'message'
  | 'scene-in'
  | 'scene-out'
  | 'ambience-hush'
  | 'fade'
  | 'ui'
  | 'error'
  | 'unlock'

/** Troque por arquivos reais quando houver assets licenciados. */
export const SFX_FILES: Partial<Record<SfxId | 'ring', string>> = {}

type Note = {
  /** início relativo (s) */
  t: number
  /** duração (s) */
  d: number
  f?: number
  /** glissando para f2 */
  f2?: number
  type?: OscillatorType
  g?: number
  /** ruído branco (para passos, papel, teclado…) */
  noise?: boolean
  /** filtro passa-banda no ruído */
  bp?: number
}

const recipes: Record<SfxId, Note[]> = {
  door: [
    { t: 0, d: 0.08, noise: true, bp: 220, g: 0.5 },
    { t: 0.06, d: 0.25, f: 70, f2: 45, type: 'sine', g: 0.35 },
  ],
  steps: [0, 0.34, 0.68, 1.02].map((t) => ({ t, d: 0.09, noise: true, bp: 260, g: 0.22 })),
  paper: [{ t: 0, d: 0.22, noise: true, bp: 3200, g: 0.16 }],
  keyboard: [0, 0.07, 0.15, 0.2, 0.31].map((t) => ({ t, d: 0.03, noise: true, bp: 2400, g: 0.14 })),
  chair: [{ t: 0, d: 0.28, noise: true, bp: 500, g: 0.22 }],
  pickup: [
    { t: 0, d: 0.05, noise: true, bp: 900, g: 0.3 },
    { t: 0.05, d: 0.12, f: 240, type: 'square', g: 0.05 },
  ],
  hangup: [
    { t: 0, d: 0.1, f: 380, type: 'sine', g: 0.14 },
    { t: 0.12, d: 0.18, f: 260, type: 'sine', g: 0.12 },
    { t: 0.32, d: 0.06, noise: true, bp: 700, g: 0.28 },
  ],
  vibrate: [0, 0.18, 0.36].map((t) => ({ t, d: 0.12, f: 90, type: 'sawtooth' as const, g: 0.08 })),
  'msg-in': [
    { t: 0, d: 0.08, f: 880, type: 'sine', g: 0.1 },
    { t: 0.09, d: 0.14, f: 1320, type: 'sine', g: 0.1 },
  ],
  'msg-out': [{ t: 0, d: 0.09, f: 660, f2: 990, type: 'sine', g: 0.08 }],
  'call-out': [0, 0.9].map((t) => ({ t, d: 0.7, f: 425, type: 'sine' as const, g: 0.06 })),
  evidence: [
    { t: 0, d: 0.07, noise: true, bp: 1800, g: 0.22 },
    { t: 0.02, d: 0.5, f: 196, type: 'triangle', g: 0.14 },
    { t: 0.14, d: 0.6, f: 294, type: 'sine', g: 0.08 },
  ],
  document: [
    { t: 0, d: 0.16, noise: true, bp: 3000, g: 0.18 },
    { t: 0.1, d: 0.3, f: 330, type: 'triangle', g: 0.08 },
  ],
  contact: [
    { t: 0, d: 0.12, f: 740, type: 'sine', g: 0.1 },
    { t: 0.14, d: 0.12, f: 740, type: 'sine', g: 0.1 },
    { t: 0.3, d: 0.3, f: 988, type: 'sine', g: 0.1 },
  ],
  location: [
    { t: 0, d: 0.22, f: 392, type: 'triangle', g: 0.12 },
    { t: 0.2, d: 0.4, f: 523, type: 'triangle', g: 0.1 },
  ],
  objective: [{ t: 0, d: 0.25, f: 262, type: 'sine', g: 0.07 }],
  contradiction: [
    { t: 0, d: 0.5, f: 110, f2: 82, type: 'sawtooth', g: 0.1 },
    { t: 0.1, d: 0.5, f: 117, f2: 87, type: 'sawtooth', g: 0.08 },
    { t: 0.5, d: 0.3, f: 440, type: 'square', g: 0.04 },
  ],
  'audio-new': [
    { t: 0, d: 0.12, f: 523, type: 'sine', g: 0.08 },
    { t: 0.12, d: 0.2, f: 784, type: 'sine', g: 0.08 },
  ],
  message: [
    { t: 0, d: 0.1, f: 600, type: 'sine', g: 0.09 },
    { t: 0.12, d: 0.1, f: 800, type: 'sine', g: 0.09 },
  ],
  'scene-in': [
    { t: 0, d: 0.9, f: 55, f2: 70, type: 'sine', g: 0.12 },
    { t: 0.1, d: 0.5, noise: true, bp: 400, g: 0.05 },
  ],
  'scene-out': [{ t: 0, d: 1.1, f: 70, f2: 40, type: 'sine', g: 0.12 }],
  'ambience-hush': [{ t: 0, d: 1.8, noise: true, bp: 300, g: 0.04 }],
  fade: [{ t: 0, d: 0.7, f: 220, f2: 110, type: 'sine', g: 0.05 }],
  ui: [{ t: 0, d: 0.04, f: 520, type: 'sine', g: 0.04 }],
  error: [{ t: 0, d: 0.18, f: 150, type: 'square', g: 0.06 }],
  unlock: [
    { t: 0, d: 0.1, f: 392, type: 'triangle', g: 0.1 },
    { t: 0.1, d: 0.1, f: 523, type: 'triangle', g: 0.1 },
    { t: 0.2, d: 0.3, f: 659, type: 'triangle', g: 0.1 },
  ],
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = false
const loops = new Map<string, number>()

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) {
    try {
      ctx = new Ctor()
      master = ctx.createGain()
      master.gain.value = 0.8
      master.connect(ctx.destination)
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined)
  return ctx
}

function noiseBuffer(c: AudioContext, seconds: number): AudioBuffer {
  const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * seconds)), c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buf
}

function playNotes(notes: Note[], gainScale = 1) {
  const c = audio()
  if (!c || !master || muted) return
  const now = c.currentTime
  for (const n of notes) {
    const start = now + n.t
    const gain = c.createGain()
    const peak = (n.g ?? 0.1) * gainScale
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), start + Math.min(0.02, n.d / 3))
    gain.gain.exponentialRampToValueAtTime(0.0001, start + n.d)
    if (n.noise) {
      const src = c.createBufferSource()
      src.buffer = noiseBuffer(c, n.d + 0.05)
      const filter = c.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = n.bp ?? 1000
      src.connect(filter)
      filter.connect(gain)
      gain.connect(master)
      src.start(start)
      src.stop(start + n.d + 0.05)
    } else {
      const osc = c.createOscillator()
      osc.type = n.type ?? 'sine'
      osc.frequency.setValueAtTime(n.f ?? 440, start)
      if (n.f2) osc.frequency.exponentialRampToValueAtTime(n.f2, start + n.d)
      osc.connect(gain)
      gain.connect(master)
      osc.start(start)
      osc.stop(start + n.d + 0.02)
    }
  }
}

function playFile(src: string, volume = 0.6) {
  if (muted) return
  const a = new Audio(src)
  a.volume = volume
  void a.play().catch(() => undefined)
}

/** Dispara um efeito pontual. Seguro em SSR/jsdom (não faz nada sem WebAudio). */
export function playSfx(id: SfxId) {
  try {
    const file = SFX_FILES[id]
    if (file) return playFile(file)
    playNotes(recipes[id])
  } catch {
    /* som nunca pode quebrar o jogo */
  }
}

/** Toque de telefone (pares de pulsos), repetido até `stopLoop('ring')`. */
export function startRing(id = 'ring') {
  if (loops.has(id)) return
  const burst = () => {
    playNotes(
      [0, 0.12, 0.24, 0.36].flatMap((t) => [
        { t, d: 0.08, f: 1250, type: 'square' as const, g: 0.035 },
        { t: t + 0.01, d: 0.07, f: 980, type: 'sine' as const, g: 0.04 },
      ]),
    )
  }
  burst()
  loops.set(id, window.setInterval(burst, 2200))
}

/** Várias linhas tocando ao fundo, desencontradas (cena das seis ligações). */
export function startAmbientPhones(id = 'ambient-phones') {
  if (loops.has(id)) return
  const tick = () => {
    const scale = 0.35 + Math.random() * 0.3
    playNotes(
      [0, 0.12, 0.24].flatMap((t) => [{ t, d: 0.08, f: 900 + Math.random() * 500, type: 'square' as const, g: 0.02 * scale }]),
      1,
    )
  }
  tick()
  loops.set(id, window.setInterval(tick, 700))
}

export function stopLoop(id: string) {
  const h = loops.get(id)
  if (h !== undefined) {
    window.clearInterval(h)
    loops.delete(id)
  }
}

export function stopAllLoops() {
  for (const id of [...loops.keys()]) stopLoop(id)
}

export function setSfxMuted(value: boolean) {
  muted = value
  if (value) stopAllLoops()
}
