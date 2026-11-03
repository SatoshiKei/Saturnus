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
import { dispatchActions, setFlag } from '../../game/state/investigationStore'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { VisualNovelDialog } from './VisualNovelDialog'
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
    dispatchActions([
      { type: 'setFlag', id: 'block01_hospital_done', value: true },
      { type: 'addEvidence', id: 'julia_kept_folder' },
      { type: 'addEvidence', id: 'camila_witness_note' },
      { type: 'unlockLocation', id: 'hospital', status: 'visited' },
    ])
    setMode('outro')
  }, [inv.flags.block01_hospital_done])

  const completeTopic = useCallback(
    (topic: HospitalTopicId) => {
      setFlag(hospitalTopicFlags[topic], true)
      if (topic === 'julia_folder') {
        dispatchActions([
          { type: 'addTask', id: 'task_julia_folder', label: 'Recolher pasta deixada com Júlia' },
        ])
      }
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
    <div
      className="vn-scene"
      data-testid="hospital-scene"
      style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.65)), url(${bg})` }}
    >
      <header className="vn-scene__bar">
        <span className="vn-scene__title">Hospital Municipal</span>
        <button type="button" onClick={onClose}>
          Sair
        </button>
      </header>

      {mode === 'menu' ? (
        <VisualNovelDialog
          speaker="Augusto"
          text={
            pendingTopics.length
              ? 'Preciso ouvir Júlia e Camila antes de decidir o próximo passo.'
              : 'Nada mais a perguntar aqui por enquanto.'
          }
          choices={pendingTopics.map((id) => ({ id, label: hospitalTopicLabels[id] }))}
          onChoice={(id) => {
            setActiveTopic(id as HospitalTopicId)
            setBeatIndex(0)
            setMode('play')
          }}
          onContinue={pendingTopics.length === 0 ? finishHospital : undefined}
          continueLabel="Encerrar visita"
        />
      ) : null}

      {mode === 'play' && currentBeat ? (
        <VisualNovelDialog
          speaker={currentBeat.speaker}
          text={currentBeat.text}
          portraitSrc={currentBeat.portrait ? portraits[currentBeat.portrait] : undefined}
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
    </div>
  )
}
