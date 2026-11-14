/**
 * Tons de teclado telefônico — par DTMF por dígito (ITU-T Q.23 / padrão internacional).
 * Cada tecla = frequência baixa + frequência alta simultâneas.
 */

/** [Hz baixa, Hz alta] — grade 4×4 do discador. */
const DTMF: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '0': [941, 1336],
}

let ctx: AudioContext | null = null
let master: GainNode | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) {
    try {
      ctx = new Ctor()
      master = ctx.createGain()
      master.gain.value = 0.5
      master.connect(ctx.destination)
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined)
  return ctx
}

const PRESS_SEC = 0.14

function playDtmf(digit: string) {
  const pair = DTMF[digit]
  if (!pair) return
  const c = audio()
  if (!c || !master) return
  const [fLo, fHi] = pair
  const now = c.currentTime
  const peak = 0.09
  for (const f of [fLo, fHi]) {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = f
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.006)
    gain.gain.setValueAtTime(peak, now + PRESS_SEC * 0.65)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + PRESS_SEC)
    osc.connect(gain)
    gain.connect(master)
    osc.start(now)
    osc.stop(now + PRESS_SEC + 0.02)
  }
}

/** Tom DTMF do dígito (0–9). */
export function playDiaryPinKey(digit: string) {
  try {
    playDtmf(digit)
  } catch {
    /* áudio nunca bloqueia UI */
  }
}