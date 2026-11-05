import {
  RUI_TOPIC_IDS,
  ruiBeats,
  ruiTopicFlags,
  ruiTopicLabels,
  type RuiTopicId,
} from '../../data/block08/ruiInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { finishRuiInterview } from '../../game/story/block08Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<RuiTopicId> = {
  testId: 'rui-scene',
  title: 'Rui',
  background: sceneBackgrounds.rui,
  portrait: undefined,
  topicIds: RUI_TOPIC_IDS,
  labels: ruiTopicLabels,
  flags: ruiTopicFlags,
  beats: ruiBeats,
  doneFlag: 'block08_rui_interview_done',
  finish: finishRuiInterview,
  idleLine: 'Não tenho mais o que acrescentar.',
}

export function RuiInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
