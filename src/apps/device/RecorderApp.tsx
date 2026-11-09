import { useInvestigation } from '../../game/hooks/useInvestigation'
import { addEvidence } from '../../game/state/investigationStore'

interface RecorderAppProps {
  onBack: () => void
}

export function RecorderApp({ onBack }: RecorderAppProps) {
  const inv = useInvestigation()
  const id = 'rafael_audio_protected'
  const owned = inv.evidenceOwned.includes(id)

  return (
    <div className="device-app" data-testid="recorder-app">
      <button type="button" onClick={onBack}>
        ‹ Início
      </button>
      <h2>Gravador</h2>
      <p>Gravações neste aparelho. Exportação bloqueada pela proteção do sistema.</p>
      {!owned ? (
        <button
          type="button"
          data-testid="recorder-reveal-protected"
          onClick={() => addEvidence(id)}
        >
          Abrir gravação “Noite anterior”
        </button>
      ) : (
        <p>
          <strong>Gravação protegida</strong> — não exportável. Use processamento no dispositivo.
        </p>
      )}
    </div>
  )
}
