import { useCallback, useMemo, useState } from 'react'
import {
  VERTICE_TOPIC_IDS,
  verticeBeats,
  verticeTopicFlags,
  verticeTopicLabels,
  type VerticeTopicId,
} from '../../data/block02/verticeInterview'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { assetPath } from '../../lib/assetPath'
import { dispatchActions, setFlag } from '../../game/state/investigationStore'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { completeVerticeTopic, finishVerticeArchive } from '../../game/story/block02Handlers'
import { VisualNovelDialog } from './VisualNovelDialog'
import '../../styles/visual-novel.css'

const portraits = {
  iara: portraitSrcForStory('iara'),
  sandro: portraitSrcForStory('sandro'),
  caio: portraitSrcForStory('caio'),
} as const

type Mode = 'menu' | 'play'

function archiveUnlocked(flags: Record<string, boolean>) {
  return (
    flags.block02_vertice_iara &&
    flags.block02_vertice_sandro &&
    flags.block02_vertice_caio &&
    !flags.block02_vertice_archive
  )
}

export function VerticeInterviewScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [mode, setMode] = useState<Mode>('menu')
  const [activeTopic, setActiveTopic] = useState<VerticeTopicId | null>(null)
  const [beatIndex, setBeatIndex] = useState(0)

  const doneTopics = useMemo(() => {
    const s = new Set<VerticeTopicId>()
    for (const id of VERTICE_TOPIC_IDS) {
      if (inv.flags[verticeTopicFlags[id]]) s.add(id)
    }
    return s
  }, [inv.flags])

  const bg = assetPath('/assets/backgrounds/processed/nightclub/nightclub-01-lights-haze.jpg')

  const finishVisit = useCallback(() => {
    dispatchActions([
      { type: 'unlockLocation', id: 'vertice', status: 'visited' },
      { type: 'setFlag', id: 'block02_vertice_visit_done', value: true },
    ])
    onClose()
  }, [onClose])

  const completeTopic = useCallback(
    (topic: VerticeTopicId) => {
      const flag = verticeTopicFlags[topic]
      if (topic === 'iara') {
        completeVerticeTopic(flag, [
          { type: 'addEvidence', id: 'mariana_vertice_visit' },
          { type: 'addEvidence', id: 'mariana_repeated_questions' },
        ])
      } else if (topic === 'archive') {
        finishVerticeArchive()
        setFlag(flag, true)
      } else {
        completeVerticeTopic(flag)
      }
      setActiveTopic(null)
      setBeatIndex(0)
      setMode('menu')
    },
    [],
  )

  const pendingTopics = VERTICE_TOPIC_IDS.filter((id) => {
    if (doneTopics.has(id)) return false
    if (id === 'archive') return archiveUnlocked(inv.flags)
    return true
  })

  const currentBeat = mode === 'play' && activeTopic ? verticeBeats[activeTopic][beatIndex] : null

  return (
    <div
      className="vn-scene"
      data-testid="vertice-scene"
      style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.72)), url(${bg})` }}
    >
      <header className="vn-scene__bar">
        <span className="vn-scene__title">Boate Vértice</span>
        <button type="button" onClick={finishVisit}>
          Sair
        </button>
      </header>

      {mode === 'menu' ? (
        <VisualNovelDialog
          speaker="Augusto"
          text={
            pendingTopics.length
              ? 'Casa fechada — mas quem trabalha aqui ainda lembra de Mariana.'
              : 'Já ouvi o que podiam dizer por hoje.'
          }
          choices={pendingTopics.map((id) => ({ id, label: verticeTopicLabels[id] }))}
          onChoice={(id) => {
            setActiveTopic(id as VerticeTopicId)
            setBeatIndex(0)
            setMode('play')
          }}
          onContinue={pendingTopics.length === 0 ? finishVisit : undefined}
          continueLabel="Encerrar visita"
        />
      ) : null}

      {mode === 'play' && currentBeat ? (
        <VisualNovelDialog
          speaker={currentBeat.speaker}
          text={currentBeat.text}
          portraitSrc={currentBeat.portrait ? portraits[currentBeat.portrait] : undefined}
          onContinue={() => {
            const beats = activeTopic ? verticeBeats[activeTopic] : []
            if (beatIndex + 1 < beats.length) setBeatIndex((i) => i + 1)
            else if (activeTopic) completeTopic(activeTopic)
          }}
        />
      ) : null}
    </div>
  )
}
