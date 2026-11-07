import {
  BIA_TOPIC_IDS,
  biaBeats,
  biaTopicFlags,
  biaTopicLabels,
  type BiaTopicId,
} from '../../data/block08/biaInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishBiaInterview } from '../../game/story/block08Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<BiaTopicId> = {
  testId: 'bia-scene',
  title: 'Bia',
  background: sceneBackgrounds.bia,
  portrait: portraitSrcForStory('bia'),
  topicIds: BIA_TOPIC_IDS,
  labels: biaTopicLabels,
  flags: biaTopicFlags,
  beats: biaBeats,
  doneFlag: 'block08_bia_interview_done',
  finish: finishBiaInterview,
  idleLine: 'Já disse o que aconteceu.',
}

export function BiaInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
