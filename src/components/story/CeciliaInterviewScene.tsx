import {
  CECILIA_TOPIC_IDS,
  ceciliaBeats,
  ceciliaTopicFlags,
  ceciliaTopicLabels,
  type CeciliaTopicId,
} from '../../data/block07/ceciliaInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { finishCeciliaInterview } from '../../game/story/block07Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<CeciliaTopicId> = {
  testId: 'cecilia-scene',
  title: 'Cecília Prado',
  background: sceneBackgrounds.cecilia,
  portrait: undefined,
  topicIds: CECILIA_TOPIC_IDS,
  labels: ceciliaTopicLabels,
  flags: ceciliaTopicFlags,
  beats: ceciliaBeats,
  doneFlag: 'block07_cecilia_interview_done',
  finish: finishCeciliaInterview,
  idleLine: 'Não tenho mais o que acrescentar.',
}

export function CeciliaInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
