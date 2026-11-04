import { useCallback, useMemo, useState } from 'react'
import {
  NICO_TOPIC_IDS,
  nicoBeats,
  nicoTopicFlags,
  nicoTopicLabels,
  type NicoTopicId,
} from '../../data/block03/nicoInterview'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { assetPath } from '../../lib/assetPath'
import { setFlag } from '../../game/state/investigationStore'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { finishNicoInterview } from '../../game/story/block03Handlers'
import { vnLinesThrough } from '../../lib/vnBeatLog'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import '../../styles/visual-novel.css'

const nicoPortrait = portraitSrcForStory('nico')

type Mode = 'menu' | 'play' | 'outro'

export function NicoInterviewScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [mode, setMode] = useState<Mode>('menu')
  const [activeTopic, setActiveTopic] = useState<NicoTopicId | null>(null)
  const [beatIndex, setBeatIndex] = useState(0)

  const doneTopics = useMemo(() => {
    const s = new Set<NicoTopicId>()
    for (const id of NICO_TOPIC_IDS) {
      if (inv.flags[nicoTopicFlags[id]]) s.add(id)
    }
    return s
  }, [inv.flags])

  const bg = assetPath('/assets/backgrounds/processed/nightclub/nightclub-01-lights-haze.jpg')

  const wrapUp = useCallback(() => {
    if (!inv.flags.block03_nico_interview_done) finishNicoInterview()
    setMode('outro')
  }, [inv.flags.block03_nico_interview_done])

  const completeTopic = useCallback(
    (topic: NicoTopicId) => {
      setFlag(nicoTopicFlags[topic], true)
      setActiveTopic(null)
      setBeatIndex(0)
      setMode('menu')
      const nextDone = new Set(doneTopics)
      nextDone.add(topic)
      if (NICO_TOPIC_IDS.every((id) => nextDone.has(id))) wrapUp()
    },
    [doneTopics, wrapUp],
  )

  const pendingTopics = NICO_TOPIC_IDS.filter((id) => !doneTopics.has(id))
  const currentBeat = mode === 'play' && activeTopic ? nicoBeats[activeTopic][beatIndex] : null

  const playLogLines = useMemo(() => {
    if (!activeTopic) return []
    return vnLinesThrough(nicoBeats[activeTopic], beatIndex, () => nicoPortrait)
  }, [activeTopic, beatIndex])

  return (
    <VNSceneShell
      title="Entrevista — Nicolas “Nico”"
      onClose={onClose}
      testId="nico-scene"
      backgroundStyle={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.28), rgba(0,0,0,.55)), url(${bg})`,
      }}
    >
      {mode === 'menu' ? (
        pendingTopics.length ? (
          <VisualNovelDialog
            text=""
            choiceVariant="topics"
            choiceHint="Nico evita olhar direto — responde curto."
            choices={pendingTopics.map((id) => ({ id, label: nicoTopicLabels[id] }))}
            onChoice={(id) => {
              setActiveTopic(id as NicoTopicId)
              setBeatIndex(0)
              setMode('play')
            }}
          />
        ) : (
          <VisualNovelDialog
            speaker="Augusto"
            text="Nada mais a extrair por agora."
            onContinue={onClose}
            continueLabel="Encerrar entrevista"
          />
        )
      ) : null}

      {mode === 'play' && currentBeat ? (
        <VisualNovelDialog
          speaker={currentBeat.speaker}
          text={currentBeat.text}
          portraitSrc={currentBeat.portrait ? nicoPortrait : undefined}
          logLines={playLogLines}
          onRewind={() => setBeatIndex((i) => Math.max(0, i - 1))}
          onContinue={() => {
            const beats = activeTopic ? nicoBeats[activeTopic] : []
            if (beatIndex + 1 < beats.length) setBeatIndex((i) => i + 1)
            else if (activeTopic) completeTopic(activeTopic)
          }}
        />
      ) : null}

      {mode === 'outro' ? (
        <VisualNovelDialog
          speaker="Augusto"
          text="Duas gravações da mesma noite. Se os relógios mentem, a cronologia do processo também pode."
          onContinue={onClose}
          continueLabel="Voltar à delegacia"
        />
      ) : null}
    </VNSceneShell>
  )
}
