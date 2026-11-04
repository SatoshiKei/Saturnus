import {
  MIRO_TOPIC_IDS,
  miroBeats,
  miroTopicFlags,
  miroTopicLabels,
  type MiroTopicId,
} from '../../data/block06/miroInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { finishMiroInterview } from '../../game/story/block06Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<MiroTopicId> = {
  testId: 'miro-scene',
  title: 'Miro',
  background: sceneBackgrounds.miro,
  portrait: undefined,
  topicIds: MIRO_TOPIC_IDS,
  labels: miroTopicLabels,
  flags: miroTopicFlags,
  beats: miroBeats,
  doneFlag: 'block06_miro_interview_done',
  finish: finishMiroInterview,
  idleLine: 'Já disse o que vou dizer por enquanto.',
}

export function MiroInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
