import type { Document } from '../../game/types'

export const seedDocuments: Document[] = [
  {
    id: 'doc-bo-inicial',
    title: 'Boletim de ocorrência — desaparecimento',
    category: 'BO',
    blocks: [
      {
        id: 'b1',
        text: 'Compareceu o declarante Augusto Mendes, delegado, informando o desaparecimento de Mariana Silva, 22 anos, último contato registrado por volta das 22h14.',
      },
      {
        id: 'b2',
        text: 'A vítima frequentava a universidade e mantinha contato habitual com Júlia e Camila.',
        extractableEvidenceId: 'nota_mariana_horario',
        extractAction: { type: 'discoverPerson', id: 'julia', status: 'identified' },
      },
      {
        id: 'b3',
        text: 'Testemunhas mencionaram um contato apenas como “Nico”, sem identificação completa no momento do registro.',
        extractAction: { type: 'discoverPerson', id: 'nico', status: 'mentioned' },
      },
    ],
  },
  {
    id: 'doc-julia-memory',
    title: 'Nota de entrevista — Júlia',
    category: 'depoimento',
    blocks: [
      {
        id: 'j1',
        text: 'Júlia afirmou que Mariana “não lembrava direito” de conversas recentes.',
      },
      {
        id: 'j2',
        text: 'Horas antes, Mariana teria comentado detalhes específicos sobre a noite anterior.',
      },
    ],
  },
]
