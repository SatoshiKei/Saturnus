import {
  GERALDO_TOPIC_IDS,
  geraldoBeats,
  geraldoTopicFlags,
  geraldoTopicLabels,
  type GeraldoTopicId,
} from '../../data/block06/geraldoInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { finishGeraldoInterview } from '../../game/story/block06Handlers'
import { isGeraldoEarlyVisit } from '../../game/story/earlyPathHandlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'
import { GeraldoEarlyInterviewScene } from './GeraldoEarlyInterviewScene'

const config: TopicInterviewConfig<GeraldoTopicId> = {
  testId: 'geraldo-scene',
  title: 'Geraldo Mota',
  background: sceneBackgrounds.geraldo,
  portrait: portraitSrcForStory('geraldo'),
  topicIds: GERALDO_TOPIC_IDS,
  labels: geraldoTopicLabels,
  flags: geraldoTopicFlags,
  beats: geraldoBeats,
  doneFlag: 'block06_geraldo_interview_done',
  finish: finishGeraldoInterview,
  idleLine: 'Já falei o que havia para falar.',
}

export function GeraldoInterviewScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  if (isGeraldoEarlyVisit(inv)) {
    return <GeraldoEarlyInterviewScene onClose={onClose} />
  }
  return <TopicInterviewScene config={config} onClose={onClose} />
}
