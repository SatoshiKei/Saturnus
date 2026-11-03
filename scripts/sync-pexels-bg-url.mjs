/**
 * When sourcePage is a Pexels photo URL, rewrite item.url to use the same numeric ID.
 * Run: node scripts/sync-pexels-bg-url.mjs [--write]
 */
import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = join(root, 'assets/manifest/backgrounds.json')
const write = process.argv.includes('--write')

const list = JSON.parse(await readFile(manifestPath, 'utf8'))
let changed = 0

for (const item of list) {
  const sp = item.sourcePage ?? ''
  const pageId = sp.match(/pexels\.com\/photo\/[^/]+-(\d+)/)?.[1]
  if (!pageId) continue
  const urlId = item.url.match(/photos\/(\d+)\//)?.[1]
  if (urlId === pageId) continue
  const next = `https://images.pexels.com/photos/${pageId}/pexels-photo-${pageId}.jpeg?auto=compress&cs=tinysrgb&w=1920`
  console.log(item.id, urlId ?? '?', '->', pageId)
  item.url = next
  changed++
}

if (write && changed) {
  await writeFile(manifestPath, JSON.stringify(list, null, 2) + '\n')
  console.log(`Wrote ${changed} updates.`)
} else if (!write) {
  console.log(`Dry run: ${changed} would change. Pass --write to save.`)
}
