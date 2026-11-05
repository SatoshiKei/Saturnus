import {
  DENIS_TOPIC_IDS,
  denisBeats,
  denisTopicFlags,
  denisTopicLabels,
  type DenisTopicId,
} from '../../data/block08/denisInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { finishDenisInterview } from '../../game/story/block08Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<DenisTopicId> = {
  testId: 'denis-scene',
  title: 'Dênis',
  background: sceneBackgrounds.denis,
  portrait: undefined,
  topicIds: DENIS_TOPIC_IDS,
  labels: denisTopicLabels,
  flags: denisTopicFlags,
  beats: denisBeats,
  doneFlag: 'block08_denis_interview_done',
  finish: finishDenisInterview,
  idleLine: 'O arquivo já está com o senhor.',
}

export function DenisInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
