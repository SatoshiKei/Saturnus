import { useGameHub } from '../../app/GameHubContext'
import {
  augustoPhotosLibrary,
  marianaPhotosLibrary,
  type PhoneMediaItem,
} from '../../data/block01/phoneMedia'
import { contactAvatarSrc } from '../../lib/characterSprites'

interface PhotosAppProps {
  onBack: () => void
}

export function PhotosApp({ onBack }: PhotosAppProps) {
  const { phoneDevice } = useGameHub()
  const items = phoneDevice === 'augusto' ? augustoPhotosLibrary : marianaPhotosLibrary

  return (
    <div className="ios-photos" data-testid="photos-app">
      <header className="ios-app-header ios-app-header--photos">
        <button type="button" className="ios-app-header__back" onClick={onBack}>
          ‹ Início
        </button>
        <h1>Fotos</h1>
        <p className="ios-photos__sub">Biblioteca</p>
      </header>
      <ul className="ios-photos__grid">
        {items.map((item) => (
          <MediaTile key={item.id} item={item} />
        ))}
      </ul>
    </div>
  )
}

function MediaTile({ item }: { item: PhoneMediaItem }) {
  const src = item.spriteId ? contactAvatarSrc(item.spriteId) : undefined
  return (
    <li className="ios-photos__tile">
      <figure>
        {src ? (
          <img src={src} alt="" className="ios-photos__img" />
        ) : (
          <span className="ios-photos__placeholder" aria-hidden />
        )}
        <figcaption>{item.label}</figcaption>
      </figure>
    </li>
  )
}
