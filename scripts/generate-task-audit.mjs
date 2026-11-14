/**
 * Gera docs/task-audit.md a partir do índice do catálogo + decisões de auditoria.
 * Uso: node scripts/generate-task-audit.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..')
const catalog = readFileSync(join(ROOT, 'docs/gameplay/TASKS_CATALOG.md'), 'utf8')

/** @type {Record<string, { decision: string, entry: string, complete: string, note: string }>} */
const OVERRIDES = {
  task_locate_nico: {
    decision: 'REMOVE',
    entry: '—',
    complete: '—',
    note: 'Fundido em task_talk_nico (B2 convergência).',
  },
  task_contact_radio_costeira: {
    decision: 'REMOVE',
    entry: '—',
    complete: '—',
    note: 'P04 + histórico liberam contato; sem meta de ligação.',
  },
  task_locate_livia: {
    decision: 'REMOVE',
    entry: '—',
    complete: '—',
    note: 'Sem etapa de localização separada.',
  },
  task_andre_visits: {
    decision: 'REMOVE',
    entry: '—',
    complete: '—',
    note: 'Antecipava consulta sem contradição.',
  },
  task_check_andre_chronology: {
    decision: 'RESTORE',
    entry: 'Pós-entrevista André (chronology_search_unlocked)',
    complete: 'Contradição contra_andre_night_hours (dois documentos)',
    note: 'Guia o cruzamento que dispara block04_hex_call_pending e a cena das 6 ligações.',
  },
  task_get_club_from_rafael: {
    decision: 'REMOVE',
    entry: '—',
    complete: '—',
    note: 'Legado; mesma função que task_rafael_recording.',
  },
  task_research_maralto: {
    decision: 'REMOVE',
    entry: '—',
    complete: '—',
    note: 'completeTask morto no onOpen do documento.',
  },
  task_call_renata: {
    decision: 'REMOVE',
    entry: '—',
    complete: '—',
    note: 'Chamada fixa liberada após Júlia; sem meta telefônica.',
  },
  task_weigh_mariana_messages: {
    decision: 'MERGE',
    entry: '—',
    complete: '—',
    note: 'Fundida em task_read_mariana_messages (onda 2).',
  },
  task_how_mariana_knew: {
    decision: 'REMOVE',
    entry: '—',
    complete: '—',
    note: 'Pergunta temática; B9 abre com task_compare_omitido_system.',
  },
  task_talk_nico: {
    decision: 'FIX_COMPLETION',
    entry: 'Cruzamento Vértice ou cadastro Nico',
    complete: 'finishNicoEarlyInterview ou finishNicoInterview',
    note: 'Visita antecipada (Titã pré-Elisa) já encerra a meta; reentrevista canônica sem nova pendência.',
  },
  task_press_nico: {
    decision: 'REWRITE',
    entry: 'Fim B4 replaceTasks',
    complete: 'finishNicoFollowup',
    note: 'Texto: Questionar Nico sobre Elisa.',
  },
  task_review_mariana_call_log: {
    decision: 'KEEP',
    entry: 'Pós-JanUs',
    complete: 'Seleção Rádio Costeira (block03PhoneHooks)',
    note: 'Conclusão sem meta de contactar rádio.',
  },
  task_talk_livia: {
    decision: 'FIX_COMPLETION',
    entry: 'Ligação fixa (visit) ou recorte Maralto (alternativo)',
    complete: 'finishLiviaInterview',
    note: 'doc-maralto-clipping não recria após entrevista; reparo se Saturnália limpou a lista.',
  },
  task_interview_andre: {
    decision: 'FIX_COMPLETION',
    entry: 'Pós-Samuel',
    complete: '1ª visita André',
    note: 'Sem metas de registros pós-visita.',
  },
  task_compare_henrique_mariana_system: {
    decision: 'REWRITE',
    entry: 'Fim B7 onTechReflectionDone',
    complete: 'block08_start trigger',
    note: 'Texto neutro (comparar registros), sem spoiler de “mesmo sistema”.',
  },
  task_aster_henrique: {
    decision: 'REWRITE',
    entry: 'Pós-reflexão hvalenca',
    complete: 'onAsterHenriqueNamed',
    note: 'Investigativa, não “contatar/ligar”.',
  },
  task_check_julia_camila_onset: {
    decision: 'REWRITE',
    entry: 'Janela lapsos B7',
    complete: 'Chamadas Júlia/Camila',
    note: 'Pergunta investigativa, não instrução de ligação.',
  },
  task_read_mariana_messages: {
    decision: 'MERGE',
    entry: 'Pós-Roberto',
    complete: 'weighMarianaMessageImpossibilities',
    note: 'Rótulo neutro; absorve onda 2.',
  },
  task_compare_omitido_system: {
    decision: 'KEEP',
    entry: 'Fim B8 / block09_start',
    complete: 'compareHenriqueMarianaSystem',
    note: 'Substitui task_how_mariana_knew no painel.',
  },
  task_omitido_assistance: {
    decision: 'REWRITE',
    entry: 'Pós-relê diário Omitido',
    complete: 'mapOmitidoAssistance (docs técnicos)',
    note: 'Ação concreta em vez de pergunta aberta.',
  },
  task_reread_diary_omitido: {
    decision: 'REWRITE',
    entry: 'Pós-nomear Omitido',
    complete: 'rereadDiaryOmitido',
    note: 'Relê diário com novo contexto.',
  },
  task_identify_morsa: {
    decision: 'KEEP',
    entry: 'Pós-Saturnália',
    complete: 'finishSamuelInterview',
    note: 'Só ativa após pista radiofônica; não antes.',
  },
  task_locate_jana: {
    decision: 'KEEP',
    entry: 'Pós-Nico2',
    complete: 'Consulta autos Jana (documento)',
    note: 'Par válido: descoberta nos autos → visita task_talk_jana.',
  },
  task_talk_jana: {
    decision: 'KEEP',
    entry: 'Após localizar nos autos',
    complete: 'finishJanaInterview',
    note: 'Unidade separada da pesquisa documental.',
  },
  task_reexamine_elisa_from_scratch: {
    decision: 'KEEP',
    entry: 'Fim B5',
    complete: 'onElisaReconstructionStarted',
    note: 'Geraldo é primeira ação concreta.',
  },
  task_talk_geraldo: {
    decision: 'KEEP',
    entry: 'Doc / flag reconstrução Elisa',
    complete: 'finishGeraldoInterview',
    note: 'Par com reconstrução — há trabalho entre cadastro e visita.',
  },
  task_find_jaguar_workshop: {
    decision: 'KEEP',
    entry: 'Trilha Jaguar B8',
    complete: 'onWorkshopLocated (ou equivalente)',
    note: 'Investigação DETRAN/oficinas antes de Dênis.',
  },
  task_talk_denis: {
    decision: 'KEEP',
    entry: 'Oficina localizada',
    complete: 'finishDenisInterview',
    note: 'Visita após trabalho de localização.',
  },
  task_locate_sandra: {
    decision: 'KEEP',
    entry: 'Pós-Miro / B7',
    complete: 'Consulta cadastro Sandra',
    note: 'Pergunta concreta no rótulo; completa ao achar testemunha.',
  },
  task_talk_sandra: {
    decision: 'KEEP',
    entry: 'Sandra localizada',
    complete: 'finishSandraInterview',
    note: 'Depoimento único conclui meta.',
  },
  task_investigate_henrique: {
    decision: 'KEEP',
    entry: 'Identidade Henrique confirmada',
    complete: 'onHenriqueTrailComplete (3 evidências)',
    note: 'Meta-pai fecha antes de task_talk_cecilia.',
  },
  task_press_miro_further: {
    decision: 'REMOVE',
    entry: '—',
    complete: 'completeTask legado em B7',
    note: 'Sem addTask ativo; só conclusão residual.',
  },
  task_crosscheck_ricardo_mariana: {
    decision: 'REMOVE',
    entry: '—',
    complete: 'onRicardoIdentityDeadEnd',
    note: 'Sem rótulo; fluxo absorvido por outras metas.',
  },
  task_revisit_mariana_ricardo_clue: {
    decision: 'KEEP',
    entry: 'Nota parcial hvalenca',
    complete: 'onMarianaPartialIdRevisited',
    note: 'Sem texto em catálogo — mantida só como conclusão interna.',
  },
  task_lookup_callsign_scale: {
    decision: 'REMOVE',
    entry: '—',
    complete: 'Consulta doc-escala',
    note: 'Sem addTask; completa por consulta.',
  },
  task_message_after_death: {
    decision: 'REMOVE',
    entry: '—',
    complete: 'onPostDeathMessageRead',
    note: 'Legado sem entrada ativa.',
  },
}

const rows = []
const seen = new Set()

for (const m of catalog.matchAll(/\| `(task_[a-z0-9_]+)` \| ([^|]+) \|/g)) {
  const id = m[1]
  if (seen.has(id)) continue
  const label = m[2].trim()
  seen.add(id)
  const head = catalog.slice(0, m.index)
  const blockHeaders = [...head.matchAll(/^### (.+)$/gm)]
  const block = blockHeaders.length ? blockHeaders[blockHeaders.length - 1][1].trim() : '—'
  const o = OVERRIDES[id]
  rows.push({
    id,
    block: block.startsWith('B') ? block : '—',
    decision: o?.decision ?? 'KEEP',
    entry: o?.entry ?? 'Ver TASKS_CATALOG (entra)',
    complete: o?.complete ?? 'Ver TASKS_CATALOG (completa)',
    note: o?.note ?? (label === '—' ? 'Sem rótulo ativo — só completeTask residual.' : ''),
  })
}

for (const [id, o] of Object.entries(OVERRIDES)) {
  if (seen.has(id)) continue
  rows.push({
    id,
    block: '—',
    decision: o.decision,
    entry: o.entry,
    complete: o.complete,
    note: o.note,
  })
}

rows.sort((a, b) => a.id.localeCompare(b.id))

let md = `# Auditoria de metas investigativas (\`task_*\`)

Revisão global B1–B9 (critérios: motivo imediato, sem telefone óbvio, sem spoiler, conclusão semântica, sem reintrodução por checkpoint).

**Gerado:** \`${new Date().toISOString().slice(0, 10)}\` — \`node scripts/generate-task-audit.mjs\`

| ID | Bloco | Decisão | Momento de entrada | Momento de conclusão | Observação |
|----|-------|---------|-------------------|----------------------|------------|
`

for (const r of rows) {
  md += `| \`${r.id}\` | ${r.block} | ${r.decision} | ${r.entry} | ${r.complete} | ${r.note} |\n`
}

md += `
## Resumo das mudanças de runtime

- **Removidas do fluxo ativo:** \`task_contact_radio_costeira\`, \`task_locate_livia\`, \`task_andre_visits\`, \`task_check_andre_chronology\`, \`task_call_renata\`, \`task_locate_nico\`, \`task_how_mariana_knew\`, legados sem add (\`task_research_maralto\`, \`task_get_club_from_rafael\`, etc.).
- **Migração de saves:** \`personRegistryGates.ts\` → \`REMOVED_TASK_IDS\`.
- **B3:** histórico de chamadas conclui ao destacar Rádio Costeira; ligação sem meta.
- **B4:** só \`task_interview_andre\` na 1ª visita; \`task_press_nico\` renomeada (Elisa).
- **B7–B9:** textos neutros (Henrique×Mariana, Aster, mensagens); fusão leitura/peso Mariana.
`

writeFileSync(join(ROOT, 'docs', 'task-audit.md'), md, 'utf8')
console.log(`Wrote docs/task-audit.md (${rows.length} tasks)`)