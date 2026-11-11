import {
  NICO_TOPIC_IDS,
  nicoBeats,
  nicoTopicFlags,
  nicoTopicLabels,
  type NicoTopicId,
} from '../../data/block03/nicoInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishNicoInterview } from '../../game/story/block03Handlers'
import { isNicoEarlyVisit } from '../../game/story/earlyPathHandlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'
import { NicoFollowupScene } from './NicoFollowupScene'
import { NicoEarlyInterviewScene } from './NicoEarlyInterviewScene'

const config: TopicInterviewConfig<NicoTopicId> = {
  testId: 'nico-scene',
  title: 'Nicolas “Nico”',
  background: sceneBackgrounds.nico,
  portrait: portraitSrcForStory('nico'),
  topicIds: NICO_TOPIC_IDS,
  labels: nicoTopicLabels,
  flags: nicoTopicFlags,
  beats: nicoBeats,
  /** Gravações / Noite X / Elisa só com Elisa conhecida (pós-Lucas). */
  topicRequires: {
    elisa: 'block02_elisa_search_unlocked',
    vertice_night: 'block02_elisa_search_unlocked',
    questions: 'block02_elisa_search_unlocked',
    recordings: 'block02_elisa_search_unlocked',
  },
  finishRequiresAllTopics: true,
  doneFlag: 'block03_nico_interview_done',
  finish: finishNicoInterview,
  idleLine: 'Por hoje é só.',
}

export function NicoInterviewScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  if (inv.flags.block05_started && !inv.flags.block05_nico_followup_done) {
    return <NicoFollowupScene onClose={onClose} />
  }
  if (isNicoEarlyVisit(inv)) {
    return <NicoEarlyInterviewScene onClose={onClose} />
  }
  return <TopicInterviewScene config={config} onClose={onClose} />
}
