/**
 * Puzzle 12 — MEMÓRIA (dataset forense).
 * Proveniência da mensagem final; lógica em memoryPuzzle / UI MemorySession.
 */

import meta from './puzzle12Meta.json'
import {
  CASE_MEDIA_CORPUS,
  CASSINI_DERIVED_META,
  FINAL_MESSAGE_META,
  MEMORY_DURATION_SEC,
  MEMORY_FINAL_SRC,
  MEMORY_REGIONS,
  MEMORY_WORD,
  isMemoryProvenanceComplete,
  isTemporalImpossibility,
  searchCaseMedia,
} from '../../data/block09/memoryPuzzle'

export const puzzle12Meta = meta

export const puzzle12Memory = {
  id: 'puzzle-12-memory',
  title: 'MEMÓRIA',
  word: MEMORY_WORD,
  durationSec: MEMORY_DURATION_SEC,
  finalSrc: MEMORY_FINAL_SRC,
  regions: MEMORY_REGIONS,
  corpus: CASE_MEDIA_CORPUS,
  cassiniDerived: CASSINI_DERIVED_META,
  finalMessage: FINAL_MESSAGE_META,
  carrier: meta.carrier,
  searchCaseMedia,
  isMemoryProvenanceComplete,
  isTemporalImpossibility,
  storyFlags: {
    available: 'block09_memory_available',
    complete: 'block09_memory_done',
    wordShown: 'block09_memory_word_shown',
  },
}
