import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const outDir = join(root, '..', 'public', 'assets', 'audio')
mkdirSync(outDir, { recursive: true })

/** Minimal mono 16-bit PCM WAV (generated for Saturnus placeholders). */
function writeWav(path, durationSec, sampleFn) {
  const sampleRate = 22050
  const numSamples = Math.floor(sampleRate * durationSec)
  const dataSize = numSamples * 2
  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const sample = sampleFn(t, i, sampleRate)
    const clamped = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)))
    buffer.writeInt16LE(clamped, 44 + i * 2)
  }
  writeFileSync(path, buffer)
}

function noise(t, seed = 1) {
  return (Math.sin(t * 991 + seed * 17) + Math.sin(t * 437 + seed)) * 0.5
}

writeWav(join(outDir, 'voice-mock-a.wav'), 4.2, (t) => Math.sin(2 * Math.PI * 320 * t) * 0.25 * Math.min(1, t * 8))
writeWav(join(outDir, 'voice-mock-b.wav'), 2.8, (t) => Math.sin(2 * Math.PI * 280 * t) * 0.25 * Math.min(1, t * 8))

/** Ligação 190 — degradada (ruído, cortes, volume irregular). */
writeWav(join(outDir, 'emergency-call-0803.wav'), 22, (t) => {
  if (t < 1.2 || (t > 5.5 && t < 6.1) || (t > 12 && t < 12.7)) return noise(t) * 0.08
  const vol = 0.12 + 0.08 * Math.sin(t * 7.3)
  const voice =
    Math.sin(2 * Math.PI * (180 + 40 * Math.sin(t * 2.1)) * t) * vol +
    Math.sin(2 * Math.PI * 360 * t) * vol * 0.35
  return voice + noise(t) * 0.35
})

/** Trechos parcialmente restaurados. */
writeWav(join(outDir, 'emergency-call-0803-restored.wav'), 18, (t) => {
  const segments = [
    [2, 4],
    [6.5, 8],
    [10, 11.5],
    [14, 16],
  ]
  const inSeg = segments.some(([a, b]) => t >= a && t <= b)
  if (!inSeg) return noise(t) * 0.06
  const vol = 0.22
  return Math.sin(2 * Math.PI * 210 * t) * vol + noise(t) * 0.12
})

/** Resposta de Rafael (placeholder — tom de voz distinto). */
writeWav(join(outDir, 'rafael-reply-block01.wav'), 28, (t) => {
  const env = Math.min(1, t * 3) * Math.max(0, 1 - (t - 27) * 2)
  const base = 140 + 20 * Math.sin(t * 0.7)
  return Math.sin(2 * Math.PI * base * t) * 0.28 * env + noise(t, 2) * 0.05
})

/** Encaminhamento Rafael — degradado + vinheta simulada no meio. */
writeWav(join(outDir, 'rafael-forward-block02.wav'), 34, (t) => {
  const env = Math.min(1, t * 2) * Math.max(0, 1 - (t - 33) * 3)
  const jingle =
    t > 14 && t < 18
      ? Math.sin(2 * Math.PI * (440 + 80 * Math.sin(t * 12)) * t) * 0.35
      : 0
  const bed = Math.sin(2 * Math.PI * 90 * t) * 0.06 * env
  return (bed + jingle + noise(t, 3) * 0.4) * env
})

writeWav(join(outDir, 'rafael-forward-block02-restored.wav'), 28, (t) => {
  const jingle =
    t > 10 && t < 16
      ? Math.sin(2 * Math.PI * (520 + 60 * Math.sin(t * 9)) * t) * 0.42
      : noise(t, 4) * 0.08
  return jingle + noise(t, 5) * 0.1
})

console.log('Wrote placeholder audio to', outDir)
