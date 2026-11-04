import {
  SAMUEL_TOPIC_IDS,
  samuelBeats,
  samuelTopicFlags,
  samuelTopicLabels,
  type SamuelTopicId,
} from '../../data/block04/samuelInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishSamuelInterview } from '../../game/story/block04Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<SamuelTopicId> = {
  testId: 'samuel-scene',
  title: 'Samuel Teixeira',
  background: sceneBackgrounds.samuel,
  portrait: portraitSrcForStory('samuel'),
  topicIds: SAMUEL_TOPIC_IDS,
  labels: samuelTopicLabels,
  flags: samuelTopicFlags,
  beats: samuelBeats,
  doneFlag: 'block04_samuel_interview_done',
  finish: finishSamuelInterview,
  idleLine: 'Ele não vai dar mais nada hoje.',
}

export function SamuelInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
