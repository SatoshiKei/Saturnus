import type { NoteItem } from '../../types/notes'

/** Notas do celular de Mariana — Bloco 1 (utilitárias, não diário). */
export const marianaBlock01Notes: NoteItem[] = [
  {
    id: 'n-quarta',
    title: 'QUARTA',
    body: '07:00 plantão\ncomprar café\nligar Paula\nconfirmar sexta com a Júlia\n\nnão confiar só no calendário',
    updatedAt: '28/10/2026',
    storyFlag: 'block01_note_quarta_read',
  },
  {
    id: 'n-pessoas',
    title: 'PESSOAS',
    body: 'Júlia\nCamila\nRafael\nPaula\n\nse eu perguntar a mesma coisa de novo, não fala que eu já perguntei',
    updatedAt: '01/11/2026',
    storyFlag: 'block01_note_pessoas_read',
  },
  {
    id: 'n-certezas',
    title: 'Sem título',
    body: 'lembrar não é a mesma coisa que ter certeza',
    updatedAt: '01/11/2026',
    storyFlag: 'block01_note_certezas_read',
  },
  {
    /**
     * Pista parcial técnica — presente desde o início no aparelho.
     * Antes do B7 parece lixo de sessão; depois do dead end de Ricardo, vira identificador.
     */
    id: 'n-sess',
    title: 'sess',
    body: 'hvalenca@\nconta antiga?\nnão abre\nver depois',
    updatedAt: '12/09/2026',
    storyFlag: 'block01_note_sess_read',
  },
]
