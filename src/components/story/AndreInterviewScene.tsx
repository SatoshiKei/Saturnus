import { useCallback, useMemo, useState } from 'react'
import {
  ANDRE_TOPIC_IDS,
  andreBeats,
  andreTopicFlags,
  andreTopicLabels,
  type AndreTopicId,
} from '../../data/block04/andreInterview'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { assetPath } from '../../lib/assetPath'
import { setFlag } from '../../game/state/investigationStore'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { finishAndreInterview } from '../../game/story/block04Handlers'
import { vnLinesThrough } from '../../lib/vnBeatLog'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import '../../styles/visual-novel.css'

const andrePortrait = portraitSrcForStory('andre')

type Mode = 'menu' | 'play' | 'outro'

export function AndreInterviewScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [mode, setMode] = useState<Mode>('menu')
  const [activeTopic, setActiveTopic] = useState<AndreTopicId | null>(null)
  const [beatIndex, setBeatIndex] = useState(0)

  const doneTopics = useMemo(() => {
    const s = new Set<AndreTopicId>()
    for (const id of ANDRE_TOPIC_IDS) {
      if (inv.flags[andreTopicFlags[id]]) s.add(id)
    }
    return s
  }, [inv.flags])

  const bg = assetPath('/assets/backgrounds/processed/hospital/hospital-02-corridor-chairs.jpg')

  const wrapUp = useCallback(() => {
    if (!inv.flags.block04_andre_interview_done) finishAndreInterview()
    setMode('outro')
  }, [inv.flags.block04_andre_interview_done])

  const completeTopic = useCallback(
    (topic: AndreTopicId) => {
      setFlag(andreTopicFlags[topic], true)
      setActiveTopic(null)
      setBeatIndex(0)
      setMode('menu')
      const nextDone = new Set(doneTopics)
      nextDone.add(topic)
      if (ANDRE_TOPIC_IDS.every((id) => nextDone.has(id))) wrapUp()
    },
    [doneTopics, wrapUp],
  )

  const pendingTopics = ANDRE_TOPIC_IDS.filter((id) => !doneTopics.has(id))
  const currentBeat = mode === 'play' && activeTopic ? andreBeats[activeTopic][beatIndex] : null

  const playLogLines = useMemo(() => {
    if (!activeTopic) return []
    return vnLinesThrough(andreBeats[activeTopic], beatIndex, () => andrePortrait)
  }, [activeTopic, beatIndex])

  return (
    <VNSceneShell
      title="Visita — André Silva"
      onClose={onClose}
      testId="andre-scene"
      backgroundStyle={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.62)), url(${bg})`,
      }}
    >
      {mode === 'menu' ? (
        pendingTopics.length ? (
          <VisualNovelDialog
            text=""
            choiceVariant="topics"
            choiceHint="Vidro entre vocês. André não está disposto a ajudar a polícia."
            choices={pendingTopics.map((id) => ({ id, label: andreTopicLabels[id] }))}
            onChoice={(id) => {
              setActiveTopic(id as AndreTopicId)
              setBeatIndex(0)
              setMode('play')
            }}
          />
        ) : (
          <VisualNovelDialog
            speaker="Augusto"
            text="Nada mais a extrair nesta visita."
            onContinue={onClose}
            continueLabel="Encerrar visita"
          />
        )
      ) : null}

      {mode === 'play' && currentBeat ? (
        <VisualNovelDialog
          speaker={currentBeat.speaker}
          text={currentBeat.text}
          portraitSrc={currentBeat.portrait ? andrePortrait : undefined}
          logLines={playLogLines}
          onRewind={() => setBeatIndex((i) => Math.max(0, i - 1))}
          onContinue={() => {
            const beats = activeTopic ? andreBeats[activeTopic] : []
            if (beatIndex + 1 < beats.length) setBeatIndex((i) => i + 1)
            else if (activeTopic) completeTopic(activeTopic)
          }}
        />
      ) : null}

      {mode === 'outro' ? (
        <VisualNovelDialog
          speaker="Augusto"
          text="Ele tem motivo para usá-la. Mas preciso cruzar horários antes de cravar que o desconhecido é ele."
          onContinue={onClose}
          continueLabel="Voltar à delegacia"
        />
      ) : null}
    </VNSceneShell>
  )
}
