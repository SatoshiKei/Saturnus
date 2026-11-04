import type {
  Evidence,
  EvidenceType,
  HypothesisStateKind,
  LocationStatus,
  PersonStatus,
  TimelineEvent,
} from '../game/types'

/**
 * Rótulos exibidos ao jogador. Os identificadores internos
 * (`mentioned`, `contactable`, `visitAvailable`…) nunca aparecem na interface.
 */

export const personStatusLabel: Record<PersonStatus, string> = {
  mentioned: 'Mencionado',
  identified: 'Identificado',
  located: 'Localizado',
  contactable: 'Contato disponível',
  interviewed: 'Entrevistado',
}

export const locationStatusLabel: Record<LocationStatus, string> = {
  unknown: 'Desconhecido',
  known: 'Local conhecido',
  visitAvailable: 'Visita disponível',
  visited: 'Já visitado',
}

export const hypothesisStateLabel: Record<HypothesisStateKind, string> = {
  active: 'Ativa',
  weakened: 'Incerta',
  discarded: 'Descartada',
  confirmed: 'Confirmada',
}

export const evidenceTypeLabel: Record<EvidenceType, string> = {
  document: 'Documento',
  audio: 'Áudio',
  photo: 'Fotografia',
  message: 'Mensagem',
  physical: 'Objeto',
  digital: 'Registro digital',
  derived: 'Material derivado',
  other: 'Outro',
}

const sourceLabels: Record<string, string> = {
  'case-file': 'Pasta do caso',
  'mariana-phone-notes': 'Notas — celular de Mariana',
  'mariana-whatsapp': 'WhatsApp — celular de Mariana',
  'mariana-phone': 'Celular de Mariana',
  'mariana-recorder-app': 'Gravador — celular de Mariana',
  'wavelab-mobile': 'Processado no aparelho (WaveLab Mobile)',
  witness: 'Depoimento de testemunha',
  'police-computer': 'Sistema de consulta',
  'audio-lab': 'Bancada de áudio',
  'augusto-whatsapp': 'WhatsApp — celular profissional',
  'unknown-channel': 'Canal sem identificação',
  'phone-forensics': 'Perícia digital — aparelho apreendido',
  'hidden-diary': 'Diário oculto — celular de Mariana',
}

export function evidenceSourceLabel(e: Pick<Evidence, 'sourceType' | 'obtainedFrom'>): string {
  return e.obtainedFrom ?? sourceLabels[e.sourceType] ?? 'Origem registrada'
}

export function evidenceOriginLabel(o: Evidence['originalOrDerived']): string {
  return o === 'original' ? 'Original' : o === 'derived' ? 'Derivada' : 'Origem incerta'
}

export function integrityLabel(i: Evidence['integrity']): string {
  switch (i) {
    case 'verified':
      return 'Verificada'
    case 'questionable':
      return 'Questionável'
    case 'unverified':
      return 'Não verificada'
    default:
      return 'Não avaliada'
  }
}

export function precisionLabel(p: TimelineEvent['precision']): string {
  switch (p) {
    case 'exact':
      return 'horário exato'
    case 'interval':
      return 'intervalo'
    case 'contested':
      return 'horário contestado'
    default:
      return 'aproximado'
  }
}

export function confidenceLabel(c: TimelineEvent['confidence']): string {
  return c === 'high' ? 'confiança alta' : c === 'medium' ? 'confiança média' : 'confiança baixa'
}
