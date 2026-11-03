import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function row(item, status) {
  const raw = `assets/backgrounds/raw/${item.category}/${item.filename}`
  const proc = item.process
    ? `assets/backgrounds/processed/${item.category}/${item.filename.replace(/\.(jpg|jpeg|png)$/i, '.jpg')}`
    : '—'
  return `| ${item.filename} | ${raw} | ${proc} | ${item.source} | ${item.license} | ${item.author} | ${item.category} | ${item.region} | ${item.narrativeFit} | ${status?.status ?? 'manifest'} | ${item.notes} |`
}

async function main() {
  const manifest = JSON.parse(await readFile(join(root, 'assets/manifest/backgrounds.json'), 'utf8'))
  let log = { backgrounds: [] }
  try {
    log = JSON.parse(await readFile(join(root, 'assets/manifest/download-log.json'), 'utf8'))
  } catch {
    /* no log yet */
  }
  const byId = Object.fromEntries((log.backgrounds ?? []).map((b) => [b.id, b]))

  const header = `# Inventário de backgrounds — SATURNUS

Direção visual: fotos reais com tratamento VN (referência estilo Umineko Ryukishi07 — **sem** usar assets proprietários da 07th Expansion).

Gerado a partir de \`assets/manifest/backgrounds.json\`. Reexecute após download: \`npm run assets:inventory\`.

| Arquivo | Raw | Processed | Fonte | Licença | Autor | Categoria | Região | Adequação narrativa | Download | Observações |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
`

  const body = manifest.map((m) => row(m, byId[m.id])).join('\n')
  const footer = `

## Licenças (resumo)

- **Unsplash License**: [unsplash.com/license](https://unsplash.com/license) — uso gratuito incluindo não comercial/comercial; sem atribuição obrigatória.
- **Pexels License**: [pexels.com/license](https://www.pexels.com/license/) — uso gratuito; verificar se atribuição desejada.

## Curadoria manual

1. Rejeitar imagens com logos legíveis, placas ou rostos dominantes.
2. Preferir versão \`processed/\` em cenas melancólicas; manter \`raw/\` para reprocessar.
3. Atualizar \`docs/assets/scene-map.md\` ao escolher candidato final por cena.
`

  await writeFile(join(root, 'docs/assets/background-inventory.md'), header + body + footer, 'utf8')
  console.log('Wrote docs/assets/background-inventory.md')
}

main()
