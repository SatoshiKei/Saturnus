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
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { completeVerticeTopicById, finishVerticeVisit } from '../../game/story/block02Handlers'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
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

/** 2ª visita: cruzamento só após P3 técnico e se ainda não feito. */
function setCrossrefUnlocked(flags: Record<string, boolean>) {
  return Boolean(flags.block02_rings_provisional && !flags.block02_vertice_set_crossref)
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
    finishVerticeVisit()
    onClose()
  }, [onClose])

  const completeTopic = useCallback((topic: VerticeTopicId) => {
    completeVerticeTopicById(topic)
    setActiveTopic(null)
    setBeatIndex(0)
    setMode('menu')
  }, [])

  const pendingTopics = VERTICE_TOPIC_IDS.filter((id) => {
    if (doneTopics.has(id)) return false
    if (id === 'archive') return archiveUnlocked(inv.flags)
    if (id === 'set_crossref') return setCrossrefUnlocked(inv.flags)
    // Na 2ª visita (P3 pronto), não reabrir tópicos da 1ª — só o cruzamento.
    if (inv.flags.block02_rings_provisional && inv.flags.block02_vertice_archive) {
      return false
    }
    return true
  })

  const currentBeat = mode === 'play' && activeTopic ? verticeBeats[activeTopic][beatIndex] : null
  const hint = setCrossrefUnlocked(inv.flags)
    ? 'Agora há uma gravação e uma referência para procurar nos arquivos internos.'
    : 'Casa fechada — mas quem trabalha aqui ainda lembra de Mariana.'

  return (
    <VNSceneShell
      title="Boate Vértice"
      onClose={finishVisit}
      testId="vertice-scene"
      backgroundStyle={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.28), rgba(0,0,0,.55)), url(${bg})`,
      }}
    >
      {mode === 'menu' ? (
        pendingTopics.length ? (
          <VisualNovelDialog
            text=""
            choiceVariant="topics"
            choiceHint={hint}
            choices={pendingTopics.map((id) => ({ id, label: verticeTopicLabels[id] }))}
            onChoice={(id) => {
              setActiveTopic(id as VerticeTopicId)
              setBeatIndex(0)
              setMode('play')
            }}
          />
        ) : (
          <VisualNovelDialog
            speaker="Augusto"
            text="Já ouvi o que podiam dizer por hoje."
            onContinue={finishVisit}
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
            const beats = activeTopic ? verticeBeats[activeTopic] : []
            if (beatIndex + 1 < beats.length) setBeatIndex((i) => i + 1)
            else if (activeTopic) completeTopic(activeTopic)
          }}
        />
      ) : null}
    </VNSceneShell>
  )
}
