/**
 * Gera docs/assets/ui-asset-audit.md: inventário de todos os assets visuais/sonoros do jogo
 * (arquivo, resolução, transparência, função, problema, manter/substituir, fonte, licença).
 *
 * Uso: node scripts/audit-assets.mjs
 * Metadados técnicos vêm do `sharp`; notas editoriais ficam nos mapas abaixo.
 */
import sharp from 'sharp'
import { readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { join, relative, extname, basename } from 'node:path'

const root = process.cwd()
const rel = (p) => relative(root, p).split('\\').join('/')

async function walk(dir) {
  const out = []
  let entries = []
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

async function tech(file) {
  const ext = extname(file).toLowerCase()
  const size = (await stat(file)).size
  const kb = `${Math.round(size / 1024)} KB`
  if (['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) {
    try {
      const m = await sharp(file).metadata()
      let alpha = m.hasAlpha ? 'sim' : 'não'
      if (m.hasAlpha) {
        // alpha realmente utilizado? (canto superior esquerdo transparente)
        const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
        let transparent = 0
        for (let i = 3; i < data.length; i += 4 * 97) if (data[i] < 8) transparent++
        const samples = Math.ceil(data.length / (4 * 97))
        alpha = transparent / samples > 0.02 ? 'sim (recorte real)' : 'canal presente, opaco'
        void info
      }
      if (ext === '.svg') return { res: `vetor ${m.width}×${m.height}`, alpha: 'sim', kb }
      return { res: `${m.width}×${m.height}`, alpha, kb }
    } catch {
      return { res: '?', alpha: '?', kb }
    }
  }
  return { res: '—', alpha: '—', kb }
}

const bgManifest = JSON.parse(await readFile(join(root, 'assets/manifest/backgrounds.json'), 'utf8'))
const bgByFile = new Map(bgManifest.map((b) => [b.filename, b]))

/** notas editoriais dos assets em uso */
const used = {
  'public/assets/scene/hub-office-bg.jpg': {
    fn: 'Fundo da sala (e da tela de título)',
    problem:
      'Foto de escritório institucional de aparência genérica/asiática (não é uma delegacia brasileira identificável). Móveis e arquivo ao fundo são aproveitados; a mesa e os telefones originais ficam cobertos pela mesa nova.',
    action: 'Manter até haver foto de delegacia brasileira',
    source: 'Pexels 12289987 — Luke Dang (original em assets/backgrounds/raw/police/police-05-chief-office.jpg)',
    license: 'Pexels License (uso livre, sem atribuição obrigatória)',
  },
  'public/assets/scene/hub/desk-table.png': {
    fn: 'Mesa em primeiro plano (cobre a mesa da foto)',
    problem: 'Ilustração vetorial com granulado; não é foto. Perspectiva fixa ~55° coerente com o fundo.',
    action: 'Manter; substituir por foto de mesa recortada quando disponível',
    source: 'Gerado por scripts/build-hub-objects.mjs',
    license: 'Autoral (projeto)',
  },
  'public/assets/scene/hub/monitor.png': {
    fn: 'Objeto: computador policial (abre PoliceComputer)',
    problem: 'Placeholder vetorial; tela é decorativa (a interface real é HTML).',
    action: 'Manter / substituir por recorte fotográfico (mesmo nome e tamanho)',
    source: 'Gerado por scripts/build-hub-objects.mjs',
    license: 'Autoral (projeto)',
  },
  'public/assets/scene/hub/notebook.png': {
    fn: 'Objeto: caderno de investigação',
    problem: 'Placeholder vetorial.',
    action: 'Manter / substituir por recorte fotográfico',
    source: 'Gerado por scripts/build-hub-objects.mjs',
    license: 'Autoral (projeto)',
  },
  'public/assets/scene/hub/case-folder.png': {
    fn: 'Objeto: pasta do caso (abre CaseFiles)',
    problem: 'Placeholder vetorial.',
    action: 'Manter / substituir por recorte fotográfico',
    source: 'Gerado por scripts/build-hub-objects.mjs',
    license: 'Autoral (projeto)',
  },
  'public/assets/scene/hub/audio-station.png': {
    fn: 'Objeto: bancada de áudio (abre AudioWorkbench)',
    problem: 'Placeholder vetorial (notebook + fone + papéis).',
    action: 'Manter / substituir por recorte fotográfico',
    source: 'Gerado por scripts/build-hub-objects.mjs',
    license: 'Autoral (projeto)',
  },
  'public/assets/scene/hub/landline.png': {
    fn: 'Objeto: telefone fixo (abre PoliceLandline)',
    problem: 'Placeholder vetorial.',
    action: 'Manter / substituir por recorte fotográfico',
    source: 'Gerado por scripts/build-hub-objects.mjs',
    license: 'Autoral (projeto)',
  },
  'public/assets/scene/hub/coffee.png': {
    fn: 'Objeto decorativo (xícara de café)',
    problem: 'Placeholder vetorial.',
    action: 'Manter',
    source: 'Gerado por scripts/build-hub-objects.mjs',
    license: 'Autoral (projeto)',
  },
  'public/assets/scene/hub/desk-sheet-bo.png': {
    fn: 'Evidência física na mesa: folha do BO (aparece quando o BO é obtido)',
    problem: 'Placeholder vetorial.',
    action: 'Manter',
    source: 'Gerado por scripts/build-hub-objects.mjs',
    license: 'Autoral (projeto)',
  },
  'public/assets/scene/hub/wall-map.png': {
    fn: 'Mapa pregado na parede (abre LocationsMap)',
    problem: 'Placeholder vetorial.',
    action: 'Manter',
    source: 'Gerado por scripts/build-hub-objects.mjs',
    license: 'Autoral (projeto)',
  },
  'public/assets/scene/hub/wall-calendar.png': {
    fn: 'Calendário de parede (decorativo; data do caso)',
    problem: 'Placeholder vetorial.',
    action: 'Manter',
    source: 'Gerado por scripts/build-hub-objects.mjs',
    license: 'Autoral (projeto)',
  },
  'public/assets/scene/hub/city-map.svg': {
    fn: 'Base do mapa da cidade na tela LocationsMap',
    problem: 'Cidade fictícia genérica.',
    action: 'Manter',
    source: 'Gerado por scripts/build-hub-objects.mjs',
    license: 'Autoral (projeto)',
  },
  'public/assets/scene/chat-sample-product.jpg': {
    fn: 'Imagem de exemplo em conversa de WhatsApp (mock)',
    problem: 'Imagem de teste, sem relação narrativa.',
    action: 'Substituir por imagem narrativa quando existir',
    source: 'Gerado localmente (mock)',
    license: 'Autoral (projeto)',
  },
  'public/assets/audio/voice-mock-a.wav': {
    fn: 'Áudio de teste (evidências e WhatsApp)',
    problem: 'Tom sintético, não é voz.',
    action: 'Substituir por gravação real quando existir',
    source: 'scripts/generate-test-audio.mjs',
    license: 'Autoral (projeto)',
  },
  'public/assets/audio/voice-mock-b.wav': {
    fn: 'Áudio de teste',
    problem: 'Tom sintético, não é voz.',
    action: 'Substituir por gravação real quando existir',
    source: 'scripts/generate-test-audio.mjs',
    license: 'Autoral (projeto)',
  },
  'public/favicon.svg': { fn: 'Favicon', problem: 'Gerado pelo template Vite.', action: 'Substituir por ícone próprio', source: 'Template Vite', license: 'MIT' },
  'public/icons.svg': { fn: 'Sprite do template Vite', problem: 'Sem uso na interface do jogo.', action: 'Remover quando o template inicial sair', source: 'Template Vite', license: 'MIT' },
}

const deprecatedReason = {
  'background-office': 'Foto antiga do fundo (Unsplash). Substituída por hub-office-bg.jpg; enquadramento errado.',
  'hub-delegacia-bg': 'Fundo antigo era um corredor — não corresponde a uma sala de delegado.',
  'props/': 'Fotos retangulares com fundo (aparência de “foto colada”), sem recorte, sombra ou escala consistentes.',
  'coffee-cup.svg': 'Ícone plano antigo; substituído por hub/coffee.png.',
  'desk-lamp.svg': 'Ícone plano antigo; sem uso na nova composição.',
  'desk-surface.svg': 'Mesa plana antiga; substituída por hub/desk-table.png.',
  'evidence-box.svg': 'Ícone plano antigo; substituído por hub/case-folder.png.',
  'landline-phone.svg': 'Telefone antigo (abria interface de celular); substituído por hub/landline.png.',
  'map-board.svg': 'Quadro/mapa antigo; substituído por hub/wall-map.png.',
  'monitor.svg': 'Ícone plano antigo; substituído por hub/monitor.png.',
  'notebook.svg': 'Ícone plano antigo; substituído por hub/notebook.png.',
  'papers.svg': 'Ícone plano antigo; função assumida por audio-station.png.',
  'pen.svg': 'Ícone plano antigo; caneta agora faz parte de notebook.png.',
  'photo-frame.svg': 'Ícone plano antigo; sem uso narrativo.',
  'wall-calendar.svg': 'Calendário antigo; substituído por hub/wall-calendar.png.',
  'office-background-unsplash': 'Original do fundo antigo.',
}

const rows = []
const row = (cols) => rows.push(`| ${cols.map((c) => String(c).replaceAll('|', '\\|')).join(' | ')} |`)
const header = '| Arquivo | Resolução | Transparência | Função | Problema | Decisão | Fonte | Licença |\n|---|---|---|---|---|---|---|---|'

// 1. em uso
const usedFiles = (await walk(join(root, 'public'))).filter((f) => !f.endsWith('.gitkeep'))
const inUse = []
for (const f of usedFiles.sort()) {
  const r = rel(f)
  const t = await tech(f)
  const n = used[r] ?? { fn: '—', problem: 'Sem anotação.', action: 'Revisar', source: '—', license: '—' }
  inUse.push(`| \`${r}\` | ${t.res} | ${t.alpha} | ${n.fn} | ${n.problem} | ${n.action} | ${n.source} | ${n.license} |`)
}

// 2. retirados
const depFiles = await walk(join(root, 'assets/deprecated/ui'))
const retired = []
for (const f of depFiles.sort()) {
  const r = rel(f)
  const t = await tech(f)
  const key = Object.keys(deprecatedReason).find((k) => r.includes(k)) ?? ''
  retired.push(
    `| \`${r}\` | ${t.res} | ${t.alpha} | (antigo) | ${deprecatedReason[key] ?? 'Substituído.'} | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |`,
  )
}

// 3. biblioteca de backgrounds
const rawBg = (await walk(join(root, 'assets/backgrounds/raw'))).sort()
const library = []
for (const f of rawBg) {
  const name = basename(f)
  const m = bgByFile.get(name)
  const t = await tech(f)
  const processed = (await walk(join(root, 'assets/backgrounds/processed'))).some((p) => basename(p) === name)
  const isChief = name === 'police-05-chief-office.jpg'
  library.push(
    `| \`${rel(f)}\` | ${t.res} | não | ${m?.narrativeFit ?? (isChief ? 'Sala de chefia/delegado' : 'Biblioteca de cenários')} | ${m?.notes ?? (isChief ? 'Ver hub-office-bg.jpg' : '—')} | ${isChief ? '**Em uso** (via hub-office-bg.jpg)' : processed ? 'Mantido na biblioteca (versão filtrada existe)' : 'Mantido na biblioteca'} | ${m ? `${m.source} — ${m.author}` : isChief ? 'Pexels 12289987 — Luke Dang' : '—'} | ${m?.license ?? (isChief ? 'Pexels License' : '—')} |`,
  )
}

const md = `# Auditoria de assets — Saturnus

Gerado por \`node scripts/audit-assets.mjs\`. Resolução/transparência medidas com \`sharp\`.

Legenda de decisão: **Manter**, **Substituir** (quando houver arte melhor) ou **Removido da implementação**
(arquivo movido para \`assets/deprecated/ui/\`, sem apagar o original).

## 1. Assets em uso (\`public/\`)

${header}
${inUse.join('\n')}

## 2. Assets retirados da implementação

${header}
${retired.join('\n')}

## 3. Biblioteca de backgrounds (\`assets/backgrounds/raw\`)

Nenhum destes é carregado diretamente pelo jogo; a sala usa apenas a versão processada de
\`police-05-chief-office.jpg\`. Observação: a entrada \`police-01\` do manifest mistura URL do Pexels com
página do Unsplash — conferir a licença real antes de usar.

${header}
${library.join('\n')}

## 4. Pendências conhecidas

- Os objetos da mesa são ilustrações vetoriais honestas (placeholders). Para trocar por recortes fotográficos,
  mantenha nome e tamanho dos arquivos em \`public/assets/scene/hub/\`.
- O fundo ainda não é uma delegacia brasileira reconhecível.
- Áudios \`voice-mock-*.wav\` são tons sintéticos.
`

await writeFile(join(root, 'docs/assets/ui-asset-audit.md'), md)
console.log(`✓ docs/assets/ui-asset-audit.md (${inUse.length} em uso, ${retired.length} retirados, ${library.length} na biblioteca)`)
