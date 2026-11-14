import { portraitSrcForStory } from './characterSprites'

/**
 * Retrato de uma pessoa do caderno. Usa apenas sprites existentes (`CHARACTER_SPRITE_URLS`,
 * mesmos ids de `seedPeople`). Sem sprite → `undefined` e a UI mostra um placeholder neutro.
 */
export function personPortraitSrc(personId: string): string | undefined {
  return portraitSrcForStory(personId)
}

/**
 * Ids de `seedPeople` SEM retrato em `src/assets/sprites/` (auditoria de arte).
 * Verificado por `tests/unit/casebookCards.test.tsx` contra `seedPeople` + `CHARACTER_SPRITE_URLS`.
 */
export const MISSING_PERSON_PORTRAIT = [
  // MISSING_PERSON_PORTRAIT: diego
  'diego',
  // MISSING_PERSON_PORTRAIT: fernanda
  'fernanda',
  // MISSING_PERSON_PORTRAIT: marcelo
  'marcelo',
  // MISSING_PERSON_PORTRAIT: morsa
  'morsa',
  // MISSING_PERSON_PORTRAIT: valter
  'valter',
  // MISSING_PERSON_PORTRAIT: henrique
  'henrique',
  // MISSING_PERSON_PORTRAIT: mauro
  'mauro',
  // MISSING_PERSON_PORTRAIT: denis
  'denis',
  // MISSING_PERSON_PORTRAIT: omitido
  'omitido',
  // MISSING_PERSON_PORTRAIT: roberto
  'roberto',
] as const
