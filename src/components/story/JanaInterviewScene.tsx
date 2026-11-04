import {
  JANA_TOPIC_IDS,
  janaBeats,
  janaTopicFlags,
  janaTopicLabels,
  type JanaTopicId,
} from '../../data/block05/janaInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { finishJanaInterview } from '../../game/story/block05Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<JanaTopicId> = {
  testId: 'jana-scene',
  title: 'Jana Ribeiro',
  background: sceneBackgrounds.jana,
  portrait: undefined,
  topicIds: JANA_TOPIC_IDS,
  labels: janaTopicLabels,
  flags: janaTopicFlags,
  beats: janaBeats,
  doneFlag: 'block05_jana_interview_done',
  finish: finishJanaInterview,
  idleLine: 'Não tenho mais o que dizer.',
}

export function JanaInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
