import {
  JANA_EARLY_TOPIC_IDS,
  janaEarlyBeats,
  janaEarlyTopicFlags,
  janaEarlyTopicLabels,
  type JanaEarlyTopicId,
} from '../../data/block05/janaEarlyInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishJanaEarlyInterview } from '../../game/story/earlyPathHandlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<JanaEarlyTopicId> = {
  testId: 'jana-early-scene',
  title: 'Jana Ribeiro',
  background: sceneBackgrounds.jana,
  portrait: portraitSrcForStory('jana'),
  topicIds: JANA_EARLY_TOPIC_IDS,
  labels: janaEarlyTopicLabels,
  flags: janaEarlyTopicFlags,
  beats: janaEarlyBeats,
  doneFlag: 'jana_early_done',
  finish: finishJanaEarlyInterview,
  idleLine: 'Não tenho mais o que dizer sobre isso.',
}

export function JanaEarlyInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
