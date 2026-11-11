import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(root, 'scripts', '_unit-test-output.txt')
const r = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vitest', 'run', 'tests/unit'],
  { cwd: root, encoding: 'utf8', shell: true, maxBuffer: 20 * 1024 * 1024 },
)
const text = [r.stdout, r.stderr].filter(Boolean).join('\n')
writeFileSync(outPath, `exit=${r.status}\n${text}`, 'utf8')
process.exit(r.status ?? 1)
