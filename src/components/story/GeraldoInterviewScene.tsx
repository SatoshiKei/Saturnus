import {
  GERALDO_TOPIC_IDS,
  geraldoBeats,
  geraldoTopicFlags,
  geraldoTopicLabels,
  type GeraldoTopicId,
} from '../../data/block06/geraldoInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { finishGeraldoInterview } from '../../game/story/block06Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<GeraldoTopicId> = {
  testId: 'geraldo-scene',
  title: 'Geraldo Mota',
  background: sceneBackgrounds.geraldo,
  portrait: undefined,
  topicIds: GERALDO_TOPIC_IDS,
  labels: geraldoTopicLabels,
  flags: geraldoTopicFlags,
  beats: geraldoBeats,
  doneFlag: 'block06_geraldo_interview_done',
  finish: finishGeraldoInterview,
  idleLine: 'Já falei o que havia para falar.',
}

export function GeraldoInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
