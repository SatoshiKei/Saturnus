import {
  SAMUEL_ACCIDENTAL_TOPIC_IDS,
  samuelAccidentalBeats,
  samuelAccidentalTopicFlags,
  samuelAccidentalTopicLabels,
  type SamuelAccidentalTopicId,
} from '../../data/block04/samuelAccidentalInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishSamuelAccidentalInterview } from '../../game/story/earlyPathHandlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<SamuelAccidentalTopicId> = {
  testId: 'samuel-accidental-scene',
  title: 'Rua das Acácias, 118',
  background: sceneBackgrounds.samuel,
  portrait: portraitSrcForStory('samuel'),
  topicIds: SAMUEL_ACCIDENTAL_TOPIC_IDS,
  labels: samuelAccidentalTopicLabels,
  flags: samuelAccidentalTopicFlags,
  beats: samuelAccidentalBeats,
  doneFlag: 'samuel_accidental_done',
  finish: finishSamuelAccidentalInterview,
  idleLine: 'Nada novo aqui por enquanto.',
}

export function SamuelAccidentalScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
