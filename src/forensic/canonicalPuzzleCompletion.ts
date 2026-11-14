/**
 * DEV QA — conclusão canônica dos puzzles forenses P01–P12.
 *
 * Cada puzzle é uma lista ordenada de etapas. Etapas chamam as MESMAS funções que a
 * gameplay legítima chama (handlers de bloco, `markForensic*`, `tryDiaryPin`,
 * `onDocumentConsulted`) e validam o resultado técnico com os predicados reais do
 * `forensicEngine` / datasets. Nada aqui inventa fato narrativo: o que é sintetizado é só
 * o estado de UI da bancada que a gameplay não persiste (offsets, seleção, fingerprints).
 *
 * Etapas `reveal` (ex.: cutscene CAM11 do P10) ficam fora do default para não auto-exibir
 * revelações; o caller decide entre tocar a cena ou marcá-la como vista.
 */
import { HEX_EVIDENCE_IDS, HEX_PIN } from '../data/block04/hexagonPuzzle'
import {
  CAD_FLAME_ID,
  CORRECT_CROSSING,
  ROTATION_CALLSIGN,
  evaluateRotationCase,
  type RotationVehicleId,
} from '../data/block08/rotationPuzzle'
import {
  MEMORY_REGIONS,
  isMemoryProvenanceComplete,
  searchCaseMedia,
  type ProvenanceConfirmId,
} from '../data/block09/memoryPuzzle'
import {
  commitDevState,
  getInvestigationState,
  markDevPuzzleCompletion,
  markForensicContainerState,
  markForensicDerivedArtifact,
  markForensicSpeechRecovered,
  openDocument,
  runInStoreSandbox,
  tryDiaryPin,
} from '../game/state/investigationStore'
import { runPoliceSearch } from '../game/search/runSearch'
import { runProvisionalEmergencyAnalysis } from '../game/story/block01Handlers'
import {
  runProvisionalRafaelForwardAnalysis,
  runProvisionalRingsAnalysis,
} from '../game/story/block02Handlers'
import { runJanusEpimetheusAnalysis, runSaturnaliaReconstruct } from '../game/story/block03Handlers'
import { runHexagonSpectrogramSurvey } from '../game/story/block04Handlers'
import { runShepherdMoonsExtract } from '../game/story/block06Handlers'
import { onCassiniSolved, onEnceladusSolved } from '../game/story/block07Handlers'
import {
  onMorsaContinuityConfirmed,
  onRingsTimelineSolved,
  onRotationSolved,
  onScaleLinksAugusto,
} from '../game/story/block08Handlers'
import { onMemoryPuzzleSolved } from '../game/story/block09Handlers'
import { onDocumentConsulted } from '../game/story/documentConsultHooks'
import type { InvestigationState } from '../game/types'
import { buildCassiniStreamBArtifact, CASSINI_STREAM_B_ARTIFACT_ID } from './derivedArtifact'
import {
  assembleClipSequence,
  clipSequenceComplete,
  clockSyncComplete,
  createInitialUiState,
  cycleDifferenceComplete,
  evaluateRfExtraction,
  fingerprintArchiveComplete,
  rebuildContainer,
  rfChannelExtractComplete,
  rtpStreamSeparationComplete,
  spectrogramSurveyComplete,
  speechRecoveryComplete,
  structureSequenceValid,
} from './forensicEngine'
import type { ForensicSession, ForensicUiState, RecoveredSpeechEntry } from './forensicTypes'
import { puzzle01CassiniSession } from './puzzles/puzzle01Cassini'
import { puzzle02IapetusSession } from './puzzles/puzzle02Iapetus'
import { puzzle03AnelsSession } from './puzzles/puzzle03Anels'
import {
  PUZZLE03_CANONICAL_SESSION_ID,
  PUZZLE03_MUSIC_SOURCES,
  PUZZLE03_TRACK_A_ID,
  PUZZLE03_TRACK_B_ID,
  puzzle03DesignIsFixed,
} from './puzzles/puzzle03Fingerprint'
import { puzzle04JanusSession } from './puzzles/puzzle04Janus'
import { puzzle05SaturnaliaSession } from './puzzles/puzzle05Saturnalia'
import { puzzle06HexagonSession } from './puzzles/puzzle06Hexagon'
import p07Meta from './puzzles/puzzle07Meta.json'
import { puzzle07ShepherdMoonsSession } from './puzzles/puzzle07ShepherdMoons'
import { puzzle08EnceladusSession } from './puzzles/puzzle08Enceladus'
import {
  puzzle09CassiniHuygensSession,
  puzzle09RtpConfig,
  puzzle09SsrcB,
} from './puzzles/puzzle09CassiniHuygens'
import { puzzle10RingsSession } from './puzzles/puzzle10Rings'
import { puzzle11SaturnRotationSession } from './puzzles/puzzle11SaturnRotation'
import { puzzle12MemorySession } from './puzzles/puzzle12Memory'

export type CanonicalPuzzleId =
  | 'P01'
  | 'P02'
  | 'P03'
  | 'P04'
  | 'P05'
  | 'P06'
  | 'P07'
  | 'P08'
  | 'P09'
  | 'P10'
  | 'P11'
  | 'P12'

/** technical = bancada; consequence = interação canônica seguinte (PIN, cruzamento, escala); reveal = cena. */
export type PuzzleStageKind = 'technical' | 'consequence' | 'reveal'

type StageOutcome = { status: 'applied' } | { status: 'skipped'; reason: string } | { status: 'failed'; reason: string }

export interface PuzzleStage {
  id: string
  label: string
  kind: PuzzleStageKind
  run: () => StageOutcome
}

export interface CanonicalPuzzleDef {
  id: CanonicalPuzzleId
  title: string
  sessionId: string
  /** Arquivos da bancada que abrem este puzzle. */
  evidenceIds: string[]
  /** Flag que a resolução técnica legítima liga. */
  doneFlag: string
  /** Fonte precisa estar no caderno (o puzzle não existe antes da aquisição). */
  requiresAnyEvidence: string[]
  requiresDerivedArtifacts?: string[]
  stages: PuzzleStage[]
  devBypass?: () => { reason: string; detail: string } | null
}

export interface PuzzleCompletionOptions {
  /** Último stage aplicado (inclusive). Default: todos exceto `reveal`. */
  through?: string
  /** Inclui stages `reveal` (marcar cena como vista). */
  includeReveal?: boolean
}

export interface PuzzleCompletionReport {
  puzzleId: CanonicalPuzzleId
  ok: boolean
  applied: string[]
  skipped: { stage: string; reason: string }[]
  blocked?: string
  devBypass?: { reason: string; detail: string }
}

const APPLIED: StageOutcome = { status: 'applied' }

function inv() {
  return getInvestigationState()
}

function owned(id: string) {
  return inv().evidenceOwned.includes(id)
}

function firstOwned(ids: string[]): string | null {
  return ids.find(owned) ?? null
}

function uiFor(session: ForensicSession, patch: Partial<ForensicUiState>): ForensicUiState {
  return { ...createInitialUiState(session, []), ...patch }
}

function recoverSegments(evidenceId: string, entries: RecoveredSpeechEntry[]) {
  for (const e of entries) {
    markForensicSpeechRecovered(evidenceId, {
      segmentId: e.segmentId,
      text: e.text,
      startSec: e.startSec,
    })
  }
}

function handlerStage(
  id: string,
  label: string,
  run: () => void,
  doneFlag: string,
  kind: PuzzleStageKind = 'technical',
): PuzzleStage {
  return {
    id,
    label,
    kind,
    run: () => {
      run()
      return inv().flags[doneFlag]
        ? APPLIED
        : { status: 'failed', reason: `Handler não ligou ${doneFlag} (pré-condição canônica ausente).` }
    },
  }
}

// ── P01 ────────────────────────────────────────────────────────────────────────
const p01Source = puzzle01CassiniSession.sources.find((s) => s.speechSegments?.length)!

const P01: CanonicalPuzzleDef = {
  id: 'P01',
  title: 'DIVISÃO DE CASSINI',
  sessionId: puzzle01CassiniSession.id,
  evidenceIds: ['emergency_call_raw'],
  doneFlag: 'block01_emergency_provisional',
  requiresAnyEvidence: ['emergency_call_raw'],
  stages: [
    {
      id: 'speech',
      label: 'Recovered speech (todos os segmentos)',
      kind: 'technical',
      run: () => {
        const entries = (p01Source.speechSegments ?? []).map((s) => ({
          segmentId: s.id,
          text: s.text,
          startSec: s.startSec,
          unlockedAt: 0,
        }))
        if (!speechRecoveryComplete(entries, p01Source.speechSegments)) {
          return { status: 'failed', reason: 'Segmentos P01 incompletos.' }
        }
        recoverSegments('emergency_call_raw', entries)
        return APPLIED
      },
    },
    handlerStage('analysis', 'Finding + conquista', runProvisionalEmergencyAnalysis, 'block01_emergency_provisional'),
  ],
}

// ── P02 ────────────────────────────────────────────────────────────────────────
const P02_EVIDENCE = ['rafael_voice_to_augusto', 'rafael_audio_reply']
const p02Source = puzzle02IapetusSession.sources[0]!

const P02: CanonicalPuzzleDef = {
  id: 'P02',
  title: 'IAPETUS',
  sessionId: puzzle02IapetusSession.id,
  evidenceIds: P02_EVIDENCE,
  doneFlag: 'block02_rafael_forward_provisional',
  requiresAnyEvidence: P02_EVIDENCE,
  stages: [
    {
      id: 'container',
      label: 'Structure: sequence corrigida + rebuild',
      kind: 'technical',
      run: () => {
        const ev = firstOwned(P02_EVIDENCE)!
        const sequences: Record<string, number> = {}
        for (const p of p02Source.structure?.pages ?? []) {
          if (p.expectedSequence != null && p.sequence !== p.expectedSequence) {
            sequences[p.id] = p.expectedSequence
          }
        }
        const result = rebuildContainer(p02Source, sequences)
        if (!result.ok || !structureSequenceValid(p02Source, sequences)) {
          return { status: 'failed', reason: result.message }
        }
        markForensicContainerState(ev, { rebuilt: true, sequences })
        return APPLIED
      },
    },
    {
      id: 'speech',
      label: 'Recovered speech exigido (pós-rebuild)',
      kind: 'technical',
      run: () => {
        const ev = firstOwned(P02_EVIDENCE)!
        const need = new Set(puzzle02IapetusSession.completion?.requireSpeechSegmentIds ?? [])
        recoverSegments(
          ev,
          (p02Source.speechSegments ?? [])
            .filter((s) => need.has(s.id))
            .map((s) => ({ segmentId: s.id, text: s.text, startSec: s.startSec, unlockedAt: 0 })),
        )
        return APPLIED
      },
    },
    handlerStage(
      'analysis',
      'Vinheta do Vértice + conquista',
      runProvisionalRafaelForwardAnalysis,
      'block02_rafael_forward_provisional',
    ),
  ],
}

// ── P03 ────────────────────────────────────────────────────────────────────────
const P03: CanonicalPuzzleDef = {
  id: 'P03',
  title: 'ANÉIS',
  sessionId: puzzle03AnelsSession.id,
  evidenceIds: ['rec_vtx_old_01'],
  doneFlag: 'block02_rings_provisional',
  requiresAnyEvidence: ['rec_vtx_old_01'],
  devBypass: () =>
    puzzle03DesignIsFixed()
      ? null
      : {
          reason: PUZZLE03_MUSIC_SOURCES.requirement,
          detail:
            'PENDING_ASSET: Faixa B ausente. Fingerprint A→B e abertura da sessão canônica aplicados pelo manifesto DEV — não representa análise dual-track real.',
        },
  stages: [
    {
      id: 'fingerprint-archive',
      label: 'Fingerprint A→B + sessão de arquivo aberta',
      kind: 'technical',
      run: () => {
        const ok = fingerprintArchiveComplete(
          puzzle03AnelsSession,
          uiFor(puzzle03AnelsSession, {
            fingerprintAId: PUZZLE03_TRACK_A_ID,
            fingerprintBId: PUZZLE03_TRACK_B_ID,
            transitionOrder: 'A→B',
            openedArchiveSessionId: PUZZLE03_CANONICAL_SESSION_ID,
          }),
        )
        return ok ? APPLIED : { status: 'failed', reason: 'Cadeia fingerprint/arquivo P03 inválida.' }
      },
    },
    handlerStage('analysis', 'Set aberto → Nico + conquista', runProvisionalRingsAnalysis, 'block02_rings_provisional'),
  ],
}

// ── P04 ────────────────────────────────────────────────────────────────────────
const P04: CanonicalPuzzleDef = {
  id: 'P04',
  title: 'JANUS E EPIMETHEUS',
  sessionId: puzzle04JanusSession.id,
  evidenceIds: ['nico_recording_booth'],
  doneFlag: 'block03_janus_done',
  requiresAnyEvidence: ['nico_recording_booth'],
  stages: [
    {
      id: 'clock-sync',
      label: 'Fontes alinhadas + offset formalizado + set log corrigido',
      kind: 'technical',
      run: () => {
        const s = puzzle04JanusSession
        const audio = s.sources.filter((x) => x.audio)
        const [a, b] = audio
        if (!a || !b) return { status: 'failed', reason: 'Sessão P04 sem par de fontes.' }
        const ok = clockSyncComplete(
          s,
          uiFor(s, {
            sourceOffsets: { [a.id]: 0, [b.id]: (a.timelineOriginSec ?? 0) - (b.timelineOriginSec ?? 0) },
            formalizedClockOffsetSec: s.completion?.expectedOffsetSec ?? 450,
            correctedSetTime: s.completion?.correctedRealTime ?? null,
            findingUnlocked: true,
          }),
        )
        return ok ? APPLIED : { status: 'failed', reason: 'Clock-sync P04 não fecha com o dataset.' }
      },
    },
    handlerStage('analysis', 'Finding temporal + conquista', runJanusEpimetheusAnalysis, 'block03_janus_done'),
  ],
}

// ── P05 ────────────────────────────────────────────────────────────────────────
const P05: CanonicalPuzzleDef = {
  id: 'P05',
  title: 'SATURNALIA',
  sessionId: puzzle05SaturnaliaSession.id,
  evidenceIds: ['livia_radio_archive_raw'],
  doneFlag: 'block03_saturnalia_done',
  requiresAnyEvidence: ['livia_radio_archive_raw'],
  stages: [
    {
      id: 'clip-sequence',
      label: 'Buffer circular remontado na ordem esperada',
      kind: 'technical',
      run: () => {
        const s = puzzle05SaturnaliaSession
        const order = [...(s.completion?.expectedSourceOrder ?? [])]
        const assembled = assembleClipSequence(s, order)
        const ok =
          assembled.ok &&
          clipSequenceComplete(s, uiFor(s, { clipSequence: order, sequenceAssembled: true }))
        return ok ? APPLIED : { status: 'failed', reason: assembled.message }
      },
    },
    handlerStage('analysis', 'Morsa + conquista', runSaturnaliaReconstruct, 'block03_saturnalia_done'),
  ],
}

// ── P06 ────────────────────────────────────────────────────────────────────────
const P06: CanonicalPuzzleDef = {
  id: 'P06',
  title: 'HEXÁGONO',
  sessionId: puzzle06HexagonSession.id,
  evidenceIds: [...HEX_EVIDENCE_IDS],
  // Canon: o puzzle só “fecha” com o PIN aceito no diário (tryDiaryPin).
  doneFlag: 'block04_hex_spectrograms_inspected',
  requiresAnyEvidence: [...HEX_EVIDENCE_IDS],
  stages: [
    {
      id: 'survey',
      label: 'Espectrogramas dos seis UNK inspecionados',
      kind: 'technical',
      run: () => {
        if (!HEX_EVIDENCE_IDS.every(owned)) {
          return { status: 'failed', reason: 'Os seis UNK precisam estar na bancada.' }
        }
        const s = puzzle06HexagonSession
        const ids = s.sources.filter((x) => x.audio).map((x) => x.id)
        if (!spectrogramSurveyComplete(s, uiFor(s, { spectrogramViewedSourceIds: ids }))) {
          return { status: 'failed', reason: 'Survey P06 inválido.' }
        }
        runHexagonSpectrogramSurvey()
        return inv().flags.block04_hex_spectrograms_inspected
          ? APPLIED
          : { status: 'failed', reason: 'runHexagonSpectrogramSurvey não registrou o survey.' }
      },
    },
    {
      id: 'diary-pin',
      label: `PIN ${HEX_PIN} no diário recuperado`,
      kind: 'consequence',
      run: () => {
        const s = inv()
        const accessible =
          s.flags.block04_forensics_access ||
          s.flags.block04_diary_icon_revealed ||
          s.phones.mariana.diaryUnlocked
        if (!accessible) {
          return {
            status: 'skipped',
            reason: 'Diário ainda não restaurado pela Perícia — o PIN só existe no aparelho após o laudo.',
          }
        }
        return tryDiaryPin(HEX_PIN) === 'unlocked'
          ? APPLIED
          : { status: 'failed', reason: 'PIN recusado pelo diário.' }
      },
    },
  ],
}

// ── P07 ────────────────────────────────────────────────────────────────────────
const P07: CanonicalPuzzleDef = {
  id: 'P07',
  title: 'LUAS PASTORAS',
  sessionId: puzzle07ShepherdMoonsSession.id,
  evidenceIds: ['valter_group_active_intercepts'],
  doneFlag: 'block06_pastor_extracted',
  requiresAnyEvidence: ['valter_group_active_intercepts'],
  stages: [
    {
      id: 'extract',
      label: 'Canal oculto extraído (G17N / 23:40)',
      kind: 'technical',
      run: () => {
        const s = puzzle07ShepherdMoonsSession
        const rf = s.sources.find((x) => x.rfCapture)?.rfCapture
        if (!rf) return { status: 'failed', reason: 'Sessão P07 sem captura RF.' }
        const r = evaluateRfExtraction(rf, rf.extract.hiddenCenterMhz, p07Meta.idealBandwidthMhz)
        const ok =
          r.ok &&
          rfChannelExtractComplete(s, uiFor(s, { rfExtracted: true, rfExtractionQuality: r.quality }))
        if (!ok) return { status: 'failed', reason: r.message }
        runShepherdMoonsExtract()
        return inv().flags.block06_pastor_extracted
          ? APPLIED
          : { status: 'failed', reason: 'Extração não registrada.' }
      },
    },
    {
      id: 'crossref',
      label: 'G17N × tabela logística → Galpão 17',
      kind: 'consequence',
      run: () => {
        if (!inv().documentsOwned.includes('doc-tabela-logistica-g17n')) {
          return { status: 'skipped', reason: 'Tabela logística ainda não está na pasta.' }
        }
        openDocument('doc-tabela-logistica-g17n')
        onDocumentConsulted('doc-tabela-logistica-g17n')
        return inv().flags.block06_pastor_done
          ? APPLIED
          : { status: 'failed', reason: 'Cruzamento não registrado.' }
      },
    },
  ],
}

// ── P08 ────────────────────────────────────────────────────────────────────────
const p08Cfg = puzzle08EnceladusSession.sources[0]!.cycleAnalysis!

const P08: CanonicalPuzzleDef = {
  id: 'P08',
  title: 'ENCELADUS',
  sessionId: puzzle08EnceladusSession.id,
  evidenceIds: ['anon_hospital_burst_audio'],
  doneFlag: 'block07_enceladus_done',
  requiresAnyEvidence: ['anon_hospital_burst_audio'],
  stages: [
    {
      id: 'residual',
      label: 'Difference → residual ouvido → “Ricardo” recuperado',
      kind: 'technical',
      run: () => {
        const entry = { ...p08Cfg.recoveredSpeech, unlockedAt: 0 }
        const ok = cycleDifferenceComplete(
          puzzle08EnceladusSession,
          uiFor(puzzle08EnceladusSession, { cycleDifferenceDone: true, recoveredSpeech: [entry] }),
        )
        if (!ok) return { status: 'failed', reason: 'Residual P08 incompleto.' }
        recoverSegments('anon_hospital_burst_audio', [entry])
        return APPLIED
      },
    },
    handlerStage('analysis', 'Ricardo no caderno + conquista', onEnceladusSolved, 'block07_enceladus_done'),
  ],
}

// ── P09 ────────────────────────────────────────────────────────────────────────
const P09: CanonicalPuzzleDef = {
  id: 'P09',
  title: 'CASSINI-HUYGENS',
  sessionId: puzzle09CassiniHuygensSession.id,
  evidenceIds: ['henrique_rtp_capture'],
  doneFlag: 'block07_cassini_done',
  requiresAnyEvidence: ['henrique_rtp_capture'],
  stages: [
    {
      id: 'streams',
      label: 'SSRC A/B separados; stream B reconstruído por sequence → artifact derivado',
      kind: 'technical',
      run: () => {
        const s = puzzle09CassiniHuygensSession
        if (!rtpStreamSeparationComplete(s, uiFor(s, { streamARecovered: true, streamBRecovered: true }))) {
          return { status: 'failed', reason: 'Separação RTP P09 inválida.' }
        }
        if (!inv().forensicDerivedArtifacts?.[CASSINI_STREAM_B_ARTIFACT_ID]) {
          // Mesmo cálculo do onReconstructAudio da bancada (stream B coerente ⇒ streamB, ordem sequence).
          markForensicDerivedArtifact(
            buildCassiniStreamBArtifact({
              audioSrc: puzzle09RtpConfig.audio.streamB,
              createdAtMs: inv().playTimeMs ?? Date.now(),
              reconstructionOrder: 'sequence',
              ssrc: puzzle09SsrcB,
              parentSourceId: s.sources[0]!.id,
            }),
          )
        }
        return APPLIED
      },
    },
    handlerStage('analysis', 'Duas sessões RTP + conquista', onCassiniSolved, 'block07_cassini_done'),
  ],
}

// ── P10 ────────────────────────────────────────────────────────────────────────
const P10: CanonicalPuzzleDef = {
  id: 'P10',
  title: 'ORDEM DOS ANÉIS',
  sessionId: puzzle10RingsSession.id,
  evidenceIds: ['protest_heterogeneous_sources'],
  doneFlag: 'block08_rings_timeline_solved',
  requiresAnyEvidence: ['protest_heterogeneous_sources'],
  stages: [
    handlerStage(
      'route',
      'Fingerprint + frame pattern + passagem de serviço (CFTV liberado)',
      onRingsTimelineSolved,
      'block08_rings_timeline_solved',
    ),
    handlerStage(
      'cctv-reveal',
      'Segmento CAM11 aberto — cena de revelação vista',
      onMorsaContinuityConfirmed,
      'block08_morsa_continuity_confirmed',
      'reveal',
    ),
  ],
}

// ── P11 ────────────────────────────────────────────────────────────────────────
const P11_AVL: RotationVehicleId[] = ['VTR-08', 'VTR-14', 'VTR-21']
const SCALE_DOC_ID = 'doc-escala-vtr14'

const P11: CanonicalPuzzleDef = {
  id: 'P11',
  title: 'ROTAÇÃO DE SATURNO',
  sessionId: puzzle11SaturnRotationSession.id,
  evidenceIds: ['rui_police_approach_records'],
  doneFlag: 'block08_rotation_done',
  requiresAnyEvidence: ['rui_police_approach_records'],
  stages: [
    {
      id: 'vtr14',
      label: `Passagem + CAD + AVL + fingerprint → ${ROTATION_CALLSIGN}`,
      kind: 'technical',
      run: () => {
        const ev = evaluateRotationCase({
          crossingId: CORRECT_CROSSING,
          cadId: CAD_FLAME_ID,
          avlUnitsOpened: P11_AVL,
          fingerprintVehicle: ROTATION_CALLSIGN as RotationVehicleId,
          eliminated: P11_AVL.filter((v) => v !== ROTATION_CALLSIGN),
        })
        if (!ev.canConfirm) return { status: 'failed', reason: 'Caso de rotação não confirma VTR-14.' }
        onRotationSolved()
        return inv().flags.block08_rotation_done
          ? APPLIED
          : { status: 'failed', reason: 'onRotationSolved não registrou.' }
      },
    },
    {
      id: 'scale',
      label: `Escala da ${ROTATION_CALLSIGN} consultada (computador)`,
      kind: 'consequence',
      run: () => {
        const hit = runPoliceSearch('escala', inv()).hits.find((h) => h.documentId === SCALE_DOC_ID)
        if (hit) {
          openDocument(SCALE_DOC_ID)
          onDocumentConsulted(SCALE_DOC_ID)
        } else {
          onScaleLinksAugusto()
        }
        return inv().flags.block08_augusto_linked
          ? APPLIED
          : { status: 'failed', reason: 'Escala indisponível (busca bloqueada).' }
      },
    },
  ],
}

// ── P12 ────────────────────────────────────────────────────────────────────────
const P12: CanonicalPuzzleDef = {
  id: 'P12',
  title: 'MEMÓRIA',
  sessionId: puzzle12MemorySession.id,
  evidenceIds: ['mariana_recent_recording_claim'],
  doneFlag: 'block09_memory_done',
  requiresAnyEvidence: ['mariana_recent_recording_claim'],
  requiresDerivedArtifacts: [CASSINI_STREAM_B_ARTIFACT_ID],
  stages: [
    {
      id: 'provenance',
      label: 'Search Case Media nas 4 regiões → proveniência A/B/C/D confirmada',
      kind: 'technical',
      run: () => {
        const derived = inv().forensicDerivedArtifacts ?? {}
        const confirmed = new Set<ProvenanceConfirmId>()
        for (const r of MEMORY_REGIONS) {
          const pad = (r.end - r.start) * 0.1
          const hit = searchCaseMedia(r.start + pad, r.end - pad, derived).find(
            (h) => h.strong && h.source === r.source,
          )
          if (hit) confirmed.add(r.source as ProvenanceConfirmId)
        }
        return isMemoryProvenanceComplete(confirmed)
          ? APPLIED
          : { status: 'failed', reason: `Proveniência incompleta: ${[...confirmed].join(', ') || 'nenhuma'}.` }
      },
    },
    handlerStage('analysis', 'Conclusão MEMÓRIA', onMemoryPuzzleSolved, 'block09_memory_done'),
  ],
}

export const CANONICAL_PUZZLES: Record<CanonicalPuzzleId, CanonicalPuzzleDef> = {
  P01,
  P02,
  P03,
  P04,
  P05,
  P06,
  P07,
  P08,
  P09,
  P10,
  P11,
  P12,
}

export const CANONICAL_PUZZLE_IDS = Object.keys(CANONICAL_PUZZLES) as CanonicalPuzzleId[]

export function puzzleIdForEvidence(evidenceId: string): CanonicalPuzzleId | null {
  for (const id of CANONICAL_PUZZLE_IDS) {
    if (CANONICAL_PUZZLES[id].evidenceIds.includes(evidenceId)) return id
  }
  // Save-compat aliases (ver forensicRegistry).
  if (evidenceId === 'rafael_forward_from_mariana') return 'P02'
  if (evidenceId === 'police_clock_drift_logs') return 'P11'
  return null
}

export function puzzleHasRevealStage(puzzleId: CanonicalPuzzleId): boolean {
  return CANONICAL_PUZZLES[puzzleId].stages.some((s) => s.kind === 'reveal')
}

/** Executa as etapas sobre o estado atual do store (use dentro de `runInStoreSandbox`). */
function runPuzzleStages(def: CanonicalPuzzleDef, opts: PuzzleCompletionOptions): PuzzleCompletionReport {
  const report: PuzzleCompletionReport = { puzzleId: def.id, ok: false, applied: [], skipped: [] }
  const s = inv()
  if (!def.requiresAnyEvidence.some((id) => s.evidenceOwned.includes(id))) {
    report.blocked = `Fonte ainda não adquirida (${def.requiresAnyEvidence.join(' | ')}).`
    return report
  }
  const missingArtifacts = (def.requiresDerivedArtifacts ?? []).filter(
    (id) => !s.forensicDerivedArtifacts?.[id],
  )
  if (missingArtifacts.length) {
    report.blocked = `Artifact derivado ausente: ${missingArtifacts.join(', ')} — conclua P09 antes.`
    return report
  }
  for (const stage of def.stages) {
    if (stage.kind === 'reveal' && !opts.includeReveal) break
    const out = stage.run()
    if (out.status === 'applied') report.applied.push(stage.id)
    else if (out.status === 'skipped') report.skipped.push({ stage: stage.id, reason: out.reason })
    else {
      report.blocked = `${stage.id}: ${out.reason}`
      break
    }
    if (opts.through && stage.id === opts.through) break
  }
  report.ok = !report.blocked && Boolean(inv().flags[def.doneFlag])
  if (report.applied.length) {
    const bypass = def.devBypass?.() ?? undefined
    if (bypass) report.devBypass = bypass
    const prev = inv().devPuzzleCompletions?.[def.id]
    markDevPuzzleCompletion({
      puzzleId: def.id,
      stages: [...new Set([...(prev?.stages ?? []), ...report.applied])],
      ...(bypass ? { devBypass: bypass } : {}),
    })
  }
  return report
}

/**
 * Aplica a conclusão canônica do puzzle sobre `state` (sem tocar no estado vivo).
 * Handlers reais rodam num sandbox do store; o resultado inclui o que a resolução legítima
 * produziria (findings, flags, speech, containers, artifacts, conquistas via engine).
 */
export function applyCanonicalPuzzleCompletion(
  puzzleId: CanonicalPuzzleId,
  state: InvestigationState,
  opts: PuzzleCompletionOptions = {},
): { state: InvestigationState; report: PuzzleCompletionReport } {
  const def = CANONICAL_PUZZLES[puzzleId]
  let report!: PuzzleCompletionReport
  const next = runInStoreSandbox(state, () => {
    report = runPuzzleStages(def, opts)
  })
  return { state: next, report }
}

/** Mesma conclusão, mas executada no store corrente (replay DEV já em sandbox). */
export function runCanonicalPuzzleCompletionInPlace(
  puzzleId: CanonicalPuzzleId,
  opts: PuzzleCompletionOptions = {},
): PuzzleCompletionReport {
  return runPuzzleStages(CANONICAL_PUZZLES[puzzleId], opts)
}

/** DEV: conclui o puzzle no jogo em andamento. */
export function devCompletePuzzle(
  puzzleId: CanonicalPuzzleId,
  opts: PuzzleCompletionOptions = {},
): PuzzleCompletionReport {
  const { state, report } = applyCanonicalPuzzleCompletion(puzzleId, getInvestigationState(), opts)
  if (report.applied.length) commitDevState(state)
  return report
}
