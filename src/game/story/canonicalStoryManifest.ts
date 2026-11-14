/**
 * DEV QA — manifesto canônico da campanha (fonte única para checkpoints DEV).
 *
 * Cada checkpoint lista as INTERAÇÕES obrigatórias do caminho principal desde o anterior,
 * expressas como as mesmas chamadas que a UI faz (handlers de bloco, abertura de documento,
 * ligação, chat roteirizado, entrevista por tópicos, reflexão, conclusão de puzzle).
 * O estado de um checkpoint é sempre reconstruído do zero: estado inicial → replay de todos
 * os checkpoints até o alvo. Voltar/avançar nunca reaproveita estado vivo, então não há
 * vazamento de descobertas futuras.
 *
 * Gatilhos de bloco (`blockNN_start`, convergências, trilhas) disparam pelo engine, como no jogo.
 * Descobertas opcionais (earlyPathHandlers, visitas antecipadas) NÃO aparecem aqui.
 */
import { callScripts } from '../../data/calls'
import { chatScripts, buildScriptStepMessages } from '../../data/chatScripts'
import { hospitalTopicFlags } from '../../data/block01/hospitalInterview'
import { lucasTopicFlags } from '../../data/block02/lucasInterview'
import { liviaTopicFlags } from '../../data/block03/liviaInterview'
import { nicoTopicFlags } from '../../data/block03/nicoInterview'
import { block04DiaryEntries } from '../../data/block04/diaryEntries'
import { andreTopicFlags } from '../../data/block04/andreInterview'
import { samuelTopicFlags } from '../../data/block04/samuelInterview'
import { janaTopicFlags } from '../../data/block05/janaInterview'
import { nicoFollowupFlags } from '../../data/block05/nicoFollowup'
import { geraldoTopicFlags } from '../../data/block06/geraldoInterview'
import { janaFollowupFlags } from '../../data/block06/janaFollowup'
import { miroTopicFlags } from '../../data/block06/miroInterview'
import { ceciliaTopicFlags } from '../../data/block07/ceciliaInterview'
import { miroFollowupFlags } from '../../data/block07/miroFollowup'
import { sandraTopicFlags } from '../../data/block07/sandraInterview'
import { andreFollowupFlags } from '../../data/block08/andreFollowup'
import { biaTopicFlags } from '../../data/block08/biaInterview'
import { denisTopicFlags } from '../../data/block08/denisInterview'
import { mauroTopicFlags } from '../../data/block08/mauroInterview'
import { miroThirdFlags } from '../../data/block08/miroThird'
import { ruiTopicFlags } from '../../data/block08/ruiInterview'
import { getDocument } from '../../data/game/seedDocuments'
import { seedSearchRules } from '../../data/game/seedStory'
import { runPoliceSearch } from '../search/runSearch'
import {
  runCanonicalPuzzleCompletionInPlace,
  type CanonicalPuzzleId,
} from '../../forensic/canonicalPuzzleCompletion'
import { repairInvestigationState } from '../personRegistryGates'
import { stripEphemeralUi } from '../state/gameSave'
import { createInitialState } from '../state/initialState'
import {
  appendChatMessages,
  dispatchActions,
  extractFromDocument,
  getInvestigationState,
  openDocument,
  runInStoreSandbox,
  setFlag,
} from '../state/investigationStore'
import type { DocumentBlock, InvestigationState, StoryActionRef } from '../types'
import {
  finishHospitalVisit,
  onJuliaChatReviewed,
  onMarianaPhoneClosed,
  onMarianaPhoneOpened,
  onNoteRead,
  onRafaelAudioPlayed,
  registerInitialPoliceReport,
} from './block01Handlers'
import {
  completeVerticeTopicById,
  finishLucasInterview,
  finishVerticeVisit,
  onRafaelForwardAudioPlayed,
} from './block02Handlers'
import { finishLiviaInterview, finishNicoInterview, onMarianaMaraltoRecordingFound } from './block03Handlers'
import {
  finishAndreInterview,
  finishSamuelInterview,
  onDiaryEntryRead,
  onHexCallAnswered,
  onHexCallsPreserved,
  onUnknownRecordingAnalyzed,
  onUnknownRecordingFound,
} from './block04Handlers'
import { onUnknownCallerNumberSeen } from './block04PhoneHooks'
import {
  comparePhoneFilesSequence,
  finishJanaInterview,
  finishNicoFollowup,
  organizeMarianaContactChronology,
} from './block05Handlers'
import {
  finishGeraldoInterview,
  finishJanaFollowup,
  finishMiroInterview,
  finishPoliceOperation,
} from './block06Handlers'
import {
  deliverAnonWhatsApp,
  finishCeciliaInterview,
  finishJuliaOnsetCall,
  finishMiroFollowup,
  finishSandraInterview,
  onAsterHenriqueNamed,
  onHospitalDepositDone,
  onJuliaRicardoAudioDone,
  onRenataCallDone,
  organizeMemoryOnset,
  receiveAnonHospitalAudio,
} from './block07Handlers'
import {
  finishAndreFollowup,
  finishBiaInterview,
  finishDenisInterview,
  finishMauroInterview,
  finishMiroThird,
  finishRuiInterview,
  onDetranMauroCallDone,
  onPartsShopDenisLead,
} from './block08Handlers'
import {
  dismissMemoryWordOverlay,
  finishTrailDiscovery,
  onMarianaChatOpened,
  onRobertoExposed,
  rereadDiaryOmitido,
} from './block09Handlers'
import { DEV_CHECKPOINTS } from './devCheckpointCatalog'
import { onDocumentConsulted } from './documentConsultHooks'
import { afterReflectionComplete } from './reflectionAftermath'

// ── Registro de interações reais ──────────────────────────────────────────────

/** Handlers que a UI chama diretamente (apps do celular, cenas, painéis). */
const HANDLERS = {
  registerInitialPoliceReport,
  onMarianaPhoneOpened,
  onMarianaPhoneClosed,
  onJuliaChatReviewed,
  onRafaelAudioPlayed,
  onRafaelForwardAudioPlayed,
  finishVerticeVisit,
  onMarianaMaraltoRecordingFound,
  onUnknownCallerNumberSeen,
  onHexCallAnswered,
  onHexCallsPreserved,
  onUnknownRecordingFound,
  onUnknownRecordingAnalyzed,
  organizeMarianaContactChronology,
  comparePhoneFilesSequence,
  finishPoliceOperation,
  organizeMemoryOnset,
  finishJuliaOnsetCall,
  deliverAnonWhatsApp,
  receiveAnonHospitalAudio,
  onJuliaRicardoAudioDone,
  onRenataCallDone,
  onHospitalDepositDone,
  onAsterHenriqueNamed,
  onPartsShopDenisLead,
  onDetranMauroCallDone,
  rereadDiaryOmitido,
  onMarianaChatOpened,
  finishTrailDiscovery,
  dismissMemoryWordOverlay,
} as const
export type CanonicalHandlerId = keyof typeof HANDLERS

/** Entrevistas por tópico: a cena marca cada flag de tópico e chama `finish`. */
const INTERVIEWS = {
  hospital: { flags: hospitalTopicFlags, finish: finishHospitalVisit, doneFlag: 'block01_hospital_done' },
  lucas: { flags: lucasTopicFlags, finish: finishLucasInterview, doneFlag: 'block02_lucas_interview_done' },
  nico: { flags: nicoTopicFlags, finish: finishNicoInterview, doneFlag: 'block03_nico_interview_done' },
  livia: { flags: liviaTopicFlags, finish: finishLiviaInterview, doneFlag: 'block03_livia_interview_done' },
  samuel: { flags: samuelTopicFlags, finish: finishSamuelInterview, doneFlag: 'block04_samuel_interview_done' },
  andre: { flags: andreTopicFlags, finish: finishAndreInterview, doneFlag: 'block04_andre_interview_done' },
  nicoFollowup: {
    flags: nicoFollowupFlags,
    finish: finishNicoFollowup,
    doneFlag: 'block05_nico_followup_done',
  },
  jana: { flags: janaTopicFlags, finish: finishJanaInterview, doneFlag: 'block05_jana_interview_done' },
  geraldo: {
    flags: geraldoTopicFlags,
    finish: finishGeraldoInterview,
    doneFlag: 'block06_geraldo_interview_done',
  },
  janaFollowup: {
    flags: janaFollowupFlags,
    finish: finishJanaFollowup,
    doneFlag: 'block06_jana_followup_done',
  },
  miro: { flags: miroTopicFlags, finish: finishMiroInterview, doneFlag: 'block06_miro_interview_done' },
  miroFollowup: {
    flags: miroFollowupFlags,
    finish: finishMiroFollowup,
    doneFlag: 'block07_miro_followup_done',
  },
  sandra: { flags: sandraTopicFlags, finish: finishSandraInterview, doneFlag: 'block07_sandra_interview_done' },
  cecilia: {
    flags: ceciliaTopicFlags,
    finish: finishCeciliaInterview,
    doneFlag: 'block07_cecilia_interview_done',
  },
  andreFollowup: {
    flags: andreFollowupFlags,
    finish: finishAndreFollowup,
    doneFlag: 'block08_andre_followup_done',
  },
  miroThird: { flags: miroThirdFlags, finish: finishMiroThird, doneFlag: 'block08_miro_third_done' },
  denis: { flags: denisTopicFlags, finish: finishDenisInterview, doneFlag: 'block08_denis_interview_done' },
  mauro: { flags: mauroTopicFlags, finish: finishMauroInterview, doneFlag: 'block08_mauro_interview_done' },
  bia: { flags: biaTopicFlags, finish: finishBiaInterview, doneFlag: 'block08_bia_interview_done' },
  rui: { flags: ruiTopicFlags, finish: finishRuiInterview, doneFlag: 'block08_rui_interview_done' },
} as const satisfies Record<string, { flags: Record<string, string>; finish: () => void; doneFlag: string }>
export type CanonicalInterviewId = keyof typeof INTERVIEWS

/** Pós-ligação que os painéis de telefone executam ao encerrar (PoliceLandlinePanel / PhoneCallsHome). */
const CALL_AFTERMATH: Record<string, () => void> = {
  'call-julia-onset': deliverAnonWhatsApp,
  'call-julia-ricardo-audio': onJuliaRicardoAudioDone,
  'call-renata-farias': onRenataCallDone,
  'call-aster-henrique': onAsterHenriqueNamed,
  'call-parts-jaguar-lead': onPartsShopDenisLead,
  'call-detran-jaguar': onDetranMauroCallDone,
}

export type ManifestStep =
  | { h: CanonicalHandlerId }
  | { vn: CanonicalInterviewId }
  /** Tópicos da visita ao Vértice (cena própria) — na ordem em que ficam disponíveis. */
  | { vertice: Parameters<typeof completeVerticeTopicById>[0][] }
  /**
   * Abrir documento (DocumentSheet): posse + leitura + onOpen + hooks de consulta.
   * Se ainda não possuído, precisa aparecer numa busca policial válida naquele momento.
   */
  | { doc: string }
  /** “Registrar no caderno” em blocos extraíveis do documento (DocumentSheet). */
  | { extract: string; blocks: string[] }
  /** Ligação roteirizada concluída + pós-ligação do painel. */
  | { call: string }
  /** Conversa roteirizada do WhatsApp até o fim (opção 0; opções são cosméticas). */
  | { chat: string }
  /** Nota do celular de Mariana lida. */
  | { note: string }
  /** `open`: abrir o app do diário (efeito de montagem do HiddenDiaryApp); `all`: ler todas as entradas. */
  | { diary: 'open' | 'all' }
  /** Reflexão concluída (`<id>_seen` + aftermath). */
  | { refl: string }
  | { puzzle: CanonicalPuzzleId; through?: string; includeReveal?: boolean }
  /** Resíduo sem handler exportável — documentado com a origem real. */
  | { act: StoryActionRef[]; why: string }

export interface CanonicalCheckpointDef {
  id: string
  steps: ManifestStep[]
  /** Ambiguidade / equivalência documentada (mantém a ordem dos handlers existentes). */
  note?: string
}

/**
 * Ordem = DEV_CHECKPOINTS. IDs reaproveitados do catálogo existente.
 * Checkpoints sem passos novos são marcos já alcançados por gatilho do engine.
 */
export const CANONICAL_STORY_MANIFEST: CanonicalCheckpointDef[] = [
  // ── Bloco 1 ──
  { id: 'b01-start', steps: [] },
  {
    id: 'b01-after-bo',
    steps: [
      { act: [{ type: 'setFlag', id: 'block01_opening_seen', value: true }], why: 'Cutscene de abertura (OpeningScene)' },
      { h: 'registerInitialPoliceReport' },
    ],
  },
  { id: 'b01-after-call', steps: [{ puzzle: 'P01' }] },
  {
    id: 'b01-after-phone',
    steps: [
      { h: 'onMarianaPhoneOpened' },
      { h: 'onJuliaChatReviewed' },
      { h: 'onRafaelAudioPlayed' },
      { h: 'onMarianaPhoneClosed' },
    ],
  },
  {
    id: 'b01-hospital-open',
    steps: [],
    note: 'Contradição Júlia × Rafael (engine) já libera o hospital ao fechar o celular.',
  },
  { id: 'b01-after-interviews', steps: [{ vn: 'hospital' }] },
  {
    id: 'b01-end',
    steps: [],
    note: 'block01_end_block dispara com block01_hospital_done — fim do bloco coincide com o fim das entrevistas.',
  },
  // ── Bloco 2 ──
  { id: 'b02-start', steps: [] },
  { id: 'b02-after-rafael-audio', steps: [{ chat: 'chat-rafael-augusto' }, { h: 'onRafaelForwardAudioPlayed' }] },
  { id: 'b02-vertice-unlocked', steps: [{ puzzle: 'P02' }] },
  {
    id: 'b02-archive-ready',
    steps: [{ vertice: ['iara', 'sandro', 'caio', 'archive'] }, { h: 'finishVerticeVisit' }],
  },
  { id: 'b02-nico-identified', steps: [{ puzzle: 'P03' }] },
  { id: 'b02-after-paula', steps: [{ note: 'block01_note_quarta_read' }, { chat: 'chat-paula-augusto' }] },
  { id: 'b02-after-lucas', steps: [{ doc: 'doc-lucas-cadastro' }, { vn: 'lucas' }] },
  { id: 'b02-convergence', steps: [{ doc: 'doc-elisa-resumo' }, { doc: 'doc-elisa-testemunhas' }] },
  { id: 'b02-end', steps: [], note: 'block02_convergence fecha o bloco (block02_complete).' },
  // ── Bloco 3 ──
  { id: 'b03-start', steps: [] },
  { id: 'b03-nico-located', steps: [{ doc: 'doc-nico-cadastro' }, { call: 'call-nico' }] },
  { id: 'b03-after-nico', steps: [{ vn: 'nico' }] },
  { id: 'b03-janus-ready', steps: [], note: 'finishNicoInterview já libera o Puzzle 04.' },
  { id: 'b03-janus-done', steps: [{ puzzle: 'P04' }] },
  { id: 'b03-maralto-found', steps: [{ h: 'onMarianaMaraltoRecordingFound' }] },
  { id: 'b03-maralto-researched', steps: [{ doc: 'doc-maralto-cadastro' }, { doc: 'doc-maralto-clipping' }] },
  { id: 'b03-livia-ready', steps: [{ call: 'call-livia' }] },
  { id: 'b03-after-livia', steps: [{ vn: 'livia' }] },
  { id: 'b03-saturnalia-ready', steps: [], note: 'finishLiviaInterview já libera o Puzzle 05.' },
  { id: 'b03-saturnalia-done', steps: [{ puzzle: 'P05' }] },
  { id: 'b03-end', steps: [], note: 'runSaturnaliaReconstruct fecha o bloco (block03_complete).' },
  // ── Bloco 4 ──
  { id: 'b04-start', steps: [] },
  {
    id: 'b04-samuel-ready',
    steps: [{ doc: 'doc-protesto-ocorrencia' }, { doc: 'doc-protesto-detidos' }, { doc: 'doc-samuel-ficha' }],
  },
  { id: 'b04-after-samuel', steps: [{ vn: 'samuel' }] },
  {
    id: 'b04-andre-ready',
    steps: [{ doc: 'doc-andre-ficha' }, { doc: 'doc-andre-visitas' }, { call: 'call-presidio-visit' }],
  },
  { id: 'b04-after-andre', steps: [{ vn: 'andre' }] },
  {
    id: 'b04-chronology-done',
    steps: [{ doc: 'doc-andre-ligacoes' }, { h: 'onUnknownCallerNumberSeen' }, { doc: 'doc-numero-sem-nome' }],
    note: 'O número sem nome precisa ter sido visto no celular de Mariana (CallList) antes da busca 99184.',
  },
  { id: 'b04-hex-received', steps: [{ h: 'onHexCallAnswered' }, { h: 'onHexCallsPreserved' }] },
  {
    id: 'b04-hex-done',
    steps: [{ puzzle: 'P06', through: 'survey' }],
    note: 'Canon: o survey de espectrogramas NÃO resolve o Hexágono; o PIN só fecha no diário (b04-diary-open).',
  },
  { id: 'b04-hidden-app', steps: [{ call: 'call-pericia-device' }, { doc: 'doc-laudo-forense' }] },
  { id: 'b04-diary-open', steps: [{ diary: 'open' }, { puzzle: 'P06' }, { diary: 'all' }] },
  { id: 'b04-unknown-found', steps: [{ h: 'onUnknownRecordingFound' }] },
  { id: 'b04-unknown-analyzed', steps: [{ h: 'onUnknownRecordingAnalyzed' }] },
  { id: 'b04-end', steps: [], note: 'onUnknownRecordingAnalyzed fecha o bloco (block04_complete).' },
  // ── Bloco 5 ──
  { id: 'b05-start', steps: [] },
  { id: 'b05-after-nico2', steps: [{ vn: 'nicoFollowup' }] },
  { id: 'b05-jana-ready', steps: [{ doc: 'doc-elisa-jana' }] },
  { id: 'b05-after-jana', steps: [{ vn: 'jana' }] },
  {
    id: 'b05-elisa-reviewed',
    steps: [
      { doc: 'doc-elisa-argumento' },
      { extract: 'doc-elisa-argumento', blocks: ['sec-relacao', 'sec-alibi', 'sec-testemunhas'] },
      { refl: 'refl-b05-andre' },
    ],
  },
  { id: 'b05-maralto-weighed', steps: [{ doc: 'doc-maralto-clipping' }, { refl: 'refl-b05-maralto' }] },
  { id: 'b05-chronology-done', steps: [{ h: 'organizeMarianaContactChronology' }] },
  { id: 'b05-compare-done', steps: [{ h: 'comparePhoneFilesSequence' }, { refl: 'refl-b05-coincidence' }] },
  { id: 'b05-end', steps: [{ doc: 'doc-central-chamada' }, { refl: 'refl-b05-path' }] },
  // ── Bloco 6 ──
  { id: 'b06-start', steps: [] },
  { id: 'b06-geraldo-ready', steps: [{ doc: 'doc-geraldo-ficha' }, { doc: 'doc-vertice-comanda-noitex' }] },
  { id: 'b06-after-geraldo', steps: [{ vn: 'geraldo' }, { refl: 'refl-b06-geraldo' }] },
  { id: 'b06-after-jana2', steps: [{ vn: 'janaFollowup' }] },
  {
    id: 'b06-valter-trail',
    steps: [{ doc: 'doc-valter-ocorrencias' }, { doc: 'doc-valter-associados' }, { doc: 'doc-valter-interceptacao' }],
  },
  { id: 'b06-pastor-done', steps: [{ puzzle: 'P07' }] },
  { id: 'b06-after-operation', steps: [{ h: 'finishPoliceOperation' }] },
  { id: 'b06-end', steps: [{ vn: 'miro' }, { refl: 'refl-b06-miro' }] },
  // ── Bloco 7 ──
  { id: 'b07-start', steps: [] },
  {
    id: 'b07-after-miro2',
    steps: [{ vn: 'miroFollowup' }],
    note: 'finishMiroInterview (B6) já registra a 2ª conversa com Miro; o passo é idempotente.',
  },
  { id: 'b07-sandra-ready', steps: [{ doc: 'doc-sandra-ficha' }] },
  { id: 'b07-after-sandra', steps: [{ vn: 'sandra' }, { refl: 'refl-b07-sandra' }] },
  {
    id: 'b07-morsa-memory',
    steps: [
      { doc: 'doc-protesto-ocorrencia' },
      { h: 'organizeMemoryOnset' },
      { call: 'call-julia-onset' },
      { h: 'finishJuliaOnsetCall' },
      { h: 'receiveAnonHospitalAudio' },
    ],
  },
  { id: 'b07-enceladus-done', steps: [{ puzzle: 'P08' }] },
  { id: 'b07-julia-renata-voice', steps: [{ call: 'call-julia-ricardo-audio' }] },
  { id: 'b07-renata-patient-context', steps: [{ call: 'call-renata-farias' }] },
  {
    id: 'b07-ricardo-found',
    steps: [{ call: 'call-hospital-ricardo' }, { doc: 'doc-hospital-ricardo-freitas' }],
  },
  {
    id: 'b07-ricardo-dead',
    steps: [{ refl: 'refl-b07-ricardo-dead' }],
    note: 'Fluxo atual: prontuário (onRicardoRecordFound) → reflexão. A consulta civil negativa só existe via flag legada (block07_ricardo_id_check_unlocked), nunca setada no jogo.',
  },
  {
    id: 'b07-ricardo-henrique',
    steps: [
      { refl: 'refl-b07-notebook' },
      { h: 'onHospitalDepositDone' },
      { refl: 'refl-b07-hv' },
      { doc: 'doc-forum-hvalenca' },
      { call: 'call-aster-henrique' },
      { refl: 'refl-b07-henrique-reveal' },
    ],
  },
  {
    id: 'b07-henrique-trail',
    steps: [{ doc: 'doc-henrique-empresa' }, { doc: 'doc-henrique-incidente' }, { doc: 'doc-cecilia-contato' }],
  },
  { id: 'b07-after-cecilia', steps: [{ vn: 'cecilia' }, { doc: 'doc-henrique-pcap-note' }] },
  { id: 'b07-end', steps: [{ puzzle: 'P09' }, { refl: 'refl-b07-tech' }] },
  // ── Bloco 8 ──
  { id: 'b08-start', steps: [] },
  {
    id: 'b08-rings-timeline',
    steps: [{ puzzle: 'P10', through: 'route' }],
    note: 'Só a etapa técnica; a revelação CAM11 fica para b08-rings-done.',
  },
  {
    id: 'b08-rings-done',
    steps: [{ puzzle: 'P10', includeReveal: true }, { refl: 'refl-b08-morsa' }],
  },
  { id: 'b08-after-andre2', steps: [{ vn: 'andreFollowup' }, { refl: 'refl-b08-andre' }] },
  { id: 'b08-after-miro3', steps: [{ vn: 'miroThird' }, { refl: 'refl-b08-miro-guardrail' }] },
  {
    id: 'b08-after-pericia',
    steps: [{ call: 'call-pericia-guardrail' }, { doc: 'doc-guardrail-reanalise' }, { refl: 'refl-b08-jaguar-lead' }],
  },
  {
    id: 'b08-after-denis',
    steps: [{ call: 'call-parts-jaguar-lead' }, { vn: 'denis' }, { call: 'call-detran-jaguar' }],
  },
  { id: 'b08-mauro-bia', steps: [{ vn: 'mauro' }] },
  { id: 'b08-bia-rui', steps: [{ vn: 'bia' }, { vn: 'rui' }, { refl: 'refl-b08-accident' }] },
  { id: 'b08-rotation-done', steps: [{ puzzle: 'P11', through: 'vtr14' }] },
  { id: 'b08-end', steps: [{ puzzle: 'P11' }, { refl: 'refl-b08-final' }] },
  // ── Bloco 9 ──
  { id: 'b09-start', steps: [] },
  {
    id: 'b09-omitido',
    steps: [
      { doc: 'doc-henrique-pcap-note' },
      { doc: 'doc-numero-sem-nome' },
      { h: 'rereadDiaryOmitido' },
      { doc: 'doc-central-chamada' },
      { refl: 'refl-b09-omitido' },
    ],
  },
  {
    id: 'b09-roberto-messages',
    steps: [
      { doc: 'doc-roberto-denuncia' },
      { h: 'onMarianaChatOpened' },
      { h: 'onMarianaChatOpened' },
      { refl: 'refl-b09-messages' },
    ],
  },
  {
    id: 'b09-death',
    steps: [
      { doc: 'doc-trilha-camera-mariana' },
      { doc: 'doc-trilha-transporte-mariana' },
      { h: 'finishTrailDiscovery' },
      { refl: 'refl-b09-death' },
    ],
  },
  {
    id: 'b09-memory-ready',
    steps: [{ doc: 'doc-outros-desaparecimentos' }, { h: 'onMarianaChatOpened' }, { refl: 'refl-b09-augusto' }],
  },
  {
    id: 'b09-end',
    steps: [{ puzzle: 'P12' }, { h: 'dismissMemoryWordOverlay' }, { refl: 'refl-b09-final' }],
  },
]

// ── Execução ──────────────────────────────────────────────────────────────────

export interface StepIssue {
  checkpointId: string
  step: string
  message: string
}

function describeStep(step: ManifestStep): string {
  if ('h' in step) return `h:${step.h}`
  if ('vn' in step) return `vn:${step.vn}`
  if ('vertice' in step) return `vertice:${step.vertice.join(',')}`
  if ('doc' in step) return `doc:${step.doc}`
  if ('extract' in step) return `extract:${step.extract}#${step.blocks.join(',')}`
  if ('call' in step) return `call:${step.call}`
  if ('chat' in step) return `chat:${step.chat}`
  if ('note' in step) return `note:${step.note}`
  if ('diary' in step) return `diary:${step.diary}`
  if ('refl' in step) return `refl:${step.refl}`
  if ('puzzle' in step) return `puzzle:${step.puzzle}${step.through ? `@${step.through}` : ''}${step.includeReveal ? '+reveal' : ''}`
  return `act:${step.why}`
}

function playChatScript(chatId: string): string | null {
  const script = chatScripts[chatId]
  if (!script) return `Chat sem roteiro: ${chatId}`
  const s = getInvestigationState()
  if (!s.phones.augusto.unlockedChatIds.includes(chatId)) return `Chat ainda bloqueado: ${chatId}`
  let progress = s.chatProgress[chatId] ?? { step: 0, done: false, messages: [] }
  if (progress.done) return null
  while (progress.step < script.steps.length) {
    const built = buildScriptStepMessages(script, progress.step, 0)
    if (!built) break
    appendChatMessages(chatId, [built.mine, ...built.replies], progress.step + 1, false)
    progress = getInvestigationState().chatProgress[chatId]!
  }
  appendChatMessages(chatId, [], progress.step, true)
  dispatchActions(script.onComplete)
  return null
}

/** O documento aparece em alguma regra de busca liberada agora (mesma consulta do terminal). */
function isDocumentSearchable(docId: string, s: InvestigationState): boolean {
  return seedSearchRules.some(
    (rule) =>
      rule.results.some((r) => r.documentId === docId) &&
      runPoliceSearch(rule.requiredTerms.join(' '), s).hits.some((h) => h.documentId === docId),
  )
}

/** Mesmas ações do botão “Registrar no caderno” do DocumentSheet. */
function extractActionsForBlock(docId: string, block: DocumentBlock): StoryActionRef[] {
  const actions: StoryActionRef[] = []
  if (block.extractableEvidenceId) {
    actions.push({ type: 'addEvidence', id: block.extractableEvidenceId })
    if (block.extractableEvidenceId === 'elisa_lookalike_near_fall') {
      actions.push(
        { type: 'discoverSearchTerm', term: 'sandra' },
        { type: 'discoverPerson', id: 'sandra', status: 'identified' },
      )
    }
  }
  if (block.extractAction) actions.push(block.extractAction)
  if (docId === 'doc-bo-inicial' && block.id === 'b5') registerInitialPoliceReport()
  return actions
}

function runStep(step: ManifestStep): string | null {
  const s = getInvestigationState()
  if ('h' in step) {
    HANDLERS[step.h]()
    return null
  }
  if ('vn' in step) {
    const vn = INTERVIEWS[step.vn]
    for (const flag of Object.values(vn.flags) as string[]) setFlag(flag, true)
    vn.finish()
    return getInvestigationState().flags[vn.doneFlag] ? null : `Entrevista não concluiu ${vn.doneFlag}`
  }
  if ('vertice' in step) {
    for (const topic of step.vertice) completeVerticeTopicById(topic)
    return null
  }
  if ('doc' in step) {
    if (!getDocument(step.doc)) return `Documento inexistente: ${step.doc}`
    if (!s.documentsOwned.includes(step.doc) && !isDocumentSearchable(step.doc, s)) {
      return `Documento ainda inalcançável (nem possuído, nem em resultado de busca): ${step.doc}`
    }
    openDocument(step.doc)
    onDocumentConsulted(step.doc)
    if (step.doc === 'doc-roberto-denuncia') onRobertoExposed()
    return null
  }
  if ('extract' in step) {
    const doc = getDocument(step.extract)
    if (!doc) return `Documento inexistente: ${step.extract}`
    if (!s.documents[step.extract]?.read) return `Documento não aberto antes da extração: ${step.extract}`
    for (const blockId of step.blocks) {
      const block = doc.blocks.find((b) => b.id === blockId)
      if (!block) return `Bloco inexistente: ${step.extract}#${blockId}`
      if (getInvestigationState().documents[step.extract]?.highlightedBlockIds.includes(blockId)) continue
      extractFromDocument(blockId, doc.id, extractActionsForBlock(doc.id, block))
    }
    return null
  }
  if ('call' in step) {
    const script = callScripts.find((c) => c.id === step.call)
    if (!script) return `Ligação inexistente: ${step.call}`
    if (!s.callsDone.includes(script.id)) {
      if (!script.available(s)) return `Ligação ainda indisponível: ${step.call}`
      dispatchActions(script.onComplete)
    }
    CALL_AFTERMATH[script.id]?.()
    return null
  }
  if ('chat' in step) return playChatScript(step.chat)
  if ('note' in step) {
    onNoteRead(step.note)
    return null
  }
  if ('diary' in step && step.diary === 'open') {
    const unlocked =
      s.phones.mariana.diaryUnlocked || s.flags.block04_forensics_done || s.flags.block04_diary_opened
    if (!unlocked && !s.flags.block04_forensics_access && !s.flags.block04_diary_icon_revealed) {
      return 'App do diário ainda não restaurado pela Perícia'
    }
    const actions: StoryActionRef[] = []
    if (s.tasks.some((t) => t.id === 'task_open_recovered_diary' && !t.completed)) {
      actions.push({ type: 'completeTask', id: 'task_open_recovered_diary' })
    }
    if (!unlocked && !s.tasks.some((t) => t.id === 'task_unlock_diary')) {
      actions.push({
        type: 'addTask',
        id: 'task_unlock_diary',
        label: 'Desbloquear o diário com o código recuperado no Hexágono',
      })
    }
    if (actions.length) dispatchActions(actions)
    return null
  }
  if ('diary' in step) {
    if (!getInvestigationState().phones.mariana.diaryUnlocked) return 'Diário ainda bloqueado'
    for (const e of block04DiaryEntries) {
      if (!getInvestigationState().flags[e.readFlag]) {
        setFlag(e.readFlag, true)
        onDiaryEntryRead(e.id, Boolean(e.unlocksUnknownRecording))
      }
    }
    return null
  }
  if ('refl' in step) {
    setFlag(`${step.refl}_seen`, true)
    afterReflectionComplete(step.refl)
    return null
  }
  if ('puzzle' in step) {
    const report = runCanonicalPuzzleCompletionInPlace(step.puzzle, {
      through: step.through,
      includeReveal: step.includeReveal,
    })
    return report.blocked ? `${step.puzzle}: ${report.blocked}` : null
  }
  dispatchActions(step.act)
  return null
}

function snapshot(s: InvestigationState): InvestigationState {
  return repairInvestigationState(stripEphemeralUi(s))
}

interface ReplayResult {
  states: Map<string, InvestigationState>
  issues: StepIssue[]
}

let cache: ReplayResult | null = null

const REPLAY_CLOCK_BASE = Date.UTC(2026, 0, 1)

function replayAll(): ReplayResult {
  if (cache) return cache
  const states = new Map<string, InvestigationState>()
  const issues: StepIssue[] = []
  // Relógio determinístico durante o replay: timestamps (fala recuperada, conquistas,
  // artefatos) ficam idênticos a cada reconstrução e preservam a ordem dos eventos.
  const realNow = Date.now
  let tick = REPLAY_CLOCK_BASE
  Date.now = () => tick++
  try {
    runInStoreSandbox(createInitialState(), () => {
      // Engine roda uma vez sobre o estado inicial (gatilhos sem condição).
      dispatchActions([])
      for (const cp of CANONICAL_STORY_MANIFEST) {
        for (const step of cp.steps) {
          const err = runStep(step)
          if (err) issues.push({ checkpointId: cp.id, step: describeStep(step), message: err })
        }
        states.set(cp.id, snapshot(getInvestigationState()))
      }
    })
  } finally {
    Date.now = realNow
  }
  cache = { states, issues }
  return cache
}

/** Estado canônico do checkpoint, sempre reconstruído a partir do estado inicial. */
export function buildCanonicalCheckpointState(checkpointId: string): InvestigationState {
  const st = replayAll().states.get(checkpointId)
  if (!st) throw new Error(`Checkpoint canônico desconhecido: ${checkpointId}`)
  return structuredClone(st)
}

export function getCanonicalCheckpointDef(checkpointId: string): CanonicalCheckpointDef | undefined {
  return CANONICAL_STORY_MANIFEST.find((c) => c.id === checkpointId)
}

export interface ManifestValidation {
  ok: boolean
  checkpointCount: number
  /** IDs do catálogo sem entrada no manifesto (ou vice-versa / fora de ordem). */
  orderMismatch: string[]
  issues: StepIssue[]
}

export function validateCanonicalManifest(): ManifestValidation {
  const catalogIds = DEV_CHECKPOINTS.map((c) => c.id)
  const manifestIds = CANONICAL_STORY_MANIFEST.map((c) => c.id)
  const orderMismatch: string[] = []
  const len = Math.max(catalogIds.length, manifestIds.length)
  for (let i = 0; i < len; i++) {
    if (catalogIds[i] !== manifestIds[i]) orderMismatch.push(`${i}: catalog=${catalogIds[i]} manifest=${manifestIds[i]}`)
  }
  const { issues } = replayAll()
  return { ok: !orderMismatch.length && !issues.length, checkpointCount: manifestIds.length, orderMismatch, issues }
}

let markerCache: Map<string, string[]> | null = null

/**
 * Flags que passam a valer neste checkpoint (e continuam até o fim da campanha).
 * Checkpoints sem marcador próprio são equivalentes ao anterior.
 */
export function canonicalCheckpointMarkers(checkpointId: string): string[] {
  if (!markerCache) {
    const { states } = replayAll()
    const last = states.get(CANONICAL_STORY_MANIFEST[CANONICAL_STORY_MANIFEST.length - 1].id)!
    markerCache = new Map()
    let prev: InvestigationState | null = null
    for (const cp of CANONICAL_STORY_MANIFEST) {
      const cur = states.get(cp.id)!
      markerCache.set(
        cp.id,
        Object.keys(cur.flags).filter((f) => cur.flags[f] && !prev?.flags[f] && last.flags[f]),
      )
      prev = cur
    }
  }
  return markerCache.get(checkpointId) ?? []
}

/** Índice do checkpoint canônico mais avançado cujas marcas estão presentes no estado atual. */
export function canonicalCampaignProgress(flags: Record<string, boolean>): {
  percent: number
  currentIndex: number
  total: number
  currentCheckpointId: string
} {
  const total = CANONICAL_STORY_MANIFEST.length
  let currentIndex = 0
  let reachedPrev = true
  for (let i = 0; i < total; i++) {
    const markers = canonicalCheckpointMarkers(CANONICAL_STORY_MANIFEST[i].id)
    const reached: boolean = markers.length ? markers.every((f) => flags[f]) : reachedPrev
    if (reached) currentIndex = i
    reachedPrev = reached
  }
  const percent = total <= 1 ? 0 : Math.round((currentIndex / (total - 1)) * 100)
  return { percent, currentIndex, total, currentCheckpointId: CANONICAL_STORY_MANIFEST[currentIndex].id }
}

/** Testes: força novo replay (ex.: após mudar dados em memória). */
export function __resetCanonicalManifestCache() {
  cache = null
  markerCache = null
}
