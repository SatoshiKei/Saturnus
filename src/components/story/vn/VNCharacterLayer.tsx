/** Camada reservada para sprites (torso) — posicionamento futuro. */
export function VNCharacterLayer({
  leftSrc,
  rightSrc,
  activeSide,
}: {
  leftSrc?: string
  rightSrc?: string
  activeSide?: 'left' | 'right' | 'none'
}) {
  if (!leftSrc && !rightSrc) return null
  return (
    <div className="vn-characters" aria-hidden>
      {leftSrc ? (
        <figure className="vn-characters__slot vn-characters__slot--left" data-active={activeSide === 'left'}>
          <img src={leftSrc} alt="" />
        </figure>
      ) : null}
      {rightSrc ? (
        <figure className="vn-characters__slot vn-characters__slot--right" data-active={activeSide === 'right'}>
          <img src={rightSrc} alt="" />
        </figure>
      ) : null}
    </div>
  )
}
