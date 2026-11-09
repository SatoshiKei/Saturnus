import { useState } from 'react'
import { assetPath } from '../../lib/assetPath'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { finishPoliceOperation } from '../../game/story/block06Handlers'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import '../../styles/visual-novel.css'

const BEATS = [
  { speaker: 'Rádio', text: 'Unidade dois em posição. Lateral norte limpa.' },
  { speaker: 'Augusto', text: 'Espera meu sinal.' },
  { speaker: 'Rádio', text: 'Copiado.' },
  { speaker: 'Rádio', text: 'Movimento nos fundos.' },
  { speaker: 'Augusto', text: 'Quantos?' },
  { speaker: 'Rádio', text: 'Não dá pra fechar. Um confirmado.' },
  { speaker: 'Augusto', text: 'Ninguém entra ainda.' },
  { speaker: 'Rádio', text: 'Porta lateral.' },
  { speaker: 'Augusto', text: 'Agora.' },
  { speaker: 'Policial', text: 'Polícia! No chão!' },
  { speaker: 'Rádio', text: 'Um correndo para o pátio norte.' },
  { speaker: 'Augusto', text: 'Fecha a saída.' },
  { speaker: 'Policial', text: 'Parado!' },
  { speaker: 'Rádio', text: 'Contato. Sem disparo.' },
  { speaker: 'Augusto', text: 'Identificação?' },
  { speaker: 'Rádio', text: 'Um segundo.' },
  { speaker: 'Rádio', text: 'É o Miro.' },
  { speaker: 'Augusto', text: 'Tem certeza?' },
  { speaker: 'Rádio', text: 'Documento com ele. Miro confirmado.' },
  { speaker: 'Miro', text: 'Isso tudo por mim?' },
  { speaker: 'Augusto', text: 'Hoje não.' },
  { speaker: 'Miro', text: 'Então você veio tarde.' },
  { speaker: 'Augusto', text: 'Alguma arma?' },
  { speaker: 'Policial', text: 'Nenhuma com ele. Rádio, telefone, material do galpão.' },
  { speaker: 'Augusto', text: 'Lacra tudo.' },
  { speaker: 'Miro', text: 'Delegado.' },
  { speaker: 'Augusto', text: 'O quê?' },
  {
    speaker: 'Miro',
    text: 'Se você acha que isso aqui vai responder a pergunta que você trouxe, não vai.',
  },
  { speaker: 'Augusto', text: 'Você nem sabe qual é a pergunta.' },
  { speaker: 'Miro', text: 'Sei de qual morto vocês sempre lembram quando aparece meu nome.' },
  { speaker: 'Augusto', text: 'Leva.' },
]

export function OperationScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [i, setI] = useState(0)
  const done = Boolean(inv.flags.block06_operation_done)
  const bg = assetPath(sceneBackgrounds.operation)

  if (done) {
    return (
      <VNSceneShell
        title="Operação — Galpão 17"
        onClose={onClose}
        testId="operation-scene"
        backgroundStyle={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.4), rgba(0,0,0,.7)), url(${bg})`,
        }}
      >
        <VisualNovelDialog speaker="Augusto" text="Operação encerrada. Miro está na detenção." onContinue={onClose} />
      </VNSceneShell>
    )
  }

  const beat = BEATS[i]
  return (
    <VNSceneShell
      title="Operação — Galpão 17"
      onClose={onClose}
      testId="operation-scene"
      backgroundStyle={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.4), rgba(0,0,0,.7)), url(${bg})`,
      }}
    >
      <VisualNovelDialog
        speaker={beat.speaker}
        text={beat.text}
        onContinue={() => {
          if (i + 1 < BEATS.length) setI(i + 1)
          else {
            finishPoliceOperation()
            onClose()
          }
        }}
      />
    </VNSceneShell>
  )
}
