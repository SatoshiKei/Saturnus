import {
  SANDRA_TOPIC_IDS,
  sandraBeats,
  sandraTopicFlags,
  sandraTopicLabels,
  type SandraTopicId,
} from '../../data/block07/sandraInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishSandraInterview } from '../../game/story/block07Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<SandraTopicId> = {
  testId: 'sandra-scene',
  title: 'Sandra Almeida',
  background: sceneBackgrounds.sandra,
  portrait: portraitSrcForStory('sandra'),
  topicIds: SANDRA_TOPIC_IDS,
  labels: sandraTopicLabels,
  flags: sandraTopicFlags,
  beats: sandraBeats,
  doneFlag: 'block07_sandra_interview_done',
  finish: finishSandraInterview,
  idleLine: 'Eu já disse o que vi.',
}

export function SandraInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
