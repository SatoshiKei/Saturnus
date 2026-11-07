import {
  MIRO_FOLLOWUP_TOPIC_IDS,
  miroFollowupBeats,
  miroFollowupFlags,
  miroFollowupLabels,
  type MiroFollowupTopicId,
} from '../../data/block07/miroFollowup'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishMiroFollowup } from '../../game/story/block07Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<MiroFollowupTopicId> = {
  testId: 'miro-followup-scene',
  title: 'Miro — segunda pressão',
  background: sceneBackgrounds.miro,
  portrait: portraitSrcForStory('miro'),
  topicIds: MIRO_FOLLOWUP_TOPIC_IDS,
  labels: miroFollowupLabels,
  flags: miroFollowupFlags,
  beats: miroFollowupBeats,
  doneFlag: 'block07_miro_followup_done',
  finish: finishMiroFollowup,
  idleLine: 'Já falei o bastante.',
}

export function MiroFollowupScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
