import { useCallback, useMemo, useState } from 'react'
import {
  LIVIA_TOPIC_IDS,
  liviaBeats,
  liviaTopicFlags,
  liviaTopicLabels,
  type LiviaTopicId,
} from '../../data/block03/liviaInterview'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { assetPath } from '../../lib/assetPath'
import { setFlag } from '../../game/state/investigationStore'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { finishLiviaInterview } from '../../game/story/block03Handlers'
import { vnLinesThrough } from '../../lib/vnBeatLog'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import '../../styles/visual-novel.css'

const liviaPortrait = portraitSrcForStory('livia')

type Mode = 'menu' | 'play' | 'outro'

export function LiviaInterviewScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [mode, setMode] = useState<Mode>('menu')
  const [activeTopic, setActiveTopic] = useState<LiviaTopicId | null>(null)
  const [beatIndex, setBeatIndex] = useState(0)

  const doneTopics = useMemo(() => {
    const s = new Set<LiviaTopicId>()
    for (const id of LIVIA_TOPIC_IDS) {
      if (inv.flags[liviaTopicFlags[id]]) s.add(id)
    }
    return s
  }, [inv.flags])

  const bg = assetPath('/assets/backgrounds/processed/university/university-03-classroom-empty.jpg')

  const wrapUp = useCallback(() => {
    if (!inv.flags.block03_livia_interview_done) finishLiviaInterview()
    setMode('outro')
  }, [inv.flags.block03_livia_interview_done])

  const completeTopic = useCallback(
    (topic: LiviaTopicId) => {
      setFlag(liviaTopicFlags[topic], true)
      setActiveTopic(null)
      setBeatIndex(0)
      setMode('menu')
      const nextDone = new Set(doneTopics)
      nextDone.add(topic)
      if (LIVIA_TOPIC_IDS.every((id) => nextDone.has(id))) wrapUp()
    },
    [doneTopics, wrapUp],
  )

  const pendingTopics = LIVIA_TOPIC_IDS.filter((id) => !doneTopics.has(id))
  const currentBeat = mode === 'play' && activeTopic ? liviaBeats[activeTopic][beatIndex] : null

  const playLogLines = useMemo(() => {
    if (!activeTopic) return []
    return vnLinesThrough(liviaBeats[activeTopic], beatIndex, () => liviaPortrait)
  }, [activeTopic, beatIndex])

  return (
    <VNSceneShell
      title="Arquivo — Lívia Serrano"
      onClose={onClose}
      testId="livia-scene"
      backgroundStyle={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.28), rgba(0,0,0,.55)), url(${bg})`,
      }}
    >
      {mode === 'menu' ? (
        pendingTopics.length ? (
          <VisualNovelDialog
            text=""
            choiceVariant="topics"
            choiceHint="Lívia fala como quem separa fato de rumor."
            choices={pendingTopics.map((id) => ({ id, label: liviaTopicLabels[id] }))}
            onChoice={(id) => {
              setActiveTopic(id as LiviaTopicId)
              setBeatIndex(0)
              setMode('play')
            }}
          />
        ) : (
          <VisualNovelDialog
            speaker="Augusto"
            text="O material fala mais do que ela."
            onContinue={onClose}
            continueLabel="Encerrar"
          />
        )
      ) : null}

      {mode === 'play' && currentBeat ? (
        <VisualNovelDialog
          speaker={currentBeat.speaker}
          text={currentBeat.text}
          portraitSrc={currentBeat.portrait ? liviaPortrait : undefined}
          logLines={playLogLines}
          onRewind={() => setBeatIndex((i) => Math.max(0, i - 1))}
          onContinue={() => {
            const beats = activeTopic ? liviaBeats[activeTopic] : []
            if (beatIndex + 1 < beats.length) setBeatIndex((i) => i + 1)
            else if (activeTopic) completeTopic(activeTopic)
          }}
        />
      ) : null}

      {mode === 'outro' ? (
        <VisualNovelDialog
          speaker="Augusto"
          text="Fragmentos fora de ordem. Se a gravação foi invertida no arquivo, a transmissão ainda está lá — só precisa ser reconstruída."
          onContinue={onClose}
          continueLabel="Voltar à delegacia"
        />
      ) : null}
    </VNSceneShell>
  )
}
