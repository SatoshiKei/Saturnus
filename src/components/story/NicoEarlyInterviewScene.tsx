import {
  NICO_EARLY_TOPIC_IDS,
  nicoEarlyBeats,
  nicoEarlyTopicFlags,
  nicoEarlyTopicLabels,
  type NicoEarlyTopicId,
} from '../../data/block03/nicoEarlyInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishNicoEarlyInterview } from '../../game/story/earlyPathHandlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<NicoEarlyTopicId> = {
  testId: 'nico-early-scene',
  title: 'Nicolas “Nico”',
  background: sceneBackgrounds.nico,
  portrait: portraitSrcForStory('nico'),
  topicIds: NICO_EARLY_TOPIC_IDS,
  labels: nicoEarlyTopicLabels,
  flags: nicoEarlyTopicFlags,
  beats: nicoEarlyBeats,
  doneFlag: 'nico_early_done',
  finish: finishNicoEarlyInterview,
  idleLine: 'Quando souber do que está falando, volta.',
}

export function NicoEarlyInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
