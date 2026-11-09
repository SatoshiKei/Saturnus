import { seedAchievements } from '../../data/game/seedAchievements'
import { contradictionDefs, seedStoryTriggers } from '../../data/game/seedStory'
import type { InvestigationState, StoryTrigger } from '../types'
import { applyStoryActions } from './actions'
import { evaluateAllConditions } from './conditions'

function syncAchievements(state: InvestigationState): InvestigationState {
  const unlocks = { ...(state.achievementUnlocks ?? {}) }
  let changed = false
  const now = Date.now()
  for (const a of seedAchievements) {
    if (unlocks[a.id]) continue
    if (!a.unlocked(state)) continue
    unlocks[a.id] = now
    changed = true
  }
  return changed ? { ...state, achievementUnlocks: unlocks } : state
}

/** Contradições são detectadas sozinhas quando as duas evidências já estão no caderno. */
function detectContradictions(state: InvestigationState): InvestigationState {
  let next = state
  for (const def of contradictionDefs) {
    if (next.contradictionsConfirmed.some((c) => c.id === def.id)) continue
    if (!next.evidenceOwned.includes(def.evidenceAId) || !next.evidenceOwned.includes(def.evidenceBId)) continue
    next = applyStoryActions(next, [{ type: 'confirmContradiction', id: def.id }, ...(def.actions ?? [])])
  }
  return next
}

export function runStoryEngine(
  state: InvestigationState,
  triggers: StoryTrigger[] = seedStoryTriggers,
): InvestigationState {
  let next = state
  let changed = true
  while (changed) {
    changed = false
    for (const trigger of triggers) {
      if (trigger.once && next.triggersFired.includes(trigger.id)) continue
      if (!evaluateAllConditions(next, trigger.conditions)) continue
      next = applyStoryActions(next, trigger.actions)
      if (trigger.once) {
        next = {
          ...next,
          triggersFired: [...next.triggersFired, trigger.id],
        }
      }
      changed = true
    }
    const detected = detectContradictions(next)
    if (detected !== next) {
      next = detected
      changed = true
    }
  }
  return syncAchievements(next)
}
