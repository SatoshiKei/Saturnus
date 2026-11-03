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
  text: string
  extractableEvidenceId?: string
  extractAction?: StoryActionRef
}

export interface Document {
  id: string
  title: string
  category: string
  blocks: DocumentBlock[]
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

export type StoryActionRef =
  | { type: 'setFlag'; id: string; value?: boolean }
  | { type: 'addEvidence'; id: string }
  | { type: 'discoverPerson'; id: string; status?: PersonStatus }
  | { type: 'unlockLocation'; id: string; status?: LocationStatus }
  | { type: 'unlockContact'; contactId: string }
  | { type: 'unlockTopic'; id: string }
  | { type: 'addTask'; id: string }
  | { type: 'completeTask'; id: string }
  | { type: 'addTimelineEvent'; id: string }
  | { type: 'updateTimelineEvent'; id: string }
  | { type: 'unlockChat'; chatId: string; device: 'mariana' | 'augusto' }
  | { type: 'revealHiddenApps'; device: 'mariana' }
  | { type: 'discoverPassword'; which: 'marianaAccount' | 'diary' }
  | { type: 'installApp'; device: 'mariana' | 'augusto'; appId: string }
  | { type: 'addHypothesis'; id: string }
  | { type: 'updateHypothesis'; id: string; state: HypothesisStateKind }
  | { type: 'confirmContradiction'; id: string }
  | { type: 'pushProvocation'; id: string }
  | { type: 'discoverSearchTerm'; term: string }

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
  results: { title: string; snippet: string; documentId?: string; evidenceId?: string }[]
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
  toastQueue: string[]
}

export type HubPanel =
  | null
  | 'computer'
  | 'case-files'
  | 'casebook'
  | 'map'
  | 'audio-lab'
  | 'landline'
  | 'mariana-phone'
  | 'augusto-phone'
