import { useCallback, useMemo, useState } from 'react'
import {
  LUCAS_TOPIC_IDS,
  lucasBeats,
  lucasTopicFlags,
  lucasTopicLabels,
  type LucasTopicId,
} from '../../data/block02/lucasInterview'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { assetPath } from '../../lib/assetPath'
import { setFlag } from '../../game/state/investigationStore'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { finishLucasInterview } from '../../game/story/block02Handlers'
import { vnLinesThrough } from '../../lib/vnBeatLog'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import '../../styles/visual-novel.css'

const lucasPortrait = portraitSrcForStory('lucas')

type Mode = 'menu' | 'play' | 'outro'

export function LucasInterviewScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [mode, setMode] = useState<Mode>('menu')
  const [activeTopic, setActiveTopic] = useState<LucasTopicId | null>(null)
  const [beatIndex, setBeatIndex] = useState(0)

  const doneTopics = useMemo(() => {
    const s = new Set<LucasTopicId>()
    for (const id of LUCAS_TOPIC_IDS) {
      if (inv.flags[lucasTopicFlags[id]]) s.add(id)
    }
    return s
  }, [inv.flags])

  const bg = assetPath('/assets/backgrounds/processed/university/university-03-classroom-empty.jpg')

  const wrapUp = useCallback(() => {
    if (!inv.flags.block02_lucas_interview_done) finishLucasInterview()
    setMode('outro')
  }, [inv.flags.block02_lucas_interview_done])

  const completeTopic = useCallback(
    (topic: LucasTopicId) => {
      setFlag(lucasTopicFlags[topic], true)
      setActiveTopic(null)
      setBeatIndex(0)
      setMode('menu')
      const nextDone = new Set(doneTopics)
      nextDone.add(topic)
      if (LUCAS_TOPIC_IDS.every((id) => nextDone.has(id))) wrapUp()
    },
    [doneTopics, wrapUp],
  )

  const pendingTopics = LUCAS_TOPIC_IDS.filter((id) => !doneTopics.has(id))
  const currentBeat = mode === 'play' && activeTopic ? lucasBeats[activeTopic][beatIndex] : null

  const playLogLines = useMemo(() => {
    if (!activeTopic) return []
    return vnLinesThrough(lucasBeats[activeTopic], beatIndex, () => lucasPortrait)
  }, [activeTopic, beatIndex])

  return (
    <VNSceneShell
      title="Entrevista — Lucas Moreira"
      onClose={onClose}
      testId="lucas-scene"
      backgroundStyle={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.28), rgba(0,0,0,.55)), url(${bg})`,
      }}
    >
      {mode === 'menu' ? (
        pendingTopics.length ? (
          <VisualNovelDialog
            text=""
            choiceVariant="topics"
            choiceHint="Lucas está tenso — mas disposto a falar."
            choices={pendingTopics.map((id) => ({ id, label: lucasTopicLabels[id] }))}
            onChoice={(id) => {
              setActiveTopic(id as LucasTopicId)
              setBeatIndex(0)
              setMode('play')
            }}
          />
        ) : (
          <VisualNovelDialog
            speaker="Augusto"
            text="Nada mais a perguntar por enquanto."
            onContinue={onClose}
            continueLabel="Encerrar entrevista"
          />
        )
      ) : null}

      {mode === 'play' && currentBeat ? (
        <VisualNovelDialog
          speaker={currentBeat.speaker}
          text={currentBeat.text}
          portraitSrc={currentBeat.portrait ? lucasPortrait : undefined}
          logLines={playLogLines}
          onRewind={() => setBeatIndex((i) => Math.max(0, i - 1))}
          onContinue={() => {
            const beats = activeTopic ? lucasBeats[activeTopic] : []
            if (beatIndex + 1 < beats.length) setBeatIndex((i) => i + 1)
            else if (activeTopic) completeTopic(activeTopic)
          }}
        />
      ) : null}

      {mode === 'outro' ? (
        <VisualNovelDialog
          speaker="Augusto"
          text="Elisa Duarte — um nome que não estava no desaparecimento de Mariana. Preciso cruzar isso nos arquivos."
          onContinue={onClose}
          continueLabel="Voltar à delegacia"
        />
      ) : null}
    </VNSceneShell>
  )
}
