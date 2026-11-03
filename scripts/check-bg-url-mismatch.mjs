import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const list = JSON.parse(await readFile(join(root, 'assets/manifest/backgrounds.json'), 'utf8'))

for (const item of list) {
  const urlId = item.url.match(/photos\/(\d+)\//)?.[1]
  const sp = item.sourcePage ?? ''
  const pexelsPageId = sp.match(/pexels\.com\/photo\/[^/]+-(\d+)/)?.[1]
  const isPexelsUrl = item.url.includes('pexels.com')
  const isPexelsPage = sp.includes('pexels.com')

  if (urlId && pexelsPageId && urlId !== pexelsPageId) {
    console.log('ID_MISMATCH', item.id, urlId, '!=', pexelsPageId)
  }
  if (isPexelsUrl && sp.includes('unsplash.com')) {
    console.log('PEXELS_URL_UNSPLASH_PAGE', item.id)
  }
  if (isPexelsPage && !isPexelsUrl && item.url.includes('unsplash')) {
    console.log('UNSPLASH_URL_PEXELS_PAGE', item.id)
  }
}
