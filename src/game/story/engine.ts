import { seedStoryTriggers } from '../../data/game/seedStory'
import type { InvestigationState, StoryTrigger } from '../types'
import { applyStoryActions } from './actions'
import { evaluateAllConditions } from './conditions'

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
  }
  return next
}
