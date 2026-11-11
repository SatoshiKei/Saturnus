import {
  ANDRE_TOPIC_IDS,
  andreBeats,
  andreTopicFlags,
  andreTopicLabels,
  type AndreTopicId,
} from '../../data/block04/andreInterview'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { finishAndreInterview } from '../../game/story/block04Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'
import { AndreFollowupScene } from './AndreFollowupScene'

const config: TopicInterviewConfig<AndreTopicId> = {
  testId: 'andre-scene',
  title: 'André Silva',
  background: sceneBackgrounds.andre,
  portrait: portraitSrcForStory('andre'),
  topicIds: ANDRE_TOPIC_IDS,
  labels: andreTopicLabels,
  flags: andreTopicFlags,
  beats: andreBeats,
  /** Maralto/protestos só depois de Saturnalia — não na primeira visita pós-Autos. */
  topicRequires: {
    maralto: 'block03_saturnalia_done',
  },
  finishRequiresAllTopics: false,
  doneFlag: 'block04_andre_interview_done',
  finish: finishAndreInterview,
  idleLine: 'O tempo de visita acabou.',
  darkness: 0.62,
}

export function AndreInterviewScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  if (inv.flags.block08_morsa_reflection_done && !inv.flags.block08_andre_followup_done) {
    return <AndreFollowupScene onClose={onClose} />
  }
  return <TopicInterviewScene config={config} onClose={onClose} />
}
