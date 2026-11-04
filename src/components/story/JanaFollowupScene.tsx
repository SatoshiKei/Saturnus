import {
  JANA_FOLLOWUP_TOPIC_IDS,
  janaFollowupBeats,
  janaFollowupFlags,
  janaFollowupLabels,
  type JanaFollowupTopicId,
} from '../../data/block06/janaFollowup'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { finishJanaFollowup } from '../../game/story/block06Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<JanaFollowupTopicId> = {
  testId: 'jana-followup-scene',
  title: 'Jana Ribeiro',
  background: sceneBackgrounds.jana,
  portrait: undefined,
  topicIds: JANA_FOLLOWUP_TOPIC_IDS,
  labels: janaFollowupLabels,
  flags: janaFollowupFlags,
  beats: janaFollowupBeats,
  doneFlag: 'block06_jana_followup_done',
  finish: finishJanaFollowup,
  idleLine: 'Não tenho mais o que dizer.',
}

export function JanaFollowupScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
