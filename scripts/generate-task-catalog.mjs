/**
 * Gera docs/gameplay/TASKS_CATALOG.md a partir de src/.
 * Uso: node scripts/generate-task-catalog.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const ROOT = join(import.meta.dirname, '..')
const SRC = join(ROOT, 'src')

/** @type {Map<string, { labels: Set<string>, appear: Set<string>, complete: Set<string> }>} */
const tasks = new Map()

function ensure(id) {
  if (!tasks.has(id)) tasks.set(id, { labels: new Set(), appear: new Set(), complete: new Set() })
  return tasks.get(id)
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(ts|tsx)$/.test(name)) scanFile(p)
  }
}

function scanFile(file) {
  const text = readFileSync(file, 'utf8')
  const rel = relative(ROOT, file).replace(/\\/g, '/')

  for (const m of text.matchAll(/\{\s*id:\s*'(task_[a-z0-9_]+)',\s*label:\s*'([^']+)'/g)) {
    ensure(m[1]).labels.add(m[2])
    ensure(m[1]).appear.add(rel)
  }
  for (const m of text.matchAll(/\{\s*type:\s*'addTask',\s*id:\s*'(task_[a-z0-9_]+)',\s*label:\s*'([^']+)'/g)) {
    ensure(m[1]).labels.add(m[2])
    ensure(m[1]).appear.add(rel)
  }
  for (const m of text.matchAll(/completeTask',\s*id:\s*'(task_[a-z0-9_]+)'/g)) {
    ensure(m[1]).complete.add(rel)
  }
  for (const m of text.matchAll(/\{\s*type:\s*'completeTask',\s*id:\s*'(task_[a-z0-9_]+)'/g)) {
    ensure(m[1]).complete.add(rel)
  }
}

walk(SRC)

const BLOCK_ORDER = [
  ['B1', /^task_(review_bo|listen_emergency|mariana_phone|trace_emergency)/],
  ['B1 pós-hospital', /^task_(rafael_|get_club)/],
  ['B2', /^task_(vertice_|match_|locate_nico|talk_nico)/],
  ['B3', /^task_(janus_|review_mariana|contact_radio|talk_livia|locate_livia|saturnalia|research_maralto|identify_morsa)/],
  ['B4', /^task_(andre_|interview_andre|check_andre|hexagon|phone_forensics|open_recovered|unlock_diary|read_diary|unknown_|analyze_unknown|press_nico)/],
  ['B5', /^task_(locate_jana|talk_jana|review_elisa|weigh_maralto|mariana_contact|compare_phone|revisit_emergency)/],
  ['B6', /^task_(reexamine_elisa|talk_geraldo|press_jana|investigate_valter|pastor_|valter_|interview_miro|press_miro)/],
  ['B7', /^task_(locate_sandra|talk_sandra|review_morsa|memory_onset|check_julia|anon_|julia_ricardo|call_renata|hospital_|confirm_ricardo|crosscheck|forum_|aster_|revisit_mariana|verify_hvalenca|investigate_henrique|talk_cecilia|henrique_|cassini_|compare_henrique)/],
  ['B8', /^task_(rings_|confront_andre|press_miro_third|reexamine_guardrail|find_jaguar|talk_denis|detran_|talk_mauro|talk_bia|talk_rui|rotation_|lookup_callsign|how_mariana)/],
  ['B9', /^task_(compare_omitido|reread_diary|omitido_|reexamine_roberto|read_mariana|weigh_mariana|reconstruct_|follow_trail|message_after|other_disappearances|augusto_anomalies|memory_puzzle|saturnus_memory)/],
]

function blockFor(id) {
  for (const [name, re] of BLOCK_ORDER) {
    if (re.test(id)) return name
  }
  return '—'
}

const ids = [...tasks.keys()].sort()

let md = `# Catálogo de pendências (\`task_*\`)

Documento gerado por \`node scripts/generate-task-catalog.mjs\`. **Referência de implementação** — a fonte da verdade é o código (\`addTask\`, \`replaceTasks\`, \`completeTask\`, triggers em \`seedStory.ts\`).

## Como o sistema funciona

| Mecanismo | Efeito |
|-----------|--------|
| \`seedTasks\` (\`seedStory.ts\`) | Três pendências iniciais no novo jogo |
| \`block01_end_block\` | \`replaceTasks\` → lista \`block01EndTasks\` (fim do Bloco 1) |
| \`addTask\` | Inclui uma pendência (mantém as outras) |
| \`replaceTasks\` | **Substitui** toda a lista (marcos de bloco) |
| \`completeTask\` | Marca \`completed: true\` (não remove da lista) |
| Trigger \`block01_complete_phone_task\` | Completa \`task_mariana_phone\` (Júlia + Camila no celular) |
| \`documentConsultHooks.onDocumentConsulted\` | Completos automáticos em alguns documentos |
| \`onOpen\` em \`seedDocuments\` | Alguns documentos completam ou criam pendências |

**Nota:** Pendências antigas podem permanecer \`completed: false\` se um \`replaceTasks\` posterior as removeu da UI sem apagá-las do save legado. O que importa para o jogador é o que está na lista **ativa**.

## Índice por bloco (heurística)

`

for (const [block] of BLOCK_ORDER) {
  const blockIds = ids.filter((id) => blockFor(id) === block)
  if (!blockIds.length) continue
  md += `### ${block}\n\n`
  md += `| ID | Texto (rótulo) | Onde entra | Onde completa |\n`
  md += `|----|----------------|------------|---------------|\n`
  for (const id of blockIds) {
    const t = tasks.get(id)
    const label = [...t.labels][0] ?? '—'
    const alt = t.labels.size > 1 ? ` (+${t.labels.size - 1} var.)` : ''
    const appear = [...t.appear].slice(0, 3).join(', ') || '—'
    const complete = [...t.complete].slice(0, 4).join(', ') || '—'
    md += `| \`${id}\` | ${label}${alt} | ${appear} | ${complete} |\n`
  }
  md += '\n'
}

const ungrouped = ids.filter((id) => blockFor(id) === '—')
if (ungrouped.length) {
  md += `### Sem bloco (heurística)\n\n`
  md += `| ID | Texto | Onde entra | Onde completa |\n|----|-------|------------|---------------|\n`
  for (const id of ungrouped) {
    const t = tasks.get(id)
    const label = [...t.labels][0] ?? '—'
    md += `| \`${id}\` | ${label} | ${[...t.appear].join(', ')} | ${[...t.complete].join(', ')} |\n`
  }
  md += '\n'
}

md += `## Condições jogáveis (canon — resumo manual)

Estas linhas descrevem **o que o jogador faz**, não só o arquivo que chama \`completeTask\`. Mantidas à mão; alinhar ao regenerar se a progressão mudar.

### Bloco 1

| Pendência | Aparece | Conclui quando |
|-----------|---------|----------------|
| \`task_review_bo\` | Início do jogo | Registra o BO (\`registerInitialPoliceReport\`) |
| \`task_listen_emergency\` | Início | Análise provisória P01 da chamada 08:03 |
| \`task_mariana_phone\` | Início (ou re-rotulada após P01) | Trigger: chats Júlia **e** Camila no celular de Mariana |
| \`task_trace_emergency_call\` | Após P01 | Abre \`doc-central-chamada\` com P01 feito; ou junto do P01 se o doc já estava lido |
| \`task_rafael_recording\` | Fim B1 (\`block01EndTasks\`) | Áudio da balada de Rafael no WhatsApp de Augusto, ou P2 Iapetus (auto se já tinha áudio) |
| \`task_rafael_venue_staff\` | Fim B1 | 1ª visita Vértice — tópico arquivo histórico |
| \`task_get_club_from_rafael\` | Legado (checkpoints B2) | Mesmo que gravação de Rafael recebida |

### Bloco 2

| Pendência | Aparece | Conclui quando |
|-----------|---------|----------------|
| \`task_vertice_dj\` | Após P02 Iapetus | 1ª visita ao Vértice concluída |
| \`task_match_vertice_set\` | Rafael envia gravação da balada | P03 Anéis na bancada |
| \`task_vertice_cross_reference\` | Após P03 | 2ª visita Vértice — cruzamento institucional (Nico) |
| \`task_talk_nico\` | Convergência B2 / cruzamento Vértice | 1ª entrevista Nico (\`finishNicoInterview\`) |

### Bloco 3

| Pendência | Aparece | Conclui quando |
|-----------|---------|----------------|
| \`task_janus_sync\` | Pós-entrevista Nico | Puzzle Janus (Epimetheus) |
| \`task_review_mariana_call_log\` | Após Janus | Entrada Rádio Costeira no histórico (P04) |
| \`task_talk_livia\` | Ligação rádio → visita redação | 1ª entrevista Lívia (\`finishLiviaInterview\`) |
| \`task_saturnalia\` | Arquivo rádio de Lívia | Puzzle Saturnália (P05) |
| \`task_identify_morsa\` | Após Saturnália (\`replaceTasks\`) | Entrevista Samuel (\`finishSamuelInterview\`) |

### Bloco 4

| Pendência | Aparece | Conclui quando |
|-----------|---------|----------------|
| \`task_interview_andre\` | Pós-Samuel / DEV | 1ª entrevista André (\`finishAndreInterview\`) |
| \`task_hexagon\` | Seis UNK preservados | Inspeção espectrogramas Hexágono |
| \`task_phone_forensics\` | Pós-hex ou pacote diário | Laudo perícia celular |
| \`task_open_recovered_diary\` | Laudo perícia | Abre app diário no celular |
| \`task_unlock_diary\` | PIN correto | PIN 481526 aceito |
| \`task_read_diary\` | Diário aberto | Primeira leitura de entrada |
| \`task_unknown_recording\` | Entrada diário “desconhecido” | CHK_UNK localizado no aparelho |
| \`task_analyze_unknown\` | UNK na bancada | Análise concluída |
| \`task_press_nico\` | Fim B4 (\`replaceTasks\`) | Reentrevista Nico — Elisa (\`finishNicoFollowup\`) |

### Blocos 5–9

Para o detalhe arquivo-a-arquivo, use as tabelas geradas acima. Handlers principais:

- **B5:** \`block05Handlers.ts\` (Jana, autos Elisa, linha Maralto, timeline, celular, reabertura 08:03)
- **B6:** \`block06Handlers.ts\` (Geraldo, Jana 2, Válter, Pastor Luas, operação, Miro)
- **B7:** \`block07Handlers.ts\` (Sandra, Morsa duração, lapsos, Júlia/Camila, áudio anônimo, Enceladus, Ricardo, hvalenca, Henrique, Cecília, Cassini divisão)
- **B8:** \`block08Handlers.ts\` (Anéis timeline, André/Morsa, Miro 3, guard-rail, Jaguar/Bia/Rui, rotação, escala)
- **B9:** \`block09Handlers.ts\` (Omitido, Roberto, mensagens, trilha, morte, outros casos, anomalias Augusto, memória final)

---

*${ids.length} ids \`task_*\` indexados em \`${new Date().toISOString().slice(0, 10)}\`.*
`

const out = join(ROOT, 'docs', 'gameplay', 'TASKS_CATALOG.md')
writeFileSync(out, md, 'utf8')
console.log(`Wrote ${out} (${ids.length} tasks)`)