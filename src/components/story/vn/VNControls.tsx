/** Reservado: Auto / Skip / Log — placeholders visuais mínimos. */
export function VNControls({ onLog }: { onLog?: () => void }) {
  if (!onLog) return null
  return (
    <div className="vn-controls">
      <button type="button" className="vn-controls__btn" onClick={onLog} aria-label="Registro">
        Log
      </button>
    </div>
  )
}
