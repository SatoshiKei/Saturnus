export function VNTopBar({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <header className="vn-top">
      <span className="vn-top__place">{title}</span>
      <button type="button" className="vn-top__exit" onClick={onClose}>
        Sair
      </button>
    </header>
  )
}
