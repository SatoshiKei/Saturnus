import {
  MIRO_THIRD_TOPIC_IDS,
  miroThirdBeats,
  miroThirdFlags,
  miroThirdLabels,
  type MiroThirdTopicId,
} from '../../data/block08/miroThird'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { finishMiroThird } from '../../game/story/block08Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<MiroThirdTopicId> = {
  testId: 'miro-third-scene',
  title: 'Miro — terceira pressão',
  background: sceneBackgrounds.miro,
  portrait: undefined,
  topicIds: MIRO_THIRD_TOPIC_IDS,
  labels: miroThirdLabels,
  flags: miroThirdFlags,
  beats: miroThirdBeats,
  doneFlag: 'block08_miro_third_done',
  finish: finishMiroThird,
  idleLine: 'Já falei o que vi.',
}

export function MiroThirdScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
