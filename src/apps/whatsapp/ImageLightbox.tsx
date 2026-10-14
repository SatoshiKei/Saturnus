import { assetPath } from '../../lib/assetPath'

interface ImageLightboxProps {
  src: string
  alt: string
  caption?: string
  onClose: () => void
}

export function ImageLightbox({ src, alt, caption, onClose }: ImageLightboxProps) {
  return (
    <div className="wa-lightbox" role="dialog" aria-modal="true" aria-label="Imagem ampliada">
      <button
        type="button"
        className="wa-lightbox__backdrop"
        onClick={onClose}
        aria-label="Fechar imagem ampliada"
      />
      <div className="wa-lightbox__content">
        <img src={assetPath(src)} alt={alt} className="wa-lightbox__img" />
        {caption ? <p className="wa-lightbox__caption">{caption}</p> : null}
      </div>
      <button type="button" className="wa-lightbox__close" onClick={onClose} aria-label="Fechar">
        ✕
      </button>
    </div>
  )
}
