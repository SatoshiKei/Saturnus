/**
 * Transcrição de cutscenes VN: entrevistas, reflexões, ligações, cenas lineares.
 * Uso: npx --yes tsx scripts/dump-cutscenes.ts
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { hospitalBeats, hospitalTopicLabels } from '../src/data/block01/hospitalInterview'
import { verticeBeats, verticeTopicLabels } from '../src/data/block02/verticeInterview'
import { lucasBeats, lucasTopicLabels } from '../src/data/block02/lucasInterview'
import { nicoBeats, nicoTopicLabels } from '../src/data/block03/nicoInterview'
import { liviaBeats, liviaTopicLabels } from '../src/data/block03/liviaInterview'
import { samuelBeats, samuelTopicLabels } from '../src/data/block04/samuelInterview'
import { andreBeats, andreTopicLabels } from '../src/data/block04/andreInterview'
import { nicoFollowupBeats, nicoFollowupLabels } from '../src/data/block05/nicoFollowup'
import { janaBeats, janaTopicLabels } from '../src/data/block05/janaInterview'
import { geraldoBeats, geraldoTopicLabels } from '../src/data/block06/geraldoInterview'
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
import { TRAIL_DISCOVERY_BEATS } from '../src/data/block09/trailDiscovery'
import { reflections } from '../src/data/reflections'
import { sceneIntros, type SceneId } from '../src/data/sceneIntros'
import { callScripts } from '../src/data/calls'
import { RING_CONTINUITY_FRAMES } from '../src/data/block08/ringsPuzzle'

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
  L(`## ${title}`)
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
  L(`## ${title}`)
  if (sceneId && sceneIntros[sceneId]) {
    L(`*${sceneIntros[sceneId].lines.join(' · ')}*`)
  }
  for (const [id, label] of Object.entries(labels)) {
    L(`### ${label}`)
    for (const b of beats[id] ?? []) {
      L(`**${b.speaker ?? 'narração'}**`)
      L(quote(b.text))
    }
  }
}

function dumpReflection(id: string) {
  const r = reflections.find((x) => x.id === id)
  if (!r) return
  L(`## Reflexão — \`${id}\``)
  if (r.sceneId) L(`*Cena vinculada:* ${r.sceneId}`)
  for (const block of r.blocks) {
    L('**Augusto**')
    L(quote(block))
  }
}

function dumpCall(id: string) {
  const c = callScripts.find((x) => x.id === id)
  if (!c) return
  L(`## Ligação — ${c.speaker}${c.ext ? ` (ramal ${c.ext})` : ''}`)
  L(`*\`${c.id}\`*`)
  for (const line of c.lines) {
    L(`**${line.who === 'augusto' ? 'Augusto' : c.speaker}**`)
    L(quote(line.text))
  }
  if (c.timeSkip) L(`*${c.timeSkip}*`)
  if (c.result) L(`*${c.result.label}:* ${c.result.detail}`)
}

L('# SATURNUS — Transcrição de cutscenes')
L(
  'Entrevistas em tópicos (VN), cenas lineares, reflexões de Augusto e diálogos de ligação. Gerado por `scripts/dump-cutscenes.ts`.',
)
L('---')

L('# Bloco 1')
dumpTopics('Hospital — Júlia / Camila', 'hospital', hospitalTopicLabels, hospitalBeats)

L('# Bloco 2')
dumpTopics('Boate Vértice', 'vertice', verticeTopicLabels, verticeBeats)
dumpTopics('Lucas', 'lucas', lucasTopicLabels, lucasBeats)
dumpReflection('refl-lucas')

L('# Bloco 3')
dumpTopics('Lívia', 'livia', liviaTopicLabels, liviaBeats)
dumpReflection('refl-livia')
dumpTopics('Nico (Titã)', 'nico', nicoTopicLabels, nicoBeats)
dumpReflection('refl-nico')

L('# Bloco 4')
dumpTopics('Samuel', 'samuel', samuelTopicLabels, samuelBeats)
dumpReflection('refl-samuel')
dumpTopics('André (1ª visita)', 'andre', andreTopicLabels, andreBeats)
dumpReflection('refl-andre')
L('## Cena — Hex (ligações misteriosas no fixo)')
L('*Sem diálogo falado; áudio hex-a.wav; segue reflexão.*')
dumpReflection('refl-hex-call')

L('# Bloco 5')
dumpTopics('Nico (2ª)', 'nico', nicoFollowupLabels, nicoFollowupBeats)
dumpReflection('refl-nico2')
dumpTopics('Jana', 'jana', janaTopicLabels, janaBeats)
dumpReflection('refl-jana')
for (const id of ['refl-b05-andre', 'refl-b05-maralto', 'refl-b05-coincidence', 'refl-b05-path']) {
  dumpReflection(id)
}

L('# Bloco 6')
dumpTopics('Geraldo', 'geraldo', geraldoTopicLabels, geraldoBeats)
dumpReflection('refl-b06-geraldo')
dumpTopics('Jana (2ª)', 'jana', janaFollowupLabels, janaFollowupBeats)
dumpReflection('refl-jana2')
dumpDialogue('Operação Galpão 17', OPERATION_SCENE_BEATS, sceneIntros.operation.lines)
dumpTopics('Miro (detenção)', 'miro', miroTopicLabels, miroBeats)
dumpReflection('refl-b06-miro')

L('# Bloco 7')
dumpTopics('Miro (2ª)', 'miro', miroFollowupLabels, miroFollowupBeats)
dumpTopics('Sandra', 'sandra', sandraTopicLabels, sandraBeats)
dumpReflection('refl-b07-sandra')
dumpTopics('Cecília', 'cecilia', ceciliaTopicLabels, ceciliaBeats)
dumpDialogue('Hospital — depósito de pertences', HOSPITAL_DEPOSIT_BEATS, sceneIntros.hospital.lines)
for (const id of [
  'refl-b07-ricardo-dead',
  'refl-b07-notebook',
  'refl-b07-hv',
  'refl-b07-henrique-reveal',
  'refl-b07-tech',
]) {
  dumpReflection(id)
}

L('# Bloco 8')
L('## Bancada — Revelação CCTV (Morsa)')
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
  L('**Augusto**')
  L(quote(b.text))
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

L('# Bloco 9')
dumpDialogue('Trilha física', TRAIL_DISCOVERY_BEATS, sceneIntros.trail.lines)
for (const id of [
  'refl-b09-omitido',
  'refl-b09-messages',
  'refl-b09-death',
  'refl-b09-augusto',
  'refl-b09-final',
]) {
  dumpReflection(id)
}

L('# Ligações (todas)')
for (const c of callScripts) {
  dumpCall(c.id)
}

L('# Reflexões (catálogo completo)')
for (const r of reflections) {
  dumpReflection(r.id)
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const destMd = join(root, 'docs', 'TRANSCRIPT_CUTSCENES.md')
const destTxt = join(root, 'docs', 'TRANSCRIPT_CUTSCENES.txt')
const body = out.join('\n')
writeFileSync(destMd, body, 'utf8')
writeFileSync(destTxt, body.replace(/^#+ /gm, '').replace(/\*\*/g, '').replace(/^> /gm, ''), 'utf8')
console.log(`Wrote ${destMd} (${body.length} chars)`)
console.log(`Wrote ${destTxt}`)
