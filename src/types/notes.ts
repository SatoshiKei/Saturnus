export interface NoteItem {
  id: string
  title: string
  body: string
  updatedAt: string
  /** Dispara flag narrativa na primeira leitura (Bloco 1). */
  storyFlag?: string
}
