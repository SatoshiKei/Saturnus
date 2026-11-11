import {
  GERALDO_EARLY_TOPIC_IDS,
  geraldoEarlyBeats,
  geraldoEarlyTopicFlags,
  geraldoEarlyTopicLabels,
  type GeraldoEarlyTopicId,
} from '../../data/block06/geraldoEarlyInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishGeraldoEarlyInterview } from '../../game/story/earlyPathHandlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<GeraldoEarlyTopicId> = {
  testId: 'geraldo-early-scene',
  title: 'Geraldo Mota',
  background: sceneBackgrounds.geraldo,
  portrait: portraitSrcForStory('geraldo'),
  topicIds: GERALDO_EARLY_TOPIC_IDS,
  labels: geraldoEarlyTopicLabels,
  flags: geraldoEarlyTopicFlags,
  beats: geraldoEarlyBeats,
  doneFlag: 'geraldo_early_done',
  finish: finishGeraldoEarlyInterview,
  idleLine: 'Já falei o que havia.',
}

export function GeraldoEarlyInterviewScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
