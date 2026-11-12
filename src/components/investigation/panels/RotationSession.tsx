import { useMemo, useState } from 'react'
import {
  CAD_FLAME_ID,
  CORRECT_CROSSING,
  RAILWAY_PASSAGES,
  ROTATION_AUDIO,
  ROTATION_AVL,
  ROTATION_CAD,
  ROTATION_CALLSIGN,
  ROTATION_CROSSINGS,
  ROTATION_VEHICLES,
  compareTrainFingerprints,
  evaluateRotationCase,
  type RotationAudioId,
  type RotationCrossingId,
  type RotationVehicleId,
} from '../../../data/block08/rotationPuzzle'
import { onRotationSolved } from '../../../game/story/block08Handlers'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { resolveChatMediaSrc } from '../../../lib/characterSprites'
import { playSfx } from '../../../lib/sfx'

const isDev = import.meta.env.DEV

const AUDIO_IDS = Object.keys(ROTATION_AUDIO) as RotationAudioId[]

/**
 * Puzzle 11 — Rotação de Saturno.
 * Passagem → CAD → AVL/rádio → fingerprint → VTR-14 (escala depois, no computador).
 */
export function RotationSession() {
  const inv = useInvestigation()
  const solved = Boolean(inv.flags.block08_rotation_done)

  const [crossingId, setCrossingId] = useState<RotationCrossingId | null>(
    solved ? CORRECT_CROSSING : null,
  )
  const [cadId, setCadId] = useState<string | null>(solved ? CAD_FLAME_ID : null)
  const [avlOpened, setAvlOpened] = useState<RotationVehicleId[]>(
    solved ? ['VTR-08', 'VTR-14', 'VTR-21'] : [],
  )
  const [avlFocus, setAvlFocus] = useState<RotationVehicleId | null>(null)
  const [eliminated, setEliminated] = useState<RotationVehicleId[]>(
    solved ? ['VTR-08', 'VTR-21'] : [],
  )
  const [fpA, setFpA] = useState<RotationAudioId | ''>('')
  const [fpB, setFpB] = useState<RotationAudioId | ''>('')
  const [fpMsg, setFpMsg] = useState<string | null>(null)
  const [fpVehicle, setFpVehicle] = useState<RotationVehicleId | null>(
    solved ? 'VTR-14' : null,
  )
  const [msg, setMsg] = useState<string | null>(null)
  const [devOpen, setDevOpen] = useState(false)

  const evalState = useMemo(
    () =>
      evaluateRotationCase({
        crossingId,
        cadId,
        avlUnitsOpened: avlOpened,
        fingerprintVehicle: fpVehicle,
        eliminated,
      }),
    [crossingId, cadId, avlOpened, fpVehicle, eliminated],
  )

  const selectCrossing = (id: RotationCrossingId) => {
    if (solved) return
    playSfx('ui')
    setCrossingId(id)
    setMsg(null)
  }

  const openCad = (id: string) => {
    if (solved) return
    playSfx('ui')
    setCadId(id)
  }

  const openAvl = (unit: RotationVehicleId) => {
    playSfx('ui')
    setAvlFocus(unit)
    setAvlOpened((prev) => (prev.includes(unit) ? prev : [...prev, unit]))
  }

  const toggleElim = (unit: RotationVehicleId) => {
    if (solved) return
    playSfx('ui')
    setEliminated((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit],
    )
  }

  const runFingerprint = () => {
    if (!fpA || !fpB) {
      setFpMsg('Selecione duas fontes.')
      return
    }
    playSfx('ui')
    const r = compareTrainFingerprints(fpA, fpB)
    setFpMsg(r.message)
    if (r.match && r.vehicleHit) {
      setFpVehicle(r.vehicleHit)
      playSfx('unlock')
    } else {
      playSfx('error')
    }
  }

  const confirmVtr = () => {
    if (solved) return
    if (!evalState.canConfirm) {
      playSfx('error')
      setMsg(
        'Ainda há inconsistências. Cruze passagem, ocorrência urgente, AVL e o fingerprint antes de isolar a unidade.',
      )
      return
    }
    playSfx('unlock')
    setMsg(`Viatura compatível com a abordagem de Rui: ${ROTATION_CALLSIGN}`)
    onRotationSolved()
  }

  const passagesForCrossing = crossingId
    ? RAILWAY_PASSAGES.filter((p) => p.crossingId === crossingId)
    : []

  const avlForFocus = avlFocus ? ROTATION_AVL.filter((p) => p.unit === avlFocus) : []

  return (
    <div className="aw-hex" data-testid="rotation-panel">
      <p className="aw-orbit__title">Rotação de Saturno</p>
      <p className="aw-provisional__note">
        Rui foi parado pouco depois de uma passagem de nível e liberado quando o rádio pediu uma
        ocorrência urgente. Cruze registros ferroviários, CAD, AVL e o áudio institucional — sem
        pedir um número mágico.
      </p>

      <h4 className="pc-sub">Passagens ferroviárias (setor)</h4>
      <ul className="pc-ul" data-testid="rotation-crossings">
        {ROTATION_CROSSINGS.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className="aw-provisional__go"
              data-testid={`crossing-${c.id}`}
              disabled={solved}
              onClick={() => selectCrossing(c.id)}
              style={{
                opacity: crossingId === c.id ? 1 : 0.75,
                outline: crossingId === c.id ? '1px solid #8af' : undefined,
              }}
            >
              {c.label}
            </button>
            <span className="aw-provisional__note"> — {c.sector}. {c.notes}</span>
          </li>
        ))}
      </ul>
      {crossingId ? (
        <div data-testid="railway-passages">
          <p className="aw-provisional__note">
            Composições na passagem selecionada (madrugada):
          </p>
          <ul className="pc-ul">
            {passagesForCrossing.length === 0 ? (
              <li>Nenhuma composição listada neste cruzamento na janela.</li>
            ) : (
              passagesForCrossing.map((p) => (
                <li key={p.id}>
                  {p.composition} · ocupação {p.occupy}–{p.clear} · {p.lengthNote}
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      <h4 className="pc-sub">CAD / despacho</h4>
      <ul className="pc-ul" data-testid="rotation-cad">
        {ROTATION_CAD.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className="aw-provisional__go"
              data-testid={`cad-${c.id}`}
              disabled={solved}
              onClick={() => openCad(c.id)}
            >
              {c.id} · {c.time} · {c.priority}
            </button>
            {cadId === c.id ? (
              <div className="aw-provisional__note" data-testid="cad-detail">
                <div>{c.sector}</div>
                <div>{c.summary}</div>
                <div>Unidades / notas: {c.unitsNoted.join('; ')}</div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <h4 className="pc-sub">Candidatos — AVL pontual</h4>
      <ul className="pc-ul" data-testid="rotation-vehicles">
        {ROTATION_VEHICLES.map((v) => (
          <li key={v.id}>
            <button
              type="button"
              className="aw-provisional__go"
              data-testid={`avl-open-${v.id}`}
              onClick={() => openAvl(v.id)}
            >
              {v.id}
            </button>
            <span className="aw-provisional__note">
              {' '}
              · {v.sectorStart} · {v.activity}
            </span>
            <label style={{ marginLeft: 8 }}>
              <input
                type="checkbox"
                data-testid={`elim-${v.id}`}
                disabled={solved}
                checked={eliminated.includes(v.id)}
                onChange={() => toggleElim(v.id)}
              />{' '}
              incompatível
            </label>
          </li>
        ))}
      </ul>
      {avlFocus ? (
        <div data-testid="avl-detail">
          <p className="pc-sub">AVL — {avlFocus}</p>
          <ul className="pc-ul">
            {avlForFocus.map((p) => (
              <li key={p.id}>
                {p.time} · {p.location} · heading {p.heading} · {p.event}
              </li>
            ))}
          </ul>
          <p className="aw-provisional__note">
            {ROTATION_VEHICLES.find((v) => v.id === avlFocus)?.radioNote}
          </p>
        </div>
      ) : null}

      <h4 className="pc-sub">Logs de rádio (janela investigada)</h4>
      <ul className="pc-ul" data-testid="rotation-radio">
        {AUDIO_IDS.map((id) => {
          const a = ROTATION_AUDIO[id]
          return (
            <li key={id}>
              {a.label}
              <audio
                controls
                src={resolveChatMediaSrc(a.src)}
                preload="metadata"
                style={{ display: 'block', marginTop: 4, maxWidth: 320 }}
              />
            </li>
          )
        })}
      </ul>

      <h4 className="pc-sub">Audio Fingerprint Compare</h4>
      <div className="fw-eq" style={{ gap: 8, flexWrap: 'wrap' }}>
        <select
          data-testid="rot-fp-a"
          value={fpA}
          disabled={solved}
          onChange={(e) => setFpA(e.target.value as RotationAudioId | '')}
        >
          <option value="">Fonte A</option>
          {AUDIO_IDS.map((id) => (
            <option key={id} value={id}>
              {ROTATION_AUDIO[id].label}
            </option>
          ))}
        </select>
        <select
          data-testid="rot-fp-b"
          value={fpB}
          disabled={solved}
          onChange={(e) => setFpB(e.target.value as RotationAudioId | '')}
        >
          <option value="">Fonte B</option>
          {AUDIO_IDS.map((id) => (
            <option key={id} value={id}>
              {ROTATION_AUDIO[id].label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="aw-provisional__go"
          data-testid="rot-fp-run"
          disabled={solved}
          onClick={runFingerprint}
        >
          Compare fingerprints
        </button>
      </div>
      {fpMsg ? <p data-testid="rot-fp-status">{fpMsg}</p> : null}

      {!solved ? (
        <button
          type="button"
          className="aw-provisional__go"
          data-testid="rotation-confirm"
          onClick={confirmVtr}
          style={{ marginTop: 12 }}
        >
          Registrar viatura compatível
        </button>
      ) : (
        <p data-testid="rotation-done-msg">
          Viatura compatível com a abordagem de Rui: {ROTATION_CALLSIGN}. Consulte a escala da
          unidade no computador da delegacia.
        </p>
      )}
      {msg ? <p data-testid="rotation-msg">{msg}</p> : null}

      {isDev ? (
        <div style={{ marginTop: 16 }}>
          <button type="button" className="aw-provisional__go" onClick={() => setDevOpen((v) => !v)}>
            DEV MODE
          </button>
          {devOpen ? (
            <pre data-testid="rotation-dev" style={{ fontSize: 11, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(
                {
                  trainCrossingCandidate: crossingId,
                  trainWindow: { occupy: '01:12', clear: '01:18', crossing: CORRECT_CROSSING },
                  cadIncidentSelected: cadId,
                  candidateVehicles: ROTATION_VEHICLES.map((v) => v.id),
                  trainFingerprintByVehicle: {
                    'VTR-08': compareTrainFingerprints('train_ref', 'vtr08').score,
                    'VTR-14': compareTrainFingerprints('train_ref', 'vtr14').score,
                    'VTR-21': compareTrainFingerprints('train_ref', 'vtr21').score,
                  },
                  vehicleRouteCompatibility: Object.fromEntries(
                    ROTATION_VEHICLES.map((v) => [
                      v.id,
                      {
                        flame: v.flameRouteOk,
                        crossing: v.crossingProximityOk,
                        exit: v.exitDirectionOk,
                      },
                    ]),
                  ),
                  vtr14Confirmed: solved || evalState.canConfirm,
                  rosterOpened: Boolean(inv.flags.block08_scale_search_unlocked),
                  augustoRevealed: Boolean(inv.flags.block08_augusto_linked),
                  puzzleComplete: solved,
                  ...evalState,
                },
                null,
                2,
              )}
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
