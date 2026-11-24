/**
 * Remove imagens untracked de experimento (cand/sel/verify/_vetted)
 * e versões obsoletas de fundos VN. Mantém raw+processed+public dos ficheiros activos.
 */
import { readFile, unlink, rm, stat } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const KEEP_BASENAMES = new Set([
  'costeira-01-newsroom.jpg',
  'operation-17-night-exterior.jpg',
  'miro-detention-01-cell.jpg',
  'denis-01-garage-interior.jpg',
])

const DROP_BASENAMES = new Set([
  'miro-detention-01-corridor.jpg',
  'operation-17-night-interior.jpg',
])

const DROP_DIR_PATTERNS = [
  /[\\/]_vetted[\\/]/,
  /[\\/]misc[\\/]cand-/,
  /[\\/]misc[\\/]sel-/,
  /[\\/]misc[\\/]verify-/,
]

function untrackedFiles() {
  const out = execSync('git ls-files -o --exclude-standard', { cwd: root, encoding: 'utf8' })
  return out
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
}

const manifest = JSON.parse(await readFile(join(root, 'assets/manifest/backgrounds.json'), 'utf8'))
for (const item of manifest) {
  KEEP_BASENAMES.add(item.filename.replace(/\.(jpg|jpeg|png)$/i, '.jpg'))
}

let removed = 0
for (const rel of untrackedFiles()) {
  if (!/\.(jpe?g|png|webp)$/i.test(rel)) continue
  if (!rel.startsWith('assets/backgrounds/') && !rel.startsWith('public/assets/backgrounds/')) continue

  const base = rel.split(/[\\/]/).pop() ?? ''
  if (KEEP_BASENAMES.has(base)) continue

  const drop =
    DROP_BASENAMES.has(base) ||
    DROP_DIR_PATTERNS.some((p) => p.test(rel.replace(/\//g, '\\')) || p.test(rel))

  if (!drop) {
    console.log('skip (untracked, not candidate)', rel)
    continue
  }

  const abs = join(root, rel)
  try {
    await stat(abs)
    await unlink(abs)
    removed++
    console.log('removed', rel)
  } catch {
  /* ignore */
  }
}

try {
  await rm(join(root, 'assets/backgrounds/raw/_vetted'), { recursive: true, force: true })
} catch {
  /* ignore */
}

console.log(`Done. Removed ${removed} image(s).`)