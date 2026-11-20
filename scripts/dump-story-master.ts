/**
 * Documento único: fluxo + cenas + conversas/textos.
 * Uso: npm run dump:story-master
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { OPENING_SCENE_BEATS } from '../src/data/block01/openingSceneBeats'
import { hospitalBeats, hospitalTopicLabels } from '../src/data/block01/hospitalInterview'
import { block01MarianaChats } from '../src/data/block01/marianaChats'
import { marianaBlock01Notes } from '../src/data/block01/marianaNotes'
import { verticeBeats, verticeTopicLabels } from '../src/data/block02/verticeInterview'
import { lucasBeats, lucasTopicLabels } from '../src/data/block02/lucasInterview'
import { nicoBeats, nicoTopicLabels } from '../src/data/block03/nicoInterview'
import { nicoEarlyBeats, nicoEarlyTopicLabels } from '../src/data/block03/nicoEarlyInterview'
import { liviaBeats, liviaTopicLabels } from '../src/data/block03/liviaInterview'
import { samuelBeats, samuelTopicLabels } from '../src/data/block04/samuelInterview'
import {
  samuelAccidentalBeats,
  samuelAccidentalTopicLabels,
} from '../src/data/block04/samuelAccidentalInterview'
import { andreBeats, andreTopicLabels } from '../src/data/block04/andreInterview'
import { block04DiaryEntries } from '../src/data/block04/diaryEntries'
import { nicoFollowupBeats, nicoFollowupLabels } from '../src/data/block05/nicoFollowup'
import { janaBeats, janaTopicLabels } from '../src/data/block05/janaInterview'
import { janaEarlyBeats, janaEarlyTopicLabels } from '../src/data/block05/janaEarlyInterview'
import { geraldoBeats, geraldoTopicLabels } from '../src/data/block06/geraldoInterview'
import { geraldoEarlyBeats, geraldoEarlyTopicLabels } from '../src/data/block06/geraldoEarlyInterview'
import { janaFollowupBeats, janaFollowupLabels } from '../src/data/block06/janaFollowup'
import { miroBeats, miroTopicLabels } from '../src/data/block06/miroInterview'
import { OPERATION_SCENE_BEATS } from '../src/data/block06/operationSceneBeats'
import { sandraBeats, sandraTopicLabels } from '../src/data/block07/sandraInterview'
import { miroFollowupBeats, miroFollowupLabels } from '../src/data/block07/miroFollowup'
import { ceciliaBeats, ceciliaTopicLabels } from '../src/data/block07/ceciliaInterview'
import { HOSPITAL_DEPOSIT_BEATS } from '../src/data/block07/hospitalDeposit'
import { andreFollowupBeats, andreFollowupLabels } from '../src/data/block08/andreFollowup'
import { miroThirdBeats, miroThirdLabels } from '../src/data/block08/miroThird'
import { mauroBeats, mauroTopicLabels } from '../src/data/block08/mauroInterview'
import { denisBeats, denisTopicLabels } from '../src/data/block08/denisInterview'
import { biaBeats, biaTopicLabels } from '../src/data/block08/biaInterview'
import { ruiBeats, ruiTopicLabels } from '../src/data/block08/ruiInterview'
import { MORSA_CCTV_BEATS } from '../src/data/block08/morsaCctvBeats'
import { RING_CONTINUITY_FRAMES } from '../src/data/block08/ringsPuzzle'
import { TRAIL_DISCOVERY_BEATS } from '../src/data/block09/trailDiscovery'
import {
  marianaMessagesWave1,
  marianaMessagesWave2,
  marianaMessagesWave3,
  marianaMessagesAnomaly,
} from '../src/data/block09/marianaMessages'
import { reflections } from '../src/data/reflections'
import { sceneIntros, type SceneId } from '../src/data/sceneIntros'
import { callScripts } from '../src/data/calls'
import { paulaScript, rafaelScript } from '../src/data/chatScripts'
import { mockChats } from '../src/data/mockChats'
import { contactById } from '../src/data/mockContacts'
import { seedDocuments } from '../src/data/game/seedDocuments'
import { MARI_COMPANION_BEATS } from '../src/data/companion/mariCompanion'
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

function dumpDialogue(title: string, beats: { speaker?: string; text: string }[], intro?: string[]) {
  L(`### ${title}`)
  if (intro?.length) L(`*${intro.join(' · ')}*`)
  for (const b of beats) {
    L(`**${b.speaker ?? 'narração'}**`)
    L(quote(b.text))
  }
}

function dumpTopics(
  title: string,
  sceneId: SceneId | undefined,
  labels: Record<string, string>,
  beats: Record<string, { speaker?: string; text: string }[]>,
) {
  L(`### ${title}`)
  if (sceneId && sceneIntros[sceneId]) {
    L(`*${sceneIntros[sceneId].lines.join(' · ')}*`)
  }
  for (const [id, label] of Object.entries(labels)) {
    L(`#### ${label}`)
    for (const b of beats[id] ?? []) {
      L(`**${b.speaker ?? 'narração'}**`)
      L(quote(b.text))
    }
  }
}

function dumpReflection(id: string) {
  const r = reflections.find((x) => x.id === id)
  if (!r) return
  L(`### Reflexão — \`${id}\``)
  if (r.sceneId) L(`*Cena vinculada:* ${r.sceneId}`)
  for (const block of r.blocks) {
    L('**Augusto**')
    L(quote(block))
  }
}

function dumpCall(id: string) {
  const c = callScripts.find((x) => x.id === id)
  if (!c) return
  L(`### Ligação — ${c.speaker}${c.ext ? ` (ramal ${c.ext})` : ''}`)
  L(`*\`${c.id}\`*`)
  for (const line of c.lines) {
    L(`**${line.who === 'augusto' ? 'Augusto' : c.speaker}**`)
    L(quote(line.text))
  }
  if (c.timeSkip) L(`*${c.timeSkip}*`)
  if (c.result) L(`*${c.result.label}:* ${c.result.detail}`)
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
  L(`#### ${name} (\`${thread.id}\`)`)
  for (const m of thread.messages) {
    const line = formatMsg(m, me, them)
    if (line) L(line)
  }
}

function dumpScript(script: ChatScript, title: string) {
  L(`#### ${title} (\`${script.chatId}\`)`)
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

function dumpDoc(id: string) {
  const doc = seedDocuments.find((d) => d.id === id)
  if (!doc) return
  L(`#### ${doc.title}`)
  L(`*\`${doc.id}\`*${doc.issuer || doc.dateLabel ? ` · ${[doc.issuer, doc.dateLabel].filter(Boolean).join(' · ')}` : ''}`)
  for (const b of doc.blocks) L(quote(b.text))
  if (doc.leads?.length) {
    L('*Pistas:*')
    for (const lead of doc.leads) L(`- ${lead.label}: ${lead.value}`)
  }
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const flowPath = join(root, 'docs', 'story', 'STORY_FLOW_CANON.md')
const flowBody = readFileSync(flowPath, 'utf8')

L('# SATURNUS — Master narrativo (cenas, textos e fluxo)')
L(
  [
    '> Gerado a partir do **runtime** (`npm run dump:story-master`).',
    '> Parte I = fluxo/gates/puzzles (`docs/story/STORY_FLOW_CANON.md`).',
    '> Partes II–III = falas e mensagens extraídas dos módulos em `src/data/`.',
    '> Se divergir do jogo, o código vence.',
  ].join('\n'),
)
L('---')
L('## Índice')
L('1. [Parte I — Fluxo da história e puzzles](#parte-i--fluxo-da-história-e-puzzles)')
L('2. [Parte II — Cenas (VN, reflexões, ligações)](#parte-ii--cenas-vn-reflexões-ligações)')
L('3. [Parte III — Conversas e textos](#parte-iii--conversas-e-textos)')
L('---')

L('# Parte I — Fluxo da história e puzzles')
out.push(
  flowBody
    .replace(/^# Fluxo narrativo canônico \(Blocos 1–9\)\r?\n+/, '')
    .trimEnd(),
  '',
)

L('---')
L('# Parte II — Cenas (VN, reflexões, ligações)')
L('Entrevistas por tópicos, cenas lineares, reflexões e ligações. Cada cena em seção própria.')

L('## Bloco 1')
dumpDialogue('Abertura — Augusto + Mari', OPENING_SCENE_BEATS)
for (const beat of MARI_COMPANION_BEATS) {
  dumpDialogue(`Mari no hub — ${beat.id}`, beat.lines)
}
dumpTopics('Hospital — Júlia / Camila', 'hospital', hospitalTopicLabels, hospitalBeats)

L('## Bloco 2')
dumpTopics('Boate Vértice', 'vertice', verticeTopicLabels, verticeBeats)
dumpTopics('Lucas', 'lucas', lucasTopicLabels, lucasBeats)
dumpReflection('refl-lucas')

L('## Bloco 3')
dumpTopics('Nico — visita precoce', 'nico', nicoEarlyTopicLabels, nicoEarlyBeats)
dumpTopics('Nico (Titã)', 'nico', nicoTopicLabels, nicoBeats)
dumpReflection('refl-nico')
dumpTopics('Lívia', 'livia', liviaTopicLabels, liviaBeats)
dumpReflection('refl-livia')

L('## Bloco 4')
dumpTopics('Samuel — visita acidental (Marcelo)', 'samuel', samuelAccidentalTopicLabels, samuelAccidentalBeats)
dumpTopics('Samuel', 'samuel', samuelTopicLabels, samuelBeats)
dumpReflection('refl-samuel')
dumpTopics('André (1ª visita)', 'andre', andreTopicLabels, andreBeats)
dumpReflection('refl-andre')
L('### Cena — Hex (ligações no fixo)')
L('*Sem diálogo falado; áudio; segue reflexão.*')
dumpReflection('refl-hex-call')

L('## Bloco 5')
dumpTopics('Jana — visita precoce', 'jana', janaEarlyTopicLabels, janaEarlyBeats)
dumpTopics('Nico (2ª)', 'nico', nicoFollowupLabels, nicoFollowupBeats)
dumpReflection('refl-nico2')
dumpTopics('Jana', 'jana', janaTopicLabels, janaBeats)
dumpReflection('refl-jana')
for (const id of ['refl-b05-andre', 'refl-b05-maralto', 'refl-b05-coincidence', 'refl-b05-path']) {
  dumpReflection(id)
}

L('## Bloco 6')
dumpTopics('Geraldo — visita precoce', 'geraldo', geraldoEarlyTopicLabels, geraldoEarlyBeats)
dumpTopics('Geraldo', 'geraldo', geraldoTopicLabels, geraldoBeats)
dumpReflection('refl-b06-geraldo')
dumpTopics('Jana (2ª)', 'jana', janaFollowupLabels, janaFollowupBeats)
dumpReflection('refl-jana2')
dumpDialogue('Operação Galpão 17', OPERATION_SCENE_BEATS, sceneIntros.operation?.lines)
dumpTopics('Miro (detenção)', 'miro', miroTopicLabels, miroBeats)
dumpReflection('refl-b06-miro')

L('## Bloco 7')
dumpTopics('Miro (2ª)', 'miro', miroFollowupLabels, miroFollowupBeats)
dumpTopics('Sandra', 'sandra', sandraTopicLabels, sandraBeats)
dumpReflection('refl-b07-sandra')
dumpTopics('Cecília', 'cecilia', ceciliaTopicLabels, ceciliaBeats)
dumpDialogue('Hospital — depósito de pertences', HOSPITAL_DEPOSIT_BEATS, sceneIntros.hospital?.lines)
for (const id of [
  'refl-b07-ricardo-dead',
  'refl-b07-notebook',
  'refl-b07-hv',
  'refl-b07-henrique-reveal',
  'refl-b07-tech',
]) {
  dumpReflection(id)
}

L('## Bloco 8')
L('### Bancada — Revelação CCTV (Morsa)')
for (const b of MORSA_CCTV_BEATS) {
  if (b.kind === 'pause') {
    L('*[pausa]*')
    continue
  }
  if (b.kind === 'cam') {
    const f = RING_CONTINUITY_FRAMES[b.frameIndex]
    L(`*${f.cameraId} ${f.timeLabel} — ${f.caption}*`)
    if (b.thought) {
      L('**Augusto**')
      L(quote(b.thought))
    }
    continue
  }
  if (b.kind === 'thought' || b.kind === 'name') {
    L('**Augusto**')
    L(quote(b.text))
  }
}
dumpReflection('refl-b08-morsa')
dumpTopics('André (confronto)', 'andre', andreFollowupLabels, andreFollowupBeats)
dumpReflection('refl-b08-andre')
dumpTopics('Miro (3ª)', 'miro', miroThirdLabels, miroThirdBeats)
dumpReflection('refl-b08-miro-guardrail')
for (const id of ['call-pericia-guardrail', 'call-parts-jaguar-lead', 'call-detran-jaguar']) {
  dumpCall(id)
}
dumpReflection('refl-b08-jaguar-lead')
dumpTopics('Mauro', 'mauro', mauroTopicLabels, mauroBeats)
dumpTopics('Dênis', 'denis', denisTopicLabels, denisBeats)
dumpTopics('Bia', 'bia', biaTopicLabels, biaBeats)
dumpTopics('Rui', 'rui', ruiTopicLabels, ruiBeats)
dumpReflection('refl-b08-accident')
dumpReflection('refl-b08-final')

L('## Bloco 9')
dumpDialogue('Trilha física', TRAIL_DISCOVERY_BEATS, sceneIntros.trail?.lines)
for (const id of [
  'refl-b09-omitido',
  'refl-b09-messages',
  'refl-b09-death',
  'refl-b09-augusto',
  'refl-b09-final',
]) {
  dumpReflection(id)
}

L('## Ligações (catálogo completo)')
for (const c of callScripts) dumpCall(c.id)

L('## Reflexões (catálogo completo)')
for (const r of reflections) dumpReflection(r.id)

L('---')
L('# Parte III — Conversas e textos')
L('WhatsApp, scripts jogáveis, notas, diário e documentos-chave. Sem cenas VN.')

L('## WhatsApp — Celular de Mariana (Bloco 1)')
for (const t of block01MarianaChats) dumpThread(t, 'Mariana', 'contato')

L('## Notas — Celular de Mariana')
for (const n of marianaBlock01Notes) {
  L(`#### ${n.title}`)
  L(quote(n.body))
}

L('## WhatsApp — Celular de Augusto (threads mock)')
for (const t of mockChats) dumpThread(t, 'Augusto', 'contato')

L('## Scripts WhatsApp (Augusto escreve)')
dumpScript(rafaelScript, 'Rafael')
dumpScript(paulaScript, 'Paula')

L('## WhatsApp — Mensagens “Mariana” (Bloco 9)')
L('### Onda 1')
for (const m of marianaMessagesWave1) {
  if (m.kind === 'text') L(`**${m.from === 'me' ? 'Augusto' : 'Mariana'}**\n${quote(m.text)}`)
}
L('### Onda 2')
for (const m of marianaMessagesWave2) {
  if (m.kind === 'text') L(`**${m.from === 'me' ? 'Augusto' : 'Mariana'}**\n${quote(m.text)}`)
}
L('### Onda 3')
for (const m of marianaMessagesWave3) {
  if (m.kind === 'text') L(`**${m.from === 'me' ? 'Augusto' : 'Mariana'}**\n${quote(m.text)}`)
}
L('### Anomalia')
for (const m of marianaMessagesAnomaly) {
  if (m.kind === 'text') L(`**${m.from === 'me' ? 'Augusto' : 'Mariana'}**\n${quote(m.text)}`)
}

L('## Diário oculto')
for (const e of block04DiaryEntries) {
  L(`#### ${e.title}`)
  L(quote(e.body))
}

L('## Documentos iniciais (pasta)')
for (const id of [
  'doc-bo-inicial',
  'doc-central-chamada',
  'doc-entrada-apartamento',
  'doc-apreensao-celular',
  'doc-extracao-inicial',
]) {
  dumpDoc(id)
}

L('## Documentos — amostra por bloco (IDs frequentes)')
for (const id of [
  'doc-lucas-cadastro',
  'doc-elisa-resumo',
  'doc-elisa-testemunhas',
  'doc-elisa-cronologia',
  'doc-nico-cadastro',
  'doc-samuel-ficha',
  'doc-andre-visitas',
  'doc-andre-ligacoes',
  'doc-numero-sem-nome',
  'doc-maralto-clipping',
  'doc-jana-cadastro',
  'doc-elisa-jana',
  'doc-elisa-geraldo-depoimento',
  'doc-geraldo-ficha',
  'doc-sandra-depoimento',
  'doc-henrique-empresa',
  'doc-henrique-pcap-note',
  'doc-cecilia-contato',
]) {
  dumpDoc(id)
}

L('---')
L('*Fim do master. Regenerar: `npm run dump:story-master`.*')

const dest = join(root, 'docs', 'STORY_MASTER.md')
const body = out.join('\n')
writeFileSync(dest, body, 'utf8')
console.log(`Wrote ${dest} (${body.length} chars, ${body.split('\n').length} lines)`)
