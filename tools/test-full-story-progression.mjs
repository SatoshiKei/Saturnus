/**
 * Progressão canônica: reconstrói os checkpoints DEV (o mesmo pipeline do save)
 * e confirma blocos, puzzles, spoilers e assets.
 *
 * Não é um engine novo — delega ao teste que importa o runtime TypeScript.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const result = spawnSync(
  'npx',
  ['vitest', 'run', 'tests/unit/canonicalProgression.test.ts', 'tests/unit/block03Story.test.ts'],
  { cwd: root, stdio: 'inherit', shell: true },
)
process.exit(result.status ?? 1)
