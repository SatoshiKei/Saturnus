import {
  MIRO_TOPIC_IDS,
  miroBeats,
  miroTopicFlags,
  miroTopicLabels,
  type MiroTopicId,
} from '../../data/block06/miroInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { finishMiroInterview } from '../../game/story/block06Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'
import { MiroFollowupScene } from './MiroFollowupScene'
import { MiroThirdScene } from './MiroThirdScene'

const config: TopicInterviewConfig<MiroTopicId> = {
  testId: 'miro-scene',
  title: 'Miro',
  background: sceneBackgrounds.miro,
  portrait: portraitSrcForStory('miro'),
  topicIds: MIRO_TOPIC_IDS,
  labels: miroTopicLabels,
  flags: miroTopicFlags,
  beats: miroBeats,
  doneFlag: 'block06_miro_interview_done',
  finish: finishMiroInterview,
  idleLine: 'Já disse o que vou dizer por enquanto.',
}

export function MiroInterviewScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  if (inv.flags.block08_andre_reflection_done && !inv.flags.block08_miro_third_done) {
    return <MiroThirdScene onClose={onClose} />
  }
  if (inv.flags.block07_started && !inv.flags.block07_miro_followup_done) {
    return <MiroFollowupScene onClose={onClose} />
  }
  return <TopicInterviewScene config={config} onClose={onClose} />
}
