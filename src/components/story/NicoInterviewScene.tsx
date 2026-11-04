import {
  NICO_TOPIC_IDS,
  nicoBeats,
  nicoTopicFlags,
  nicoTopicLabels,
  type NicoTopicId,
} from '../../data/block03/nicoInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishNicoInterview } from '../../game/story/block03Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<NicoTopicId> = {
  testId: 'nico-scene',
  title: 'Nicolas “Nico”',
  background: sceneBackgrounds.nico,
  portrait: portraitSrcForStory('nico'),
  topicIds: NICO_TOPIC_IDS,
  labels: nicoTopicLabels,
  flags: nicoTopicFlags,
  beats: nicoBeats,
  doneFlag: 'block03_nico_interview_done',
  finish: finishNicoInterview,
  idleLine: 'Por hoje é só.',
}

export function NicoInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
