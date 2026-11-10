/**
 * Efeitos após uma Reflection terminar (SceneRunner ou solo no hub).
 * Mantém um único lugar para não divergir flags / unlocks.
 */
import {
  onAccidentReflectionDone,
  onAndreWronglyReflectionDone,
  onFinalReflectionDone,
  onMorsaReflectionDone,
} from './block08Handlers'
import {
  onAndreStillGuiltyReflectionDone,
  onCoincidenceReflectionDone,
  onMaraltoReflectionDone,
  onPathReflectionDone,
} from './block05Handlers'
import { onGeraldoReflectionDone, onMiroReflectionDone } from './block06Handlers'
import {
  onHenriqueRevealReflectionDone,
  onHvReflectionDone,
  onNotebookReflectionDone,
  onRicardoDeadReflectionDone,
  onSandraReflectionDone,
  onTechReflectionDone,
} from './block07Handlers'
import {
  onAugustoAnomaliesReflectionDone,
  onDeathReflectionDone,
  onMessagesImpossibilityReflectionDone,
  onOmitidoAssistanceReflectionDone,
  onSaturnusFinalReflectionDone,
} from './block09Handlers'

export function afterReflectionComplete(reflectionId: string): void {
  switch (reflectionId) {
    case 'refl-b05-andre':
      onAndreStillGuiltyReflectionDone()
      break
    case 'refl-b05-maralto':
      onMaraltoReflectionDone()
      break
    case 'refl-b05-coincidence':
      onCoincidenceReflectionDone()
      break
    case 'refl-b05-path':
      onPathReflectionDone()
      break
    case 'refl-b06-geraldo':
      onGeraldoReflectionDone()
      break
    case 'refl-b06-miro':
      onMiroReflectionDone()
      break
    case 'refl-b07-sandra':
      onSandraReflectionDone()
      break
    case 'refl-b07-ricardo-dead':
      onRicardoDeadReflectionDone()
      break
    case 'refl-b07-notebook':
      onNotebookReflectionDone()
      break
    case 'refl-b07-hv':
      onHvReflectionDone()
      break
    case 'refl-b07-henrique-reveal':
      onHenriqueRevealReflectionDone()
      break
    case 'refl-b07-tech':
      onTechReflectionDone()
      break
    case 'refl-b08-morsa':
      onMorsaReflectionDone()
      break
    case 'refl-b08-andre':
      onAndreWronglyReflectionDone()
      break
    case 'refl-b08-accident':
      onAccidentReflectionDone()
      break
    case 'refl-b08-final':
      onFinalReflectionDone()
      break
    case 'refl-b09-omitido':
      onOmitidoAssistanceReflectionDone()
      break
    case 'refl-b09-messages':
      onMessagesImpossibilityReflectionDone()
      break
    case 'refl-b09-death':
      onDeathReflectionDone()
      break
    case 'refl-b09-augusto':
      onAugustoAnomaliesReflectionDone()
      break
    case 'refl-b09-final':
      onSaturnusFinalReflectionDone()
      break
    default:
      break
  }
}
