/** Bancada Rings — revelação CCTV (pensamentos de Augusto). */
export type MorsaCctvBeat =
  | { kind: 'cam'; frameIndex: number; thought?: string }
  | { kind: 'thought'; text: string }
  | { kind: 'name'; text: string }
  | { kind: 'pause' }

export const MORSA_CCTV_BEATS: MorsaCctvBeat[] = [
  { kind: 'thought', text: 'As câmeras não discordam entre si — só entre os relógios.' },
  { kind: 'cam', frameIndex: 0, thought: 'Mochila. Rádio. Mesma passagem.' },
  { kind: 'cam', frameIndex: 1, thought: 'No interior a máscara ainda cobre o rosto. Os objetos permanecem.' },
  { kind: 'cam', frameIndex: 2, thought: 'A saída não bate com ninguém que eu conheça. E ainda assim…' },
  { kind: 'pause' },
  { kind: 'thought', text: 'O porte. A altura. O gesto de ajustar o rádio.' },
  { kind: 'name', text: 'André.' },
]
