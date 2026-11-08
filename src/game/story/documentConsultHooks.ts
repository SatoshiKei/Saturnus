import {
  onMaraltoLineWeighed,
  revisitEmergencyEntry,
} from './block05Handlers'
import {
  onHenriqueCadastroOpened,
  onRicardoIdentityDeadEnd,
  onRicardoRecordFound,
  reviewMorsaDuration,
  unlockHenriqueDump,
} from './block07Handlers'
import { requestGuardrailReexam } from './block08Handlers'
import {
  findOtherDisappearances,
  mapOmitidoAssistance,
  noteOmitidoCompareSource,
  noteTrailConsult,
} from './block09Handlers'
import { getInvestigationState } from '../state/investigationStore'

const MARALTO_SOURCES = new Set([
  'doc-cruzamento-maralto-elisa',
  'doc-maralto-clipping',
  'doc-maralto-cadastro',
  'doc-protesto-ocorrencia',
  'doc-protesto-detidos',
])

const MORSA_SOURCES = new Set([
  'doc-protesto-ocorrencia',
  'doc-protesto-detidos',
  'doc-maralto-clipping',
])

const EMERGENCY_SOURCES = new Set([
  'doc-central-chamada',
  'doc-entrada-apartamento',
  'doc-apreensao-celular',
])

const HENRIQUE_COMPARE_SOURCES = new Set([
  'doc-henrique-pcap-note',
  'doc-henrique-incidente',
  'doc-henrique-empresa',
])

const MARIANA_COMPARE_SOURCES = new Set([
  'doc-numero-sem-nome',
  'doc-extracao-inicial',
  'doc-laudo-forense',
])

const OMITIDO_ASSIST_SOURCES = new Set([
  'doc-central-chamada',
  'doc-entrada-apartamento',
  'doc-apreensao-celular',
  'doc-extracao-inicial',
])

/**
 * Progressão B5/B7/B8/B9 ao consultar fontes reais (reabrir docs), sem botões do Caso.
 * Idempotente: os handlers já guardam por flag.
 */
export function onDocumentConsulted(docId: string) {
  const s = getInvestigationState()

  if (
    s.flags.block05_maralto_review_unlocked &&
    !s.flags.block05_maralto_weighed &&
    MARALTO_SOURCES.has(docId)
  ) {
    onMaraltoLineWeighed()
  }

  if (
    s.flags.block05_emergency_revisit_unlocked &&
    !s.flags.block05_emergency_revisited &&
    EMERGENCY_SOURCES.has(docId)
  ) {
    revisitEmergencyEntry()
  }

  if (
    s.flags.block07_morsa_review_unlocked &&
    !s.flags.block07_morsa_duration_done &&
    MORSA_SOURCES.has(docId)
  ) {
    reviewMorsaDuration()
  }

  // Dump PCAP: abrir o laudo/nota forense libera Cassini (também via busca).
  if (
    docId === 'doc-henrique-pcap-note' &&
    s.flags.block07_henrique_dump_unlocked &&
    !s.flags.block07_cassini_available
  ) {
    unlockHenriqueDump()
  }

  // B7: Ricardo hospital → confirmação civil → Henrique (cadastro).
  if (docId === 'doc-hospital-ricardo-freitas') {
    onRicardoRecordFound()
  }
  if (docId === 'doc-ricardo-consulta-negativa') {
    onRicardoIdentityDeadEnd()
  }
  if (docId === 'doc-henrique-cadastro') {
    onHenriqueCadastroOpened()
  }

  // B8: laudo complementar do guardrail (após ligação à Perícia).
  if (docId === 'doc-guardrail-reanalise') {
    requestGuardrailReexam()
  }

  // B9: comparar Henrique × Mariana (duas consultas reais).
  if (s.flags.block09_compare_unlocked && !s.flags.block09_omitido_named) {
    if (HENRIQUE_COMPARE_SOURCES.has(docId)) noteOmitidoCompareSource('henrique')
    if (MARIANA_COMPARE_SOURCES.has(docId)) noteOmitidoCompareSource('mariana')
  }

  // B9: assistência de O Omitido — reabrir uma fonte técnica original.
  if (
    s.flags.block09_assistance_unlocked &&
    !s.flags.block09_assistance_done &&
    OMITIDO_ASSIST_SOURCES.has(docId)
  ) {
    mapOmitidoAssistance()
  }

  // B9: trilha física — consultas de câmera + transporte.
  if (
    s.flags.block09_trail_unlocked &&
    !s.flags.block09_trail_ready &&
    (docId === 'doc-trilha-camera-mariana' || docId === 'doc-trilha-transporte-mariana')
  ) {
    noteTrailConsult(docId)
  }

  // B9: outros desaparecimentos — resultado institucional da busca.
  if (
    docId === 'doc-outros-desaparecimentos' &&
    s.flags.block09_other_cases_unlocked &&
    !s.flags.block09_other_cases_done
  ) {
    findOtherDisappearances()
  }
}
