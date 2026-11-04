import {
  NICO_FOLLOWUP_TOPIC_IDS,
  nicoFollowupBeats,
  nicoFollowupFlags,
  nicoFollowupLabels,
  type NicoFollowupTopicId,
} from '../../data/block05/nicoFollowup'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { finishNicoFollowup } from '../../game/story/block05Handlers'
import { TopicInterviewScene, type TopicInterviewConfig } from './TopicInterviewScene'

const config: TopicInterviewConfig<NicoFollowupTopicId> = {
  testId: 'nico-followup-scene',
  title: 'Nicolas “Nico”',
  background: sceneBackgrounds.nico,
  portrait: portraitSrcForStory('nico'),
  topicIds: NICO_FOLLOWUP_TOPIC_IDS,
  labels: nicoFollowupLabels,
  flags: nicoFollowupFlags,
  beats: nicoFollowupBeats,
  doneFlag: 'block05_nico_followup_done',
  finish: finishNicoFollowup,
  idleLine: 'Já falei o que lembrava.',
}

export function NicoFollowupScene({ onClose }: { onClose: () => void }) {
  return <TopicInterviewScene config={config} onClose={onClose} />
}
