/** Galeria Fotos / Arquivos — mídia diegética do Bloco 1 (sprites, sem spoilers). */

export type PhoneMediaItem = {
  id: string
  label: string
  /** chave em `CHARACTER_SPRITE_URLS` ou vazio para ícone genérico */
  spriteId?: string
  folder?: 'WhatsApp' | 'Câmera' | 'Downloads'
}

export const marianaPhotosLibrary: PhoneMediaItem[] = [
  { id: 'mp-1', label: 'Plantão — corredor', spriteId: 'mariana', folder: 'Câmera' },
  { id: 'mp-2', label: 'Júlia', spriteId: 'julia', folder: 'Câmera' },
  { id: 'mp-3', label: 'Camila', spriteId: 'camila', folder: 'Câmera' },
  { id: 'mp-4', label: 'Equipe — PA', spriteId: 'paula', folder: 'Câmera' },
]

export const marianaFilesLibrary: PhoneMediaItem[] = [
  { id: 'mf-wa-1', label: 'Foto — documento turno', spriteId: 'julia', folder: 'WhatsApp' },
  { id: 'mf-wa-2', label: 'Contato — Rafael', spriteId: 'rafael', folder: 'WhatsApp' },
  { id: 'mf-dl-1', label: 'Escala outubro.pdf', folder: 'Downloads' },
]

export const augustoPhotosLibrary: PhoneMediaItem[] = [
  { id: 'ap-1', label: 'Identificação', spriteId: 'augusto', folder: 'Câmera' },
  { id: 'ap-2', label: 'Camila — plantão', spriteId: 'camila', folder: 'Câmera' },
]

export const augustoFilesLibrary: PhoneMediaItem[] = [
  { id: 'af-wa-1', label: 'Prontuário — trecho', spriteId: 'camila', folder: 'WhatsApp' },
]
