import {
  ANDRE_TOPIC_IDS,
  andreBeats,
  andreTopicFlags,
  andreTopicLabels,
  type AndreTopicId,
} from '../../data/block04/andreInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishAndreInterview } from '../../game/story/block04Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<AndreTopicId> = {
  testId: 'andre-scene',
  title: 'André Silva',
  background: sceneBackgrounds.andre,
  portrait: portraitSrcForStory('andre'),
  topicIds: ANDRE_TOPIC_IDS,
  labels: andreTopicLabels,
  flags: andreTopicFlags,
  beats: andreBeats,
  doneFlag: 'block04_andre_interview_done',
  finish: finishAndreInterview,
  idleLine: 'O tempo de visita acabou.',
  darkness: 0.62,
}

export function AndreInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
