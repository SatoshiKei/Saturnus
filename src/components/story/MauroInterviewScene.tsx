import {
  MAURO_TOPIC_IDS,
  mauroBeats,
  mauroTopicFlags,
  mauroTopicLabels,
  type MauroTopicId,
} from '../../data/block08/mauroInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { finishMauroInterview } from '../../game/story/block08Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<MauroTopicId> = {
  testId: 'mauro-scene',
  title: 'Mauro',
  background: sceneBackgrounds.mauro,
  portrait: undefined,
  topicIds: MAURO_TOPIC_IDS,
  labels: mauroTopicLabels,
  flags: mauroTopicFlags,
  beats: mauroBeats,
  doneFlag: 'block08_mauro_interview_done',
  finish: finishMauroInterview,
  idleLine: 'Não tenho mais o que dizer.',
}

export function MauroInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
