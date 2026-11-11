import type { ChatMessage } from '../../types/messaging'

export type PersonStatus =
  | 'mentioned'
  | 'identified'
  | 'located'
  | 'contactable'
  | 'interviewed'

export type LocationStatus = 'unknown' | 'known' | 'visitAvailable' | 'visited'

export type EvidenceType =
  | 'document'
  | 'audio'
  | 'photo'
  | 'message'
  | 'physical'
  | 'digital'
  | 'derived'
  | 'other'

export type HypothesisStateKind = 'active' | 'weakened' | 'discarded' | 'confirmed'

/** Metadados de puzzle em evidências de áudio (substituível depois). */
export interface AudioPuzzleMeta {
  puzzleId: string
  implementation: 'placeholder' | 'full'
  completionEvidenceId: string
}

export interface Person {
  id: string
  name: string
  aliases?: string[]
  status: PersonStatus
  occupation?: string
  notes?: string[]
  relatedEvidenceIds: string[]
  relatedPersonIds: string[]
  contactId?: string
  locationId?: string
}

export interface Location {
  id: string
  name: string
  description?: string
  status: LocationStatus
  relatedPersonIds: string[]
  relatedEvidenceIds: string[]
  sceneId?: string
  /** Posição do marcador no mapa (0–1); locais sem posição não aparecem no mapa */
  mapX?: number
  mapY?: number
}

export interface Evidence {
  id: string
  title: string
  type: EvidenceType
  description?: string
  sourceType: string
  sourceId?: string
  obtainedAt?: string
  obtainedFrom?: string
  originalOrDerived: 'original' | 'derived' | 'unknown'
  integrity?: 'verified' | 'unverified' | 'questionable'
  relatedPersonIds: string[]
  relatedLocationIds: string[]
  relatedEventIds: string[]
  exportable?: boolean
  deviceLocked?: boolean
  requiredAppId?: string
  contentRef?: string
  audioSrc?: string
  durationSec?: number
  /** Nome exibido na estação (pode diferir do arquivo em disco). */
  displayFileName?: string
  puzzleMeta?: AudioPuzzleMeta
  /**
   * Se true, a evidência existe para lógica/save mas não aparece no caderno.
   * Usar para detalhes agrupados numa evidência principal.
   */
  catalogHidden?: boolean
}

export interface AudioEvidence extends Evidence {
  type: 'audio'
  audioSrc?: string
  durationSec?: number
  operationsApplied?: AudioOperation[]
}

export type AudioOperation =
  | 'noiseReduction'
  | 'bandPass'
  | 'channelIsolation'
  | 'phaseInvert'
  | 'speed'
  | 'pitch'
  | 'spectrogram'
  | 'metadata'
  | 'custom'

export interface DocumentBlock {
  id: string
  /** Título da peça/seção, quando o documento é um volume com trechos distintos. */
  heading?: string
  text: string
  extractableEvidenceId?: string
  extractAction?: StoryActionRef
}

export type DocumentLeadType = 'phone' | 'address' | 'institution'

/** Pista operacional contida no documento (registrada ao ler, nunca como botão de entrevista). */
export interface DocumentLead {
  type: DocumentLeadType
  label: string
  value: string
}

export interface Document {
  id: string
  title: string
  category: string
  /** Quem emitiu / sistema de origem (cabeçalho do documento). */
  issuer?: string
  dateLabel?: string
  /** Módulo do computador onde o documento é listado. */
  system?: 'consultas' | 'ocorrencias' | 'autos' | 'documentos' | 'pericia'
  blocks: DocumentBlock[]
  /** Pistas (telefone/endereço) listadas ao ler. */
  leads?: DocumentLead[]
  /** Imagem diegética opcional (`sprite:id` ou caminho). */
  imageSrc?: string
  imageCaption?: string
  /** Executado uma única vez, na primeira leitura. */
  onOpen?: StoryActionRef[]
  /**
   * Se false, o documento existe para save/legado mas não lista no computador.
   * Padrão: visível.
   */
  playerFacing?: boolean
}

export interface DocumentProgress {
  read: boolean
  highlightedBlockIds: string[]
}

export interface Contact {
  id: string
  personId?: string
  displayName: string
  phone?: string
  /** Contato institucional (setor / unidade): aparece na agenda do fixo. */
  institution?: boolean
  unlocked: boolean
}

export interface ConversationMeta {
  id: string
  contactId: string
  device: 'mariana' | 'augusto'
  lockedUntilFlag?: string
  lockedUntilEvidence?: string
}

export interface InterviewTopic {
  id: string
  label: string
  personId: string
  unlockedByEvidence?: string[]
  unlockedByFlag?: string
}

export interface Hypothesis {
  id: string
  title: string
  supportingEvidenceIds: string[]
  contradictingEvidenceIds: string[]
  state: HypothesisStateKind
}

export interface ContradictionDef {
  id: string
  evidenceAId: string
  evidenceBId: string
  summary: string
  actions?: StoryActionRef[]
}

export interface ContradictionRecord {
  id: string
  confirmedAt: string
}

export type TimelinePrecision = 'exact' | 'interval' | 'contested' | 'approximate'

export interface TimelineEvent {
  id: string
  label: string
  start?: string
  end?: string
  precision: TimelinePrecision
  sourceIds: string[]
  confidence: 'low' | 'medium' | 'high'
  relatedPersonIds: string[]
  relatedLocationIds: string[]
}

export interface CaseTask {
  id: string
  label: string
  completed: boolean
  auto?: boolean
}

export interface AppDefinition {
  id: string
  name: string
  device: 'mariana' | 'augusto' | 'both'
  hiddenByDefault?: boolean
  searchableInStore?: boolean
  storeKeywords?: string[]
  preinstalled?: boolean
  narrativeDescription?: string
}

export interface InstalledApp {
  appId: string
  installedAt: string
}

export interface AnalysisModule {
  id: string
  title: string
  accepts: EvidenceType[]
  unlocked: boolean
}

export interface ProvocationEvent {
  id: string
  channel: 'sms' | 'whatsapp' | 'call' | 'audio' | 'email' | 'computer' | 'physical'
  preview: string
  triggerFlag?: string
  actions?: StoryActionRef[]
}

export type StoryCondition =
  | { type: 'flag'; id: string; value?: boolean }
  | { type: 'evidenceOwned'; id: string }
  | { type: 'personStatusAtLeast'; personId: string; status: PersonStatus }
  | { type: 'topicKnown'; id: string }
  | { type: 'appInstalled'; device: 'mariana' | 'augusto'; appId: string }
  | { type: 'passwordDiscovered'; which: 'marianaAccount' | 'diary' }
  | { type: 'contradictionConfirmed'; id: string }

export type DiscoveryKind =
  | 'evidence'
  | 'document'
  | 'contact'
  | 'location'
  | 'audio'
  | 'hypothesis'
  | 'objective'
  | 'contradiction'
  | 'message'

export type StoryActionRef =
  | { type: 'setFlag'; id: string; value?: boolean }
  | { type: 'addEvidence'; id: string }
  | { type: 'discoverPerson'; id: string; status?: PersonStatus }
  | { type: 'unlockLocation'; id: string; status?: LocationStatus }
  | { type: 'unlockContact'; contactId: string }
  | { type: 'unlockTopic'; id: string }
  | { type: 'addTask'; id: string; label?: string }
  | { type: 'linkHypothesis'; hypothesisId: string; evidenceId: string; role: 'support' | 'contradict' }
  | { type: 'removeTask'; id: string }
  | { type: 'replaceTasks'; tasks: CaseTask[] }
  | { type: 'completeTask'; id: string }
  | { type: 'addTimelineEvent'; id: string }
  | { type: 'updateTimelineEvent'; id: string }
  | { type: 'unlockChat'; chatId: string; device: 'mariana' | 'augusto' }
  | { type: 'discoverPassword'; which: 'marianaAccount' | 'diary' }
  | { type: 'installApp'; device: 'mariana' | 'augusto'; appId: string }
  | { type: 'addHypothesis'; id: string }
  | { type: 'updateHypothesis'; id: string; state: HypothesisStateKind }
  | { type: 'confirmContradiction'; id: string }
  | { type: 'addDocument'; id: string }
  | { type: 'completeCall'; id: string }
  | { type: 'pushProvocation'; id: string }
  | { type: 'discoverSearchTerm'; term: string }
  /** Marca triggers `once` como já disparados (checkpoints DEV / save repair). */
  | { type: 'markTriggersFired'; ids: string[] }
  /**
   * Feedback visual explícito (opt-in). Não é emitido automaticamente por
   * addEvidence / addDocument / addTask / unlockContact.
   */
  | {
      type: 'notifyInvestigationUpdate'
      id: string
      kind: DiscoveryKind
      title: string
      subtitle?: string
      summary?: string
      /** Sobrescreve o rótulo padrão do kind (ex.: “CASO ATUALIZADO”). */
      label?: string
      refId?: string
      /**
       * `card` = DiscoveryCard claro (bloqueante, CTA caderno).
       * `notice` = faixa preta auto-dismiss (padrão).
       */
      presentation?: 'card' | 'notice'
    }

export interface StoryTrigger {
  id: string
  once?: boolean
  conditions: StoryCondition[]
  actions: StoryActionRef[]
}

export interface SearchRule {
  id: string
  category: 'web' | 'news' | 'police' | 'case' | 'public' | 'internal'
  requiredTerms: string[]
  optionalTerms?: string[]
  /** Todas as flags devem estar ativas para a regra valer (AND). */
  requiredFlags?: string[]
  /**
   * Augusto precisa conhecer estes termos (searchTermsDiscovered ou pessoa no caso).
   * Substitui a maior parte dos `*_search_unlocked` para cadastros básicos.
   */
  requiredKnownTerms?: string[]
  results: { title: string; snippet: string; documentId?: string }[]
  discoverTerms?: string[]
}

export interface PhoneDeviceState {
  installedAppIds: string[]
  hiddenAppsRevealed: boolean
  diaryUnlocked: boolean
  diaryPasswordAttempts: number
  unlockedChatIds: string[]
  readMessageIds: string[]
}

export interface InvestigationState {
  version: number
  flags: Record<string, boolean>
  people: Record<string, Person>
  locations: Record<string, Location>
  evidence: Record<string, Evidence>
  evidenceOwned: string[]
  documents: Record<string, DocumentProgress>
  contacts: Record<string, Contact>
  hypotheses: Record<string, Hypothesis>
  contradictionsConfirmed: ContradictionRecord[]
  timeline: TimelineEvent[]
  tasks: CaseTask[]
  interviewTopicsUnlocked: string[]
  passwordsDiscovered: { marianaAccount: boolean; diary: boolean }
  searchTermsDiscovered: string[]
  phones: { mariana: PhoneDeviceState; augusto: PhoneDeviceState }
  provocationsPending: string[]
  provocationsSeen: string[]
  triggersFired: string[]
  /** @deprecated substituído por `discoveries`; mantido para saves antigos. */
  toastQueue: string[]
  /** Documentos que o jogador possui (pasta física e sistema). */
  documentsOwned: string[]
  /** Fila UI efêmera de discoveries (não persiste no save). */
  discoveries: DiscoveryEvent[]
  /** Áudios (ids de evidência) já abertos na bancada. */
  audioSeen: string[]
  /** Conversas iniciadas pelo jogador (Paula, Rafael…). */
  chatProgress: Record<string, ChatProgress>
  /** Ligações já concluídas (ids de CallScript). */
  callsDone: string[]
  /** Tempo de jogo acumulado (ms). Não inclui menus. */
  playTimeMs?: number
  /** Primeiro instante em que cada conquista foi satisfeita. */
  achievementUnlocks?: Record<string, number>
  /**
   * Segmentos de fala recuperados na bancada forense, por evidenceId.
   * Persiste no save; reset de processamento não apaga.
   */
  forensicRecoveredSpeech?: Record<
    string,
    { segmentId: string; text: string; startSec: number; unlockedAt: number }[]
  >
}

export interface DiscoveryEvent {
  id: string
  kind: DiscoveryKind
  title: string
  subtitle?: string
  source?: string
  summary?: string
  refId?: string
  /** Quantos itens do mesmo tipo foram agrupados (áudios em lote). */
  count?: number
  /** Rótulo customizado no notice (senão usa o padrão do kind). */
  label?: string
  /** `card` = DiscoveryCard claro; omitido/`notice` = faixa preta. */
  presentation?: 'card' | 'notice'
}

export interface ChatProgress {
  step: number
  done: boolean
  messages: ChatMessage[]
}

export type HubPanel =
  | null
  | 'computer'
  | 'case-files'
  | 'casebook'
  | 'map'
  | 'audio-lab'
  | 'landline'
  | 'wall-board'
  | 'mariana-phone'
  | 'augusto-phone'
