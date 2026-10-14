import type { NoteItem } from '../types/notes'

export const mockNotes: NoteItem[] = [
  {
    id: 'n1',
    title: 'Comprar pilhas',
    body: 'AA para o gravador velho.\nPegar na farmácia do centro.',
    updatedAt: '2026-10-12',
  },
  {
    id: 'n2',
    title: 'Perguntar pro André',
    body: 'Horário do depoimento na terça.\nEle disse que manda mensagem.',
    updatedAt: '2026-10-11',
  },
  {
    id: 'n3',
    title: 'Ligação Elisa',
    body: 'Retornar quando sair da reunião.\nNúmero alternativo no cartão.',
    updatedAt: '2026-10-10',
  },
  {
    id: 'n4',
    title: 'Lista bar',
    body: 'Água\nGuardanapos\nGelo\nCopos descartáveis',
    updatedAt: '2026-10-09',
  },
  {
    id: 'n5',
    title: 'não esquecer',
    body: 'Chaves do armário B.\nRecibo na gaveta.',
    updatedAt: '2026-10-08',
  },
]
