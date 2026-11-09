/**
 * Extrai o texto diegético do jogo para Markdown cronológico.
 * Uso: npx --yes tsx scripts/dump-narrative.ts
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { hospitalBeats, hospitalTopicLabels } from '../src/data/block01/hospitalInterview'
import { block01MarianaChats } from '../src/data/block01/marianaChats'
import { marianaBlock01Notes } from '../src/data/block01/marianaNotes'
import { marianaDeviceCallLog } from '../src/data/block01/marianaCalls'
import { augustoDeviceCallLog } from '../src/data/block01/augustoCalls'
import {
  marianaPhotosLibrary,
  marianaFilesLibrary,
  augustoPhotosLibrary,
  augustoFilesLibrary,
} from '../src/data/block01/phoneMedia'
import { verticeBeats, verticeTopicLabels } from '../src/data/block02/verticeInterview'
import { lucasBeats, lucasTopicLabels } from '../src/data/block02/lucasInterview'
import { nicoBeats, nicoTopicLabels } from '../src/data/block03/nicoInterview'
import { liviaBeats, liviaTopicLabels } from '../src/data/block03/liviaInterview'
import { samuelBeats, samuelTopicLabels } from '../src/data/block04/samuelInterview'
import { andreBeats, andreTopicLabels } from '../src/data/block04/andreInterview'
import { block04DiaryEntries } from '../src/data/block04/diaryEntries'
import { HEX_NODES, HEX_PHRASE, HEX_PIN, HEX_CYCLE } from '../src/data/block04/hexagonPuzzle'
import { nicoFollowupBeats, nicoFollowupLabels } from '../src/data/block05/nicoFollowup'
import { janaBeats, janaTopicLabels } from '../src/data/block05/janaInterview'
import { geraldoBeats, geraldoTopicLabels } from '../src/data/block06/geraldoInterview'
import { janaFollowupBeats, janaFollowupLabels } from '../src/data/block06/janaFollowup'
import { miroBeats, miroTopicLabels } from '../src/data/block06/miroInterview'
import {
  PASTOR_CYCLES,
  PASTOR_TOKEN,
  PASTOR_LOCATION_LABEL,
  PASTOR_CODE_TABLE,
  decodeBurst,
} from '../src/data/block06/pastorMoonsPuzzle'
import { sandraBeats, sandraTopicLabels } from '../src/data/block07/sandraInterview'
import { miroFollowupBeats, miroFollowupLabels } from '../src/data/block07/miroFollowup'
import { ceciliaBeats, ceciliaTopicLabels } from '../src/data/block07/ceciliaInterview'
import {
  ENCELADUS_BURSTS,
  ENCELADUS_HOSPITAL_MATCH,
  ENCELADUS_VOICE_FRAGMENT,
  ENCELADUS_SHIFT_HINT,
  ENCELADUS_REF_TABLE,
} from '../src/data/block07/enceladusPuzzle'
import { CASSINI_CAPTURE, CASSINI_SESSION_A_SUMMARY, CASSINI_SESSION_B_SUMMARY } from '../src/data/block07/cassiniPuzzle'
import { andreFollowupBeats, andreFollowupLabels } from '../src/data/block08/andreFollowup'
import { miroThirdBeats, miroThirdLabels } from '../src/data/block08/miroThird'
import { mauroBeats, mauroTopicLabels } from '../src/data/block08/mauroInterview'
import { denisBeats, denisTopicLabels } from '../src/data/block08/denisInterview'
import { biaBeats, biaTopicLabels } from '../src/data/block08/biaInterview'
import { ruiBeats, ruiTopicLabels } from '../src/data/block08/ruiInterview'
import {
  RING_SOURCES,
  RING_TRUE_ORDER,
  RING_CALLSIGN_HINT,
  RING_CONTINUITY_FRAMES,
  RING_CONTINUITY_CHECKS,
} from '../src/data/block08/ringsPuzzle'
import { ROTATION_LOGS, ROTATION_CALLSIGN } from '../src/data/block08/rotationPuzzle'
import { TRAIL_DISCOVERY_BEATS } from '../src/data/block09/trailDiscovery'
import {
  MARIANA_CHAT_ID,
  marianaMessagesWave1,
  marianaMessagesWave2,
  marianaMessagesWave3,
  marianaMessagesAnomaly,
} from '../src/data/block09/marianaMessages'
import { MEMORY_SEGMENTS, MEMORY_SOURCES, MEMORY_WORD } from '../src/data/block09/memoryPuzzle'
import { reflections } from '../src/data/reflections'
import { sceneIntros } from '../src/data/sceneIntros'
import { seedDocuments } from '../src/data/game/seedDocuments'
import { seedEvidenceCatalog } from '../src/data/game/seedEvidence'
import { seedPeople } from '../src/data/game/seedPeople'
import { seedLocations } from '../src/data/game/seedLocations'
import { seedContacts } from '../src/data/game/seedContacts'
import {
  seedTasks,
  block01EndTasks,
  hypothesisCatalog,
  contradictionDefs,
} from '../src/data/game/seedStory'
import { callScripts, landlineDirectory } from '../src/data/calls'
import { paulaScript, rafaelScript } from '../src/data/chatScripts'
import { mockCalendarEvents } from '../src/data/mockCalendar'
import { mockChats } from '../src/data/mockChats'
import { contactById } from '../src/data/mockContacts'
import type { ChatMessage, ChatThread } from '../src/types/messaging'
import type { ChatScript } from '../src/data/chatScripts'

const out: string[] = []
const L = (...lines: string[]) => {
  out.push(...lines, '')
}

function esc(s: string) {
  return s.replace(/\r\n/g, '\n')
}

function quote(text: string) {
  return esc(text)
    .split('\n')
    .map((ln) => `> ${ln || ' '}`)
    .join('\n')
}

function dumpBeats(
  title: string,
  introLines: string[] | undefined,
  labels: Record<string, string>,
  beats: Record<string, { speaker?: string; text: string }[]>,
) {
  L(`#### ${title}`)
  if (introLines?.length) L(`*Abertura:* ${introLines.join(' · ')}`)
  for (const [id, label] of Object.entries(labels)) {
    L(`##### ${label}`)
    for (const b of beats[id] ?? []) {
      const who = b.speaker ?? '*narração*'
      L(`**${who}**`)
      L(quote(b.text))
    }
  }
}

function formatMsg(m: ChatMessage, meLabel: string, themLabel: string): string {
  if (m.kind === 'date-separator') return `*— ${m.label} —*`
  const who = 'from' in m ? (m.from === 'me' ? meLabel : themLabel) : ''
  if (m.kind === 'text') return `**${who}** (${m.timestamp})\n${quote(m.text)}`
  if (m.kind === 'image')
    return `**${who}** (${m.timestamp}) *[imagem]*${m.caption ? `\n${quote(m.caption)}` : ''}`
  if (m.kind === 'audio')
    return `**${who}** (${m.timestamp}) *[áudio ${m.durationSec}s]* \`${m.audioSrc}\``
  if (m.kind === 'deleted') return `**${who}** (${m.timestamp}) *[mensagem apagada]*`
  if (m.kind === 'media-missing') return `**${who}** (${m.timestamp}) *[mídia ausente]* ${m.label}`
  return ''
}

function dumpThread(thread: ChatThread, me: string, them: string) {
  const name = contactById[thread.contactId]?.name ?? thread.contactId
  L(`##### ${name} (\`${thread.id}\`)`)
  for (const m of thread.messages) {
    const line = formatMsg(m, me, them)
    if (line) L(line)
  }
}

function dumpScript(script: ChatScript, title: string) {
  L(`##### ${title} (\`${script.chatId}\`)`)
  L(`*Campo vazio:* ${script.emptyHint}`)
  script.steps.forEach((step, i) => {
    L(`**Etapa ${i + 1} — opções de Augusto**`)
    step.options.forEach((opt, j) => L(`${j + 1}. ${opt}`))
    if (step.repliesByOption) {
      step.repliesByOption.forEach((replies, j) => {
        L(`*Se escolher ${j + 1}:*`)
        for (const r of replies) {
          if (r.kind === 'text') L(quote(r.text))
          else L(`*[áudio]* \`${r.audioSrc}\` (${r.durationSec}s)`)
        }
      })
    } else {
      L('*Resposta:*')
      for (const r of step.replies) {
        if (r.kind === 'text') L(quote(r.text))
        else L(`*[áudio]* \`${r.audioSrc}\` (${r.durationSec}s)`)
      }
    }
  })
}

function docLoc(system?: string) {
  const map: Record<string, string> = {
    consultas: 'Computador — Consultas',
    ocorrencias: 'Computador — Ocorrências',
    autos: 'Computador — Autos',
    documentos: 'Computador — Documentos',
    pericia: 'Computador — Perícia',
  }
  return system ? map[system] ?? `Computador — ${system}` : 'Computador'
}

const PHYSICAL = new Set([
  'doc-bo-inicial',
  'doc-central-chamada',
  'doc-entrada-apartamento',
  'doc-apreensao-celular',
  'doc-extracao-inicial',
])

function dumpDocs(ids: string[]) {
  for (const id of ids) {
    const doc = seedDocuments.find((d) => d.id === id)
    if (!doc) continue
    const loc = PHYSICAL.has(id) ? `Pasta física da mesa + ${docLoc(doc.system)}` : docLoc(doc.system)
    L(`##### ${doc.title}`)
    L(`*Local:* ${loc}`)
    if (doc.issuer || doc.dateLabel) L(`*${[doc.issuer, doc.dateLabel].filter(Boolean).join(' · ')}*`)
    if (doc.imageCaption) L(`*Imagem:* ${doc.imageCaption}`)
    for (const b of doc.blocks) L(quote(b.text))
    if (doc.leads?.length) {
      L('*Pistas operacionais:*')
      for (const lead of doc.leads) L(`- ${lead.label}: ${lead.value}`)
    }
  }
}

function dumpEvidence(ids: string[]) {
  for (const id of ids) {
    const e = seedEvidenceCatalog.find((x) => x.id === id)
    if (!e) continue
    L(`- **${e.title}**${e.description ? ` — ${e.description}` : ''}`)
  }
}

function dumpCall(id: string) {
  const c = callScripts.find((x) => x.id === id)
  if (!c) return
  L(`##### ${c.speaker}${c.ext ? ` (ramal ${c.ext})` : ''}`)
  for (const line of c.lines) {
    L(`**${line.who === 'augusto' ? 'Augusto' : c.speaker}**`)
    L(quote(line.text))
  }
  if (c.timeSkip) L(`*${c.timeSkip}*`)
  if (c.result) L(`*Resultado:* ${c.result.label} — ${c.result.detail}`)
}

function dumpRefl(id: string) {
  const r = reflections.find((x) => x.id === id)
  if (!r) return
  L(`##### Reflexão \`${r.id}\``)
  L('*Local:* NVL — pensamento de Augusto (após cena / hub)*')
  r.blocks.forEach((b, i) => {
    L(`**[${i + 1}]**`)
    L(quote(b))
  })
}

const DOC_B1 = [
  'doc-bo-inicial',
  'doc-central-chamada',
  'doc-entrada-apartamento',
  'doc-apreensao-celular',
  'doc-extracao-inicial',
]
const DOC_B2 = ['doc-lucas-cadastro', 'doc-elisa-resumo', 'doc-elisa-testemunhas']
const DOC_B3 = [
  'doc-elisa-cronologia',
  'doc-vertice-escala',
  'doc-nico-cadastro',
  'doc-maralto-cadastro',
  'doc-maralto-clipping',
  'doc-cruzamento-maralto-elisa',
]
const DOC_B4 = [
  'doc-protesto-ocorrencia',
  'doc-protesto-detidos',
  'doc-samuel-ficha',
  'doc-andre-ficha',
  'doc-andre-visitas',
  'doc-andre-ligacoes',
  'doc-numero-sem-nome',
  'doc-laudo-forense',
]
const DOC_B5 = [
  'doc-elisa-jana',
  'doc-elisa-argumento',
  'doc-elisa-alibi',
  'doc-elisa-testemunha-queda',
  'doc-mariana-contact-chronology',
  'doc-phone-file-dependencies',
  'doc-emergency-reassessment',
]
const DOC_B6 = [
  'doc-elisa-geraldo-depoimento',
  'doc-geraldo-ficha',
  'doc-vertice-comanda-noitex',
  'doc-valter-ocorrencias',
  'doc-valter-associados',
  'doc-valter-interceptacao',
  'doc-tabela-logistica-g17n',
]
const DOC_B7 = [
  'doc-sandra-depoimento',
  'doc-sandra-ficha',
  'doc-morsa-duration-note',
  'doc-memory-onset-chronology',
  'doc-hospital-ricardo-freitas',
  'doc-ricardo-consulta-negativa',
  'doc-mariana-ricardo-note',
  'doc-henrique-cadastro',
  'doc-henrique-empresa',
  'doc-henrique-incidente',
  'doc-cecilia-contato',
  'doc-henrique-pcap-note',
]
const DOC_B8 = [
  'doc-guardrail-reanalise',
  'doc-camera-veiculo-madrugada',
  'doc-mauro-transferencia',
  'doc-bia-ficha',
  'doc-rui-ficha',
  'doc-escala-vtr14',
]
const DOC_B9 = [
  'doc-omitido-interface',
  'doc-diario-releitura-omitido',
  'doc-omitido-assistencia',
  'doc-roberto-denuncia',
  'doc-mensagens-impossiveis',
  'doc-trilha-camera-mariana',
  'doc-trilha-transporte-mariana',
  'doc-trilha-fisica-mariana',
  'doc-outros-desaparecimentos',
  'doc-anomalias-augusto',
]

L('# SATURNUS — Transcrição cronológica')
L(
  'Texto diegético extraído das fontes do jogo (cenas, WhatsApp, notas, diário, ligações, computador, caderno, bancada, reflexões). Áudios aparecem como referência de arquivo, não como transcrição fonética. Opções de WhatsApp do Augusto são formulações cosméticas da mesma intenção.',
)
L('---')

L('## Índice')
L(
  [
    '1. [Bloco 1 — O desaparecimento](#bloco-1--o-desaparecimento)',
    '2. [Bloco 2 — Duas trilhas](#bloco-2--duas-trilhas)',
    '3. [Bloco 3 — Noites fora de ordem](#bloco-3--noites-fora-de-ordem)',
    '4. [Bloco 4 — Memórias que não pertencem](#bloco-4--memórias-que-não-pertencem)',
    '5. [Bloco 5 — O percurso deixado](#bloco-5--o-percurso-deixado)',
    '6. [Bloco 6 — A pessoa errada](#bloco-6--a-pessoa-errada)',
    '7. [Bloco 7 — O homem que não era Ricardo](#bloco-7--o-homem-que-não-era-ricardo)',
    '8. [Bloco 8 — Não houve assassinato naquela noite](#bloco-8--não-houve-assassinato-naquela-noite)',
    '9. [Bloco 9 — Memória](#bloco-9--memória)',
    '10. [Anexos](#anexos)',
  ].join('\n'),
)

L('## Bloco 1 — O desaparecimento')

L('### Caderno — pendências iniciais')
for (const t of seedTasks) L(`- ${t.label}`)
L('*Ao fim do bloco:*')
for (const t of block01EndTasks) L(`- ${t.label}`)

L('### Pasta física / Computador')
dumpDocs(DOC_B1)

L('### Bancada — ligação de emergência')
dumpEvidence(['emergency_call_raw', 'emergency_call_restored', 'call_history_gap'])

L('### Celular de Mariana — WhatsApp')
L('*Local:* aparelho apreendido (EV-01). `me` = Mariana.*')
for (const th of block01MarianaChats) dumpThread(th, 'Mariana', contactById[th.contactId]?.name ?? th.contactId)

L('### Celular de Mariana — Notas')
for (const n of marianaBlock01Notes) {
  L(`##### ${n.title}`)
  L(`*Atualizado:* ${n.updatedAt}`)
  L(quote(n.body))
}

L('### Celular de Mariana — Calendário')
for (const ev of mockCalendarEvents) {
  L(`- **${ev.title}** — ${ev.date} ${ev.time ?? ''}${ev.location ? ` · ${ev.location}` : ''}${ev.notes ? ` · ${ev.notes}` : ''}`)
}

L('### Celular de Mariana — Fotos / Arquivos / Chamadas')
L('**Fotos**')
for (const p of marianaPhotosLibrary) L(`- ${p.label} (${p.folder})`)
L('**Arquivos**')
for (const f of marianaFilesLibrary) L(`- ${f.label} (${f.folder})`)
L('**Recentes**')
for (const c of marianaDeviceCallLog) {
  L(`- ${c.direction} ${c.contactId} · ${c.dateLabel} ${c.time}${c.duration ? ` (${c.duration})` : ''}`)
}

L('### Celular de Augusto — WhatsApp (pré-existente)')
const camilaAug = mockChats.find((c) => c.id === 'chat-camila-augusto')
if (camilaAug) dumpThread(camilaAug, 'Augusto', 'Camila')

L('### Celular de Augusto — Fotos / Arquivos / Chamadas')
for (const p of augustoPhotosLibrary) L(`- ${p.label} (${p.folder})`)
for (const f of augustoFilesLibrary) L(`- ${f.label} (${f.folder})`)
for (const c of augustoDeviceCallLog) {
  L(`- ${c.direction} ${c.contactId} · ${c.dateLabel} ${c.time}${c.duration ? ` (${c.duration})` : ''}`)
}

L('### Cena — Hospital Municipal')
dumpBeats('Hospital — tópicos', sceneIntros.hospital.lines, hospitalTopicLabels, hospitalBeats)

L('### Caderno — provas e contradição (Bloco 1)')
dumpEvidence([
  'initial_police_report',
  'mariana_phone',
  'mariana_memory_lapses',
  'rafael_call_memory',
  'rafael_audio_reply',
  'julia_kept_folder',
  'camila_witness_note',
])
L('##### Contradição')
for (const c of contradictionDefs.filter((x) => x.id === 'contra_selective_memory')) {
  L(`- **${c.id}:** ${c.summary}`)
}

L('## Bloco 2 — Duas trilhas')

L('### Celular de Augusto — WhatsApp (conversas iniciadas)')
dumpScript(rafaelScript, 'Rafael')
dumpScript(paulaScript, 'Paula')

L('### Computador')
dumpDocs(DOC_B2)

L('### Cena — Boate Vértice')
dumpBeats('Vértice — tópicos', sceneIntros.vertice.lines, verticeTopicLabels, verticeBeats)

L('### Cena — Universidade (Lucas)')
dumpBeats('Lucas Moreira — tópicos', sceneIntros.lucas.lines, lucasTopicLabels, lucasBeats)
dumpRefl('refl-lucas')

L('### Caderno — provas (Bloco 2)')
dumpEvidence([
  'rafael_forward_from_mariana',
  'rafael_recording_vertice_tag',
  'mariana_vertice_visit',
  'mariana_repeated_questions',
  'nico_dj_identified',
  'paula_leads_lucas',
  'lucas_knew_elisa',
  'mariana_andre_innocence',
  'elisa_case_summary',
  'nico_elisa_witness',
  'mariana_rebuilding_elisa_case',
])

L('## Bloco 3 — Noites fora de ordem')

L('### Telefone fixo')
dumpCall('call-nico')
dumpCall('call-livia')

L('### Computador')
dumpDocs(DOC_B3)

L('### Cena — Rádio Costeira (Lívia)')
dumpBeats('Lívia Serrano — tópicos', sceneIntros.livia.lines, liviaTopicLabels, liviaBeats)
dumpRefl('refl-livia')

L('### Cena — Titã (Nico)')
dumpBeats('Nico — tópicos', sceneIntros.nico.lines, nicoTopicLabels, nicoBeats)
dumpRefl('refl-nico')

L('### Celular de Mariana — Arquivos (após reanálise)')
L('- **REC_1102.m4a** (Downloads) — localizado após reanálise; gravação Maralto')

L('### Bancada — Janus / Saturnalia')
L('*Puzzles de áudio (Lívia + Nico). Textos de resultado no caderno:*')
dumpEvidence([
  'nico_recording_booth',
  'nico_recording_portable',
  'vertice_clocks_unsynced',
  'vertice_timeline_inconsistent',
  'mariana_revising_elisa_chronology',
  'mariana_maralto_recording',
  'mariana_investigating_protests',
  'maralto_public_record',
  'maralto_no_elisa_link',
  'livia_sought_by_mariana',
  'livia_radio_archive_raw',
  'protest_records_incomplete',
  'protest_masked_core',
  'morsa_unidentified',
])
L('##### Contradição')
for (const c of contradictionDefs.filter((x) => x.id === 'contra_vertice_clock')) {
  L(`- **${c.id}:** ${c.summary}`)
}

L('## Bloco 4 — Memórias que não pertencem')

L('### Computador')
dumpDocs(DOC_B4)

L('### Telefone fixo')
dumpCall('call-presidio-visit')
dumpCall('call-pericia-device')

L('### Cena — Samuel')
dumpBeats('Samuel Teixeira — tópicos', sceneIntros.samuel.lines, samuelTopicLabels, samuelBeats)
dumpRefl('refl-samuel')

L('### Cena — Penitenciária (André)')
dumpBeats('André Silva — tópicos', sceneIntros.andre.lines, andreTopicLabels, andreBeats)
dumpRefl('refl-andre')

L('### Cutscene — as seis ligações (Hexágono)')
L('*Local:* telefone fixo da mesa. Ninguém fala; um áudio passa; a linha cai; reflexão; seis arquivos na bancada.*')
dumpRefl('refl-hex-call')

L('### Bancada — Puzzle Hexágono')
L(`Ciclo: ${HEX_CYCLE.join(' → ')}`)
L(`Frase: **${HEX_PHRASE}**`)
L(`PIN do diário: **${HEX_PIN}**`)
for (const n of HEX_NODES) {
  L(`- **${n.id}** ${n.displayName} → ${n.pointsTo} · fragmento “${n.fragment}” · dígito ${n.digit}`)
}

L('### Celular de Mariana — Diário oculto')
L('*Local:* launcher de Mariana, ícone Diário, após laudo pericial. PIN 481526.*')
for (const e of block04DiaryEntries) {
  L(`##### ${e.title} (${e.dateLabel})`)
  L(quote(e.body))
}

L('### Celular de Mariana — Arquivos (após diário)')
L('- **CHK_UNK.m4a** (Downloads) — indicado no diário')

L('### Caderno — provas (Bloco 4)')
dumpEvidence([
  'samuel_protest_lead',
  'samuel_current_record',
  'samuel_confirms_morsa',
  'mariana_sought_samuel',
  'mariana_morsa_timing',
  'mariana_andre_visit_record',
  'andre_confirms_shift',
  'andre_told_her_to_stop',
  'andre_no_maralto_link',
  'andre_contact_chronology_mismatch',
  'hex_phrase_recovered',
  'hidden_app_detected',
  'hidden_diary_recovered',
  'diary_memory_fear',
  'diary_julia_contradiction',
  'unknown_contact_recording',
  'unknown_knows_mariana',
  'elisa_original_chronology',
  'protest_incident_report',
  'samuel_detainee_record',
  'andre_authorized_calls',
  'unknown_number_log',
])

L('## Bloco 5 — O percurso deixado')

L('### Cena — Nico (2ª)')
dumpBeats('Nico — follow-up', sceneIntros.nico.lines, nicoFollowupLabels, nicoFollowupBeats)
dumpRefl('refl-nico2')

L('### Computador')
dumpDocs(DOC_B5)

L('### Cena — Jana Ribeiro')
dumpBeats('Jana — tópicos', sceneIntros.jana.lines, janaTopicLabels, janaBeats)
dumpRefl('refl-jana')

L('### Caderno — cronologia de contatos de Mariana')
L('*Montada a partir de quem já está no caderno:*')
for (const c of [
  'Rafael (hospital)',
  'Nico / Vértice',
  'Paula',
  'Lucas Moreira',
  'Lívia Serrano',
  'Samuel Teixeira',
  'Jana Ribeiro',
  'André (unidade)',
])
  L(`- ${c}`)

L('### Reflexões (Bloco 5)')
dumpRefl('refl-b05-andre')
dumpRefl('refl-b05-maralto')
dumpRefl('refl-b05-coincidence')
dumpRefl('refl-b05-path')

L('### Caderno — provas (Bloco 5)')
dumpEvidence([
  'nico_believes_jacket_jana',
  'jana_current_record',
  'jana_confirms_jacket',
  'jana_loan_explanation',
  'elisa_argument_jealousy',
  'elisa_weak_alibi',
  'elisa_lookalike_near_fall',
  'mariana_sought_people_before',
  'phone_files_depend_on_order',
  'call_enabled_apartment_entry',
  'phone_seized_after_call',
])

L('## Bloco 6 — A pessoa errada')

L('### Computador')
dumpDocs(DOC_B6)

L('### Cena — Geraldo')
dumpBeats('Geraldo Mota — tópicos', sceneIntros.geraldo.lines, geraldoTopicLabels, geraldoBeats)
dumpRefl('refl-b06-geraldo')

L('### Cena — Jana (2ª)')
dumpBeats('Jana — follow-up', sceneIntros.jana.lines, janaFollowupLabels, janaFollowupBeats)
dumpRefl('refl-jana2')

L('### Bancada — Luas Pastoras')
L(`Token: **${PASTOR_TOKEN}** → ${PASTOR_LOCATION_LABEL}`)
L('Tabela:')
for (const row of PASTOR_CODE_TABLE) L(`- ${row.token} = ${row.place}`)
for (const c of PASTOR_CYCLES) {
  const ch = decodeBurst(c.burstB.senderId, c.burstB.payload)
  L(
    `- Ciclo ${c.sequence}: A ${c.leftA.time} ${c.leftA.callsign} (${c.leftA.note}) / B ${c.burstB.time} → “${ch}” / C ${c.rightC.time} ${c.rightC.callsign} (${c.rightC.note})`,
  )
}

L('### Cutscene — Operação Galpão 17')
L(`*Abertura:* ${sceneIntros.operation.lines.join(' · ')}`)
const OP = [
  { speaker: 'Augusto', text: 'Equipes posicionadas. Galpão 17 — Pátio Norte. Entrada coordenada.' },
  { speaker: 'Rádio', text: 'Unidade dois no perímetro. Sem movimento na frente.' },
  { speaker: undefined, text: 'Sirene curta. Passos. Metal. Alguém tenta sair pelo pátio.' },
  { speaker: 'Augusto', text: 'Miro identificado. Contido. Sem disparos.' },
  { speaker: 'Rádio', text: 'Custódia confirmada. Material apreendido no local.' },
  { speaker: 'Augusto', text: 'Prisão por crimes atuais. Levar à detenção. Entrevista depois.' },
]
for (const b of OP) {
  L(`**${b.speaker ?? 'narração'}**`)
  L(quote(b.text))
}

L('### Cena — Miro (detenção)')
dumpBeats('Miro — tópicos', sceneIntros.miro.lines, miroTopicLabels, miroBeats)
dumpRefl('refl-b06-miro')

L('### Caderno — provas (Bloco 6)')
dumpEvidence([
  'geraldo_minimized_alcohol',
  'elisa_more_alcohol_than_stated',
  'geraldo_suspected_underage',
  'vertice_comanda_night_x',
  'jana_gave_belongings_deliberately',
  'jana_feared_valter_people',
  'valter_criminal_structure',
  'miro_linked_to_valter_group',
  'valter_group_active_intercepts',
  'pastor_token_g17n',
  'galpao17_operational_site',
  'miro_arrested_current_crimes',
  'miro_sought_jana_night_x',
  'miro_followed_elisa_by_mistake',
  'miro_denies_killing_elisa',
  'miro_descended_fall_area',
  'miro_recovered_jana_bag',
])

L('## Bloco 7 — O homem que não era Ricardo')

L('### Cena — Miro (2ª)')
dumpBeats('Miro — follow-up', sceneIntros.miro.lines, miroFollowupLabels, miroFollowupBeats)

L('### Cena — Sandra Almeida')
dumpBeats('Sandra — tópicos', sceneIntros.sandra.lines, sandraTopicLabels, sandraBeats)
dumpRefl('refl-b07-sandra')

L('### Computador')
dumpDocs(DOC_B7)

L('### Telefone fixo')
dumpCall('call-hospital')

L('### Bancada — Enceladus')
L(`Match: ${ENCELADUS_HOSPITAL_MATCH}`)
L(`Fragmento de voz: **${ENCELADUS_VOICE_FRAGMENT}**`)
L(`Dica de plantão: ${ENCELADUS_SHIFT_HINT}`)
for (const b of ENCELADUS_BURSTS) L(`- t=${b.tSec}s [${b.kind}] ${b.label}`)
L('Tabela de referência:')
for (const r of ENCELADUS_REF_TABLE) L(`- ${r.name}: ${r.pattern}`)

L('### Cena — Cecília')
dumpBeats('Cecília — tópicos', sceneIntros.cecilia.lines, ceciliaTopicLabels, ceciliaBeats)
dumpRefl('refl-b07-ricardo-dead')
dumpRefl('refl-b07-henrique-reveal')
dumpRefl('refl-b07-tech')

L('### Bancada — Cassini-Huygens')
L(quote(CASSINI_SESSION_A_SUMMARY))
L(quote(CASSINI_SESSION_B_SUMMARY))
L('Pacotes:')
for (const p of CASSINI_CAPTURE) {
  L(`- ${p.id} SSRC ${p.ssrc} seq ${p.seq} ts ${p.ts}${p.note && p.note !== 'ok' ? ` (${p.note})` : ''}`)
}

L('### Caderno — provas (Bloco 7)')
dumpEvidence([
  'sandra_still_identifies_andre',
  'sandra_acknowledges_miro_possibility',
  'morsa_active_long_interval',
  'mariana_focused_morsa_duration',
  'memory_anomalies_months_before',
])

L('## Bloco 8 — Não houve assassinato naquela noite')

L('### Bancada — Ordem dos Anéis')
for (const s of RING_SOURCES) {
  L(`- **${s.id}** ${s.label} · bruto t=${s.rawTMin} · offset ${s.offsetMin}${s.driftMin ? ` · drift ${s.driftMin}` : ''} — ${s.note}`)
}
L(`Ordem verdadeira: **${RING_TRUE_ORDER.join(' → ')}**`)
L(quote(RING_CALLSIGN_HINT))
L('Frames CCTV:')
for (const f of RING_CONTINUITY_FRAMES) {
  L(`- ${f.cameraId} ${f.timeLabel} — ${f.caption}`)
}
L('Checks: ' + RING_CONTINUITY_CHECKS.map((c) => c.label).join(' · '))

L('### Cena — André (2ª, confronto)')
dumpBeats('André — follow-up', sceneIntros.andre.lines, andreFollowupLabels, andreFollowupBeats)
dumpRefl('refl-b08-andre')

L('### Cena — Miro (3ª)')
dumpBeats('Miro — terceira', sceneIntros.miro.lines, miroThirdLabels, miroThirdBeats)

L('### Computador')
dumpDocs(DOC_B8)

L('### Telefone fixo')
dumpCall('call-pericia-guardrail')

L('### Cenas — cadeia do veículo')
dumpBeats('Mauro', sceneIntros.mauro.lines, mauroTopicLabels, mauroBeats)
dumpBeats('Dênis', sceneIntros.denis.lines, denisTopicLabels, denisBeats)
dumpBeats('Bia', sceneIntros.bia.lines, biaTopicLabels, biaBeats)
dumpBeats('Rui', sceneIntros.rui.lines, ruiTopicLabels, ruiBeats)

L('### Bancada — Rotação de Saturno')
L(`Indicativo: **${ROTATION_CALLSIGN}**`)
for (const l of ROTATION_LOGS) {
  L(
    `- ${l.system} t bruto ${l.rawTMin} offset ${l.offsetMin} · “${l.event}”${l.callsign ? ` · ${l.callsign}` : ''}`,
  )
}

L('### Reflexões (Bloco 8)')
dumpRefl('refl-b08-morsa')
dumpRefl('refl-b08-accident')
dumpRefl('refl-b08-final')

L('## Bloco 9 — Memória')

L('### Computador')
dumpDocs(DOC_B9)

L('### Celular de Augusto — WhatsApp (Mariana)')
L(`*Chat:* \`${MARIANA_CHAT_ID}\`. \`them\` fala como Mariana.*`)
L('##### Onda 1')
for (const m of marianaMessagesWave1) {
  const line = formatMsg(m, 'Augusto', 'Mariana')
  if (line) L(line)
}
L('##### Onda 2')
for (const m of marianaMessagesWave2) {
  const line = formatMsg(m, 'Augusto', 'Mariana')
  if (line) L(line)
}
L('##### Onda 3')
for (const m of marianaMessagesWave3) {
  const line = formatMsg(m, 'Augusto', 'Mariana')
  if (line) L(line)
}
L('##### Anomalia')
for (const m of marianaMessagesAnomaly) {
  const line = formatMsg(m, 'Augusto', 'Mariana')
  if (line) L(line)
}

L('### Cena — trilha física')
L(`*Abertura:* ${sceneIntros.trail.lines.join(' · ')}`)
for (const b of TRAIL_DISCOVERY_BEATS) {
  L(`**${b.speaker ?? 'narração'}**`)
  L(quote(b.text))
}

L('### Bancada — Puzzle MEMÓRIA')
L(`Palavra: **${MEMORY_WORD}**`)
L('Fontes:')
for (const s of MEMORY_SOURCES) L(`- ${s.label}`)
L('Segmentos:')
for (const s of MEMORY_SEGMENTS) {
  L(`- ${s.label} (${s.tStart}–${s.tEnd}s) → ${s.trueSource} — ${s.hint}`)
}

L('### Reflexões (Bloco 9)')
dumpRefl('refl-b09-omitido')
dumpRefl('refl-b09-messages')
dumpRefl('refl-b09-death')
dumpRefl('refl-b09-augusto')
dumpRefl('refl-b09-final')

L('## Anexos')

L('### Agenda do telefone fixo')
for (const e of landlineDirectory) L(`- **${e.key}** ${e.name}${e.scriptId ? ` (\`${e.scriptId}\`)` : ''}`)

L('### Ligações institucionais restantes')
for (const c of callScripts) {
  if (
    [
      'call-nico',
      'call-livia',
      'call-presidio-visit',
      'call-pericia-device',
      'call-hospital',
      'call-pericia-guardrail',
    ].includes(c.id)
  )
    continue
  dumpCall(c.id)
}

L('### Pessoas (caderno)')
for (const p of seedPeople) {
  L(
    `- **${p.name}**${p.occupation ? ` — ${p.occupation}` : ''}${p.notes?.length ? ` · ${p.notes.join('; ')}` : ''}`,
  )
}

L('### Locais (mapa)')
for (const loc of seedLocations) {
  L(`- **${loc.name}** — ${loc.description}`)
}

L('### Contatos')
for (const c of seedContacts) {
  L(`- ${c.displayName}${c.phone ? ` · ${c.phone}` : ''}${c.institution ? ' (institucional)' : ''}`)
}

L('### Hipóteses (catálogo do caderno)')
for (const h of hypothesisCatalog) L(`- **${h.title}**`)

L('### Todas as reflexões (lista)')
for (const r of reflections) L(`- \`${r.id}\`${r.sceneId ? ` (cena ${r.sceneId})` : ''}`)

L('### Catálogo completo de provas (caderno)')
for (const e of seedEvidenceCatalog) {
  L(`- **${e.title}**${e.description ? ` — ${e.description}` : ''}`)
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dest = join(root, 'docs', 'TRANSCRIPT_CRONOLOGICO.md')
writeFileSync(dest, out.join('\n'), 'utf8')
console.log(`Wrote ${dest} (${out.join('\n').length} chars)`)
