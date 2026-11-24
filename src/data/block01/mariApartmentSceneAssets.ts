import { HUB_REFLECTION_BACKGROUND } from '../sceneIntros'

/** Dois fundos canônicos da reconstrução 402 — não reutilizar em outras residências. */
export const MARIANA_402_DOOR = '/assets/scenes/apartment/porta-angelim-solida-fri-13.webp'
/** Interior ativo na cena (sala Mariana). */
export const MARIANA_402_INTERIOR = '/assets/scenes/apartment/mariana-402-house-inside.png'
/** Reserva (stock quarto vazio) — não apagar; troca rápida se precisar. */
export const MARIANA_402_INTERIOR_RESERVE =
  '/assets/scenes/apartment/mariana-402-interior-phone.jpg'

export const MELODIE_PHONE_AUDIO_SRC = '/assets/audio/phone/melodie.mp3'
export const MELODIE_PHONE_FILE_ID = 'mf-dl-melodie'

const VEIL_DARK = 'linear-gradient(180deg, rgba(0,0,0,.32), rgba(0,0,0,.68))'

export type MariAptBgKey = 'door' | 'interior'

export function apartmentReconstructionBackgroundStyle(bgKey?: MariAptBgKey): {
  backgroundImage: string
  backgroundSize: string
  backgroundPosition: string
} {
  const src = bgKey === 'interior' ? MARIANA_402_INTERIOR : MARIANA_402_DOOR
  return {
    backgroundImage: `${VEIL_DARK}, url(${src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
}

export function mariApartmentPresentBackgroundStyle() {
  return {
    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.32), rgba(0,0,0,.58)), url(${HUB_REFLECTION_BACKGROUND})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
}