/**
 * Baixa URLs curadas para `assets/backgrounds/raw/_vetted/<name>.jpg`.
 * Uso: node scripts/fetch-vetted-batch.mjs vetted-urls.json
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const listPath = process.argv[2]
  ? join(process.cwd(), process.argv[2])
  : join(root, 'assets/manifest/vetted-fetch.json')

const list = JSON.parse(await readFile(listPath, 'utf8'))
const outDir = join(root, 'assets/backgrounds/raw/_vetted')
await mkdir(outDir, { recursive: true })

for (const item of list) {
  const res = await fetch(item.url, { redirect: 'follow' })
  if (!res.ok) {
    console.error('FAIL', item.name, res.status)
    continue
  }
  const buf = Buffer.from(await res.arrayBuffer())
  const dest = join(outDir, `${item.name}.jpg`)
  await writeFile(dest, buf)
  console.log('OK', item.name, buf.length, item.note ?? '')
}