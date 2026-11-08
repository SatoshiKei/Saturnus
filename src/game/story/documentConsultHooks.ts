import {
  onMaraltoLineWeighed,
  revisitEmergencyEntry,
} from './block05Handlers'
import { reviewMorsaDuration, unlockHenriqueDump } from './block07Handlers'
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

/**
 * Progressão B5/B7 ao consultar fontes reais (reabrir docs), sem botões do Caso.
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
}
