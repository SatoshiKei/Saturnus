import { useState } from 'react'
import {
  HEX_CYCLE,
  HEX_NODES,
  HEX_PHRASE,
  assembleHex,
  hexNode,
  isHexSolved,
  type HexNodeDef,
  type HexNodeId,
} from '../../../data/block04/hexagonPuzzle'
import { setFlag } from '../../../game/state/investigationStore'
import { onHexagonSolved } from '../../../game/story/block04Handlers'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { playSfx } from '../../../lib/sfx'

/** Hora de criação exibida nos metadados — só a ordem importa (rank 1 = mais antigo). */
function createdLabel(n: HexNodeDef) {
  const mins = [14, 41, 52, 67, 83, 95][n.createdRank - 1]
  const h = 2 + Math.floor(mins / 60)
  const m = String(mins % 60).padStart(2, '0')
  return `2026-10-27 0${h}:${m}`
}

const inspectedFlag = (id: HexNodeId) => `hex_inspected_${id}`

/**
 * Puzzle 6 — Hexágono. O jogador inspeciona os metadados de cada arquivo, descobre qual aponta para
 * qual, escolhe o primeiro (o mais antigo) e encadeia os seis até o ciclo fechar.
 * O código só é montado e exibido depois que o ciclo fecha.
 */
export function HexagonSession({ currentId }: { currentId: HexNodeId }) {
  const inv = useInvestigation()
  const solved = Boolean(inv.flags.block04_hexagon_done)
  const [sequence, setSequence] = useState<HexNodeId[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const node = hexNode(currentId)
  const inspected = Boolean(inv.flags[inspectedFlag(currentId)])
  const inspectedAll = HEX_NODES.every((n) => inv.flags[inspectedFlag(n.id)])

  const append = (id: HexNodeId) => {
    setMsg(null)
    if (sequence.includes(id)) {
      setMsg('Este arquivo já está no ciclo.')
      return
    }
    if (sequence.length === 0) {
      if (hexNode(id).createdRank !== 1) {
        playSfx('error')
        setMsg('Este arquivo não é o primeiro: algum outro foi criado antes dele.')
        return
      }
    } else {
      const prev = hexNode(sequence[sequence.length - 1])
      if (prev.pointsTo !== id) {
        playSfx('error')
        setMsg(`O campo anômalo de ${prev.displayName} não aponta para ${hexNode(id).displayName}.`)
        return
      }
    }
    playSfx('ui')
    const next = [...sequence, id]
    setSequence(next)
    if (isHexSolved(next)) {
      playSfx('unlock')
      onHexagonSolved()
    }
  }

  const assembled = solved ? assembleHex(HEX_CYCLE) : null

  return (
    <div className="aw-hex" data-testid="hexagon-panel">
      <p className="aw-orbit__title">Seis arquivos, uma cadeia</p>
      <p className="aw-provisional__note">
        Cada arquivo carrega um campo de metadados que não pertence a ele: aponta para outro. Inspecione os
        seis e encadeie-os, começando pelo mais antigo.
      </p>

      <dl className="aw-dl" data-testid="hex-metadata">
        <dt>Arquivo</dt>
        <dd>{node.displayName}</dd>
        <dt>Duração</dt>
        <dd>{node.durationSec} s</dd>
        <dt>Taxa de amostragem</dt>
        <dd>{node.sampleRate} Hz</dd>
        <dt>Canais</dt>
        <dd>{node.channels}</dd>
        <dt>Codec</dt>
        <dd>{node.codec}</dd>
        <dt>Criado em</dt>
        <dd>{createdLabel(node)}</dd>
        <dt>Campo anômalo</dt>
        <dd data-testid="hex-pointer">{node.pointerField}</dd>
        <dt>Tags embutidas</dt>
        <dd>
          {inspected ? (
            <span data-testid="hex-tags">
              fragmento “{node.fragment}” · dígito {node.digit}
            </span>
          ) : (
            <button
              type="button"
              className="aw-provisional__go"
              data-testid={`hex-inspect-${node.id}`}
              onClick={() => {
                playSfx('ui')
                setFlag(inspectedFlag(node.id), true)
              }}
            >
              Inspecionar tags
            </button>
          )}
        </dd>
      </dl>

      {!solved ? (
        <div className="aw-hex__chain" data-testid="hex-chain">
          <p className="aw-orbit__label">
            Cadeia ({sequence.length}/{HEX_NODES.length})
          </p>
          <ol className="aw-hex__slots">
            {HEX_NODES.map((_, i) => (
              <li key={i} data-filled={Boolean(sequence[i])}>
                {sequence[i] ? hexNode(sequence[i]).displayName : '—'}
              </li>
            ))}
          </ol>
          <div className="aw-hex__actions">
            <button
              type="button"
              className="aw-provisional__go"
              data-testid={`hex-append-${node.id}`}
              disabled={!inspected || sequence.includes(node.id)}
              onClick={() => append(node.id)}
            >
              Anexar {node.displayName} à cadeia
            </button>
            <button
              type="button"
              className="aw-provisional__go"
              disabled={sequence.length === 0}
              onClick={() => {
                setSequence([])
                setMsg(null)
              }}
            >
              Limpar cadeia
            </button>
          </div>
          {!inspectedAll ? (
            <p className="aw-provisional__note">Inspecione as tags dos seis arquivos antes de montar a cadeia.</p>
          ) : null}
          {msg ? (
            <p className="aw-msg" role="status" data-testid="hex-msg">
              {msg}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="aw-hex__result" data-testid="hex-result">
          <p className="aw-orbit__label">Cadeia fechada: {HEX_CYCLE.map((id) => hexNode(id).displayName.replace('.wav', '')).join(' → ')} → FRAG_A</p>
          <blockquote className="aw-provisional__transcript" data-testid="hex-phrase">
            {HEX_PHRASE}
          </blockquote>
          <p className="aw-orbit__label">
            Dígitos na ordem da cadeia: <b data-testid="hex-code">{assembled?.code}</b>
          </p>
        </div>
      )}
    </div>
  )
}
