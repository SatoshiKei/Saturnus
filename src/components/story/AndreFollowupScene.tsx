import {
  ANDRE_FOLLOWUP_TOPIC_IDS,
  andreFollowupBeats,
  andreFollowupFlags,
  andreFollowupLabels,
  type AndreFollowupTopicId,
} from '../../data/block08/andreFollowup'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishAndreFollowup } from '../../game/story/block08Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<AndreFollowupTopicId> = {
  testId: 'andre-followup-scene',
  title: 'André Silva — confronto',
  background: sceneBackgrounds.andre,
  portrait: portraitSrcForStory('andre'),
  topicIds: ANDRE_FOLLOWUP_TOPIC_IDS,
  labels: andreFollowupLabels,
  flags: andreFollowupFlags,
  beats: andreFollowupBeats,
  doneFlag: 'block08_andre_followup_done',
  finish: finishAndreFollowup,
  idleLine: 'O tempo de visita acabou.',
  darkness: 0.62,
}

export function AndreFollowupScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
