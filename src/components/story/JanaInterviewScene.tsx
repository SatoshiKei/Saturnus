import {
  JANA_TOPIC_IDS,
  janaBeats,
  janaTopicFlags,
  janaTopicLabels,
  type JanaTopicId,
} from '../../data/block05/janaInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { finishJanaInterview } from '../../game/story/block05Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'
import { JanaFollowupScene } from './JanaFollowupScene'

const config: TopicInterviewConfig<JanaTopicId> = {
  testId: 'jana-scene',
  title: 'Jana Ribeiro',
  background: sceneBackgrounds.jana,
  portrait: undefined,
  topicIds: JANA_TOPIC_IDS,
  labels: janaTopicLabels,
  flags: janaTopicFlags,
  beats: janaBeats,
  doneFlag: 'block05_jana_interview_done',
  finish: finishJanaInterview,
  idleLine: 'Não tenho mais o que dizer.',
}

export function JanaInterviewScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  if (
    inv.flags.block06_geraldo_reflection_done &&
    !inv.flags.block06_jana_followup_done
  ) {
    return <JanaFollowupScene onClose={onClose} />
  }
  return <TopicInterviewScene config={config} onClose={onClose} />
}
