import { useCallback, useMemo, useState } from 'react'
import {
  HOSPITAL_TOPIC_IDS,
  hospitalBeats,
  hospitalTopicFlags,
  hospitalTopicLabels,
  type HospitalTopicId,
} from '../../data/block01/hospitalInterview'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { assetPath } from '../../lib/assetPath'
import { setFlag } from '../../game/state/investigationStore'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { finishHospitalVisit } from '../../game/story/block01Handlers'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import '../../styles/visual-novel.css'

const portraits = {
  julia: portraitSrcForStory('julia'),
  camila: portraitSrcForStory('camila'),
  augusto: portraitSrcForStory('augusto'),
} as const

type Mode = 'menu' | 'play' | 'outro'

export function HospitalInterviewScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [mode, setMode] = useState<Mode>('menu')
  const [activeTopic, setActiveTopic] = useState<HospitalTopicId | null>(null)
  const [beatIndex, setBeatIndex] = useState(0)

  const doneTopics = useMemo(() => {
    const s = new Set<HospitalTopicId>()
    for (const id of HOSPITAL_TOPIC_IDS) {
      if (inv.flags[hospitalTopicFlags[id]]) s.add(id)
    }
    return s
  }, [inv.flags])

  const bg = assetPath('/assets/backgrounds/processed/hospital/hospital-02-corridor-chairs.jpg')

  const finishHospital = useCallback(() => {
    if (inv.flags.block01_hospital_done) return
    finishHospitalVisit()
    setMode('outro')
  }, [inv.flags.block01_hospital_done])

  const completeTopic = useCallback(
    (topic: HospitalTopicId) => {
      setFlag(hospitalTopicFlags[topic], true)
      setActiveTopic(null)
      setBeatIndex(0)
      setMode('menu')
      const nextDone = new Set(doneTopics)
      nextDone.add(topic)
      if (HOSPITAL_TOPIC_IDS.every((id) => nextDone.has(id))) finishHospital()
    },
    [doneTopics, finishHospital],
  )

  const pendingTopics = HOSPITAL_TOPIC_IDS.filter((id) => !doneTopics.has(id))

  const currentBeat =
    mode === 'play' && activeTopic ? hospitalBeats[activeTopic][beatIndex] : null

  return (
    <VNSceneShell
      title="Hospital Municipal"
      onClose={onClose}
      testId="hospital-scene"
      backgroundStyle={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.28), rgba(0,0,0,.52)), url(${bg})`,
      }}
    >
      {mode === 'menu' ? (
        pendingTopics.length ? (
          <VisualNovelDialog
            text=""
            choiceVariant="topics"
            choiceHint="Preciso ouvir Júlia e Camila antes de decidir o próximo passo."
            choices={pendingTopics.map((id) => ({ id, label: hospitalTopicLabels[id] }))}
            onChoice={(id) => {
              setActiveTopic(id as HospitalTopicId)
              setBeatIndex(0)
              setMode('play')
            }}
          />
        ) : (
          <VisualNovelDialog
            speaker="Augusto"
            text="Nada mais a perguntar aqui por enquanto."
            onContinue={finishHospital}
            continueLabel="Encerrar visita"
          />
        )
      ) : null}

      {mode === 'play' && currentBeat ? (
        <VisualNovelDialog
          speaker={currentBeat.speaker}
          text={currentBeat.text}
          portraitSrc={currentBeat.portrait ? portraits[currentBeat.portrait] : undefined}
          onRewind={() => setBeatIndex((i) => Math.max(0, i - 1))}
          onContinue={() => {
            const beats = activeTopic ? hospitalBeats[activeTopic] : []
            if (beatIndex + 1 < beats.length) setBeatIndex((i) => i + 1)
            else if (activeTopic) completeTopic(activeTopic)
          }}
        />
      ) : null}

      {mode === 'outro' ? (
        <VisualNovelDialog
          speaker="Augusto"
          text="Volto à delegacia com mais perguntas do que respostas — mas com um próximo passo claro."
          onContinue={onClose}
          continueLabel="Voltar à delegacia"
        />
      ) : null}
    </VNSceneShell>
  )
}
