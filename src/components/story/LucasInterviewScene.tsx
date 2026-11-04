import {
  LUCAS_TOPIC_IDS,
  lucasBeats,
  lucasTopicFlags,
  lucasTopicLabels,
  type LucasTopicId,
} from '../../data/block02/lucasInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishLucasInterview } from '../../game/story/block02Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<LucasTopicId> = {
  testId: 'lucas-scene',
  title: 'Lucas Moreira',
  background: sceneBackgrounds.lucas,
  portrait: portraitSrcForStory('lucas'),
  topicIds: LUCAS_TOPIC_IDS,
  labels: lucasTopicLabels,
  flags: lucasTopicFlags,
  beats: lucasBeats,
  doneFlag: 'block02_lucas_interview_done',
  finish: finishLucasInterview,
  idleLine: 'Nada mais a perguntar por enquanto.',
}

export function LucasInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
