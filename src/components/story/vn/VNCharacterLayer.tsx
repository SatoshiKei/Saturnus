/** Camada de sprites VN. `data-sprite` permite enquadramento por personagem no CSS. */
export function VNCharacterLayer({
  leftSrc,
  rightSrc,
  leftSpriteId,
  rightSpriteId,
  activeSide,
}: {
  leftSrc?: string
  rightSrc?: string
  leftSpriteId?: string
  rightSpriteId?: string
  activeSide?: 'left' | 'right' | 'none'
}) {
  if (!leftSrc && !rightSrc) return null
  return (
    <div className="vn-characters" aria-hidden>
      {leftSrc ? (
        <figure
          className="vn-characters__slot vn-characters__slot--left"
          data-active={activeSide === 'left'}
          data-sprite={leftSpriteId || undefined}
        >
          <img src={leftSrc} alt="" />
        </figure>
      ) : null}
      {rightSrc ? (
        <figure
          className="vn-characters__slot vn-characters__slot--right"
          data-active={activeSide === 'right'}
          data-sprite={rightSpriteId || undefined}
        >
          <img src={rightSrc} alt="" />
        </figure>
      ) : null}
    </div>
  )
}
