import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const outDir = join(root, '..', 'public', 'assets', 'audio')
mkdirSync(outDir, { recursive: true })

/** Minimal mono 16-bit PCM WAV (CC0 — generated for Saturnus bootstrap). */
function writeWav(path, durationSec, freqHz = 440) {
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
    const envelope = Math.min(1, t * 8) * Math.max(0, 1 - (t - durationSec + 0.08) * 12)
    const sample = Math.sin(2 * Math.PI * freqHz * t) * 0.25 * envelope
    const clamped = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)))
    buffer.writeInt16LE(clamped, 44 + i * 2)
  }
  writeFileSync(path, buffer)
}

writeWav(join(outDir, 'voice-mock-a.wav'), 4.2, 320)
writeWav(join(outDir, 'voice-mock-b.wav'), 2.8, 280)
console.log('Wrote test audio to', outDir)
