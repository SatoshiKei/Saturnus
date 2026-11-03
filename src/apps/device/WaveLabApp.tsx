import { useInvestigation } from '../../game/hooks/useInvestigation'
import { deriveEvidenceFromAudio } from '../../game/state/investigationStore'

interface WaveLabAppProps {
  onBack: () => void
}

export function WaveLabApp({ onBack }: WaveLabAppProps) {
  const inv = useInvestigation()
  const protectedId = 'rafael_audio_protected'
  const hasProtected = inv.evidenceOwned.includes(protectedId)
  const canProcess = inv.phones.mariana.installedAppIds.includes('wavelab-mobile')

  const runDemoOp = () => {
    if (!canProcess || !hasProtected) return
    deriveEvidenceFromAudio(protectedId, 'derived_wavelab_demo')
  }

  return (
    <div className="device-app" data-testid="wavelab-app">
      <button type="button" onClick={onBack}>
        ‹ Início
      </button>
      <h2>WaveLab Mobile</h2>
      {!canProcess ? <p>App não instalado.</p> : null}
      {canProcess && !hasProtected ? (
        <p className="inv-muted">Nenhum áudio protegido disponível neste aparelho.</p>
      ) : null}
      {canProcess && hasProtected ? (
        <>
          <p>Áudio protegido carregado do sandbox do Gravador.</p>
          <button type="button" data-testid="wavelab-noise-reduction" onClick={runDemoOp}>
            Redução de ruído (demo)
          </button>
        </>
      ) : null}
    </div>
  )
}
