/**
 * Baixa os 4 núcleos de BGM VN (piloto) do OpenGameArt.
 * npm run assets:vn-bgm
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'assets', 'audio', 'vn', 'bgm')
mkdirSync(outDir, { recursive: true })

const BASE = 'https://opengameart.org/sites/default/files'
const tracks = [
  { family: 'family-a.mp3', url: `${BASE}/Ambient%20Piano.mp3` },
  { family: 'family-b.mp3', url: `${BASE}/gloom.mp3` },
  { family: 'family-c.mp3', url: `${BASE}/Night%20Calm%20v0_4.mp3` },
  { family: 'family-d.mp3', url: `${BASE}/Looking%20For...%20Answers.mp3` },
]

for (const t of tracks) {
  const res = await fetch(t.url)
  if (!res.ok) throw new Error(`${t.url} → ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 50_000) throw new Error(`${t.family} suspeito (${buf.length} bytes)`)
  writeFileSync(join(outDir, t.family), buf)
  console.log(`ok ${t.family} (${buf.length} bytes)`)
}

console.log('Done. Ver public/assets/audio/vn/bgm/manifest.json')