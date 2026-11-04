import { useCallback, useMemo, useState } from 'react'
import {
  SAMUEL_TOPIC_IDS,
  samuelBeats,
  samuelTopicFlags,
  samuelTopicLabels,
  type SamuelTopicId,
} from '../../data/block04/samuelInterview'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { assetPath } from '../../lib/assetPath'
import { setFlag } from '../../game/state/investigationStore'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { finishSamuelInterview } from '../../game/story/block04Handlers'
import { vnLinesThrough } from '../../lib/vnBeatLog'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import '../../styles/visual-novel.css'

const samuelPortrait = portraitSrcForStory('samuel')

type Mode = 'menu' | 'play' | 'outro'

export function SamuelInterviewScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [mode, setMode] = useState<Mode>('menu')
  const [activeTopic, setActiveTopic] = useState<SamuelTopicId | null>(null)
  const [beatIndex, setBeatIndex] = useState(0)

  const doneTopics = useMemo(() => {
    const s = new Set<SamuelTopicId>()
    for (const id of SAMUEL_TOPIC_IDS) {
      if (inv.flags[samuelTopicFlags[id]]) s.add(id)
    }
    return s
  }, [inv.flags])

  const bg = assetPath('/assets/backgrounds/processed/university/university-03-classroom-empty.jpg')

  const wrapUp = useCallback(() => {
    if (!inv.flags.block04_samuel_interview_done) finishSamuelInterview()
    setMode('outro')
  }, [inv.flags.block04_samuel_interview_done])

  const completeTopic = useCallback(
    (topic: SamuelTopicId) => {
      setFlag(samuelTopicFlags[topic], true)
      setActiveTopic(null)
      setBeatIndex(0)
      setMode('menu')
      const nextDone = new Set(doneTopics)
      nextDone.add(topic)
      if (SAMUEL_TOPIC_IDS.every((id) => nextDone.has(id))) wrapUp()
    },
    [doneTopics, wrapUp],
  )

  const pendingTopics = SAMUEL_TOPIC_IDS.filter((id) => !doneTopics.has(id))
  const currentBeat = mode === 'play' && activeTopic ? samuelBeats[activeTopic][beatIndex] : null

  const playLogLines = useMemo(() => {
    if (!activeTopic) return []
    return vnLinesThrough(samuelBeats[activeTopic], beatIndex, () => samuelPortrait)
  }, [activeTopic, beatIndex])

  return (
    <VNSceneShell
      title="Entrevista — Samuel"
      onClose={onClose}
      testId="samuel-scene"
      backgroundStyle={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.28), rgba(0,0,0,.55)), url(${bg})`,
      }}
    >
      {mode === 'menu' ? (
        pendingTopics.length ? (
          <VisualNovelDialog
            text=""
            choiceVariant="topics"
            choiceHint="Samuel mede cada palavra — medo racional, não teimosia."
            choices={pendingTopics.map((id) => ({ id, label: samuelTopicLabels[id] }))}
            onChoice={(id) => {
              setActiveTopic(id as SamuelTopicId)
              setBeatIndex(0)
              setMode('play')
            }}
          />
        ) : (
          <VisualNovelDialog
            speaker="Augusto"
            text="Ele não vai dar o nome."
            onContinue={onClose}
            continueLabel="Encerrar"
          />
        )
      ) : null}

      {mode === 'play' && currentBeat ? (
        <VisualNovelDialog
          speaker={currentBeat.speaker}
          text={currentBeat.text}
          portraitSrc={currentBeat.portrait ? samuelPortrait : undefined}
          logLines={playLogLines}
          onRewind={() => setBeatIndex((i) => Math.max(0, i - 1))}
          onContinue={() => {
            const beats = activeTopic ? samuelBeats[activeTopic] : []
            if (beatIndex + 1 < beats.length) setBeatIndex((i) => i + 1)
            else if (activeTopic) completeTopic(activeTopic)
          }}
        />
      ) : null}

      {mode === 'outro' ? (
        <VisualNovelDialog
          speaker="Augusto"
          text="Morsa existiu. Mariana queria horários — não só um rosto. E Samuel não vai entregar ninguém."
          onContinue={onClose}
          continueLabel="Voltar à delegacia"
        />
      ) : null}
    </VNSceneShell>
  )
}
