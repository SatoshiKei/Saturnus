import {
  LIVIA_TOPIC_IDS,
  liviaBeats,
  liviaTopicFlags,
  liviaTopicLabels,
  type LiviaTopicId,
} from '../../data/block03/liviaInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishLiviaInterview } from '../../game/story/block03Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<LiviaTopicId> = {
  testId: 'livia-scene',
  title: 'Lívia Serrano',
  background: sceneBackgrounds.livia,
  portrait: portraitSrcForStory('livia'),
  topicIds: LIVIA_TOPIC_IDS,
  labels: liviaTopicLabels,
  flags: liviaTopicFlags,
  beats: liviaBeats,
  doneFlag: 'block03_livia_interview_done',
  finish: finishLiviaInterview,
  idleLine: 'O material fala mais do que ela.',
}

export function LiviaInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
