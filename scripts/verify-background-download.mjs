/**
 * Valida download: tamanho mínimo + id na URL igual ao id na sourcePage (Pexels).
 * Uso: node scripts/verify-background-download.mjs <manifest-id> ...
 */
import { readFile, stat } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ids = new Set(process.argv.slice(2))
if (!ids.size) {
  console.error('Usage: verify-background-download.mjs <manifest-id> ...')
  process.exit(1)
}

const manifest = JSON.parse(await readFile(join(root, 'assets/manifest/backgrounds.json'), 'utf8'))
const MIN_BYTES = 120_000

for (const item of manifest.filter((m) => ids.has(m.id))) {
  const raw = join(root, 'assets/backgrounds/raw', item.category, item.filename)
  const st = await stat(raw)
  const pexelsId = item.sourcePage?.match(/(\d{5,})(?:\/|$)/)?.[1]
  const urlId = item.url?.match(/photos\/(\d+)\//)?.[1]
  const idOk = !pexelsId || !urlId || pexelsId === urlId
  const ok = st.size >= MIN_BYTES && idOk
  console.log(ok ? 'OK' : 'FAIL', item.id, `${st.size}b`, idOk ? 'id-match' : `id-mismatch url=${urlId} page=${pexelsId}`)
  if (!ok) process.exitCode = 1
}